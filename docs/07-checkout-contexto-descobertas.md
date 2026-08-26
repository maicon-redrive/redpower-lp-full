# Checkout RedPower — Contexto e Descobertas

**Data:** Agosto 2026
**Objetivo:** Consolidar tudo que foi levantado até agora para planejar/ajustar a tela de checkout do RedPower.

**Fontes:**
- `RedPower_Documentacao_Produto_v3.pdf` (v3.0 — Julho 2026)
- `redrive-api-v2/docs/redrive-api-v2-ai-guide.md` (API v4.6.1, SDK v2.13.0)
- Estado atual deste repositório (`redpower-lp`, docs 01–06)

---

## 1. Os produtos (o que o checkout precisa vender)

| Produto | Preço | O que é | Condições |
|---|---|---|---|
| **RedUp** | R$ 997 | Método (8 aulas) + livros físicos e digitais | Garantia 7 dias. Requer endereço de envio |
| **RedMax** | R$ 1.997 | Tudo do RedUp + implantação técnica do zero | Garantia 7 dias. CS contata em até 48h. Requer endereço |
| **RedMax Revisão** | R$ 999 | Método + livros + implantação formato Revisão | Só para clientes com **6+ meses de Redrive ativa** (validação via login). **Sem** garantia de 7 dias. À vista 10% off, até 3x sem juros. Requer endereço |

### Formas de pagamento (doc de produto, seção 6)

| Forma | RedUp | RedMax | RedMax Revisão |
|---|---|---|---|
| Cartão de crédito | até 6x | até 6x | até 3x sem juros |
| Pix | Sim | Sim | Sim (10% off à vista) |
| Boleto | Sim | Sim | "Consultar" |

- Conteúdo digital liberado imediatamente após confirmação do pagamento.
- Livros físicos entram na fila de envio em até 3 dias úteis → **todo produto exige coleta de endereço**.

### SKUs para ERP/NF (doc de produto, seção 4)

Cada produto se decompõe em itens fiscais (método = serviço digital/ISS; livros = NCM 4901.99.00, imunes de ICMS; frete = serviço; implantação = consultoria/treinamento):

- **RedUp (997):** REDUP-METHOD 497 + REDUP-BOOK-MC 150 + REDUP-BOOK-CF 150 + REDUP-SHIP 200
- **RedMax (1.997):** REDMAX-METHOD 497 + livros 150+150 + REDMAX-SHIP 200 + REDMAX-IMPL 1.000
- **RedMax Revisão (999):** REVMAX-METHOD 197 + livros 100+100 + REVMAX-SHIP 200 + REVMAX-IMPL 402

## 2. Pontos de upsell que envolvem o checkout (doc de produto, seção 5)

1. **Checkout do RedUp → upsell RedMax:** order bump ou one-click upsell: "+R$ 1.000 para adicionar a implantação" (total R$ 1.997).
2. **RedMax Revisão no checkout:** exibir **apenas** se o cliente tiver 6+ meses de Redrive (validação via login).
3. **Implantação avulsa pós-compra:** aluno RedUp pode contratar a implantação depois, pela área do membro (`/metodo/conta`), e-mails de follow-up (7–14 dias) e ao concluir as 8 aulas.
4. **LP:** placeholder `{{CTA_IMPLANTACAO}}` no FAQ precisa virar link real; barra abaixo dos cards de Pricing ("Já usa a Redrive há 6+ meses?") abre modal do Revisão.

## 3. Estado atual do checkout neste repo

Fluxo em produção hoje (docs 01 e 06):

```
CTA na LP → /envio?plano=redup|redmax (pré-checkout próprio)
         → coleta nome, e-mail, WhatsApp, endereço (ViaCEP)
         → salva no Supabase (tabela pre_checkout)
         → redireciona para checkout Kiwify (ref_id via UTM)
         → pagamento no Kiwify
         → webhook Kiwify → casa venda com endereço (ref_id ou e-mail)
         → /obrigado?plano=...
```

- **Gateway atual: Kiwify** (RedUp: `https://pay.kiwify.com.br/UaDtSGp`). A página `/envio` existe porque o Kiwify não coleta endereço de produto físico.
- UTMs salvos em cookie `rp_utms` (30 dias) e repassados ao Kiwify.
- `src/lib/checkout.ts` só conhece os planos `redup` e `redmax` — **RedMax Revisão não existe no fluxo atual**.
- Arquivos-chave: `src/lib/checkout.ts`, `src/lib/plans.ts`, `src/components/sections/Pricing.tsx`, `src/app/api/pre-checkout`, `src/app/obrigado/page.tsx`. Infra: Supabase (docs 02–05: webhook de ingestão, API de vendas, painel operacional).

