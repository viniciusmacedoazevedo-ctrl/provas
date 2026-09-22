"use client";

import { useTransition } from "react";

import { excluirQuestao } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoExcluirQuestao({ id }: { id: string }) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={emAndamento}
      onClick={() => {
        if (confirm("Excluir esta questão?")) {
          iniciarTransicao(() => excluirQuestao(id));
        }
      }}
    >
      Excluir
    </Button>
  );
}
