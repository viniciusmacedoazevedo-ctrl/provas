"use client";

import { useActionState, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  ChartColumn,
  Eye,
  EyeOff,
  FilePlus,
  Lock,
  Mail,
  Users,
} from "lucide-react";

import { entrar } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { AlternadorTema } from "@/components/theme-toggle";

const recursos = [
  { titulo: "Banco de questões", Icone: BookOpenCheck, cor: "bg-blue-100 text-blue-600" },
  { titulo: "Criação de provas", Icone: FilePlus, cor: "bg-teal-100 text-teal-600" },
  { titulo: "Relatórios de desempenho", Icone: ChartColumn, cor: "bg-violet-100 text-violet-600" },
  { titulo: "Gestão de usuários", Icone: Users, cor: "bg-orange-100 text-orange-600" },
];

export default function PaginaLogin() {
  const [erro, formAction, pendente] = useActionState(entrar, undefined);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="relative flex flex-1 flex-col lg:flex-row">
        {/* painel institucional */}
        <div className="relative flex flex-1 flex-col justify-between gap-10 overflow-hidden bg-gradient-to-br from-blue-50 via-background to-teal-50 px-8 py-8 lg:px-16 lg:py-12 dark:from-blue-950/40 dark:via-background dark:to-teal-950/30">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-10 left-1/4 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-500/10"
          />

          <div className="relative flex items-center justify-between">
            <Logo tamanhoIcone={24} />
            <AlternadorTema />
          </div>

          <div className="relative flex max-w-lg flex-col gap-6">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
              <span className="h-px w-6 bg-primary" /> Conhecimento transforma
            </p>
            <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance lg:text-5xl">
              Crie, aplique e{" "}
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                evolua
              </span>{" "}
              com provas
            </h1>
            <p className="text-muted-foreground">
              Uma plataforma completa para disciplinas, banco de questões, montagem de
              provas, aplicação para os alunos e correção — tudo em um só lugar.
            </p>

            <div className="grid grid-cols-2 gap-5 pt-4 sm:grid-cols-4">
              {recursos.map(({ titulo, Icone, cor }) => (
                <div key={titulo} className="flex flex-col items-start gap-2">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${cor}`}
                  >
                    <Icone size={18} />
                  </span>
                  <span className="text-sm font-medium text-foreground">{titulo}</span>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="relative max-w-sm border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground italic">
            &ldquo;Educação é o ponto de partida para grandes conquistas.&rdquo;
          </blockquote>
        </div>

        {/* card de login */}
        <div className="flex flex-1 items-center justify-center border-t bg-card px-6 py-12 lg:max-w-md lg:border-t-0 lg:border-l">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex justify-center text-2xl">
              <Logo tamanhoIcone={34} empilhado className="items-center text-center" />
            </div>
            <Card className="border-none shadow-none lg:border lg:shadow-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Bem-vindo de volta!</CardTitle>
                <CardDescription>Acesse sua conta para continuar.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={formAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                        size={16}
                      />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="seu@email.com"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="senha">Senha</Label>
                    <div className="relative">
                      <Lock
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                        size={16}
                      />
                      <Input
                        id="senha"
                        name="senha"
                        type={mostrarSenha ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        placeholder="Sua senha"
                        className="pr-9 pl-9"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha((v) => !v)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  {erro && <p className="text-sm text-destructive">{erro}</p>}
                  <Button
                    type="submit"
                    disabled={pendente}
                    className="mt-2 gap-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90"
                  >
                    {pendente ? "Entrando..." : "Entrar"}
                    {!pendente && <ArrowRight size={16} />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="flex flex-col items-center gap-1 border-t bg-background px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span>Vinicius Provas · Plataforma de Avaliações</span>
        <span>v1.0.0</span>
      </footer>
    </div>
  );
}
