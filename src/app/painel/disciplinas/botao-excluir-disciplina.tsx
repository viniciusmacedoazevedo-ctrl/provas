"use client";

import { useTransition } from "react";

import { excluirDisciplina } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoExcluirDisciplina({ id }: { id: string }) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={emAndamento}
      onClick={() => {
        if (confirm("Excluir esta disciplina? Assuntos e questões vinculados também são afetados.")) {
          iniciarTransicao(() => excluirDisciplina(id));
        }
      }}
    >
      Excluir
    </Button>
  );
}
