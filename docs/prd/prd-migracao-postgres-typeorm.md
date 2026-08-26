# PRD — Migração de Persistência: Supabase SDK → PostgreSQL + TypeORM

**Status:** Draft
**Autor:** Morgan (PM)
**Data:** Agosto 2026
**Contexto consolidado:** `docs/07-checkout-contexto-descobertas.md`

---

## 1. Contexto e Motivação

Hoje a persistência do RedPower LP usa o SDK `@supabase/supabase-js` apontando para um projeto Supabase gerenciado. Decisão de produto/infra: **desacoplar do Supabase** e falar com PostgreSQL padrão via **TypeORM**, com destino do banco definido apenas por env var (`DATABASE_URL`) — por hora um Postgres local/da empresa, sem compromisso com provedor.

**Motivadores:**
- Independência de fornecedor (o código passa a rodar contra qualquer Postgres).
- SQL/ORM padrão em vez de API proprietária do SDK.
- Credenciais e endpoint controlados por env (12-factor), hoje há até service key exposta em ConfigMap versionado (ver Riscos/R4).

**Decisões já tomadas (não rediscutir):**
- ORM: **TypeORM** (definição do stakeholder).
- Banco novo **começa vazio** — histórico de vendas permanece no Supabase para consulta (read-only).
- Localização do banco é irrelevante para o código: **somente `DATABASE_URL`**.

## 2. Escopo

### Dentro
- Substituir `supabase-js` nas 3 rotas: `/api/rp-ingest` (webhook Kiwify), `/api/vendas` (painel), `/api/pre-checkout` (form /envio).
- Entidades TypeORM para `vendas` e `pre_checkout` + migrations versionadas.
- Estratégia de rollback por env var (voltar ao Supabase enquanto ele existir).
- Atualização de k8s (Secret para `DATABASE_URL`), `.env.example`, docs e agente `redpower-data`.
- Setup de desenvolvimento local (docker-compose com Postgres 16).

### Fora
- Migração de dados históricos (decidido: começa vazio).
- Backend da plataforma do aluno (PRD futuro — mas as escolhas daqui viram padrão para ele).
- Qualquer mudança de comportamento das rotas (contrato de request/response idêntico).

## 3. Requisitos

### Funcionais
- **FR-1** — As 3 rotas mantêm contrato HTTP idêntico (status codes, shapes de resposta, validações).
- **FR-2** — Webhook `rp-ingest` preserva: verificação HMAC, casamento com `pre_checkout` por `ref_id`→email, flag `used`, `detectPlano()`.
- **FR-3** — `GET /api/vendas` preserva filtros (status/plano/product), paginação (limit≤500/offset) e `total` (count exato).
- **FR-4** — `PATCH /api/vendas` preserva a allowlist de campos editáveis.
- **FR-5** — Schema gerenciado por TypeORM migrations versionadas no repo (`synchronize: false` SEMPRE).

### Não-funcionais
- **NFR-1** — `next build` NÃO pode depender de banco disponível (DataSource lazy; lição do incidente v0.1.26).
- **NFR-2** — Pool de conexões único por processo; sem vazamento em hot-reload dev.
- **NFR-3** — Rollback em ≤ 5 min: flip de env `DATA_BACKEND=supabase|postgres` + rollout, sem rebuild.
- **NFR-4** — `DATABASE_URL` em Secret k8s, nunca em ConfigMap/repo.

### Constraints técnicas (aprendizados de arquitetura)
- **CON-1** — Entidades via **`EntitySchema`** (não decorators): evita `experimentalDecorators`/`emitDecoratorMetadata` com Turbopack/SWC no Next 16.
- **CON-2** — `serverExternalPackages: ["typeorm", "pg"]` no `next.config.ts` para o bundler não empacotar drivers nativos.
- **CON-3** — DataSource singleton com init preguiçosa e reuso em dev (`globalThis`), padrão análogo ao `getSupabaseAdmin()` atual.
- **CON-4** — Migrations executadas por script npm dedicado (CLI), nunca no boot da aplicação.

## 4. Plano Faseado (conservador)

