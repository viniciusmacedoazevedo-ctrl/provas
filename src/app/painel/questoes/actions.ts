"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/permissoes";

const tipoValues = ["MULTIPLA_ESCOLHA", "VERDADEIRO_FALSO", "DISSERTATIVA"] as const;
const dificuldadeValues = ["FACIL", "MEDIA", "DIFICIL"] as const;

const baseSchema = z.object({
  enunciado: z.string().trim().min(3, "Informe o enunciado da questão."),
  disciplinaId: z.string().trim().min(1, "Selecione uma disciplina."),
  assuntoId: z.string().trim().optional(),
  dificuldade: z.enum(dificuldadeValues),
  tipo: z.enum(tipoValues),
});

export async function criarQuestao(
  _estadoAnterior: string | undefined,
  formData: FormData,
) {
  const usuario = await exigirPapel("ADMIN", "PROFESSOR");

  const dadosBase = baseSchema.safeParse({
    enunciado: formData.get("enunciado"),
    disciplinaId: formData.get("disciplinaId"),
    assuntoId: formData.get("assuntoId") || undefined,
    dificuldade: formData.get("dificuldade"),
    tipo: formData.get("tipo"),
  });
  if (!dadosBase.success) {
    return dadosBase.error.issues[0]?.message ?? "Dados inválidos.";
  }
  const { tipo, assuntoId, ...resto } = dadosBase.data;

  let opcoesParaCriar: { texto: string; correta: boolean; ordem: number }[] = [];
  let respostaReferencia: string | null = null;

  if (tipo === "MULTIPLA_ESCOLHA") {
    const textos = formData.getAll("opcaoTexto").map((v) => String(v).trim());
    const indiceCorreta = formData.get("opcaoCorreta");
    opcoesParaCriar = textos
      .map((texto, i) => ({ texto, correta: String(i) === indiceCorreta, ordem: i }))
      .filter((o) => o.texto.length > 0);
    if (opcoesParaCriar.length < 2) {
      return "Adicione pelo menos 2 opções preenchidas.";
    }
    if (!opcoesParaCriar.some((o) => o.correta)) {
      return "Marque qual opção é a correta.";
    }
  } else if (tipo === "VERDADEIRO_FALSO") {
    const correta = formData.get("respostaVF");
    if (correta !== "verdadeiro" && correta !== "falso") {
      return "Selecione se a afirmação é verdadeira ou falsa.";
    }
    opcoesParaCriar = [
      { texto: "Verdadeiro", correta: correta === "verdadeiro", ordem: 0 },
      { texto: "Falso", correta: correta === "falso", ordem: 1 },
    ];
  } else {
    respostaReferencia =
      String(formData.get("respostaReferencia") || "").trim() || null;
  }

  await prisma.questao.create({
    data: {
      enunciado: resto.enunciado,
      tipo,
      dificuldade: resto.dificuldade,
      disciplinaId: resto.disciplinaId,
      assuntoId: assuntoId || null,
      criadoPorId: usuario.id,
      respostaReferencia,
      opcoes:
        opcoesParaCriar.length > 0 ? { create: opcoesParaCriar } : undefined,
    },
  });

  revalidatePath("/painel/questoes");
}

export async function excluirQuestao(id: string) {
  await exigirPapel("ADMIN", "PROFESSOR");
  await prisma.questao.delete({ where: { id } });
  revalidatePath("/painel/questoes");
}
