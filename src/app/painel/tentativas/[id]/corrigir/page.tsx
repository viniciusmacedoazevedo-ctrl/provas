import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/permissoes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { salvarCorrecao } from "./actions";

const rotuloTipo: Record<string, string> = {
  MULTIPLA_ESCOLHA: "Múltipla escolha",
  VERDADEIRO_FALSO: "Verdadeiro/Falso",
  DISSERTATIVA: "Dissertativa",
};

export default async function PaginaCorrigirTentativa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exigirPapel("ADMIN", "PROFESSOR");

  const tentativa = await prisma.tentativa.findUnique({
    where: { id },
    include: {
      aluno: { select: { nome: true, email: true } },
      prova: {
        include: {
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

  if (tentativa.status === "EM_ANDAMENTO") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tentativa.prova.titulo}</CardTitle>
          <CardDescription>
            {tentativa.aluno.nome} ainda não enviou esta prova.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const respostasPorQuestao = new Map(
    tentativa.respostas.map((r) => [r.questaoId, r]),
  );
  const acaoComId = salvarCorrecao.bind(null, tentativa.id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/painel/provas/${tentativa.provaId}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar para a prova
      </Link>

      <form action={acaoComId} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Corrigir: {tentativa.prova.titulo}</CardTitle>
          <CardDescription>
            Aluno: {tentativa.aluno.nome} ({tentativa.aluno.email}) · Status:{" "}
            {tentativa.status} · Nota atual: {tentativa.nota ?? 0}
          </CardDescription>
        </CardHeader>
      </Card>

      {tentativa.prova.provaQuestoes.map((pq, i) => {
        const questao = pq.questao;
        const resposta = respostasPorQuestao.get(questao.id);
        return (
          <Card key={questao.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {i + 1}. {questao.enunciado}
              </CardTitle>
              <CardDescription>
                {rotuloTipo[questao.tipo]} · vale {pq.valor}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {questao.tipo === "DISSERTATIVA" ? (
                <>
                  <p>
                    Resposta do aluno:{" "}
                    {resposta?.textoResposta || (
                      <span className="text-muted-foreground">(não respondida)</span>
                    )}
                  </p>
                  {questao.respostaReferencia && (
                    <p className="text-muted-foreground">
                      Referência: {questao.respostaReferencia}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`pontos_${questao.id}`}>
                      Pontuação (0 a {pq.valor})
                    </Label>
                    <Input
                      id={`pontos_${questao.id}`}
                      name={`pontos_${questao.id}`}
                      type="number"
                      min={0}
                      max={pq.valor}
                      step="0.5"
                      defaultValue={resposta?.pontuacaoObtida ?? 0}
                      className="w-24"
                    />
                  </div>
                </>
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
                      {escolhida && !opcao.correta && " (resposta do aluno)"}
                    </p>
                  );
                })
              )}
            </CardContent>
          </Card>
        );
      })}

      <Button type="submit" className="self-start">
        Salvar correção
      </Button>
      </form>
    </div>
  );
}
