# provas

Sistema web completo para criação, gerenciamento e aplicação de provas.

Veja a arquitetura completa, o modelo de dados e o plano de desenvolvimento em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL + Auth.js.

## Rodando localmente

### 1. Banco de dados

Suba um Postgres local com Docker:

```bash
docker compose up -d
```

Se preferir usar um Postgres já instalado na máquina, crie o banco/usuário indicados em `.env.example` manualmente.

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Ajuste `DATABASE_URL` se necessário e gere um `AUTH_SECRET`:

```bash
npx auth secret
```

### 3. Instalar dependências e preparar o banco

```bash
npm install
npm run db:migrate   # cria as tabelas
npm run db:seed      # cria usuários e dados de exemplo
```

O seed cria três usuários de teste (senha `123456` para todos):

- `admin@provas.local` — papel ADMIN
- `professor@provas.local` — papel PROFESSOR
- `aluno@provas.local` — papel ALUNO

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts úteis

| Comando | Descrição |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run lint` | ESLint |
| `npm run db:migrate` | aplica migrations do Prisma |
| `npm run db:seed` | popula o banco com dados de exemplo |
| `npm run db:studio` | abre o Prisma Studio (explorar o banco visualmente) |
