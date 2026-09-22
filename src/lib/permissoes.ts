import { auth } from "@/auth";

type Papel = "ADMIN" | "PROFESSOR" | "ALUNO";

export class NaoAutorizadoError extends Error {
  constructor() {
    super("Você não tem permissão para realizar esta ação.");
  }
}

/** Garante que há um usuário logado com um dos papéis informados. Lança erro caso contrário. */
export async function exigirPapel(...papeisPermitidos: Papel[]) {
  const session = await auth();
  if (!session?.user || !papeisPermitidos.includes(session.user.papel)) {
    throw new NaoAutorizadoError();
  }
  return session.user;
}
