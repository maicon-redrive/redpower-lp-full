# Webhook — Recebimento de Vendas

**Data:** Julho 2026
**Versão:** v0.1.6

---

## Resumo técnico

### O que foi feito

- Criado endpoint `/api/rp-ingest` (API route do Next.js) que recebe notificações de venda do Kiwify via POST
- O endpoint valida a assinatura HMAC-SHA1 do Kiwify para garantir que a requisição é legítima
- Extrai todos os dados relevantes do payload (cliente, produto, pagamento, endereço, UTMs, assinatura)
- Salva os dados na tabela `vendas` do Supabase
- Endpoint originalmente chamava `/api/webhook` — renomeado para `/api/rp-ingest` por segurança (nomes genéricos como "webhook" são alvo fácil de bots)

### Fluxo de dados

```
Cliente paga no Kiwify
       ↓
Kiwify envia POST para /api/rp-ingest
       ↓
Endpoint valida assinatura HMAC
       ↓
Extrai dados do JSON (nome, email, endereço, valor, UTMs...)
       ↓
Insere registro na tabela "vendas" do Supabase
       ↓
Retorna { success: true } para o Kiwify
```

### Dados extraídos do Kiwify

| Grupo | Campos |
|-------|--------|
| Pedido | order_id, order_ref, event (tipo de evento) |
| Produto | product_id, product_name |
| Cliente | nome, email, telefone |
| Endereço | rua, número, complemento, bairro, cidade, estado, CEP |
| Pagamento | status, método (pix/cartão/boleto), parcelas, valor |
| Assinatura | subscription_id, subscription_status (se aplicável) |
| Rastreamento | utm_source, utm_medium, utm_campaign, utm_content, utm_term |

### Arquivo envolvido

| Arquivo | Função |
|---------|--------|
| `src/app/api/rp-ingest/route.ts` | Recebe, valida e salva dados do webhook Kiwify |

### Validação de segurança (HMAC)

O Kiwify envia junto com cada requisição um header `x-kiwify-signature` contendo um hash do corpo da mensagem. O endpoint recalcula esse hash usando o token secreto compartilhado (`KIWIFY_WEBHOOK_TOKEN`) e compara. Se não bater, rejeita a requisição com erro 401.

Enquanto o `KIWIFY_WEBHOOK_TOKEN` estiver vazio no `.env.local`, a validação é ignorada (útil para testes). Em produção, deve ser preenchido com o token configurado no painel do Kiwify.

### Status pendente

- O endpoint só funciona após deploy no K8s pelo Ederson (precisa das variáveis de ambiente do Supabase no servidor)
- Após deploy, configurar no Kiwify a URL: `https://redpower.redrive.com.br/api/rp-ingest`

---

## Explicação acessível

### O que é um webhook?

Imagine que o Kiwify é um carteiro. Toda vez que alguém compra o RedPower, o Kiwify "bate na porta" do nosso servidor e entrega um envelope com todos os dados da venda. O webhook é essa "porta" — um endereço na internet que fica esperando essas entregas.

### Por que mudou de nome?

O endereço antigo era `/api/webhook`, que é um nome muito comum e genérico. Hackers e bots costumam testar endereços assim automaticamente. Mudamos para `/api/rp-ingest`, que é um nome que só nós sabemos — como trocar a fechadura da porta.

### O que acontece quando alguém compra?

1. A pessoa paga no Kiwify (cartão, Pix ou boleto)
2. O Kiwify manda uma mensagem automática para o nosso servidor com todos os dados: nome, e-mail, telefone, endereço, quanto pagou, por onde chegou (Instagram, Google, etc.)
3. O servidor confere se a mensagem realmente veio do Kiwify (segurança)
4. Se tudo estiver certo, salva os dados no banco de dados
5. Pronto — a venda aparece no painel operacional

### E se alguém tentar enviar dados falsos?

O Kiwify e o nosso servidor compartilham uma "senha secreta". Toda mensagem que o Kiwify envia vem com uma assinatura digital feita com essa senha. Se alguém tentar mandar uma mensagem falsa, a assinatura não vai bater e o servidor rejeita automaticamente.

### O que falta para funcionar?

O código já está pronto e no GitHub. Falta o Ederson fazer o deploy (colocar no ar) no servidor de produção e configurar as variáveis de ambiente. Depois disso, é só configurar a URL do webhook no painel do Kiwify.
