# API de Vendas — Painel Operacional

**Data:** Julho 2026
**Versão:** v0.1.6

---

## Resumo técnico

### O que foi feito

- Criado endpoint `/api/vendas` com dois métodos:
  - **GET** — lista vendas com filtros (status, plano, produto) e paginação
  - **PATCH** — atualiza dados de uma venda (endereço, envio, frete, notas)
- Autenticação via header `x-api-key` ou query param `key` (usando variável `PANEL_API_SECRET`)
- Campos atualizáveis controlados por whitelist (só aceita campos permitidos)
- Limite máximo de 500 registros por consulta

### Arquivo envolvido

| Arquivo | Função |
|---------|--------|
| `src/app/api/vendas/route.ts` | Consulta e atualização de vendas para o painel operacional |

### Endpoints

#### GET `/api/vendas`

Consulta vendas do Supabase com filtros opcionais.

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `limit` | number | 100 | Máximo de registros (até 500) |
| `offset` | number | 0 | Pular N registros (paginação) |
| `status` | string | — | Filtrar por status de pagamento |
| `plano` | string | — | Filtrar por plano (redup, redmax) |
| `product` | string | — | Buscar por nome do produto |

**Resposta:**
```json
{
  "vendas": [ ... ],
  "total": 42
}
```

#### PATCH `/api/vendas`

Atualiza dados de uma venda específica.

**Body:**
```json
{
  "id": 123,
  "tracking_code": "BR123456789BR",
  "envio_status": "enviado",
  "custo_frete": 25.90
}
```

**Campos atualizáveis:**
- Plano e flag de cliente Redrive
- Dados do cliente (nome, email, telefone)
- Endereço completo
- Envio (status, código de rastreamento)
- Frete (custo, comprovante)
- Flag de e-mail de rastreio enviado
- Notas internas

**Resposta:**
```json
{
  "venda": { ... }
}
```

### Segurança

- Se `PANEL_API_SECRET` estiver configurado, toda requisição precisa enviar a chave no header `x-api-key` ou na URL como `?key=...`
- Apenas campos da whitelist podem ser atualizados — mesmo que alguém envie outros campos, são ignorados
- Usa `supabaseAdmin` (service_role) para ter acesso total ao banco, sem depender de autenticação do usuário

---

## Explicação acessível

### Para que serve isso?

Esse endpoint é o "canal de comunicação" entre o painel operacional e o banco de dados. Quando você abre o painel e vê a lista de vendas, é esse endpoint que vai buscar os dados. Quando você edita o endereço de um cliente ou marca um envio como feito, é esse endpoint que salva a alteração.

### Como funciona na prática?

**Ver vendas:**
O painel pede a lista de vendas → o endpoint vai no banco de dados → pega os registros → devolve para o painel mostrar na tela.

Você pode filtrar: "me mostra só as vendas do plano RedUp" ou "só as que estão com pagamento aprovado".

**Editar dados:**
Você clica em um cliente no painel, muda o endereço, clica em salvar → o painel manda a alteração para o endpoint → o endpoint atualiza no banco de dados → confirma que deu certo.

### O que é a whitelist?

Por segurança, o endpoint só aceita alterações em campos específicos. Por exemplo, você pode mudar o endereço ou o status do envio, mas não pode mudar o valor da venda ou o order_id do Kiwify. Isso evita alterações acidentais ou maliciosas em dados sensíveis.

### Como o painel se conecta?

O painel operacional faz chamadas HTTP (requisições web) para esse endpoint. É como abrir uma página na internet, mas em vez de receber uma página HTML, recebe dados em formato JSON (um formato que computadores entendem facilmente).

### O que falta?

O endpoint já está pronto. Falta:
1. Deploy no K8s (Ederson)
2. Conectar o painel operacional para usar esse endpoint em vez de dados fictícios
3. Configurar a variável `PANEL_API_SECRET` no servidor para proteger o acesso
