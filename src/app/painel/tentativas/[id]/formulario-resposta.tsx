"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { enviarTentativa } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Opcao = { id: string; texto: string };
type Questao = {
  id: string;
  enunciado: string;
  tipo: "MULTIPLA_ESCOLHA" | "VERDADEIRO_FALSO" | "DISSERTATIVA";
  opcoes: Opcao[];
};

function BotaoEnviar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enviando..." : "Enviar prova"}
    </Button>
  );
}

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(segundos % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function FormularioResposta({
  tentativaId,
  questoes,
  expiraEm,
}: {
  tentativaId: string;
  questoes: Questao[];
  expiraEm: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const acaoComTentativa = enviarTentativa.bind(null, tentativaId);

  const [segundosRestantes, setSegundosRestantes] = useState<number | null>(null);

  useEffect(() => {
    if (!expiraEm) return;

    const tick = () => {
      const restante = Math.max(
        0,
        Math.round((new Date(expiraEm).getTime() - Date.now()) / 1000),
      );
      setSegundosRestantes(restante);
      if (restante <= 0) {
        clearInterval(intervalo);
        formRef.current?.requestSubmit();
      }
    };

    const intervalo = setInterval(tick, 1000);
    return () => clearInterval(intervalo);
  }, [expiraEm]);

  return (
    <form ref={formRef} action={acaoComTentativa} className="flex flex-col gap-4">
      {segundosRestantes !== null && (
        <div
          className={
            segundosRestantes <= 60
              ? "text-sm font-medium text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          Tempo restante: {formatarTempo(segundosRestantes)}
        </div>
      )}

      {questoes.map((questao, i) => (
        <Card key={questao.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {i + 1}. {questao.enunciado}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {questao.tipo === "DISSERTATIVA" ? (
              <textarea
                name={`resposta_${questao.id}`}
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Digite sua resposta..."
              />
            ) : (
              questao.opcoes.map((opcao) => (
                <label key={opcao.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`resposta_${questao.id}`}
                    value={opcao.id}
                  />
                  {opcao.texto}
                </label>
              ))
            )}
          </CardContent>
        </Card>
      ))}

      <BotaoEnviar />
    </form>
  );
}
