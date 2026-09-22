/**
 * Importa questões de um JSON gerado pelo importar_pdf.py.
 *
 * Uso:
 *   npx tsx prisma/importar-questoes.ts questoes.json
 *   npx tsx prisma/importar-questoes.ts questoes.json --incluir-revisao
 *   npx tsx prisma/importar-questoes.ts questoes.json --email professor@email.com
 *
 * Por padrão, só importa as questões SEM problemas detectados.
 * Com --incluir-revisao, importa todas; as problemáticas ficam com precisaRevisao = true.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Formato de cada questão no JSON (os nomes vêm do Python)
type QuestaoJson = {
  numero_original: number;
  pagina_pdf?: number;
  competencia?: string;
  habilidade?: string;
  assunto?: string;
  banca?: string;
  texto_base?: string;
  enunciado: string;
  alternativa_a?: string;
  alternativa_b?: string;
  alternativa_c?: string;
  alternativa_d?: string;
  alternativa_e?: string;
  tipo: "multipla_escolha" | "discursiva";
  resposta_correta?: string | null;
  disciplina: string;
  origem: string;
  problemas: string[];
};

async function main() {
  const args = process.argv.slice(2);
  const arquivo = args.find((a) => a.endsWith(".json"));
  if (!arquivo) {
    console.log("Uso: npx tsx prisma/importar-questoes.ts questoes.json");
    return;
  }
  const incluirRevisao = args.includes("--incluir-revisao");
  const email = args.includes("--email") ? args[args.indexOf("--email") + 1] : undefined;

  // Quem aparece como autor das questões importadas
  const autor = email
    ? await prisma.usuario.findUnique({ where: { email } })
    : await prisma.usuario.findFirst({ where: { papel: { in: ["ADMIN", "PROFESSOR"] } } });
  if (!autor) {
    console.log("Nenhum usuário ADMIN/PROFESSOR encontrado. Use --email.");
    return;
  }
  console.log(`Questões serão criadas em nome de: ${autor.nome} (${autor.email})`);

  const questoes: QuestaoJson[] = JSON.parse(readFileSync(arquivo, "utf-8"));

  // Guarda ids já encontrados, para não consultar o banco a cada questão
  const cacheDisciplinas = new Map<string, string>();
  const cacheAssuntos = new Map<string, string>();

  async function idDisciplina(nome: string) {
    if (!cacheDisciplinas.has(nome)) {
      const d =
        (await prisma.disciplina.findFirst({ where: { nome } })) ??
        (await prisma.disciplina.create({ data: { nome, criadoPorId: autor!.id } }));
      cacheDisciplinas.set(nome, d.id);
    }
    return cacheDisciplinas.get(nome)!;
  }

  async function idAssunto(nome: string, disciplinaId: string) {
    const chave = `${disciplinaId}|${nome}`;
    if (!cacheAssuntos.has(chave)) {
      const a =
        (await prisma.assunto.findFirst({ where: { nome, disciplinaId } })) ??
        (await prisma.assunto.create({ data: { nome, disciplinaId } }));
      cacheAssuntos.set(chave, a.id);
    }
    return cacheAssuntos.get(chave)!;
  }

  let criadas = 0, repetidas = 0, puladas = 0;

  for (const q of questoes) {
    const temProblema = q.problemas.length > 0;
    if (temProblema && !incluirRevisao) {
      puladas++;
      continue;
    }

    // Já importada antes? (origem + número original)
    const existente = await prisma.questao.findUnique({
      where: { origem_numeroOriginal: { origem: q.origem, numeroOriginal: q.numero_original } },
    });
    if (existente) {
      repetidas++;
      continue;
    }

    const disciplinaId = await idDisciplina(q.disciplina);
    const assuntoId = q.assunto ? await idAssunto(q.assunto, disciplinaId) : null;

    // O sistema web só exibe o enunciado, então o texto de apoio vai junto, antes dele
    const enunciado = q.texto_base ? `${q.texto_base}\n\n${q.enunciado}` : q.enunciado;

    // Alternativas: A..E viram OpcaoQuestao, marcando a correta pelo gabarito
    const letras = ["a", "b", "c", "d", "e"] as const;
    const opcoes = letras
      .map((letra, ordem) => ({
        texto: (q[`alternativa_${letra}`] ?? "").trim(),
        correta: q.resposta_correta?.toLowerCase() === letra,
        ordem,
      }))
      .filter((o) => o.texto !== "");

    await prisma.questao.create({
      data: {
        enunciado,
        tipo: q.tipo === "discursiva" ? "DISSERTATIVA" : "MULTIPLA_ESCOLHA",
        disciplinaId,
        assuntoId,
        criadoPorId: autor.id,
        fonte: q.banca ?? null,
        origem: q.origem,
        numeroOriginal: q.numero_original,
        paginaOrigem: q.pagina_pdf ?? null,
        competencia: q.competencia ?? null,
        habilidade: q.habilidade ?? null,
        precisaRevisao: temProblema,
        opcoes: { create: opcoes }, // cria a questão e as opções juntas
      },
    });
    criadas++;
  }

  console.log(`${criadas} criadas, ${repetidas} já existiam, ${puladas} puladas por precisarem de revisão.`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
