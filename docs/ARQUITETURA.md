# Arquitetura do sistema de provas

## 1. Visão geral

Aplicação web monolítica (não microserviços): frontend renderizado no servidor e API
integrados em um único projeto Next.js, com um banco relacional único. Esse desenho
foi escolhido porque o domínio (disciplina → assunto → questão → prova → tentativa →
resposta) é fortemente relacional e o escopo não justifica a complexidade operacional
de múltiplos serviços — um monólito modular é mais fácil de manter por um time pequeno.

- **Frontend + Backend no mesmo projeto**: páginas server-rendered para telas de
  gestão (CRUD) e Server Actions para lógica de negócio; um fluxo client-side dedicado
  para a *aplicação da prova* (timer, autosave, navegação entre questões) será
  adicionado na Fase 5.
- **Banco relacional único** (PostgreSQL) acessado via Prisma ORM.
- **Autenticação own-hosted** com sessões JWT (Auth.js/NextAuth v5), papéis simples
  no banco (`ADMIN` / `PROFESSOR` / `ALUNO`), com espaço para evoluir para permissões
  granulares depois.
- **Camada de domínio separada da UI**: regras de negócio ficam em Server Actions e
  módulos por domínio (`src/app/painel/<modulo>/actions.ts`), não espalhadas em
  componentes React.

## 2. Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| Linguagem | TypeScript | tipagem estática ponta a ponta |
| Framework | Next.js 16 (App Router) | full-stack em um único projeto, deploy simples |
| UI | Tailwind CSS v4 + componentes no estilo shadcn/ui (escritos à mão) | produtividade, consistência, sem lock-in pesado |
| ORM | Prisma 7 (driver adapter `@prisma/adapter-pg`) | migrations versionadas, type-safety com o banco |
| Banco | PostgreSQL | relacional, robusto, ótima integridade referencial |
| Auth | Auth.js / NextAuth v5 (Credentials + JWT) | padrão de mercado para Next.js App Router |
| Validação | Zod | validação de formulários e payloads |
| Hash de senha | bcryptjs | portátil (sem binário nativo), suficiente para o volume esperado |
| Infra local | Docker Compose (Postgres) ou Postgres local | onboarding simples |

> Nota: os componentes de UI foram escritos manualmente seguindo o padrão shadcn/ui
> (`class-variance-authority` + `tailwind-merge`) porque o registro `ui.shadcn.com`
> não estava acessível no ambiente onde o projeto foi iniciado. Para adicionar novos
> componentes do shadcn normalmente, rode `npx shadcn@latest add <componente>` em um
> ambiente com acesso à internet.

## 3. Estrutura de pastas

```
provas/
├── docker-compose.yml          # Postgres local
├── prisma7.config.ts           # config do Prisma CLI (schema, migrations, seed)
├── prisma/
│   ├── schema.prisma            # modelo de dados
│   ├── migrations/
│   └── seed.ts                  # dados iniciais (usuários de teste, disciplina exemplo)
├── src/
│   ├── app/
│   │   ├── login/                        # login (público)
│   │   ├── painel/                       # área autenticada
│   │   │   ├── layout.tsx                # navegação + verificação de sessão
│   │   │   ├── disciplinas/              # CRUD completo (referência)
│   │   │   ├── assuntos/                 # placeholder (Fase 2)
│   │   │   ├── questoes/                 # placeholder (Fase 3)
│   │   │   ├── provas/                   # placeholder (Fase 4)
│   │   │   └── usuarios/                 # placeholder (Fase 1, gestão de usuários)
│   │   └── api/auth/[...nextauth]/       # handler do Auth.js
│   ├── auth.ts                  # configuração principal do Auth.js (Credentials + Prisma)
│   ├── proxy.ts                 # proteção de rotas (era "middleware" até o Next 16)
│   ├── components/ui/           # Button, Input, Label, Card
│   ├── lib/
│   │   ├── prisma.ts             # client singleton (com driver adapter pg)
│   │   ├── senha.ts              # hash/verificação de senha
│   │   ├── permissoes.ts         # helper `exigirPapel` para checagens de autorização
│   │   └── definicoes-auth.ts    # config leve do Auth.js (compartilhada com o proxy)
│   ├── types/next-auth.d.ts     # augmentation de tipos da sessão (id, papel)
│   └── generated/prisma/        # client Prisma gerado (gitignored)
└── docs/
    └── ARQUITETURA.md
```

