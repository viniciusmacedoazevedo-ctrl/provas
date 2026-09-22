function hashSemente(semente: string) {
  let h = 1779033703 ^ semente.length;
  for (let i = 0; i < semente.length; i++) {
    h = Math.imul(h ^ semente.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** Embaralha de forma determinística: a mesma `semente` sempre produz a mesma ordem. */
export function embaralharDeterministico<T>(itens: T[], semente: string): T[] {
  const aleatorio = hashSemente(semente);
  const resultado = [...itens];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = aleatorio() % (i + 1);
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}
