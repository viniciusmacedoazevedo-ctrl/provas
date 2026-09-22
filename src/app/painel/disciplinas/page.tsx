import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormularioNovaDisciplina } from "./formulario-nova-disciplina";
import { BotaoExcluirDisciplina } from "./botao-excluir-disciplina";

export default async function PaginaDisciplinas() {
  const disciplinas = await prisma.disciplina.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { assuntos: true, questoes: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova disciplina</CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioNovaDisciplina />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disciplinas cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {disciplinas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma disciplina cadastrada ainda.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {disciplinas.map((disciplina) => (
                <li
                  key={disciplina.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-medium">{disciplina.nome}</p>
                    {disciplina.descricao && (
                      <p className="text-sm text-muted-foreground">
                        {disciplina.descricao}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {disciplina._count.assuntos} assunto(s) ·{" "}
                      {disciplina._count.questoes} questão(ões)
                    </p>
                  </div>
                  <BotaoExcluirDisciplina id={disciplina.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