## 4. Modelo de dados

Ver `prisma/schema.prisma` para a fonte da verdade. Resumo das entidades:

```
Usuario        (id, nome, email, senhaHash, papel[ADMIN|PROFESSOR|ALUNO])
Disciplina     (id, nome, descricao, criadoPorId)
Assunto        (id, nome, disciplinaId, descricao)
Questao        (id, enunciado, tipo[MULTIPLA_ESCOLHA|VERDADEIRO_FALSO|DISSERTATIVA],
                dificuldade, disciplinaId, assuntoId, criadoPorId)
OpcaoQuestao   (id, questaoId, texto, correta)              # opções de M.E. / V-F
Prova          (id, titulo, disciplinaId, criadoPorId, duracaoMinutos,
                tentativasPermitidas, embaralharQuestoes, dataInicio, dataFim, status)
ProvaQuestao   (provaId, questaoId, ordem, valor)             # join table
Tentativa      (id, provaId, alunoId, status, iniciadoEm, finalizadoEm, nota)
Resposta       (tentativaId, questaoId, opcaoEscolhidaId?, textoResposta?,
                correta?, pontuacaoObtida?)
```

Papéis e permissões começam simples (enum `Papel` no `Usuario`). Se no futuro for
necessário granularidade maior (ex: permissões por disciplina, coordenadores com
acesso limitado), a evolução natural é introduzir tabelas `Permissao` e
`PapelPermissao` — não foi feito agora para não introduzir complexidade não usada.

## 5. Módulos principais

1. **Autenticação e Usuários** — login, sessão, papéis (implementado nesta etapa)
2. **Disciplinas** — CRUD (implementado como módulo de referência)
3. **Assuntos** — CRUD, vinculado a disciplina (implementado)
4. **Banco de Questões** — CRUD de questões, filtros por disciplina/assunto/dificuldade (Fase 3)
5. **Provas** — montagem (seleção/aleatorização de questões), configuração (Fase 4)
6. **Aplicação de Provas** — fluxo do aluno: iniciar tentativa, responder, timer, envio (Fase 5)
7. **Correção e Resultados** — correção automática (objetivas) + manual (dissertativas) (Fase 6)

## 6. Plano de desenvolvimento por etapas

- [x] **Fase 0** — Scaffolding: Next.js + TS + Tailwind + Prisma + Docker Compose
- [x] **Fase 1** — Autenticação e sessão (login, proteção de rotas, papéis no schema)
- [~] **Fase 1.1** — Gestão de usuários (criar/editar/desativar usuários pela UI, hoje só via seed)
- [x] **Fase 2** — Disciplinas e Assuntos: CRUD completo
- [ ] **Fase 3** — Banco de Questões (CRUD, tipos de questão, filtros)
- [ ] **Fase 4** — Criação/montagem de Provas
- [ ] **Fase 5** — Aplicação de Provas (fluxo do aluno)
- [ ] **Fase 6** — Correção e Resultados
- [ ] **Fase 7** — Relatórios, exportação, refino de UI, testes e2e

## 7. Decisões e observações do ambiente de scaffolding

- **Prisma 7**: a versão estável atual mudou a forma de configurar a conexão do
  banco — não vai mais no `datasource.url` do `schema.prisma`, e sim em
  `prisma7.config.ts`. O `PrismaClient` em runtime precisa de um *driver adapter*
  (`@prisma/adapter-pg`) — ver `src/lib/prisma.ts`.
- **Next.js 16 renomeou `middleware.ts` para `proxy.ts`** (mesma função, roda agora
  por padrão no runtime Node.js em vez de Edge). O projeto já usa a nova convenção.
- **`ui.shadcn.com` estava bloqueado** no ambiente onde o projeto foi criado, então os
  componentes de UI base foram escritos manualmente seguindo o mesmo padrão. Isso não
  afeta o uso normal do CLI do shadcn em outros ambientes.
- **Docker não estava disponível** no ambiente de scaffolding (daemon não pôde ser
  iniciado no sandbox); as migrations foram validadas com um Postgres instalado
  localmente. Localmente/em produção, `docker compose up -d` deve funcionar
  normalmente.
