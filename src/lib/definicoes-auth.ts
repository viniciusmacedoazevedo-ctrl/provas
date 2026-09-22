import type { NextAuthConfig } from "next-auth";

// Configuração compartilhada entre o middleware (Edge) e o handler principal do Auth.js.
// Fica separada de `src/auth.ts` porque o middleware não pode importar o Prisma Client.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const logado = !!auth?.user;
      const emAreaProtegida = request.nextUrl.pathname.startsWith("/painel");

      if (emAreaProtegida) return logado;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
