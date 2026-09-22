"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/permissoes";

const provaSchema = z.object({
  titulo: z.string().trim().min(2, "Informe um título com pelo menos 2 letras."),
  descricao: z.string().trim().optional(),
  disciplinaId: z.string().trim().min(1, "Selecione uma disciplina."),
  duracaoMinutos: z.string().trim().optional(),
  tentativasPermitidas: z.string().trim().optional(),
  embaralharQuestoes: z.string().nullable().optional(),
  dataInicio: z.string().trim().optional(),
  dataFim: z.string().trim().optional(),
});

export async function criarProva(
  _estadoAnterior: string | undefined,
  formData: FormData,
) {
  const usuario = await exigirPapel("ADMIN", "PROFESSOR");

  const dados = provaSchema.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    disciplinaId: formData.get("disciplinaId"),
    duracaoMinutos: formData.get("duracaoMinutos"),
    tentativasPermitidas: formData.get("tentativasPermitidas"),
    embaralharQuestoes: formData.get("embaralharQuestoes"),
    dataInicio: formData.get("dataInicio"),
    dataFim: formData.get("dataFim"),
  });
  if (!dados.success) {
    return dados.error.issues[0]?.message ?? "Dados inválidos.";
  }

  const duracaoMinutos = dados.data.duracaoMinutos
    ? Number(dados.data.duracaoMinutos)
    : null;
  const tentativasPermitidas = dados.data.tentativasPermitidas
    ? Number(dados.data.tentativasPermitidas)
    : 1;

  await prisma.prova.create({
    data: {
      titulo: dados.data.titulo,
      descricao: dados.data.descricao || null,
      disciplinaId: dados.data.disciplinaId,
      criadoPorId: usuario.id,
      duracaoMinutos: duracaoMinutos && duracaoMinutos > 0 ? duracaoMinutos : null,
      tentativasPermitidas:
        tentativasPermitidas && tentativasPermitidas > 0
          ? tentativasPermitidas
          : 1,
      embaralharQuestoes: dados.data.embaralharQuestoes === "on",
      dataInicio: dados.data.dataInicio
        ? new Date(dados.data.dataInicio)
        : null,
      dataFim: dados.data.dataFim ? new Date(dados.data.dataFim) : null,
    },
  });

  revalidatePath("/painel/provas");
}

export async function excluirProva(id: string) {
  await exigirPapel("ADMIN", "PROFESSOR");
  await prisma.prova.delete({ where: { id } });
  revalidatePath("/painel/provas");
}
