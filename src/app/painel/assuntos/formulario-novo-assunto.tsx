"use client";

import { useActionState, useRef, useEffect } from "react";

import { criarAssunto } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Disciplina = { id: string; nome: string };

export function FormularioNovoAssunto({
  disciplinas,
}: {
  disciplinas: Disciplina[];
}) {
  const [erro, formAction, pendente] = useActionState(criarAssunto, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pendente && !erro) {
      formRef.current?.reset();
    }
  }, [pendente, erro]);

  if (disciplinas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Cadastre uma disciplina antes de adicionar assuntos.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="disciplinaId">Disciplina</Label>
        <Select id="disciplinaId" name="disciplinaId" required defaultValue="">
          <option value="" disabled>
            Selecione...
          </option>
          {disciplinas.map((disciplina) => (
            <option key={disciplina.id} value={disciplina.id}>
              {disciplina.nome}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="nome">Nome do assunto</Label>
        <Input id="nome" name="nome" required placeholder="Ex: Frações" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Input id="descricao" name="descricao" />
      </div>
      <Button type="submit" disabled={pendente}>
        {pendente ? "Adicionando..." : "Adicionar"}
      </Button>
      {erro && <p className="text-sm text-destructive sm:ml-3">{erro}</p>}
    </form>
  );
}
