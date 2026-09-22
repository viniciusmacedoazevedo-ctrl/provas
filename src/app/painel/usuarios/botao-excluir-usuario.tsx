"use client";

import { useTransition } from "react";

import { excluirUsuario } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoExcluirUsuario({
  id,
  desabilitado,
}: {
  id: string;
  desabilitado?: boolean;
}) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={desabilitado || emAndamento}
      onClick={() => {
        if (confirm("Excluir este usuário? Esta ação não pode ser desfeita.")) {
          iniciarTransicao(async () => {
            const resultado = await excluirUsuario(id);
            if (resultado.erro) {
              alert(resultado.erro);
            }
          });
        }
      }}
    >
      Excluir
    </Button>
  );
}
