-- CreateTable
CREATE TABLE "prova_alunos" (
    "provaId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "prova_alunos_pkey" PRIMARY KEY ("provaId","alunoId")
);

-- AddForeignKey
ALTER TABLE "prova_alunos" ADD CONSTRAINT "prova_alunos_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "provas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prova_alunos" ADD CONSTRAINT "prova_alunos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

