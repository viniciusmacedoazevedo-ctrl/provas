import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { BotaoAdicionarQuestao } from "./botao-adicionar-questao";
import { BotaoRemoverQuestao } from "./botao-remover-questao";
import { BotaoPublicar } from "./botao-publicar";
import { BotaoAtribuirAluno } from "./botao-atribuir-aluno";
import { BotaoRemoverAluno } from "./botao-remover-aluno";

const rotuloStatusTentativa: Record<string, string> = {
  EM_ANDAMENTO: "Em andamento",
  ENVIADA: "Aguardando correção",
  CORRIGIDA: "Corrigida",
};

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
      alunosAtribuidos: {
        include: { aluno: { select: { id: true, nome: true, email: true } } },
      },
    },
  });

  if (!prova) notFound();

  const todosAlunos = await prisma.usuario.findMany({
    where: { papel: "ALUNO" },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, email: true },
  });

  const restrita = prova.alunosAtribuidos.length > 0;
  const idsAtribuidos = new Set(prova.alunosAtribuidos.map((pa) => pa.alunoId));
  const alunosDisponiveisParaAtribuir = todosAlunos.filter(
    (a) => !idsAtribuidos.has(a.id),
  );

  const idsNaProva = prova.provaQuestoes.map((pq) => pq.questaoId);

  const questoesDisponiveis = await prisma.questao.findMany({
    where: {
      disciplinaId: prova.disciplinaId,
      id: { notIn: idsNaProva },
    },
    orderBy: { criadoEm: "desc" },
  });

  const tentativas = await prisma.tentativa.findMany({
    where: { provaId: prova.id },
    orderBy: { iniciadoEm: "desc" },
    include: { aluno: { select: { nome: true, email: true } } },
  });

  const notasFinalizadas = tentativas
    .filter((t) => t.status !== "EM_ANDAMENTO" && t.nota !== null)
    .map((t) => t.nota as number);
  const mediaNotas =
    notasFinalizadas.length > 0
      ? notasFinalizadas.reduce((soma, n) => soma + n, 0) / notasFinalizadas.length
      : null;

  const tentativasPorAluno = new Map<string, typeof tentativas>();
  for (const tentativa of tentativas) {
    const lista = tentativasPorAluno.get(tentativa.alunoId) ?? [];
    lista.push(tentativa);
    tentativasPorAluno.set(tentativa.alunoId, lista);
  }

  const alunosDaProva = restrita
    ? prova.alunosAtribuidos.map((pa) => pa.aluno)
    : todosAlunos;

  const roster = alunosDaProva
    .map((aluno) => ({
      aluno,
      tentativas: tentativasPorAluno.get(aluno.id) ?? [],
    }))
    .sort((a, b) => a.aluno.nome.localeCompare(b.aluno.nome));

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/painel/provas"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar para Provas
      </Link>

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
          <CardTitle>
            Alunos com acesso ({restrita ? prova.alunosAtribuidos.length : "todos"})
          </CardTitle>
          <CardDescription>
            {restrita
              ? "Apenas os alunos abaixo podem ver e responder esta prova."
              : "Nenhum aluno específico foi atribuído: a prova fica aberta para todos os alunos. Adicione um aluno abaixo para restringir o acesso."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {restrita && (
            <ul className="flex flex-col divide-y">
              {prova.alunosAtribuidos.map((pa) => (
                <li
                  key={pa.alunoId}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-medium">{pa.aluno.nome}</p>
                    <p className="text-xs text-muted-foreground">{pa.aluno.email}</p>
                  </div>
                  <BotaoRemoverAluno provaId={prova.id} alunoId={pa.alunoId} />
                </li>
              ))}
            </ul>
          )}
          {alunosDisponiveisParaAtribuir.length > 0 && (
            <details>
              <summary className="cursor-pointer text-sm text-muted-foreground">
                {restrita ? "Adicionar outro aluno" : "Restringir a alunos específicos"}
              </summary>
              <ul className="mt-2 flex flex-col divide-y">
                {alunosDisponiveisParaAtribuir.map((aluno) => (
                  <li
                    key={aluno.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{aluno.nome}</p>
                      <p className="text-xs text-muted-foreground">{aluno.email}</p>
                    </div>
                    <BotaoAtribuirAluno provaId={prova.id} alunoId={aluno.id} />
                  </li>
                ))}
              </ul>
            </details>
          )}
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

      <Card>
        <CardHeader>
          <CardTitle>Resultados ({roster.length} aluno(s))</CardTitle>
          <CardDescription>
            {mediaNotas !== null
              ? `Média das tentativas finalizadas: ${mediaNotas.toFixed(2)}`
              : "Nenhuma tentativa finalizada ainda."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {tentativas.length > 0 && (
            <a
              href={`/painel/provas/${prova.id}/exportar`}
              className={buttonVariants({ variant: "outline", size: "sm" }) + " self-start"}
            >
              Exportar CSV
            </a>
          )}
          {roster.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum aluno cadastrado ainda.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {roster.map(({ aluno, tentativas: tentativasDoAluno }) => {
                const ultima = tentativasDoAluno[0];
                return (
                  <li
                    key={aluno.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{aluno.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {ultima
                          ? rotuloStatusTentativa[ultima.status]
                          : "Não iniciou"}
                        {" · "}
                        {tentativasDoAluno.length}/{prova.tentativasPermitidas}{" "}
                        tentativa(s)
                        {ultima &&
                          ultima.status !== "EM_ANDAMENTO" &&
                          ` · nota ${ultima.nota ?? 0}`}
                      </p>
                    </div>
                    {ultima && ultima.status !== "EM_ANDAMENTO" ? (
                      <Link
                        href={`/painel/tentativas/${ultima.id}/corrigir`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        {ultima.status === "ENVIADA" ? "Corrigir" : "Ver correção"}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
