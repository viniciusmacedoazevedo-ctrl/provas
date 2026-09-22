"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/permissoes";

const disciplinaSchema = z.object({
  nome: z.string().trim().min(2, "Informe um nome com pelo menos 2 letras."),
  descricao: z.string().trim().optional(),
});

export async function criarDisciplina(
  _estadoAnterior: string | undefined,
  formData: FormData,
) {
  const usuario = await exigirPapel("ADMIN", "PROFESSOR");

  const dados = disciplinaSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
  });
  if (!dados.success) {
    return dados.error.issues[0]?.message ?? "Dados inválidos.";
  }

  await prisma.disciplina.create({
    data: {
      nome: dados.data.nome,
      descricao: dados.data.descricao || null,
      criadoPorId: usuario.id,
    },
  });

  revalidatePath("/painel/disciplinas");
}

export async function excluirDisciplina(id: string) {
  await exigirPapel("ADMIN", "PROFESSOR");
  await prisma.disciplina.delete({ where: { id } });
  revalidatePath("/painel/disciplinas");
}
