import { prisma } from "@/lib/prisma";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PaginaInicialPainel() {
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
