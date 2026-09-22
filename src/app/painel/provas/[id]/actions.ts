"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/permissoes";

export async function adicionarQuestaoNaProva(provaId: string, questaoId: string) {
  await exigirPapel("ADMIN", "PROFESSOR");

  const totalAtual = await prisma.provaQuestao.count({ where: { provaId } });
  await prisma.provaQuestao.create({
    data: { provaId, questaoId, ordem: totalAtual },
  });

  revalidatePath(`/painel/provas/${provaId}`);
}

export async function removerQuestaoDaProva(provaId: string, questaoId: string) {
  await exigirPapel("ADMIN", "PROFESSOR");

  await prisma.provaQuestao.delete({
    where: { provaId_questaoId: { provaId, questaoId } },
  });

  revalidatePath(`/painel/provas/${provaId}`);
}

export async function atribuirAlunoAProva(provaId: string, alunoId: string) {
  await exigirPapel("ADMIN", "PROFESSOR");

  await prisma.provaAluno.upsert({
    where: { provaId_alunoId: { provaId, alunoId } },
    update: {},
    create: { provaId, alunoId },
  });

  revalidatePath(`/painel/provas/${provaId}`);
}

export async function removerAlunoDaProva(provaId: string, alunoId: string) {
  await exigirPapel("ADMIN", "PROFESSOR");

  await prisma.provaAluno.delete({
    where: { provaId_alunoId: { provaId, alunoId } },
  });

  revalidatePath(`/painel/provas/${provaId}`);
}

export async function alternarPublicacaoProva(provaId: string) {
  await exigirPapel("ADMIN", "PROFESSOR");

  const prova = await prisma.prova.findUniqueOrThrow({ where: { id: provaId } });
  const novoStatus = prova.status === "PUBLICADA" ? "RASCUNHO" : "PUBLICADA";

  await prisma.prova.update({
    where: { id: provaId },
    data: { status: novoStatus },
  });

  revalidatePath(`/painel/provas/${provaId}`);
  revalidatePath("/painel/provas");
}
