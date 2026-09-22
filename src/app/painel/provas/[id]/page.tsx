import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BotaoAdicionarQuestao } from "./botao-adicionar-questao";
import { BotaoRemoverQuestao } from "./botao-remover-questao";
import { BotaoPublicar } from "./botao-publicar";

const rotuloTipo: Record<string, string> = {
  MULTIPLA_ESCOLHA: "Múltipla escolha",
  VERDADEIRO_FALSO: "Verdadeiro/Falso",
  DISSERTATIVA: "Dissertativa",
};

export default async function PaginaMontagemProva({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const prova = await prisma.prova.findUnique({
    where: { id },
    include: {
      disciplina: { select: { nome: true } },
      provaQuestoes: {
        orderBy: { ordem: "asc" },
        include: { questao: true },
      },
    },
  });

  if (!prova) notFound();

  const idsNaProva = prova.provaQuestoes.map((pq) => pq.questaoId);

  const questoesDisponiveis = await prisma.questao.findMany({
    where: {
      disciplinaId: prova.disciplinaId,
      id: { notIn: idsNaProva },
    },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{prova.titulo}</CardTitle>
          <CardDescription>
            {prova.disciplina.nome} · Status: {prova.status} ·{" "}
            {prova.provaQuestoes.length} questão(ões)
            {prova.duracaoMinutos && ` · ${prova.duracaoMinutos} min`}
            {" · "}
            {prova.tentativasPermitidas} tentativa(s) permitida(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BotaoPublicar
            provaId={prova.id}
            publicada={prova.status === "PUBLICADA"}
            podePublicar={prova.provaQuestoes.length > 0}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questões na prova ({prova.provaQuestoes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {prova.provaQuestoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma questão adicionada ainda.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {prova.provaQuestoes.map((pq, i) => (
                <li
                  key={pq.questaoId}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {i + 1}. {rotuloTipo[pq.questao.tipo]} · vale {pq.valor}
                    </p>
                    <p className="font-medium">{pq.questao.enunciado}</p>
                  </div>
                  <BotaoRemoverQuestao provaId={prova.id} questaoId={pq.questaoId} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar questões do banco</CardTitle>
          <CardDescription>
            Mostrando questões de {prova.disciplina.nome} ainda não incluídas nesta
            prova.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questoesDisponiveis.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma questão disponível. Cadastre mais no Banco de Questões.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {questoesDisponiveis.map((questao) => (
                <li
                  key={questao.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {rotuloTipo[questao.tipo]}
                    </p>
                    <p className="font-medium">{questao.enunciado}</p>
                  </div>
                  <BotaoAdicionarQuestao provaId={prova.id} questaoId={questao.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
