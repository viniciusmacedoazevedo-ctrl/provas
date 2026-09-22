"use client";

import { useActionState, useRef, useEffect } from "react";

import { criarDisciplina } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FormularioNovaDisciplina() {
  const [erro, formAction, pendente] = useActionState(
    criarDisciplina,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pendente && !erro) {
      formRef.current?.reset();
    }
  }, [pendente, erro]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="nome">Nome da disciplina</Label>
        <Input id="nome" name="nome" required placeholder="Ex: Matemática" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Input id="descricao" name="descricao" placeholder="Ex: Ensino médio" />
      </div>
      <Button type="submit" disabled={pendente}>
        {pendente ? "Adicionando..." : "Adicionar"}
      </Button>
      {erro && <p className="text-sm text-destructive sm:ml-3">{erro}</p>}
    </form>
  );
}
