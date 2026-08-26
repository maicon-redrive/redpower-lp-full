# Página de Envio (Pré-Checkout)

**Versão**: v0.1.20  
**URL**: [redpower.com.br/envio](https://redpower.com.br/envio?plano=redup)

## O que foi feito

Como o Kiwify não tem opção de "produto físico" para coletar endereço no checkout, criamos uma página intermediária que coleta os dados de envio **antes** do comprador ir para o pagamento.

### Fluxo completo

```
Comprador clica "Comprar"
        ↓
redpower.com.br/envio?plano=redup (ou redmax)
        ↓
Preenche: nome, e-mail, WhatsApp, endereço completo
        ↓
Dados salvos no Supabase (tabela pre_checkout)
        ↓
Redirecionado para checkout Kiwify (com ref_id no UTM)
        ↓
Comprador paga no Kiwify
        ↓
Webhook dispara → busca endereço da pre_checkout → salva na venda
```

### Links de checkout

| Plano | URL de envio |
|-------|-------------|
| RedUp | `redpower.com.br/envio?plano=redup` |
| RedMax | `redpower.com.br/envio?plano=redmax` |

### Funcionalidades

- **Busca automática de CEP** — ao digitar o CEP, rua, bairro, cidade e estado são preenchidos automaticamente via ViaCEP
- **Validação** — campos obrigatórios (nome, e-mail, rua, cidade, estado, CEP) precisam ser preenchidos
- **Visual** — segue o design dark do RedPower com a mesma tipografia e paleta
- **Integração com webhook** — quando a venda é confirmada no Kiwify, o sistema busca o endereço pelo ref_id (UTM) ou pelo e-mail do comprador

---

## Para quem não é técnico

Antes, os livros do RedPower não tinham como saber o endereço do comprador porque o Kiwify não pedia isso no checkout. Agora, antes de pagar, o comprador passa por uma página bonita onde coloca o endereço de entrega.

Quando ele digita o CEP, o sistema já preenche a rua, bairro, cidade e estado automaticamente. Depois de preencher tudo, ele é levado para o checkout do Kiwify normalmente.

Quando a compra é confirmada, o sistema liga os dados de endereço com a venda automaticamente. No painel operacional (/ops), o endereço já aparece preenchido e a etiqueta pode ser gerada.

**Para usar**: substitua os links de checkout nos botões de venda por:
- RedUp: `https://redpower.com.br/envio?plano=redup`
- RedMax: `https://redpower.com.br/envio?plano=redmax`
