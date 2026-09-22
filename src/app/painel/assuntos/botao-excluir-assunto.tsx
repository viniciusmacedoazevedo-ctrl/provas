"use client";

import { useTransition } from "react";

import { excluirAssunto } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoExcluirAssunto({ id }: { id: string }) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={emAndamento}
      onClick={() => {
        if (confirm("Excluir este assunto? Questões vinculadas também são afetadas.")) {
          iniciarTransicao(() => excluirAssunto(id));
        }
      }}
    >
      Excluir
    </Button>
  );
}
