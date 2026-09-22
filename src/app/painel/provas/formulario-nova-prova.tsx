"use client";

import { useActionState, useRef } from "react";

import { criarProva } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Disciplina = { id: string; nome: string };

export function FormularioNovaProva({
  disciplinas,
}: {
  disciplinas: Disciplina[];
}) {
  const [erro, formAction, pendente] = useActionState(criarProva, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" name="titulo" required placeholder="Ex: Prova 1 - Frações" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="disciplinaId">Disciplina</Label>
          <Select id="disciplinaId" name="disciplinaId" required defaultValue="">
            <option value="" disabled>
              Selecione...
            </option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="duracaoMinutos">Duração em minutos (opcional)</Label>
          <Input
            id="duracaoMinutos"
            name="duracaoMinutos"
            type="number"
            min={1}
            placeholder="Ex: 60"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tentativasPermitidas">Tentativas permitidas</Label>
          <Input
            id="tentativasPermitidas"
            name="tentativasPermitidas"
            type="number"
            min={1}
            defaultValue={1}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dataInicio">Disponível a partir de (opcional)</Label>
          <Input id="dataInicio" name="dataInicio" type="datetime-local" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dataFim">Disponível até (opcional)</Label>
          <Input id="dataFim" name="dataFim" type="datetime-local" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Input id="descricao" name="descricao" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="embaralharQuestoes" />
        Embaralhar a ordem das questões para cada aluno
      </label>

      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" disabled={pendente} className="self-start">
        {pendente ? "Criando..." : "Criar prova"}
      </Button>
    </form>
  );
}
