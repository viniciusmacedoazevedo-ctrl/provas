"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/permissoes";

const assuntoSchema = z.object({
  nome: z.string().trim().min(2, "Informe um nome com pelo menos 2 letras."),
  descricao: z.string().trim().optional(),
  disciplinaId: z.string().trim().min(1, "Selecione uma disciplina."),
});

export async function criarAssunto(
  _estadoAnterior: string | undefined,
  formData: FormData,
) {
  await exigirPapel("ADMIN", "PROFESSOR");

  const dados = assuntoSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    disciplinaId: formData.get("disciplinaId"),
  });
  if (!dados.success) {
    return dados.error.issues[0]?.message ?? "Dados inválidos.";
  }

  await prisma.assunto.create({
    data: {
      nome: dados.data.nome,
      descricao: dados.data.descricao || null,
      disciplinaId: dados.data.disciplinaId,
    },
  });

  revalidatePath("/painel/assuntos");
}

export async function excluirAssunto(id: string) {
  await exigirPapel("ADMIN", "PROFESSOR");
  await prisma.assunto.delete({ where: { id } });
  revalidatePath("/painel/assuntos");
}
