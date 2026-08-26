# Painel Operacional RedPower

**Versão**: v0.1.15  
**URL**: [redpower.com.br/ops](https://redpower.com.br/ops)

## O que foi feito

O painel operacional (`/painel`) foi completamente reconstruído para replicar o visual do dashboard de referência (redpower-ops.vercel.app), agora conectado aos dados reais do Supabase.

### Estrutura

O painel tem **4 abas**, acessíveis pela sidebar (desktop) ou barra inferior (mobile):

| Aba | O que mostra |
|-----|-------------|
| **Visão Geral** | KPIs principais (receita confirmada, pendente, ticket médio, envios pendentes, frete total), vendas por modalidade (RedUp/RedMax/Revisão), atividade recente |
| **Vendas** | Tabela completa com filtros (status de pagamento, plano, busca por nome/e-mail). Clicar em uma venda abre modal para editar dados do cliente, endereço, envio e notas |
| **Envios** | Pipeline de despacho (aguardando → etiqueta → enviado → entregue), gastos com frete, detalhamento por envio, geração de etiqueta para impressão |
| **Marketing** | Receita por canal (baseado em UTM source), gráfico de barras, tabela detalhada |

### Como funciona

- Todos os dados vêm do Supabase, via `/api/vendas`
- Alterações feitas no modal de detalhes são salvas no banco em tempo real
- O painel é responsivo: sidebar fixa em telas grandes, barra inferior em mobile

---

## Para quem não é técnico

Pense no painel como o "painel de controle" de todas as vendas do RedPower. Quando alguém compra no Kiwify, a venda aparece automaticamente no painel. Dali, o Maicon pode:

1. **Ver quanto vendeu** — receita total, por plano, por origem
2. **Gerenciar envios** — saber quem precisa receber livros, registrar rastreamento e frete
3. **Editar dados** — corrigir nome, endereço, marcar como cliente Redrive
4. **Gerar etiquetas** — imprimir etiqueta de envio direto do painel
5. **Acompanhar marketing** — ver qual canal (Google Ads, WhatsApp, etc.) traz mais vendas
