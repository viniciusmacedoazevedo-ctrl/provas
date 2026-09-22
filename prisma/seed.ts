import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const senhaHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@provas.local" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@provas.local",
      senhaHash,
      papel: "ADMIN",
    },
  });

  const professor = await prisma.usuario.upsert({
    where: { email: "professor@provas.local" },
    update: {},
    create: {
      nome: "Professor Exemplo",
      email: "professor@provas.local",
      senhaHash,
      papel: "PROFESSOR",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "aluno@provas.local" },
    update: {},
    create: {
      nome: "Aluno Exemplo",
      email: "aluno@provas.local",
      senhaHash,
      papel: "ALUNO",
    },
  });

  const disciplina = await prisma.disciplina.upsert({
    where: { id: "disciplina-exemplo" },
    update: {},
    create: {
      id: "disciplina-exemplo",
      nome: "Matemática",
      descricao: "Disciplina de exemplo criada pelo seed.",
      criadoPorId: professor.id,
    },
  });

  console.log("Seed concluído:");
  console.log(`- admin@provas.local / professor@provas.local / aluno@provas.local (senha: 123456)`);
  console.log(`- disciplina de exemplo: ${disciplina.nome}`);
  console.log(`- criado por: ${admin.nome}`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
