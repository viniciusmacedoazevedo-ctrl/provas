"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AlternadorTema() {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setEscuro(document.documentElement.classList.contains("dark"));
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function alternar() {
    const novoEstado = !escuro;
    setEscuro(novoEstado);
    document.documentElement.classList.toggle("dark", novoEstado);
    try {
      localStorage.setItem("tema", novoEstado ? "escuro" : "claro");
    } catch {
      // localStorage pode estar indisponível (modo privado); a preferência
      // só não é lembrada na próxima visita.
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={alternar}
      className="gap-2 rounded-full"
    >
      {escuro ? <Sun size={15} /> : <Moon size={15} />}
      {escuro ? "Modo claro" : "Modo escuro"}
    </Button>
  );
}
