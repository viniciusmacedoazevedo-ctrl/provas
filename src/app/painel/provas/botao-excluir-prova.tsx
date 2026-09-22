"use client";

import { useTransition } from "react";

import { excluirProva } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoExcluirProva({ id }: { id: string }) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={emAndamento}
      onClick={() => {
        if (confirm("Excluir esta prova? Tentativas dos alunos também são apagadas.")) {
          iniciarTransicao(() => excluirProva(id));
        }
      }}
    >
      Excluir
    </Button>
  );
}
