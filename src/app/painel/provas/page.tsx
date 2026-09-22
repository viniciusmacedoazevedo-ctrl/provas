import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormularioNovaProva } from "./formulario-nova-prova";
import { BotaoExcluirProva } from "./botao-excluir-prova";
import { iniciarTentativa } from "../tentativas/actions";

export default async function PaginaProvas() {
  const session = await auth();

  if (session?.user.papel === "ALUNO") {
    return <ListaProvasAluno alunoId={session.user.id} />;
  }

  const [disciplinas, provas] = await Promise.all([
    prisma.disciplina.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.prova.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        disciplina: { select: { nome: true } },
        _count: { select: { provaQuestoes: true, tentativas: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova prova</CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioNovaProva disciplinas={disciplinas} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provas cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {provas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma prova cadastrada ainda.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {provas.map((prova) => (
                <li
                  key={prova.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <Link
                      href={`/painel/provas/${prova.id}`}
                      className="font-medium hover:underline"
                    >
                      {prova.titulo}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {prova.disciplina.nome} · {prova.status} ·{" "}
                      {prova._count.provaQuestoes} questão(ões) ·{" "}
                      {prova._count.tentativas} tentativa(s) de alunos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/painel/provas/${prova.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Gerenciar
                    </Link>
                    <BotaoExcluirProva id={prova.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function ListaProvasAluno({ alunoId }: { alunoId: string }) {
  const agora = new Date();

  const provasPublicadas = await prisma.prova.findMany({
    where: {
      status: "PUBLICADA",
      OR: [{ dataInicio: null }, { dataInicio: { lte: agora } }],
    },
    orderBy: { criadoEm: "desc" },
    include: { disciplina: { select: { nome: true } } },
  });

  const provasDisponiveis = provasPublicadas.filter(
    (p) => !p.dataFim || p.dataFim >= agora,
  );

  const tentativas = await prisma.tentativa.findMany({
    where: {
      alunoId,
      provaId: { in: provasDisponiveis.map((p) => p.id) },
    },
    orderBy: { iniciadoEm: "desc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provas disponíveis</CardTitle>
      </CardHeader>
      <CardContent>
        {provasDisponiveis.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma prova disponível no momento.
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {provasDisponiveis.map((prova) => {
              const tentativasDaProva = tentativas.filter(
                (t) => t.provaId === prova.id,
              );
              const emAndamento = tentativasDaProva.find(
                (t) => t.status === "EM_ANDAMENTO",
              );
              const esgotou =
                tentativasDaProva.length >= prova.tentativasPermitidas;
              const ultima = tentativasDaProva[0];

              return (
                <li
                  key={prova.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-medium">{prova.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {prova.disciplina.nome}
                      {prova.duracaoMinutos && ` · ${prova.duracaoMinutos} min`}
                      {" · "}
                      {tentativasDaProva.length}/{prova.tentativasPermitidas}{" "}
                      tentativa(s) usada(s)
                    </p>
                  </div>
                  {emAndamento ? (
                    <Link
                      href={`/painel/tentativas/${emAndamento.id}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      Continuar
                    </Link>
                  ) : esgotou ? (
                    ultima && (
                      <Link
                        href={`/painel/tentativas/${ultima.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Ver resultado
                      </Link>
                    )
                  ) : (
                    <form action={iniciarTentativa.bind(null, prova.id)}>
                      <Button type="submit" size="sm">
                        Iniciar prova
                      </Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
