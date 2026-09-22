import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { exigirPapel } from "@/lib/permissoes";

const rotuloStatus: Record<string, string> = {
  EM_ANDAMENTO: "Em andamento",
  ENVIADA: "Aguardando correção",
  CORRIGIDA: "Corrigida",
};

function paraCampoCsv(valor: string) {
  if (/[",\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await exigirPapel("ADMIN", "PROFESSOR");
  const { id } = await params;

  const prova = await prisma.prova.findUniqueOrThrow({
    where: { id },
    include: {
      tentativas: {
        orderBy: { iniciadoEm: "asc" },
        include: { aluno: { select: { nome: true, email: true } } },
      },
    },
  });

  const cabecalho = ["Aluno", "E-mail", "Status", "Nota", "Iniciado em", "Enviado em"];
  const linhas = prova.tentativas.map((t) =>
    [
      t.aluno.nome,
      t.aluno.email,
      rotuloStatus[t.status],
      t.nota !== null ? String(t.nota) : "",
      t.iniciadoEm.toISOString(),
      t.finalizadoEm ? t.finalizadoEm.toISOString() : "",
    ]
      .map(paraCampoCsv)
      .join(","),
  );

  const csv = [cabecalho.join(","), ...linhas].join("\n");
  const nomeArquivo = `${prova.titulo.replace(/[^a-zA-Z0-9]+/g, "-")}-resultados.csv`;

  return new NextResponse(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
