import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      papel: "ADMIN" | "PROFESSOR" | "ALUNO";
    } & DefaultSession["user"];
  }

  interface User {
    papel: "ADMIN" | "PROFESSOR" | "ALUNO";
  }
}
