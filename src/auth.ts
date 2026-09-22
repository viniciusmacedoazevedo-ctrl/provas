import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { authConfig } from "@/lib/definicoes-auth";
import { prisma } from "@/lib/prisma";
import { verificarSenha } from "@/lib/senha";

const credenciaisSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credenciais) {
        const dados = credenciaisSchema.safeParse(credenciais);
        if (!dados.success) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: dados.data.email },
        });
        if (!usuario) return null;

        const senhaValida = await verificarSenha(
          dados.data.senha,
          usuario.senhaHash,
        );
        if (!senhaValida) return null;

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          papel: usuario.papel,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.papel = user.papel as string;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.papel = token.papel as "ADMIN" | "PROFESSOR" | "ALUNO";
      }
      return session;
    },
  },
});
