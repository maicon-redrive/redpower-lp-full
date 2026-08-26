-- Schema do RedPower — rodar no Supabase SQL Editor

-- Tabela de vendas (recebe dados do webhook Kiwify)
CREATE TABLE vendas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Kiwify order
  order_id TEXT,
  order_ref TEXT,
  event TEXT NOT NULL DEFAULT 'unknown',

  -- Produto
  product_id TEXT,
  product_name TEXT,

  -- Cliente
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,

  -- Endereço
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,

  -- Pagamento
  payment_status TEXT,
  payment_method TEXT,
  installments INTEGER DEFAULT 1,
  amount NUMERIC(10,2),

  -- Assinatura (se aplicável)
  subscription_id TEXT,
  subscription_status TEXT,

  -- UTMs
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Gestão interna (preenchido manualmente no painel)
  plano TEXT, -- redup, redmax, revisao
  cliente_redrive BOOLEAN DEFAULT FALSE,
  envio_status TEXT DEFAULT 'aguardando', -- aguardando, etiqueta, enviado, entregue
  tracking_code TEXT,
  custo_frete NUMERIC(10,2),
  comprovante_url TEXT,
  email_rastreio_enviado BOOLEAN DEFAULT FALSE,
  notas TEXT
);

-- Índices para consultas frequentes
CREATE INDEX idx_vendas_email ON vendas(customer_email);
CREATE INDEX idx_vendas_event ON vendas(event);
CREATE INDEX idx_vendas_created ON vendas(created_at DESC);
CREATE INDEX idx_vendas_order ON vendas(order_id);

-- RLS (Row Level Security) — proteger os dados
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

-- Política: apenas service_role pode inserir (webhook)
CREATE POLICY "webhook_insert" ON vendas
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Política: leitura para usuários autenticados (painel)
CREATE POLICY "painel_select" ON vendas
  FOR SELECT TO authenticated
  USING (true);

-- Política: service_role lê tudo (API interna)
CREATE POLICY "service_read" ON vendas
  FOR SELECT TO service_role
  USING (true);

-- Política: service_role pode atualizar (painel edita campos internos)
CREATE POLICY "service_update" ON vendas
  FOR UPDATE TO service_role
  USING (true);
