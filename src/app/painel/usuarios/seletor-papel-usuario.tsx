"use client";

import { useTransition } from "react";

import { alterarPapelUsuario } from "./actions";
import { Select } from "@/components/ui/select";

type Papel = "ADMIN" | "PROFESSOR" | "ALUNO";

export function SeletorPapelUsuario({
  id,
  papelAtual,
}: {
  id: string;
  papelAtual: Papel;
}) {
  const [emAndamento, iniciarTransicao] = useTransition();

  return (
    <Select
      className="w-auto"
      defaultValue={papelAtual}
      disabled={emAndamento}
      onChange={(evento) => {
        const novoPapel = evento.target.value as Papel;
        iniciarTransicao(async () => {
          const resultado = await alterarPapelUsuario(id, novoPapel);
          if (resultado.erro) {
            alert(resultado.erro);
            evento.target.value = papelAtual;
          }
        });
      }}
    >
      <option value="ADMIN">Administrador</option>
      <option value="PROFESSOR">Professor</option>
      <option value="ALUNO">Aluno</option>
    </Select>
  );
}
