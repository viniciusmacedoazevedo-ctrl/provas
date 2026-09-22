"use client";

import { useTransition } from "react";

import { removerAlunoDaProva } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoRemoverAluno({
  provaId,
  alunoId,
}: {
  provaId: string;
  alunoId: string;
}) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={emAndamento}
      onClick={() => iniciarTransicao(() => removerAlunoDaProva(provaId, alunoId))}
    >
      Remover
    </Button>
  );
}
