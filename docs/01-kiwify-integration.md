# Integração com Kiwify

**Data:** Julho 2026
**Versão:** v0.1.4

---

## Resumo técnico

### O que foi feito

- Cadastro do produto RedPower RedUp no Kiwify (checkout: `https://pay.kiwify.com.br/UaDtSGp`)
- Os botões de CTA (chamadas para ação) da landing page agora direcionam para o checkout do Kiwify
- Implementado rastreamento de UTMs: quando um visitante chega na LP por um link com parâmetros UTM (ex: `?utm_source=instagram`), esses dados são salvos em um cookie e repassados para o Kiwify no momento da compra
- Criada página de agradecimento pós-compra (`/obrigado`) com conteúdo dinâmico por plano

### Arquivos envolvidos

| Arquivo | Função |
|---------|--------|
| `src/lib/checkout.ts` | Monta a URL do checkout com UTMs |
| `src/components/sections/Pricing.tsx` | Botões de CTA apontando para o Kiwify |
| `src/app/obrigado/page.tsx` | Página de obrigado pós-compra |
| `src/lib/plans.ts` | Definição dos planos (RedUp R$997, RedMax R$1.997) |

### Como funciona o fluxo

1. Visitante chega na LP (com ou sem UTMs)
2. UTMs são salvos em cookie `rp_utms` (dura 30 dias)
3. Visitante clica em "Quero o RedUp" → abre checkout do Kiwify em nova aba
4. Os UTMs são colados na URL do Kiwify automaticamente
5. Após pagamento, Kiwify redireciona para `/obrigado?plano=redup`

---

## Explicação acessível

### O que é isso?

Quando alguém quer comprar o RedPower, o botão de compra na nossa página leva direto para o Kiwify, que é a plataforma que processa o pagamento. É como se nossa página fosse a vitrine e o Kiwify fosse o caixa da loja.

### O que são UTMs?

São "etiquetas" que colocamos nos links para saber de onde veio cada visitante. Por exemplo, se você postar um link no Instagram com `?utm_source=instagram`, quando alguém comprar, vamos saber que veio do Instagram. Isso ajuda a entender qual canal de divulgação está trazendo mais vendas.

### Página de obrigado

Depois que a pessoa paga, ela é redirecionada para uma página de agradecimento que mostra os próximos passos:
- Checar e-mail para acesso à área de membros
- Aguardar os livros chegarem pelo correio
- Para o RedMax: aviso de que a implementação começa em breve

### Planos disponíveis

| Plano | Preço | Inclui |
|-------|-------|--------|
| RedUp | R$ 997 | Curso + livros |
| RedMax | R$ 1.997 | Curso + livros + implementação personalizada |

O RedMax ainda não está cadastrado no Kiwify — quando for criado, basta adicionar a URL do checkout no código.