## 4. O que a Redrive API V2 oferece (alternativa/complemento ao Kiwify)

API REST em `api.redrive.com.br` (PRD) / `api-dev` (DEV) / `sandbox` (default do SDK). Auth via Firebase ID Token; SDK `@redrive/redrive-api-v2` injeta o token automaticamente.

### Endpoints relevantes para o checkout

| Função | Endpoint | Observações |
|---|---|---|
| Criar assinatura/compra | `POST /checkout/subscription` | **Público** (sem auth). Recebe `serviceSlug`, `customer` (nome, e-mail, telefone, documento), `address`, `creditCard` OU `paymentToken`, `paymentGateway` (`fly-erp`/`asaas`/`stripe`), periodicidade, moeda, `tracking` com UTMs. Retorna `user.uid` + `password` (cria conta Firebase) |
| Catálogo/preços | `GET /services` | Público. Filtra por `type` (enum inclui `course`) e `group`. Preço em **centavos** |
| Trocar plano | `PATCH /checkout/subscription/plan` | Autenticado — serve para upgrade RedUp → RedMax |
| Addon na assinatura | `POST /subscription/service` | Autenticado — caminho recomendado para upsell (ex.: implantação avulsa) |
| Perfil + plano ativo | `GET /user/me` | Retorna UserEntity + subscription (com `startDate` — base para calcular 6+ meses) |
| Validar acesso | `GET /validate-access` | Revalida acesso pós-compra |
| Vendedor por referral | `GET /seller?referralCode=` | Público — atribuição de venda |
| Webhook Stripe/genérico | `POST /webhook/stripe`, `POST /webhooks/{provider}` | Já existem na API |

### O que a API V2 **não** tem

- **Endpoint de elegibilidade do Revisão** (`GET /api/eligibility/revisao` da doc de produto não existe). Dá para derivar de `GET /user/me` (subscription.startDate ≥ 6 meses), mas exige login Firebase do cliente no fluxo.
- Nada da **plataforma do aluno** (progresso, notas, chat, analytics) — backend separado (a doc de produto sugere Supabase, que o repo já usa).
- Parcelamento: a spec não expõe campo de nº de parcelas no `POST /checkout/subscription` (só periodicidade de assinatura) — **ponto a confirmar** para "até 6x no cartão".

## 5. Tensões e decisões em aberto (para discutir antes de planejar)

1. **Gateway: Kiwify vs. API V2 (checkout próprio).** Hoje é Kiwify. A API V2 permitiria checkout 100% próprio (cartão/Pix via fly-erp/asaas/stripe), eliminando a página intermediária `/envio` (endereço entraria no próprio `POST /checkout/subscription`) e criando a conta do aluno automaticamente. Migrar, conviver, ou manter Kiwify?
2. **Compra única vs. assinatura.** RedPower é venda one-shot (R$ 997/1.997/999), mas o endpoint da API V2 é modelado como *subscription* com periodicidade. Como representar compra única? (frequency yearly sem renovação? serviço tipo `course`?)
3. **Parcelamento (6x / 3x sem juros) e Pix com 10% off** — onde isso é configurado? Kiwify suporta nativamente; na API V2 não está claro na spec.
4. **RedMax Revisão:** não existe no fluxo atual. Exige login Redrive para validar 6+ meses → o checkout dele é necessariamente diferente (autenticado). Entra nesta fase ou fica para depois?
5. **Order bump RedUp → RedMax:** o Kiwify tem order bump nativo, mas os produtos estão em checkouts separados. Se o bump for na nossa página (`/envio` evoluindo para um checkout de verdade), como fica a troca de valor no gateway?
6. **SKUs/NF:** o faturamento decomposto (seção 4 da doc) acontece no gateway/ERP, não na LP — mas o plano escolhido precisa carregar essa composição. Quem emite NF hoje no fluxo Kiwify?
7. **Boleto no Revisão** está como "Consultar" na doc — definir se entra.
8. **`{{CTA_IMPLANTACAO}}`** no FAQ da LP ainda precisa de destino real (âncora no Pricing ou link de checkout do RedMax).

---

*Texto extraído do PDF disponível em scratchpad da sessão; specs completas da API em `~/Workspace/redrive-api-v2/docs/redrive-api-v2-ai-guide.md`.*
