import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormularioNovaQuestao } from "./formulario-nova-questao";
import { FiltrosQuestoes } from "./filtros-questoes";
import { BotaoExcluirQuestao } from "./botao-excluir-questao";

const TIPOS_VALIDOS = [
  "MULTIPLA_ESCOLHA",
  "VERDADEIRO_FALSO",
  "DISSERTATIVA",
] as const;
const DIFICULDADES_VALIDAS = ["FACIL", "MEDIA", "DIFICIL"] as const;

const rotuloTipo: Record<string, string> = {
  MULTIPLA_ESCOLHA: "Múltipla escolha",
  VERDADEIRO_FALSO: "Verdadeiro/Falso",
  DISSERTATIVA: "Dissertativa",
};

const rotuloDificuldade: Record<string, string> = {
  FACIL: "Fácil",
  MEDIA: "Média",
  DIFICIL: "Difícil",
};

function comoTipo(valor?: string) {
  return TIPOS_VALIDOS.includes(valor as (typeof TIPOS_VALIDOS)[number])
    ? (valor as (typeof TIPOS_VALIDOS)[number])
    : undefined;
}

function comoDificuldade(valor?: string) {
  return DIFICULDADES_VALIDAS.includes(
    valor as (typeof DIFICULDADES_VALIDAS)[number],
  )
    ? (valor as (typeof DIFICULDADES_VALIDAS)[number])
    : undefined;
}

export default async function PaginaQuestoes({
  searchParams,
}: {
  searchParams: Promise<{
    disciplinaId?: string;
    assuntoId?: string;
    tipo?: string;
    dificuldade?: string;
  }>;
}) {
  const filtros = await searchParams;

  const [disciplinas, assuntos, questoes] = await Promise.all([
    prisma.disciplina.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.assunto.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, disciplinaId: true },
    }),
    prisma.questao.findMany({
      where: {
        disciplinaId: filtros.disciplinaId || undefined,
        assuntoId: filtros.assuntoId || undefined,
        tipo: comoTipo(filtros.tipo),
        dificuldade: comoDificuldade(filtros.dificuldade),
      },
      orderBy: { criadoEm: "desc" },
      include: {
        disciplina: { select: { nome: true } },
        assunto: { select: { nome: true } },
        opcoes: { orderBy: { ordem: "asc" } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova questão</CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioNovaQuestao disciplinas={disciplinas} assuntos={assuntos} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar</CardTitle>
        </CardHeader>
        <CardContent>
          <FiltrosQuestoes
            disciplinas={disciplinas}
            assuntos={assuntos}
            filtrosAtuais={filtros}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questões cadastradas ({questoes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {questoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma questão encontrada.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {questoes.map((questao) => (
                <li key={questao.id} className="flex flex-col gap-2 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{questao.enunciado}</p>
                      <p className="text-xs text-muted-foreground">
                        {questao.disciplina.nome}
                        {questao.assunto && ` · ${questao.assunto.nome}`}
                        {" · "}
                        {rotuloTipo[questao.tipo]}
                        {" · "}
                        {rotuloDificuldade[questao.dificuldade]}
                      </p>
                    </div>
                    <BotaoExcluirQuestao id={questao.id} />
                  </div>
                  {questao.opcoes.length > 0 && (
                    <ul className="ml-4 flex flex-col gap-1 text-sm">
                      {questao.opcoes.map((opcao) => (
                        <li
                          key={opcao.id}
                          className={
                            opcao.correta
                              ? "font-medium text-green-700 dark:text-green-400"
                              : "text-muted-foreground"
                          }
                        >
                          {opcao.correta ? "✓ " : "· "}
                          {opcao.texto}
                        </li>
                      ))}
                    </ul>
                  )}
                  {questao.tipo === "DISSERTATIVA" &&
                    questao.respostaReferencia && (
                      <p className="ml-4 text-sm text-muted-foreground">
                        Referência: {questao.respostaReferencia}
                      </p>
                    )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
