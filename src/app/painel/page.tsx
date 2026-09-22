import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { provasDisponiveisParaAluno } from "@/lib/provas";
import {
  StatusTentativaBadge,
  type StatusExibivel,
} from "@/components/status-tentativa-badge";
import { GraficoNotas } from "./grafico-notas";

export default async function PaginaInicialPainel() {
  const session = await auth();

  if (session?.user.papel === "ALUNO") {
    return <DashboardAluno alunoId={session.user.id} />;
  }

  const [disciplinas, questoes, provas, usuarios] = await Promise.all([
    prisma.disciplina.count(),
    prisma.questao.count(),
    prisma.prova.count(),
    prisma.usuario.count(),
  ]);

  const cartoes = [
    { titulo: "Disciplinas", valor: disciplinas },
    { titulo: "Questões no banco", valor: questoes },
    { titulo: "Provas", valor: provas },
    { titulo: "Usuários", valor: usuarios },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cartoes.map((cartao) => (
        <Card key={cartao.titulo}>
          <CardHeader>
            <CardDescription>{cartao.titulo}</CardDescription>
            <CardTitle className="text-3xl">{cartao.valor}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

async function DashboardAluno({ alunoId }: { alunoId: string }) {
  const [provasDisponiveis, tentativas] = await Promise.all([
    provasDisponiveisParaAluno(alunoId),
    prisma.tentativa.findMany({
      where: { alunoId },
      orderBy: { iniciadoEm: "desc" },
      include: {
        prova: {
          select: {
            id: true,
            titulo: true,
            provaQuestoes: { select: { valor: true } },
          },
        },
      },
    }),
  ]);

  const comNota = tentativas
    .filter((t) => t.status !== "EM_ANDAMENTO" && t.nota !== null)
    .map((t) => {
      const notaMaxima = t.prova.provaQuestoes.reduce((soma, pq) => soma + pq.valor, 0);
      const percentual = notaMaxima > 0 ? ((t.nota as number) / notaMaxima) * 100 : 0;
      return { tentativa: t, notaMaxima, percentual };
    });

  const scoreMedio =
    comNota.length > 0
      ? comNota.reduce((soma, c) => soma + c.percentual, 0) / comNota.length
      : null;

  const idsProvasFeitas = new Set(comNota.map((c) => c.tentativa.provaId));

  const pendentes = provasDisponiveis
    .filter((p) => !idsProvasFeitas.has(p.id))
    .map((prova) => {
      const emAndamento = tentativas.find(
        (t) => t.provaId === prova.id && t.status === "EM_ANDAMENTO",
      );
      return {
        prova,
        status: (emAndamento ? "EM_ANDAMENTO" : "NAO_INICIADA") as StatusExibivel,
      };
    });

  const dadosGrafico = [...comNota]
    .sort((a, b) => a.tentativa.iniciadoEm.getTime() - b.tentativa.iniciadoEm.getTime())
    .map((c) => ({
      id: c.tentativa.id,
      titulo: c.tentativa.prova.titulo,
      percentual: c.percentual,
      nota: c.tentativa.nota as number,
      notaMaxima: c.notaMaxima,
      parcial: c.tentativa.status === "ENVIADA",
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Score médio</CardDescription>
            <CardTitle className="text-3xl">
              {scoreMedio !== null ? `${scoreMedio.toFixed(0)}%` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Provas feitas</CardDescription>
            <CardTitle className="text-3xl">{idsProvasFeitas.size}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Provas pendentes</CardDescription>
            <CardTitle className="text-3xl">{pendentes.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notas por prova</CardTitle>
          <CardDescription>Score (%) obtido em cada prova corrigida</CardDescription>
        </CardHeader>
        <CardContent>
          <GraficoNotas dados={dadosGrafico} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ainda não feitas</CardTitle>
          </CardHeader>
          <CardContent>
            {pendentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma prova pendente no momento.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {pendentes.map(({ prova, status }) => (
                  <li key={prova.id} className="flex flex-col gap-1 py-3">
                    <p className="font-medium">{prova.titulo}</p>
                    <StatusTentativaBadge status={status} />
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/painel/provas"
              className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-4"}
            >
              Ver provas disponíveis
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            {comNota.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Você ainda não concluiu nenhuma prova.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {comNota.map(({ tentativa, notaMaxima, percentual }) => (
                  <li
                    key={tentativa.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{tentativa.prova.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        Nota {tentativa.nota}/{notaMaxima} · {percentual.toFixed(0)}%
                      </p>
                      <StatusTentativaBadge
                        status={tentativa.status as StatusExibivel}
                      />
                    </div>
                    <Link
                      href={`/painel/tentativas/${tentativa.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Ver
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
