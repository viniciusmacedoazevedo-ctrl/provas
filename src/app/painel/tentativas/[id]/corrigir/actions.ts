"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/permissoes";

export async function salvarCorrecao(tentativaId: string, formData: FormData) {
  await exigirPapel("ADMIN", "PROFESSOR");

  const tentativa = await prisma.tentativa.findUniqueOrThrow({
    where: { id: tentativaId },
    include: {
      prova: { include: { provaQuestoes: true } },
      respostas: true,
    },
  });

  const atualizacoes = [];
  let notaTotal = 0;

  for (const pq of tentativa.prova.provaQuestoes) {
    const resposta = tentativa.respostas.find((r) => r.questaoId === pq.questaoId);
    if (!resposta) continue;

    if (resposta.correta !== null) {
      // questão objetiva, já corrigida automaticamente no envio
      notaTotal += resposta.pontuacaoObtida ?? 0;
      continue;
    }

    const bruto = formData.get(`pontos_${pq.questaoId}`);
    let pontos = bruto !== null ? Number(bruto) : 0;
    if (Number.isNaN(pontos) || pontos < 0) pontos = 0;
    if (pontos > pq.valor) pontos = pq.valor;

    notaTotal += pontos;
    atualizacoes.push(
      prisma.resposta.update({
        where: { id: resposta.id },
        data: { pontuacaoObtida: pontos },
      }),
    );
  }

  await prisma.$transaction([
    ...atualizacoes,
    prisma.tentativa.update({
      where: { id: tentativaId },
      data: { status: "CORRIGIDA", nota: notaTotal },
    }),
  ]);

  revalidatePath(`/painel/tentativas/${tentativaId}`);
  revalidatePath(`/painel/tentativas/${tentativaId}/corrigir`);
  revalidatePath(`/painel/provas/${tentativa.provaId}`);
}
