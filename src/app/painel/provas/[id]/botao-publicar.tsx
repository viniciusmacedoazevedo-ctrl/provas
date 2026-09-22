"use client";

import { useTransition } from "react";

import { alternarPublicacaoProva } from "./actions";
import { Button } from "@/components/ui/button";

export function BotaoPublicar({
  provaId,
  publicada,
  podePublicar,
}: {
  provaId: string;
  publicada: boolean;
  podePublicar: boolean;
}) {
  const [emAndamento, iniciarTransicao] = useTransition();

  if (!publicada && !podePublicar) {
    return (
      <p className="text-sm text-muted-foreground">
        Adicione pelo menos uma questão para publicar.
      </p>
    );
  }

  return (
    <Button
      variant={publicada ? "outline" : "default"}
      disabled={emAndamento}
      onClick={() => {
        if (
          !publicada ||
          confirm("Despublicar a prova? Alunos não poderão mais acessá-la.")
        ) {
          iniciarTransicao(() => alternarPublicacaoProva(provaId));
        }
      }}
    >
      {publicada ? "Despublicar" : "Publicar prova"}
    </Button>
  );
}
