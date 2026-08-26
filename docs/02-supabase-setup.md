# Banco de Dados — Supabase

**Data:** Julho 2026
**Versão:** v0.1.5

---

## Resumo técnico

### O que foi feito

- Criado projeto no Supabase (PostgreSQL gerenciado, gratuito)
- Criada tabela `vendas` com todos os campos necessários para armazenar dados de vendas vindos do Kiwify
- Configurado Row Level Security (RLS) para proteger os dados
- Criadas políticas de acesso: apenas o servidor (service_role) pode inserir e atualizar dados
- Configuradas variáveis de ambiente no projeto (`.env.local`)
- Testada conexão: inserção, leitura e exclusão funcionando

### Schema da tabela `vendas`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGINT | Identificador único (automático) |
| `created_at` | TIMESTAMP | Data/hora do registro |
| `order_id`, `order_ref` | TEXT | Identificadores do pedido no Kiwify |
| `event` | TEXT | Tipo de evento (compra, reembolso, etc.) |
| `product_id`, `product_name` | TEXT | Dados do produto |
| `customer_name`, `email`, `phone` | TEXT | Dados do cliente |
| `address_*` | TEXT | Endereço completo (rua, número, bairro, cidade, estado, CEP) |
| `payment_status`, `method` | TEXT | Status e método de pagamento |
| `amount` | NUMERIC | Valor da venda |
| `utm_source`, `medium`, `campaign`, `content`, `term` | TEXT | Rastreamento de origem |
| `plano` | TEXT | Plano interno (redup, redmax, revisao) |
| `cliente_redrive` | BOOLEAN | Se já é cliente Redrive |
| `envio_status` | TEXT | Status do envio (aguardando, etiqueta, enviado, entregue) |
| `tracking_code` | TEXT | Código de rastreamento dos Correios |
| `custo_frete` | NUMERIC | Quanto custou o envio |
| `comprovante_url` | TEXT | Link do comprovante de frete |
| `notas` | TEXT | Observações internas |

### Arquivos envolvidos

| Arquivo | Função |
|---------|--------|
| `src/lib/supabase.ts` | Conexão com o Supabase (cliente público e admin) |
| `supabase/schema.sql` | Schema completo da tabela |
| `.env.local` | Chaves de acesso (não vai para o git) |
| `.env.example` | Template das variáveis (vai para o git, sem valores reais) |

### Segurança

- A `service_role key` (chave secreta) só roda no servidor, nunca no navegador do usuário
- A `anon key` (chave pública) é usada no frontend mas com RLS ativo, não consegue acessar dados sem autenticação
- As chaves estão no `.env.local`, que é ignorado pelo git — nunca vão para o repositório público

---

## Explicação acessível

### O que é o Supabase?

É o nosso banco de dados — pense nele como uma planilha gigante, só que muito mais segura e rápida. Toda vez que alguém compra no Kiwify, os dados da venda (nome, e-mail, endereço, valor, etc.) são guardados lá.

### Por que Supabase e não MySQL?

O Supabase usa PostgreSQL (um dos bancos mais robustos do mundo) e oferece um plano gratuito generoso. Tem painel visual para ver os dados, API pronta, e segurança embutida. Para o nosso volume, o plano gratuito é mais que suficiente.

### O que é RLS?

Row Level Security é como um "segurança na porta" do banco de dados. Mesmo que alguém descubra a chave pública, não consegue ler nem alterar dados sem a chave secreta que só o nosso servidor tem.

### Os campos de gestão interna

Além dos dados que vêm automaticamente do Kiwify, a tabela tem campos que vocês preenchem manualmente pelo painel operacional:
- **Plano** — qual plano o cliente comprou (RedUp, RedMax, Revisão)
- **Cliente Redrive** — marcar se já é cliente da Redrive
- **Status do envio** — acompanhar se o livro foi enviado
- **Código de rastreamento** — preencher quando despachar pelos Correios
- **Custo do frete** — registrar quanto pagou no envio
- **Notas** — qualquer observação sobre aquele cliente

### Onde ficam as senhas?

As chaves de acesso ao banco ficam em um arquivo chamado `.env.local` que existe só no computador/servidor. Ele nunca vai para o GitHub. No repositório, existe apenas um `.env.example` mostrando quais variáveis precisam ser configuradas, mas sem os valores reais.
