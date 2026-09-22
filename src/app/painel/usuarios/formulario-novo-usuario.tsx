"use client";

import { useActionState, useRef, useEffect } from "react";

import { criarUsuario } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function FormularioNovoUsuario() {
  const [erro, formAction, pendente] = useActionState(criarUsuario, undefined);
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
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" required placeholder="Nome completo" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="nome@email.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="papel">Papel</Label>
        <Select id="papel" name="papel" required defaultValue="ALUNO">
          <option value="ADMIN">Administrador</option>
          <option value="PROFESSOR">Professor</option>
          <option value="ALUNO">Aluno</option>
        </Select>
      </div>
      <div className="lg:col-span-4">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Adicionando..." : "Adicionar usuário"}
        </Button>
        {erro && <p className="mt-2 text-sm text-destructive">{erro}</p>}
      </div>
    </form>
  );
}
