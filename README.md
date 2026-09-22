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
SECRET=$(openssl rand -base64 32)
sed -i "s|AUTH_SECRET=\"\"|AUTH_SECRET=\"$SECRET\"|" .env
```

(o comando `npx auth secret` também existe, mas em alguns ambientes o `npx`
pode resolver um pacote `auth` diferente do esperado — se isso acontecer,
prefira o `openssl` acima ou preencha `AUTH_SECRET` manualmente com
qualquer string aleatória longa.)

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

## Testes e2e

Os testes usam [Playwright](https://playwright.dev) e cobrem o fluxo completo:
professor cria questão e prova, publica, aluno responde e recebe nota
automática.

```bash
npx playwright install chromium   # só na primeira vez
npm run test:e2e
```

Os testes esperam o banco populado pelo `npm run db:seed` (usuários de teste
e a disciplina "Matemática"). Se o servidor de desenvolvimento (`npm run dev`)
já estiver rodando na porta 3000, o Playwright reaproveita ele; caso
contrário, sobe um automaticamente.

## Scripts úteis

| Comando | Descrição |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run lint` | ESLint |
| `npm run test:e2e` | testes e2e (Playwright) |
| `npm run db:migrate` | aplica migrations do Prisma |
| `npm run db:seed` | popula o banco com dados de exemplo |
| `npm run db:studio` | abre o Prisma Studio (explorar o banco visualmente) |
