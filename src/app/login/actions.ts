"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export async function entrar(_estadoAnterior: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      senha: formData.get("senha"),
      redirectTo: "/painel",
    });
  } catch (erro) {
    if (erro instanceof AuthError) {
      if (erro.type === "CredentialsSignin") {
        return "E-mail ou senha inválidos.";
      }
      return "Não foi possível entrar. Tente novamente.";
    }
    throw erro;
  }
}
