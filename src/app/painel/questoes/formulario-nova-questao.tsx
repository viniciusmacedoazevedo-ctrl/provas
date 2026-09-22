"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { criarQuestao } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Disciplina = { id: string; nome: string };
type Assunto = { id: string; nome: string; disciplinaId: string };

const TIPOS = [
  { value: "MULTIPLA_ESCOLHA", label: "Múltipla escolha" },
  { value: "VERDADEIRO_FALSO", label: "Verdadeiro ou falso" },
  { value: "DISSERTATIVA", label: "Dissertativa" },
] as const;

const DIFICULDADES = [
  { value: "FACIL", label: "Fácil" },
  { value: "MEDIA", label: "Média" },
  { value: "DIFICIL", label: "Difícil" },
] as const;

const textareaClass =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function FormularioNovaQuestao({
  disciplinas,
  assuntos,
}: {
  disciplinas: Disciplina[];
  assuntos: Assunto[];
}) {
  const [erro, formAction, pendente] = useActionState(criarQuestao, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["value"]>(
    "MULTIPLA_ESCOLHA",
  );
  const [disciplinaId, setDisciplinaId] = useState("");
  const [opcoes, setOpcoes] = useState(["", ""]);
  const [opcaoCorreta, setOpcaoCorreta] = useState(0);

  useEffect(() => {
    if (!pendente && !erro) {
      formRef.current?.reset();
    }
  }, [pendente, erro]);

  const assuntosFiltrados = disciplinaId
    ? assuntos.filter((a) => a.disciplinaId === disciplinaId)
    : assuntos;

  return (
    <form
      ref={formRef}
      action={formAction}
      onReset={() => {
        setOpcoes(["", ""]);
        setOpcaoCorreta(0);
        setDisciplinaId("");
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="disciplinaId">Disciplina</Label>
          <Select
            id="disciplinaId"
            name="disciplinaId"
            required
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
          >
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
          <Label htmlFor="assuntoId">Assunto (opcional)</Label>
          <Select
            key={disciplinaId}
            id="assuntoId"
            name="assuntoId"
            defaultValue=""
          >
            <option value="">Nenhum</option>
            {assuntosFiltrados.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tipo">Tipo</Label>
          <Select
            id="tipo"
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as typeof tipo)}
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dificuldade">Dificuldade</Label>
          <Select id="dificuldade" name="dificuldade" defaultValue="MEDIA">
            {DIFICULDADES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="enunciado">Enunciado</Label>
        <textarea
          id="enunciado"
          name="enunciado"
          required
          rows={3}
          className={textareaClass}
        />
      </div>

      {tipo === "MULTIPLA_ESCOLHA" && (
        <div className="flex flex-col gap-2">
          <Label>Opções (marque a correta)</Label>
          {opcoes.map((valor, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="opcaoCorreta"
                value={i}
                checked={opcaoCorreta === i}
                onChange={() => setOpcaoCorreta(i)}
                aria-label={`Opção ${i + 1} é a correta`}
              />
              <Input
                name="opcaoTexto"
                value={valor}
                onChange={(e) => {
                  const novas = [...opcoes];
                  novas[i] = e.target.value;
                  setOpcoes(novas);
                }}
                placeholder={`Opção ${i + 1}`}
                required
              />
              {opcoes.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpcoes(opcoes.filter((_, idx) => idx !== i));
                    if (opcaoCorreta === i) setOpcaoCorreta(0);
                  }}
                >
                  Remover
                </Button>
              )}
            </div>
          ))}
          {opcoes.length < 6 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setOpcoes([...opcoes, ""])}
            >
              Adicionar opção
            </Button>
          )}
        </div>
      )}

      {tipo === "VERDADEIRO_FALSO" && (
        <div className="flex flex-col gap-2">
          <Label>Resposta correta</Label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="respostaVF"
                value="verdadeiro"
                defaultChecked
              />
              Verdadeiro
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="respostaVF" value="falso" />
              Falso
            </label>
          </div>
        </div>
      )}

      {tipo === "DISSERTATIVA" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="respostaReferencia">
            Resposta de referência (opcional, apoia a correção manual)
          </Label>
          <textarea
            id="respostaReferencia"
            name="respostaReferencia"
            rows={3}
            className={cn(textareaClass)}
          />
        </div>
      )}

      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" disabled={pendente} className="self-start">
        {pendente ? "Salvando..." : "Salvar questão"}
      </Button>
    </form>
  );
}
