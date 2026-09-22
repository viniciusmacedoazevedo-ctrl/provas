import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { embaralharDeterministico } from "@/lib/embaralhar";
import { FormularioResposta } from "./formulario-resposta";

const rotuloTipo: Record<string, string> = {
  MULTIPLA_ESCOLHA: "Múltipla escolha",
  VERDADEIRO_FALSO: "Verdadeiro/Falso",
  DISSERTATIVA: "Dissertativa",
};

export default async function PaginaTentativa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const tentativa = await prisma.tentativa.findUnique({
    where: { id },
    include: {
      prova: {
        include: {
          disciplina: { select: { nome: true } },
          provaQuestoes: {
            orderBy: { ordem: "asc" },
            include: {
              questao: { include: { opcoes: { orderBy: { ordem: "asc" } } } },
            },
          },
        },
      },
      respostas: true,
    },
  });

  if (!tentativa) notFound();
  if (tentativa.alunoId !== session?.user.id && session?.user.papel !== "ADMIN") {
    notFound();
  }

  const questoesOrdenadas = tentativa.prova.embaralharQuestoes
    ? embaralharDeterministico(tentativa.prova.provaQuestoes, tentativa.id)
    : tentativa.prova.provaQuestoes;

  if (tentativa.status === "EM_ANDAMENTO") {
    const expiraEm = tentativa.prova.duracaoMinutos
      ? new Date(
          tentativa.iniciadoEm.getTime() + tentativa.prova.duracaoMinutos * 60_000,
        ).toISOString()
      : null;

    const questoesParaCliente = questoesOrdenadas.map((pq) => ({
      id: pq.questao.id,
      enunciado: pq.questao.enunciado,
      tipo: pq.questao.tipo,
      opcoes: pq.questao.opcoes.map((o) => ({ id: o.id, texto: o.texto })),
    }));

    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{tentativa.prova.titulo}</CardTitle>
            <CardDescription>{tentativa.prova.disciplina.nome}</CardDescription>
          </CardHeader>
        </Card>
        <FormularioResposta
          tentativaId={tentativa.id}
          questoes={questoesParaCliente}
          expiraEm={expiraEm}
        />
      </div>
    );
  }

  const respostasPorQuestao = new Map(
    tentativa.respostas.map((r) => [r.questaoId, r]),
  );
  const temDissertativa = tentativa.prova.provaQuestoes.some(
    (pq) => pq.questao.tipo === "DISSERTATIVA",
  );
  const notaParcial = temDissertativa && tentativa.status === "ENVIADA";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{tentativa.prova.titulo}</CardTitle>
          <CardDescription>
            {tentativa.prova.disciplina.nome} · Nota{notaParcial ? " parcial" : ""}:{" "}
            {tentativa.nota ?? 0}
          </CardDescription>
        </CardHeader>
        {notaParcial && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esta prova tem questões dissertativas que ainda serão corrigidas
              manualmente. A nota final pode mudar.
            </p>
          </CardContent>
        )}
      </Card>

      {questoesOrdenadas.map((pq, i) => {
        const questao = pq.questao;
        const resposta = respostasPorQuestao.get(questao.id);
        return (
          <Card key={questao.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {i + 1}. {questao.enunciado}
              </CardTitle>
              <CardDescription>{rotuloTipo[questao.tipo]}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              {questao.tipo === "DISSERTATIVA" ? (
                <p>
                  Sua resposta:{" "}
                  {resposta?.textoResposta || (
                    <span className="text-muted-foreground">(não respondida)</span>
                  )}
                </p>
              ) : (
                questao.opcoes.map((opcao) => {
                  const escolhida = resposta?.opcaoEscolhidaId === opcao.id;
                  return (
                    <p
                      key={opcao.id}
                      className={
                        opcao.correta
                          ? "font-medium text-green-700 dark:text-green-400"
                          : escolhida
                            ? "font-medium text-destructive"
                            : "text-muted-foreground"
                      }
                    >
                      {opcao.correta ? "✓ " : escolhida ? "✗ " : "· "}
                      {opcao.texto}
                      {escolhida && !opcao.correta && " (sua resposta)"}
                    </p>
                  );
                })
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
