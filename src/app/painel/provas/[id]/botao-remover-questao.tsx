"use client";

import { useTransition } from "react";

import { removerQuestaoDaProva } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoRemoverQuestao({
  provaId,
  questaoId,
}: {
  provaId: string;
  questaoId: string;
}) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={emAndamento}
      onClick={() => iniciarTransicao(() => removerQuestaoDaProva(provaId, questaoId))}
    >
      Remover
    </Button>
  );
}
