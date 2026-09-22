-- AlterTable
ALTER TABLE "questoes" ADD COLUMN     "competencia" TEXT,
ADD COLUMN     "fonte" TEXT,
ADD COLUMN     "habilidade" TEXT,
ADD COLUMN     "numeroOriginal" INTEGER,
ADD COLUMN     "origem" TEXT,
ADD COLUMN     "paginaOrigem" INTEGER,
ADD COLUMN     "precisaRevisao" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "questoes_origem_numeroOriginal_key" ON "questoes"("origem", "numeroOriginal");