### Fase 0 — Fundação (sem tocar produção)
Instalar `typeorm`, `pg`, criar `src/lib/db/` (data-source, entities, migrations), docker-compose local, scripts npm (`db:migrate`, `db:revert`). Rotas continuam 100% Supabase.
**Gate:** migrations criam schema limpo num Postgres local; build passa sem banco.

### Fase 1 — Camada de repositório dual
Criar `src/lib/repositories/` com interface única (ex.: `VendasRepo`, `PreCheckoutRepo`) e duas implementações: `supabase` (código atual encapsulado) e `typeorm`. Seleção por env `DATA_BACKEND` (default: `supabase`).
**Gate:** rotas refatoradas para usar repositório, comportamento idêntico com `DATA_BACKEND=supabase` em produção. Deploy desta fase é no-op funcional.

### Fase 2 — Cutover controlado
Provisionar Postgres destino (fora deste repo), criar Secret `redpower-lp-secrets` com `DATABASE_URL`, rodar migrations, flip `DATA_BACKEND=postgres`.
Sequência de menor risco: 1º `/api/pre-checkout` (dado efêmero), 2º `/api/vendas` (painel), 3º `/api/rp-ingest` (webhook — último, é o crítico).
**Gate por rota:** smoke test em produção + venda de teste de R$ 1 antes de virar o webhook.
**Rollback:** flip de env de volta (NFR-3).

### Fase 3 — Descomissionamento
Após 2 semanas estáveis: remover implementação supabase, dep `@supabase/supabase-js`, envs `SUPABASE_*` do ConfigMap (e rotacionar/revogar as keys expostas — R4), atualizar `docs/02`, agente `redpower-data` e `supabase/schema.sql` → `src/lib/db/migrations/`.
**Gate:** grep sem referências a supabase; Supabase projeto pausado (não deletado — histórico).

## 5. Épico e Stories (para @sm detalhar)

| # | Story | Fase | Estimativa |
|---|-------|------|-----------|
| 1 | Setup TypeORM + DataSource lazy + docker-compose local | 0 | S |
| 2 | Entities (`EntitySchema`) + migration inicial (vendas, pre_checkout) | 0 | S |
| 3 | Interface de repositórios + impl supabase (refactor sem mudança de comportamento) | 1 | M |
| 4 | Impl typeorm dos repositórios + testes de paridade | 1 | M |
| 5 | Seleção por `DATA_BACKEND` + wiring nas 3 rotas | 1 | S |
| 6 | k8s: Secret DATABASE_URL + ConfigMap sem SUPABASE_* + docs de operação | 2 | S |
| 7 | Runbook de cutover + smoke tests + execução do flip por rota | 2 | M |
| 8 | Remoção supabase + rotação de credenciais + docs/agents atualizados | 3 | S |

## 6. Riscos

| ID | Risco | Mitigação |
|----|-------|-----------|
| R1 | Webhook perde venda durante cutover | Webhook é a ÚLTIMA rota a virar; Kiwify reenvia em falha (5xx); janela de flip fora de horário de campanha |
| R2 | TypeORM + Turbopack incompatibilidades | CON-1/CON-2 (EntitySchema, serverExternalPackages); validado na Fase 0 antes de qualquer refactor |
| R3 | Drift entre impl supabase e typeorm na Fase 1 | Testes de paridade (story 4) com fixtures dos payloads reais do Kiwify |
| R4 | **Já existente:** service_role key exposta em `k8s/environment-config.yaml` versionado | Fase 3 rotaciona/revoga; até lá, não piorar (DATABASE_URL nasce em Secret) |
| R5 | Banco "local" indisponível derruba rotas | Postgres local é só dev; produção exige destino definido no gate da Fase 2 — bloqueante explícito |

## 7. Métricas de Sucesso
- Zero vendas perdidas no webhook durante e após cutover (conferência Kiwify × banco).
- Contratos HTTP inalterados (testes de paridade verdes).
- Rollback testado 1× em ambiente real antes do flip do webhook.
- Nenhuma credencial de banco em arquivo versionado.

## 8. Aprovações pendentes
- [ ] Stakeholder (Ederson): aprovar fases e sequência de cutover
- [ ] @architect: validar CON-1..4 e desenho de repositórios
- [ ] @po: validar stories antes de @sm detalhar
- [ ] @devops: destino do Postgres de produção + Secret (bloqueante da Fase 2)
