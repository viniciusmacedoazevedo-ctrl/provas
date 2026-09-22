"use client";

import { useTransition } from "react";

import { adicionarQuestaoNaProva } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoAdicionarQuestao({
  provaId,
  questaoId,
}: {
  provaId: string;
  questaoId: string;
}) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={emAndamento}
      onClick={() => iniciarTransicao(() => adicionarQuestaoNaProva(provaId, questaoId))}
    >
      Adicionar
    </Button>
  );
}
