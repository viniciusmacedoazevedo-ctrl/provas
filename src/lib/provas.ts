import { prisma } from "@/lib/prisma";

/**
 * Provas publicadas, dentro do prazo e liberadas para o aluno: uma prova sem
 * nenhuma atribuição em ProvaAluno fica aberta a todos; com atribuições, só
 * quem está na lista vê. Mesma regra usada em `iniciarTentativa`.
 */
export async function provasDisponiveisParaAluno(alunoId: string) {
  const agora = new Date();

  const provasPublicadas = await prisma.prova.findMany({
    where: {
      status: "PUBLICADA",
      OR: [{ dataInicio: null }, { dataInicio: { lte: agora } }],
    },
    orderBy: { criadoEm: "desc" },
    include: { disciplina: { select: { nome: true } } },
  });

  const provasDentroDoPrazo = provasPublicadas.filter(
    (p) => !p.dataFim || p.dataFim >= agora,
  );

  const atribuicoes = await prisma.provaAluno.findMany({
    where: { provaId: { in: provasDentroDoPrazo.map((p) => p.id) } },
    select: { provaId: true, alunoId: true },
  });
  const provasComRestricao = new Set(atribuicoes.map((a) => a.provaId));
  const provasLiberadasParaEsteAluno = new Set(
    atribuicoes.filter((a) => a.alunoId === alunoId).map((a) => a.provaId),
  );

  return provasDentroDoPrazo.filter(
    (p) => !provasComRestricao.has(p.id) || provasLiberadasParaEsteAluno.has(p.id),
  );
}
