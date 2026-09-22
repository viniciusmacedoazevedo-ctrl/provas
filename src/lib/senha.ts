import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function gerarHashSenha(senha: string) {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

export function verificarSenha(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}
