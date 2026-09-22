"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { exigirPapel, NaoAutorizadoError } from "@/lib/permissoes";

export async function iniciarTentativa(provaId: string) {
  const usuario = await exigirPapel("ALUNO");

  const prova = await prisma.prova.findUnique({ where: { id: provaId } });
  if (!prova || prova.status !== "PUBLICADA") {
    throw new Error("Esta prova não está disponível.");
  }

  const agora = new Date();
  if (prova.dataInicio && agora < prova.dataInicio) {
    throw new Error("Esta prova ainda não está disponível.");
  }
  if (prova.dataFim && agora > prova.dataFim) {
    throw new Error("O prazo desta prova já encerrou.");
  }

  const tentativaEmAndamento = await prisma.tentativa.findFirst({
    where: { provaId, alunoId: usuario.id, status: "EM_ANDAMENTO" },
  });
  if (tentativaEmAndamento) {
    redirect(`/painel/tentativas/${tentativaEmAndamento.id}`);
  }

  const totalTentativas = await prisma.tentativa.count({
    where: { provaId, alunoId: usuario.id },
  });
  if (totalTentativas >= prova.tentativasPermitidas) {
    const ultima = await prisma.tentativa.findFirst({
      where: { provaId, alunoId: usuario.id },
      orderBy: { iniciadoEm: "desc" },
    });
    if (ultima) redirect(`/painel/tentativas/${ultima.id}`);
    throw new Error("Você já usou todas as tentativas permitidas.");
  }

  const novaTentativa = await prisma.tentativa.create({
    data: { provaId, alunoId: usuario.id },
  });

  redirect(`/painel/tentativas/${novaTentativa.id}`);
}

export async function enviarTentativa(tentativaId: string, formData: FormData) {
  const usuario = await exigirPapel("ALUNO");

  const tentativa = await prisma.tentativa.findUnique({
    where: { id: tentativaId },
    include: {
      prova: {
        include: {
          provaQuestoes: { include: { questao: { include: { opcoes: true } } } },
        },
      },
    },
  });

  if (!tentativa || tentativa.alunoId !== usuario.id) {
    throw new NaoAutorizadoError();
  }
  if (tentativa.status !== "EM_ANDAMENTO") {
    redirect(`/painel/tentativas/${tentativaId}`);
  }

  let notaTotal = 0;
  const respostas = tentativa.prova.provaQuestoes.map((pq) => {
    const questao = pq.questao;
    const valorCampo = formData.get(`resposta_${questao.id}`);

    if (questao.tipo === "DISSERTATIVA") {
      const texto = String(valorCampo ?? "").trim();
      return {
        tentativaId,
        questaoId: questao.id,
        textoResposta: texto || null,
        correta: null,
        pontuacaoObtida: null,
      };
    }

    const opcaoEscolhida = questao.opcoes.find((o) => o.id === valorCampo);
    const correta = opcaoEscolhida?.correta ?? false;
    const pontuacao = correta ? pq.valor : 0;
    notaTotal += pontuacao;

    return {
      tentativaId,
      questaoId: questao.id,
      opcaoEscolhidaId: opcaoEscolhida?.id ?? null,
      correta,
      pontuacaoObtida: pontuacao,
    };
  });

  await prisma.$transaction([
    prisma.resposta.createMany({ data: respostas }),
    prisma.tentativa.update({
      where: { id: tentativaId },
      data: { status: "ENVIADA", finalizadoEm: new Date(), nota: notaTotal },
    }),
  ]);

  revalidatePath(`/painel/tentativas/${tentativaId}`);
  redirect(`/painel/tentativas/${tentativaId}`);
}
