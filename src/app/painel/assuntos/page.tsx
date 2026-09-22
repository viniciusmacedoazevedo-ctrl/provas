import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormularioNovoAssunto } from "./formulario-novo-assunto";
import { BotaoExcluirAssunto } from "./botao-excluir-assunto";

export default async function PaginaAssuntos() {
  const [assuntos, disciplinas] = await Promise.all([
    prisma.assunto.findMany({
      orderBy: [{ disciplina: { nome: "asc" } }, { nome: "asc" }],
      include: {
        disciplina: { select: { nome: true } },
        _count: { select: { questoes: true } },
      },
    }),
    prisma.disciplina.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo assunto</CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioNovoAssunto disciplinas={disciplinas} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assuntos cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {assuntos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum assunto cadastrado ainda.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {assuntos.map((assunto) => (
                <li
                  key={assunto.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-medium">{assunto.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {assunto.disciplina.nome}
                      {assunto.descricao && ` · ${assunto.descricao}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assunto._count.questoes} questão(ões)
                    </p>
                  </div>
                  <BotaoExcluirAssunto id={assunto.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
