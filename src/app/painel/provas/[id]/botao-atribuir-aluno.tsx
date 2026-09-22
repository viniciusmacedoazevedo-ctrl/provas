"use client";

import { useTransition } from "react";

import { atribuirAlunoAProva } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoAtribuirAluno({
  provaId,
  alunoId,
}: {
  provaId: string;
  alunoId: string;
}) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={emAndamento}
      onClick={() => iniciarTransicao(() => atribuirAlunoAProva(provaId, alunoId))}
    >
      Adicionar
    </Button>
  );
}
