"use client";

import { useState, useEffect, useCallback, useMemo, FormEvent } from "react";

/* ─── Painel auth (chave enviada como x-api-key) ─────── */
const OPS_KEY_STORAGE = "rp_ops_key";
function getOpsKey(): string {
  try { return sessionStorage.getItem(OPS_KEY_STORAGE) || ""; } catch { return ""; }
}
function setOpsKeyStore(v: string): void {
  try { sessionStorage.setItem(OPS_KEY_STORAGE, v); } catch { /* ignore */ }
}
function clearOpsKeyStore(): void {
  try { sessionStorage.removeItem(OPS_KEY_STORAGE); } catch { /* ignore */ }
}
function opsHeaders(extra?: Record<string, string>): Record<string, string> {
  const k = getOpsKey();
  return { ...(extra || {}), ...(k ? { "x-api-key": k } : {}) };
}

/* ─── Types ──────────────────────────────────────────── */
interface Venda {
  id: number;
  created_at: string;
  order_id: string;
  order_ref: string;
  event: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  payment_status: string;
  payment_method: string;
  installments: number;
  amount: number;
  subscription_id: string;
  subscription_status: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  plano: string;
  kiwify_fee: number;
  net_amount: number;
  cliente_redrive: boolean;
  envio_status: string;
  tracking_code: string;
  custo_frete: number;
  comprovante_url: string;
  email_rastreio_enviado: boolean;
  notas: string;
}

type View = "hub" | "product" | "ga4" | "meta-pixel" | "utms";

interface PreCheckout {
  id: number;
  created_at: string;
  ref_id: string;
  plano: string;
  customer_name: string;
  customer_email: string;
  used: boolean;
}
type ProductTab = "overview" | "vendas" | "envios" | "mkt" | "implantacao";

interface Product {
  id: string;
  name: string;
  desc: string;
  icon: string;
  active: boolean;
  match: (v: Venda) => boolean;
}

/* ─── Constants ──────────────────────────────────────── */
// Combos RedPower Full (LP2): método/livros + 12 meses de Redrive Enterprise.
// Toda venda com esse plano precisa de criação MANUAL da conta Redrive (campo cliente_redrive).
const isRedPowerFull = (v: Venda): boolean =>
  ["redup-full", "redmax-full"].includes(v.plano) || /red\s*power\s*full/i.test(v.product_name || "");

const PRODUCTS: Product[] = [
  // RedPower original — exclui explicitamente os combos Full para não duplicar contagem.
  { id: "redpower", name: "RedPower", desc: "Método + livros + implantação", icon: "⚡", active: true, match: (v) => !isRedPowerFull(v) && (/red\s*power|redup|redmax/i.test(v.product_name || "") || ["redup", "redmax", "revisao"].includes(v.plano)) },
  { id: "redpowerfull", name: "RedPower Full", desc: "Método + livros + 12m Redrive Enterprise", icon: "🔥", active: true, match: isRedPowerFull },
  { id: "chatfirst", name: "Chat First", desc: "Livro físico e digital", icon: "📘", active: true, match: (v) => /chat\s*first/i.test(v.product_name || "") },
  { id: "redgo", name: "RedGo", desc: "Automação de vendas", icon: "🚀", active: false, match: () => false },
  { id: "saleos", name: "SaleOS", desc: "Sistema operacional de vendas", icon: "💻", active: false, match: () => false },
];

const PLANS: Record<string, { name: string; livros: boolean; implantacao: boolean; itens: string[] }> = {
  redup: { name: "RedUp", livros: true, implantacao: false, itens: ["Magia da Conversa (livro)", "Chat First (livro)", "Método Redrive (8 aulas)"] },
  redmax: { name: "RedMax", livros: true, implantacao: true, itens: ["Magia da Conversa (livro)", "Chat First (livro)", "Método Redrive (8 aulas)", "Implantação Redrive"] },
  revisao: { name: "Revisão", livros: false, implantacao: true, itens: ["Implantação Redrive (revisão)"] },
  "redup-full": { name: "RedUp Full", livros: true, implantacao: false, itens: ["Magia da Conversa (livro)", "Chat First (livro)", "Método Redrive (8 aulas)", "12 meses Redrive Enterprise"] },
  "redmax-full": { name: "RedMax Full", livros: true, implantacao: true, itens: ["Magia da Conversa (livro)", "Chat First (livro)", "Método Redrive (8 aulas)", "Implantação Redrive", "12 meses Redrive Enterprise"] },
};

const IMPL_STAGES = [
  { id: "boas_vindas", label: "Boas-vindas", icon: "👋", desc: "Meet de alinhamento inicial" },
  { id: "diagnostico", label: "Diagnóstico", icon: "🔍", desc: "Análise da operação atual" },
  { id: "setup_redrive", label: "Setup Redrive", icon: "⚙️", desc: "Configuração da plataforma" },
  { id: "treinamento", label: "Treinamento", icon: "🎓", desc: "Capacitação da equipe" },
  { id: "go_live", label: "Go Live", icon: "🚀", desc: "Operação rodando com acompanhamento" },
  { id: "acompanhamento", label: "Acompanhamento", icon: "📊", desc: "Suporte pós-implantação" },
];

const CS_TEAM = ["Não atribuído", "Maicon", "Daniel", "Ederson", "CS 1", "CS 2"];

const REMETENTE = {
  nome: "Redrive Tecnologia LTDA",
  rua: "Rua Funchal", num: "538", comp: "Cj 91",
  bairro: "Vila Olímpia", cidade: "São Paulo", uf: "SP", cep: "04551-060",
};

/* ─── Formatters ─────────────────────────────────────── */
const BRL = (v: number) =>
  "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: string) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
};

const fmtDateFull = (d: string) => {
  if (!d) return "—";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

const isPaid = (v: Venda) => v.payment_status === "paid" || v.payment_status === "approved";

/* ─── CSS ────────────────────────────────────────────── */
const STYLES = `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#09090B;--s1:#111114;--s2:#18181B;--s3:#222225;
  --b1:#27272A;--b2:#3F3F46;
  --red:#DC2626;--red-d:#7F1D1D;--green:#22C55E;--green-d:#166534;
  --yellow:#EAB308;--yellow-d:#854D0E;--orange:#F97316;--blue:#3B82F6;
  --t1:#FAFAFA;--t2:#A1A1AA;--t3:#71717A;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  font-size:14px;color:var(--t1);background:var(--bg);
}
.rp-wrap{display:flex;min-height:100vh;background:var(--bg)}
.sidebar{position:fixed;top:0;left:0;width:220px;height:100vh;background:var(--s1);border-right:1px solid var(--b1);display:flex;flex-direction:column;z-index:100}
.sidebar .logo{padding:24px 20px 20px;border-bottom:1px solid var(--b1)}
.sidebar .logo h1{font-size:18px;font-weight:800;letter-spacing:-.5px}
.sidebar .logo h1 em{color:var(--red);font-style:normal}
.sidebar .logo p{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--t3);margin-top:2px}
.sidebar nav{flex:1;padding:12px 8px;overflow-y:auto}
.sidebar nav .nav-section{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--t3);padding:12px 12px 6px;margin-top:4px}
.sidebar nav a{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;color:var(--t2);text-decoration:none;font-size:13px;font-weight:500;transition:all .15s;position:relative;margin-bottom:2px;cursor:pointer}
.sidebar nav a:hover{color:var(--t1);background:var(--s2)}
.sidebar nav a.active{color:var(--t1);background:var(--s2);font-weight:600}
.sidebar nav a.active::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;background:var(--red);border-radius:0 2px 2px 0}
.sidebar nav a .icon{width:20px;text-align:center;font-size:14px;opacity:.7}
.sidebar nav a.active .icon{opacity:1}
.sidebar nav a .badge{margin-left:auto;background:var(--red);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;min-width:20px;text-align:center}
.sidebar nav a.back{color:var(--t3);font-size:12px;gap:6px;padding:8px 12px;margin-bottom:8px}
.sidebar nav a.back:hover{color:var(--t1)}
.sidebar .user{padding:16px 20px;border-top:1px solid var(--b1)}
.sidebar .user .name{font-size:13px;font-weight:600}
.sidebar .user .role{font-size:11px;color:var(--t3)}
.content{margin-left:220px;flex:1;padding:32px;min-width:0}
.breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--t3);margin-bottom:20px;flex-wrap:wrap}
.breadcrumb a{color:var(--t3);text-decoration:none;cursor:pointer}
.breadcrumb a:hover{color:var(--t1)}
.breadcrumb span{color:var(--t2)}
.page-head{margin-bottom:28px}
.page-head h2{font-size:22px;font-weight:700;letter-spacing:-.5px}
.page-head p{color:var(--t3);font-size:13px;margin-top:4px}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:24px}
.kpi{background:var(--s1);border:1px solid var(--b1);border-radius:10px;padding:18px 20px}
.kpi .label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--t3);margin-bottom:8px}
.kpi .value{font-size:28px;font-weight:800;letter-spacing:-1px;font-variant-numeric:tabular-nums}
.kpi .sub{font-size:12px;color:var(--t2);margin-top:4px}
.kpi.alert .value{color:var(--red)}.kpi.warn .value{color:var(--yellow)}.kpi.ok .value{color:var(--green)}
.section-title{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:var(--t3);margin:28px 0 12px;padding-bottom:8px;border-bottom:1px solid var(--b1)}
.section-title:first-child{margin-top:0}
.product-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:28px}
.product-card{background:var(--s1);border:1px solid var(--b1);border-radius:12px;padding:24px;cursor:pointer;transition:all .2s}
.product-card:hover{border-color:var(--b2);transform:translateY(-2px)}
.product-card.soon{opacity:.5;cursor:default}.product-card.soon:hover{transform:none;border-color:var(--b1)}
.product-card .pc-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.product-card .pc-icon{font-size:24px}
.product-card .pc-name{font-size:16px;font-weight:700}
.product-card .pc-desc{font-size:12px;color:var(--t3)}
.product-card .pc-badge{margin-left:auto;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--t3);background:var(--s3);padding:3px 10px;border-radius:12px}
.product-card .pc-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.product-card .pc-stat .pc-sv{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums}
.product-card .pc-stat .pc-sl{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--t3)}
.product-card .pc-enter{font-size:12px;color:var(--red);font-weight:600}
.filters{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.filters select,.filters input{background:var(--s2);border:1px solid var(--b1);color:var(--t1);padding:8px 12px;border-radius:6px;font-size:12px;outline:none}
.filters select:focus,.filters input:focus{border-color:var(--red)}
.table-wrap{background:var(--s1);border:1px solid var(--b1);border-radius:10px;overflow:hidden}
.table-wrap .scroll{overflow-x:auto}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--t3);padding:12px 16px;border-bottom:1px solid var(--b1);white-space:nowrap;font-weight:600}
td{padding:12px 16px;border-bottom:1px solid var(--b1);font-size:13px;white-space:nowrap;font-variant-numeric:tabular-nums}
tr:last-child td{border-bottom:none}
tbody tr{cursor:pointer;transition:background .1s}
tbody tr:hover{background:var(--s2)}
.pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.3px}
.pill-green{background:var(--green-d);color:var(--green)}
.pill-yellow{background:var(--yellow-d);color:var(--yellow)}
.pill-red{background:var(--red-d);color:var(--red)}
.pill-gray{background:var(--s3);color:var(--t2)}
.pill-blue{background:#1E3A5F;color:var(--blue)}
.pill-orange{background:#431407;color:var(--orange)}
.tag{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600}
.tag-green{background:var(--green-d);color:var(--green)}
.tag-gray{background:var(--s3);color:var(--t2)}
.tag-red{background:var(--red-d);color:var(--red)}
.bar-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.bar-label{width:100px;font-size:12px;color:var(--t2);text-align:right;flex-shrink:0}
.bar-track{flex:1;height:24px;background:var(--s3);border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width .5s}
.bar-value{width:90px;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.card{background:var(--s1);border:1px solid var(--b1);border-radius:10px;padding:20px;margin-bottom:16px}
.card h4{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--t3);margin-bottom:14px}
.frete-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--b1);font-size:13px}
.frete-row:last-child{border-bottom:none}
.frete-row .fr-cliente{flex:1;font-weight:600}
.frete-row .fr-val{width:80px;text-align:right;font-variant-numeric:tabular-nums}
.frete-row .fr-date{width:50px;color:var(--t3);font-size:11px}
.form-group{margin-bottom:14px}
.form-group label{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--t3);margin-bottom:5px;font-weight:600}
.form-group input,.form-group select,.form-group textarea{width:100%;background:var(--s2);border:1px solid var(--b1);border-radius:6px;color:var(--t1);padding:9px 12px;font-family:inherit;font-size:13px;outline:none}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:var(--red)}
.form-group input:read-only{color:var(--t3);cursor:default}
.form-row{display:flex;gap:12px}
.form-row .form-group{flex:1}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:6px;border:none;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.btn-red{background:var(--red);color:#fff}.btn-red:hover{background:#B91C1C}
.btn-ghost{background:transparent;border:1px solid var(--b1);color:var(--t2)}.btn-ghost:hover{border-color:var(--t2);color:var(--t1)}
.btn-sm{padding:5px 10px;font-size:11px}
.btn-blue{background:#1E3A5F;color:var(--blue);border:1px solid var(--blue)}.btn-blue:hover{background:var(--blue);color:#fff}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center}
.modal{background:var(--s1);border:1px solid var(--b1);border-radius:12px;width:680px;max-width:95vw;max-height:90vh;overflow-y:auto}
.modal-head{padding:20px 24px;border-bottom:1px solid var(--b1);display:flex;align-items:center}
.modal-head h3{font-size:16px;font-weight:700;flex:1}
.modal-head .close{background:none;border:none;color:var(--t3);font-size:20px;cursor:pointer;padding:4px 8px}
.modal-body{padding:24px}
.toast{position:fixed;bottom:24px;right:24px;background:var(--green-d);border:1px solid var(--green);color:var(--green);padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;z-index:999}
.label-box{background:#fff;color:#111;border-radius:8px;padding:48px;font-family:"Courier New",monospace;font-size:24px;line-height:1.6;margin-bottom:16px}
.label-box .lb-section{margin-bottom:32px;padding-bottom:32px;border-bottom:3px dashed #ccc}
.label-box .lb-section:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none}
.label-box .lb-title{font-weight:700;font-size:20px;text-transform:uppercase;letter-spacing:3px;margin-bottom:16px;color:#666}
.label-box .lb-name{font-size:28px;font-weight:700}
.label-empty{background:#2a1a00;border:1px solid #664400;border-radius:8px;padding:16px;color:#ffaa33;font-size:13px;margin-bottom:16px;text-align:center}
@media print{body *{visibility:hidden!important}
.label-box,.label-box *{visibility:visible!important}
.label-box{position:fixed;top:0;left:0;width:200mm;padding:40px;border:2px solid #000;border-radius:0;box-shadow:none}
}
.activity{background:var(--s1);border:1px solid var(--b1);border-radius:10px;padding:20px}
.activity-item{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--b1)}
.activity-item:last-child{border-bottom:none}
.activity-item .dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0}
.activity-item .text{font-size:13px;color:var(--t2);line-height:1.5}
.activity-item .text strong{color:var(--t1);font-weight:600}
.activity-item .time{margin-left:auto;font-size:11px;color:var(--t3);white-space:nowrap}
@media(max-width:768px){
  .sidebar{position:fixed;bottom:0;left:0;right:0;top:auto;width:100%;height:auto;flex-direction:row;border-right:none;border-top:1px solid var(--b1)}
  .sidebar .logo,.sidebar .user,.sidebar nav .nav-section,.sidebar nav a.back{display:none}
  .sidebar nav{display:flex;padding:4px 8px;overflow-x:auto;gap:0}
  .sidebar nav a{flex-direction:column;font-size:10px;padding:8px 12px;gap:2px;white-space:nowrap}
  .sidebar nav a .icon{font-size:18px}
  .sidebar nav a.active::before{display:none}
  .sidebar nav a .badge{position:absolute;top:4px;right:4px;padding:1px 5px;font-size:8px}
  .content{margin-left:0;padding:16px 16px 80px}
  .kpi-grid{grid-template-columns:repeat(2,1fr)}
  .kpi .value{font-size:22px}
  .product-grid{grid-template-columns:1fr}
  .grid-2{grid-template-columns:1fr}
  .form-row{flex-direction:column}
}
`;

/* ─── Badge helpers ──────────────────────────────────── */
function statusPill(s: string) {
  const map: Record<string, [string, string]> = {
    paid: ["Aprovado", "green"], approved: ["Aprovado", "green"],
    waiting_payment: ["Pendente", "yellow"], pending: ["Pendente", "yellow"],
    refunded: ["Reembolsado", "red"], refused: ["Recusado", "red"],
  };
  const [label, color] = map[s] || [s || "—", "gray"];
  return <span className={`pill pill-${color}`}>{label}</span>;
}

function envioPill(status: string, plano: string) {
  if (!PLANS[plano]?.livros) return <span className="pill pill-gray">N/A</span>;
  const map: Record<string, [string, string]> = {
    aguardando: ["Ag. envio", "yellow"], etiqueta: ["Etiqueta", "blue"],
    enviado: ["Enviado", "orange"], entregue: ["Entregue", "green"],
  };
  if (!status) return <span className="pill pill-gray">—</span>;
  const [label, color] = map[status] || [status, "gray"];
  return <span className={`pill pill-${color}`}>{label}</span>;
}

function planoPill(p: string) {
  return <span className="pill pill-red">{PLANS[p]?.name || p}</span>;
}

/* ─── Detail Modal ───────────────────────────────────── */
function DetailModal({ venda, onClose, onSave }: {
  venda: Venda; onClose: () => void;
  onSave: (data: Partial<Venda>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    customer_name: venda.customer_name || "",
    customer_email: venda.customer_email || "",
    customer_phone: venda.customer_phone || "",
    address_street: venda.address_street || "",
    address_number: venda.address_number || "",
    address_complement: venda.address_complement || "",
    address_neighborhood: venda.address_neighborhood || "",
    address_city: venda.address_city || "",
    address_state: venda.address_state || "",
    address_zip: venda.address_zip || "",
    plano: venda.plano || "",
    envio_status: venda.envio_status || "aguardando",
    tracking_code: venda.tracking_code || "",
    email_rastreio_enviado: venda.email_rastreio_enviado || false,
    custo_frete: venda.custo_frete || "",
    comprovante_url: venda.comprovante_url || "",
    cliente_redrive: venda.cliente_redrive || false,
    notas: venda.notas || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (key: string, val: string | boolean | number) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ id: venda.id, ...form, custo_frete: form.custo_frete ? Number(form.custo_frete) : null } as Partial<Venda>);
    } finally { setSaving(false); }
  };

  const needsShipping = PLANS[form.plano]?.livros;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{venda.customer_name || "Sem nome"}</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 20 }}>
            Pedido #{venda.order_ref || venda.order_id} · {fmtDateFull(venda.created_at)} ·{" "}
            {venda.amount ? BRL(venda.amount) : "—"} · {statusPill(venda.payment_status)}
          </p>

          <div className="card">
            <h4>Dados de contato</h4>
            <div className="form-row">
              <div className="form-group"><label>Nome</label><input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} /></div>
              <div className="form-group"><label>E-mail</label><input value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Telefone</label><input value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)} /></div>
              <div className="form-group">
                <label>Plano</label>
                <select value={form.plano} onChange={(e) => set("plano", e.target.value)}>
                  <option value="">—</option>
                  <option value="redup">RedUp</option>
                  <option value="redmax">RedMax</option>
                  <option value="revisao">Revisão</option>
                </select>
              </div>
            </div>
          </div>

          {PLANS[form.plano] && (
            <div className="card" style={{ borderColor: "var(--red)" }}>
              <h4>Itens do plano — {PLANS[form.plano].name}</h4>
              {PLANS[form.plano].itens.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 13, color: "var(--t2)" }}>
                  <span style={{ color: "var(--green)" }}>✓</span> {item}
                </div>
              ))}
            </div>
          )}

          <div className="card">
              <h4>Endereço</h4>
              <div className="form-row">
                <div className="form-group" style={{ flex: 3 }}><label>Rua</label><input value={form.address_street} onChange={(e) => set("address_street", e.target.value)} /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Nº</label><input value={form.address_number} onChange={(e) => set("address_number", e.target.value)} /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Comp.</label><input value={form.address_complement} onChange={(e) => set("address_complement", e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Bairro</label><input value={form.address_neighborhood} onChange={(e) => set("address_neighborhood", e.target.value)} /></div>
                <div className="form-group"><label>Cidade</label><input value={form.address_city} onChange={(e) => set("address_city", e.target.value)} /></div>
                <div className="form-group" style={{ flex: 0.5 }}><label>UF</label><input value={form.address_state} onChange={(e) => set("address_state", e.target.value.toUpperCase())} maxLength={2} /></div>
                <div className="form-group"><label>CEP</label><input value={form.address_zip} onChange={(e) => set("address_zip", e.target.value)} /></div>
              </div>
            </div>

          {needsShipping && (
            <div className="card">
              <h4>Envio</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.envio_status} onChange={(e) => set("envio_status", e.target.value)}>
                    <option value="aguardando">Aguardando envio</option>
                    <option value="etiqueta">Etiqueta gerada</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregue">Entregue</option>
                  </select>
                </div>
                <div className="form-group"><label>Rastreamento</label><input value={form.tracking_code} onChange={(e) => set("tracking_code", e.target.value)} placeholder="BR123456789BR" /></div>
                <div className="form-group"><label>Custo frete</label><input type="number" step="0.01" value={form.custo_frete} onChange={(e) => set("custo_frete", e.target.value)} placeholder="0.00" /></div>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--t2)" }}>
                  <input type="checkbox" checked={form.email_rastreio_enviado} onChange={(e) => set("email_rastreio_enviado", e.target.checked)} style={{ accentColor: "var(--red)" }} />
                  E-mail de rastreio enviado
                </label>
              </div>
            </div>
          )}

          <div className="card">
            <h4>Interno</h4>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--t2)", marginBottom: 12 }}>
              <input type="checkbox" checked={form.cliente_redrive} onChange={(e) => set("cliente_redrive", e.target.checked)} style={{ accentColor: "var(--green)" }} />
              Cliente Redrive
            </label>
            <div className="form-group">
              <label>Notas</label>
              <textarea value={form.notas} onChange={(e) => set("notas", e.target.value)} rows={3} placeholder="Observações..." />
            </div>
          </div>

          <button className="btn btn-red" style={{ width: "100%", padding: "12px 0", fontSize: 14, marginTop: 8 }} onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Label Modal ────────────────────────────────────── */
function LabelModal({ venda, onClose }: { venda: Venda; onClose: () => void }) {
  const hasAddress = venda.address_street && venda.address_city && venda.address_state && venda.address_zip;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Etiqueta de Envio</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {!hasAddress && (
            <div className="label-empty">
              ⚠️ Endereço incompleto. Edite os dados do cliente na aba Vendas antes de gerar a etiqueta.<br />
              <span style={{ fontSize: 11, opacity: 0.8 }}>Dica: no Kiwify, marque o produto como "produto físico" para coletar endereço no checkout.</span>
            </div>
          )}
          <div className="label-box">
            <div className="lb-section">
              <div className="lb-title">Remetente</div>
              <div className="lb-name">{REMETENTE.nome}</div>
              {REMETENTE.rua}, {REMETENTE.num} – {REMETENTE.comp}<br />
              {REMETENTE.bairro} — {REMETENTE.cidade}/{REMETENTE.uf}<br />
              CEP: {REMETENTE.cep}
            </div>
            <div className="lb-section">
              <div className="lb-title">Destinatário</div>
              <div className="lb-name">{venda.customer_name}</div>
              {venda.address_street || "—"}, {venda.address_number || "s/n"}{venda.address_complement ? ` – ${venda.address_complement}` : ""}<br />
              {venda.address_neighborhood || "—"} — {venda.address_city || "—"}/{venda.address_state || "—"}<br />
              CEP: {venda.address_zip || "—"}<br /><br />
              Tel: {venda.customer_phone || "—"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => window.print()} disabled={!hasAddress}>🖨️ Imprimir</button>
            <button className="btn btn-red" onClick={onClose}>✓ Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function OpsPage() {
  const [sales, setSales] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("hub");
  const [activeProduct, setActiveProduct] = useState<string | null>(null);
  const [productTab, setProductTab] = useState<ProductTab>("overview");
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [labelVenda, setLabelVenda] = useState<Venda | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlano, setFilterPlano] = useState("");
  const [search, setSearch] = useState("");
  const [preCheckouts, setPreCheckouts] = useState<PreCheckout[]>([]);
  const [locked, setLocked] = useState(false);
  const [keyInput, setKeyInput] = useState("");

  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, pcRes] = await Promise.all([
        fetch("/api/vendas?limit=500", { headers: opsHeaders() }),
        fetch("/api/pre-checkout", { headers: opsHeaders() }),
      ]);
      if (salesRes.status === 401 || pcRes.status === 401) {
        clearOpsKeyStore();
        setLocked(true);
        return;
      }
      setLocked(false);
      const salesData = await salesRes.json();
      const pcData = await pcRes.json();
      setSales(salesData.vendas || []);
      setPreCheckouts(pcData.pre_checkouts || []);
    } catch { toast("Erro ao carregar dados"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const unlock = async (e: FormEvent) => {
    e.preventDefault();
    setOpsKeyStore(keyInput.trim());
    setKeyInput("");
    await fetchSales();
    // fetchSales clears the stored key on 401 — if it's gone, the key was wrong.
    if (!getOpsKey()) toast("Chave inválida");
  };

  const handleSave = async (data: Partial<Venda>) => {
    try {
      const res = await fetch("/api/vendas", { method: "PATCH", headers: opsHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(data) });
      if (res.status === 401) { clearOpsKeyStore(); setLocked(true); toast("Sessão expirada — informe a chave"); return; }
      if (!res.ok) throw new Error();
      const result = await res.json();
      setSales((prev) => prev.map((s) => (s.id === result.venda.id ? result.venda : s)));
      setSelectedVenda(null);
      toast("Salvo com sucesso!");
    } catch { toast("Erro ao salvar"); }
  };

  const goHub = () => { setView("hub"); setActiveProduct(null); };
  const goProduct = (pid: string) => { setView("product"); setActiveProduct(pid); setProductTab("overview"); setFilterStatus(""); setFilterPlano(""); setSearch(""); };

  /* ─── Computed ─────────────────────────────────────── */
  const paidSales = useMemo(() => sales.filter(isPaid), [sales]);
  const receitaTotal = useMemo(() => paidSales.reduce((s, v) => s + (Number(v.amount) || 0), 0), [paidSales]);
  const taxasTotal = useMemo(() => paidSales.reduce((s, v) => s + (Number(v.kiwify_fee) || 0), 0), [paidSales]);
  const liquidoTotal = useMemo(() => paidSales.reduce((s, v) => s + (Number(v.net_amount) || Number(v.amount) || 0), 0), [paidSales]);
  const totalFrete = useMemo(() => sales.reduce((s, v) => s + (Number(v.custo_frete) || 0), 0), [sales]);
  const pendentes = useMemo(() => sales.filter((s) => s.payment_status === "waiting_payment" || s.payment_status === "pending").length, [sales]);
  const enviosPendTotal = useMemo(() => paidSales.filter((s) => PLANS[s.plano]?.livros && (s.envio_status === "aguardando" || s.envio_status === "etiqueta")).length, [paidSales]);

  // Product-specific sales
  const productSales = useMemo(() => {
    if (!activeProduct) return sales;
    const prod = PRODUCTS.find((p) => p.id === activeProduct);
    if (!prod) return sales;
    const matched = sales.filter(prod.match);
    const unmatched = sales.filter((v) => !PRODUCTS.some((p) => p.active && p.match(v)));
    if (activeProduct === "redpower") return [...matched, ...unmatched];
    return matched;
  }, [sales, activeProduct]);

  const prodPaid = useMemo(() => productSales.filter(isPaid), [productSales]);
  const prodReceita = useMemo(() => prodPaid.reduce((s, v) => s + (Number(v.amount) || 0), 0), [prodPaid]);
  const prodPendente = useMemo(() => productSales.filter((s) => !isPaid(s)).reduce((s, v) => s + (Number(v.amount) || 0), 0), [productSales]);
  const prodTaxas = useMemo(() => prodPaid.reduce((s, v) => s + (Number(v.kiwify_fee) || 0), 0), [prodPaid]);
  const prodLiquido = useMemo(() => prodPaid.reduce((s, v) => s + (Number(v.net_amount) || Number(v.amount) || 0), 0), [prodPaid]);
  const prodTicket = prodPaid.length > 0 ? prodReceita / prodPaid.length : 0;
  const prodFrete = useMemo(() => productSales.reduce((s, v) => s + (Number(v.custo_frete) || 0), 0), [productSales]);
  const prodEnviosPend = useMemo(() => prodPaid.filter((s) => PLANS[s.plano]?.livros && (s.envio_status === "aguardando" || s.envio_status === "etiqueta")).length, [prodPaid]);

  const filtered = useMemo(() => {
    return productSales.filter((s) => {
      if (filterStatus && s.payment_status !== filterStatus) return false;
      if (filterPlano && s.plano !== filterPlano) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(s.customer_name || "").toLowerCase().includes(q) && !(s.customer_email || "").toLowerCase().includes(q) && !(s.order_ref || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [productSales, filterStatus, filterPlano, search]);

  const envioSales = useMemo(() => prodPaid.filter((s) => PLANS[s.plano]?.livros), [prodPaid]);
  const aguardando = useMemo(() => envioSales.filter((s) => s.envio_status === "aguardando"), [envioSales]);
  const etiqueta = useMemo(() => envioSales.filter((s) => s.envio_status === "etiqueta"), [envioSales]);
  const enviado = useMemo(() => envioSales.filter((s) => s.envio_status === "enviado"), [envioSales]);
  const entregue = useMemo(() => envioSales.filter((s) => s.envio_status === "entregue"), [envioSales]);
  const comFrete = useMemo(() => envioSales.filter((s) => Number(s.custo_frete) > 0), [envioSales]);

  const utmData = useMemo(() => {
    const map: Record<string, { vendas: number; receita: number }> = {};
    for (const s of productSales) {
      const src = s.utm_source || "Direto";
      if (!map[src]) map[src] = { vendas: 0, receita: 0 };
      map[src].vendas++;
      if (isPaid(s)) map[src].receita += Number(s.amount) || 0;
    }
    return Object.entries(map).sort((a, b) => b[1].receita - a[1].receita);
  }, [productSales]);

  const planBreakdown = useMemo(() => {
    return ["redup", "redmax", "revisao"].map((p) => {
      const pv = prodPaid.filter((s) => s.plano === p);
      return { plano: p, count: pv.length, receita: pv.reduce((s, v) => s + (Number(v.amount) || 0), 0) };
    });
  }, [prodPaid]);

  // Product stats for Hub cards
  const productStats = useMemo(() => {
    return PRODUCTS.filter((p) => p.active).map((prod) => {
      const pSales = sales.filter(prod.match);
      const unmatchedCount = prod.id === "redpower" ? sales.filter((v) => !PRODUCTS.some((p) => p.active && p.match(v))).length : 0;
      const allProdSales = prod.id === "redpower" ? [...pSales, ...sales.filter((v) => !PRODUCTS.some((p) => p.active && p.match(v)))] : pSales;
      const paid = allProdSales.filter(isPaid);
      const receita = paid.reduce((s, v) => s + (Number(v.amount) || 0), 0);
      const envPend = paid.filter((s) => PLANS[s.plano]?.livros && (s.envio_status === "aguardando" || s.envio_status === "etiqueta")).length;
      return {
        ...prod,
        totalSales: allProdSales.length + unmatchedCount - (prod.id === "redpower" ? unmatchedCount : 0),
        receita,
        ticket: paid.length > 0 ? receita / paid.length : 0,
        envPend,
      };
    });
  }, [sales]);

  const recentActivity = useMemo(() => sales.slice(0, 8), [sales]);

  /* ─── Product tab nav items ────────────────────────── */
  const prodTabs: { id: ProductTab; label: string; icon: string }[] = [
    { id: "overview", label: "Visão Geral", icon: "◉" },
    { id: "vendas", label: "Vendas", icon: "$" },
    { id: "envios", label: "Envios", icon: "📦" },
    { id: "mkt", label: "Marketing", icon: "◎" },
    { id: "implantacao", label: "Implantação", icon: "🚀" },
  ];

  const activeProd = PRODUCTS.find((p) => p.id === activeProduct);

  /* ─── Render: Hub ──────────────────────────────────── */
  const renderHub = () => (
    <>
      <div className="page-head">
        <h2>Hub Operacional</h2>
        <p>Visão consolidada de todos os produtos — {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
      </div>
      <div className="kpi-grid">
        <div className="kpi"><div className="label">Faturamento bruto</div><div className="value">{BRL(receitaTotal)}</div><div className="sub">{paidSales.length} vendas aprovadas</div></div>
        <div className="kpi" style={{ borderColor: "var(--yellow)" }}><div className="label">Taxas Kiwify</div><div className="value" style={{ color: "var(--yellow)" }}>-{BRL(taxasTotal)}</div><div className="sub">{taxasTotal > 0 ? ((taxasTotal / receitaTotal) * 100).toFixed(1) + "%" : "—"}</div></div>
        <div className="kpi ok"><div className="label">Saldo líquido</div><div className="value">{BRL(liquidoTotal)}</div><div className="sub">após taxas</div></div>
        <div className="kpi"><div className="label">Gastos com frete</div><div className="value">{BRL(totalFrete)}</div></div>
      </div>

      <div className="section-title">Produtos</div>
      <div className="product-grid">
        {PRODUCTS.map((prod) => {
          if (!prod.active) return (
            <div className="product-card soon" key={prod.id}>
              <div className="pc-head">
                <span className="pc-icon">{prod.icon}</span>
                <div><div className="pc-name">{prod.name}</div><div className="pc-desc">{prod.desc}</div></div>
                <span className="pc-badge">Em breve</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--t3)" }}>Em desenvolvimento</p>
            </div>
          );
          const stats = productStats.find((s) => s.id === prod.id);
          return (
            <div className="product-card" key={prod.id} onClick={() => goProduct(prod.id)}>
              <div className="pc-head">
                <span className="pc-icon">{prod.icon}</span>
                <div><div className="pc-name">{prod.name}</div><div className="pc-desc">{prod.desc}</div></div>
              </div>
              <div className="pc-stats">
                <div className="pc-stat"><div className="pc-sv">{BRL(stats?.receita || 0)}</div><div className="pc-sl">Receita</div></div>
                <div className="pc-stat"><div className="pc-sv">{stats?.totalSales || 0}</div><div className="pc-sl">Vendas</div></div>
                <div className="pc-stat"><div className="pc-sv">{stats?.envPend || 0}</div><div className="pc-sl">Envios pend.</div></div>
                <div className="pc-stat"><div className="pc-sv">{BRL(stats?.ticket || 0)}</div><div className="pc-sl">Ticket médio</div></div>
              </div>
              <div className="pc-enter">Acessar painel →</div>
            </div>
          );
        })}
      </div>

      <div className="section-title">Atividade recente</div>
      <div className="activity">
        {loading && <p style={{ color: "var(--t3)", fontSize: 13, padding: 8 }}>Carregando...</p>}
        {!loading && recentActivity.length === 0 && <p style={{ color: "var(--t3)", fontSize: 13, padding: 8 }}>Nenhuma venda registrada</p>}
        {recentActivity.map((v) => (
          <div className="activity-item" key={v.id} style={{ cursor: "pointer" }} onClick={() => setSelectedVenda(v)}>
            <div className="dot" style={{ background: isPaid(v) ? "var(--green)" : v.payment_status === "refunded" ? "var(--red)" : "var(--yellow)" }} />
            <div className="text">
              ⚡ <strong>{v.customer_name || "Sem nome"}</strong>{" "}
              {isPaid(v) ? `— ${v.product_name || ""} ${BRL(Number(v.amount) || 0)}` : `— ${v.payment_status === "refunded" ? "reembolsado" : "pagamento pendente"}`}
            </div>
            <div className="time">{fmtDate(v.created_at)}</div>
          </div>
        ))}
      </div>
    </>
  );

  /* ─── Render: Product Overview ─────────────────────── */
  const renderOverview = () => (
    <>
      <div className="page-head"><h2>Visão Geral</h2></div>
      <div className="kpi-grid">
        <div className="kpi"><div className="label">Faturamento bruto</div><div className="value">{BRL(prodReceita)}</div><div className="sub">{prodPaid.length} vendas aprovadas</div></div>
        <div className="kpi" style={{ borderColor: "var(--yellow)" }}><div className="label">Taxas Kiwify</div><div className="value" style={{ color: "var(--yellow)" }}>-{BRL(prodTaxas)}</div></div>
        <div className="kpi ok"><div className="label">Saldo líquido</div><div className="value">{BRL(prodLiquido)}</div><div className="sub">após taxas</div></div>
        <div className="kpi"><div className="label">Ticket médio</div><div className="value">{BRL(prodTicket)}</div></div>
        <div className={`kpi ${prodPendente > 0 ? "warn" : ""}`}><div className="label">Receita pendente</div><div className="value">{BRL(prodPendente)}</div></div>
        <div className={`kpi ${prodEnviosPend > 0 ? "warn" : "ok"}`}><div className="label">Envios pendentes</div><div className="value">{prodEnviosPend}</div></div>
        <div className="kpi"><div className="label">Gasto total frete</div><div className="value">{BRL(prodFrete)}</div></div>
        <div className="kpi"><div className="label">Total de vendas</div><div className="value">{productSales.length}</div></div>
        {activeProduct === "redpowerfull" && (
          <div className={`kpi ${prodPaid.filter((s) => !s.cliente_redrive).length > 0 ? "warn" : "ok"}`}>
            <div className="label">Contas Redrive a criar</div>
            <div className="value">{prodPaid.filter((s) => !s.cliente_redrive).length}</div>
            <div className="sub">combos pagos sem conta criada</div>
          </div>
        )}
      </div>
      {activeProduct === "redpower" && (
        <>
          <div className="section-title">Vendas por modalidade</div>
          <div className="kpi-grid">
            {planBreakdown.map((p) => (
              <div className="kpi" key={p.plano}>
                <div className="label">{PLANS[p.plano]?.name || p.plano}</div>
                <div className="value">{p.count}</div>
                <div className="sub">{BRL(p.receita)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );

  const exportCSV = () => {
    const rows = filtered.length ? filtered : productSales;
    if (!rows.length) return;
    const headers = ["Data","Pedido","Nome","E-mail","Telefone","Plano","Valor","Pagamento","Envio","Rastreio","Rua","Número","Complemento","Bairro","Cidade","UF","CEP","Origem","Cliente Redrive"];
    const csv = [headers.join(";"), ...rows.map((v: Venda) => [
      fmtDate(v.created_at), v.order_ref || v.order_id || "", v.customer_name || "", v.customer_email || "",
      v.customer_phone || "", v.plano || "", v.amount ?? "", v.payment_status || "", v.envio_status || "",
      v.tracking_code || "", v.address_street || "", v.address_number || "", v.address_complement || "",
      v.address_neighborhood || "", v.address_city || "", v.address_state || "", v.address_zip || "",
      v.utm_source || "Direto", v.cliente_redrive ? "Sim" : "Não",
    ].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `vendas-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  /* ─── Render: Vendas ───────────────────────────────── */
  const renderVendas = () => (
    <>
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Vendas</h2><p>Clique em uma venda para ver detalhes e editar</p></div>
        <button className="btn btn-ghost" onClick={exportCSV} style={{ whiteSpace: "nowrap" }}>📥 Exportar CSV</button>
      </div>
      <div className="filters">
        <input placeholder="Buscar nome, e-mail ou pedido..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: "1 1 200px" }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Status: Todos</option>
          <option value="paid">Aprovado</option>
          <option value="waiting_payment">Pendente</option>
          <option value="refunded">Reembolsado</option>
          <option value="refused">Recusado</option>
        </select>
        <select value={filterPlano} onChange={(e) => setFilterPlano(e.target.value)}>
          <option value="">Plano: Todos</option>
          <option value="redup">RedUp</option>
          <option value="redmax">RedMax</option>
          <option value="revisao">Revisão</option>
        </select>
      </div>
      <div className="table-wrap"><div className="scroll">
        <table>
          <thead><tr><th>Data</th><th>ID</th><th>Cliente</th><th>Plano</th><th>Valor</th><th>Origem</th><th>Pagamento</th><th>Envio</th><th>Redrive</th><th></th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: "var(--t3)" }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: "var(--t3)" }}>Nenhuma venda encontrada</td></tr>
            ) : filtered.map((v) => (
              <tr key={v.id} onClick={() => setSelectedVenda(v)}>
                <td>{fmtDate(v.created_at)}</td>
                <td style={{ color: "var(--t3)" }}>{v.order_ref || `#${v.id}`}</td>
                <td><strong>{v.customer_name || "—"}</strong><br /><span style={{ color: "var(--t3)", fontSize: 11 }}>{v.customer_email || ""}</span></td>
                <td>{v.plano ? planoPill(v.plano) : <span style={{ color: "var(--t3)" }}>—</span>}</td>
                <td><strong>{v.amount ? BRL(v.amount) : "—"}</strong></td>
                <td>{v.utm_source || "Direto"}</td>
                <td>{statusPill(v.payment_status)}</td>
                <td>{envioPill(v.envio_status, v.plano)}</td>
                <td>{v.cliente_redrive ? <span className="tag tag-green">Sim</span> : <span className="tag tag-gray">Não</span>}</td>
                <td style={{ color: "var(--t3)" }}>→</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
      <p style={{ marginTop: 12, fontSize: 12, color: "var(--t3)" }}>{filtered.length} venda{filtered.length !== 1 ? "s" : ""}</p>
    </>
  );

  /* ─── Render: Envios ───────────────────────────────── */
  const renderEnvios = () => {
    const mediaFrete = comFrete.length ? comFrete.reduce((s, x) => s + Number(x.custo_frete), 0) / comFrete.length : 0;
    const semComp = comFrete.filter((s) => !s.comprovante_url).length;
    const allEnvios = [...aguardando, ...etiqueta, ...enviado, ...entregue];
    return (
      <>
        <div className="page-head"><h2>Envios</h2><p>Gestão de despacho e custos de frete</p></div>
        <div className="kpi-grid">
          <div className="kpi warn"><div className="label">Ag. envio</div><div className="value">{aguardando.length}</div></div>
          <div className="kpi"><div className="label">Etiqueta gerada</div><div className="value">{etiqueta.length}</div></div>
          <div className="kpi"><div className="label">Enviados</div><div className="value">{enviado.length}</div></div>
          <div className="kpi ok"><div className="label">Entregues</div><div className="value">{entregue.length}</div></div>
        </div>
        <div className="section-title">Gastos com frete</div>
        <div className="kpi-grid">
          <div className="kpi"><div className="label">Total gasto</div><div className="value">{BRL(prodFrete)}</div><div className="sub">{comFrete.length} envios</div></div>
          <div className="kpi"><div className="label">Custo médio</div><div className="value">{BRL(mediaFrete)}</div></div>
          <div className={`kpi ${semComp > 0 ? "warn" : "ok"}`}><div className="label">Sem comprovante</div><div className="value">{semComp}</div></div>
        </div>
        {comFrete.length > 0 && (
          <div className="card"><h4>Detalhamento de frete</h4>
            {[...comFrete].sort((a, b) => Number(b.custo_frete) - Number(a.custo_frete)).map((s) => (
              <div className="frete-row" key={s.id}>
                <span className="fr-date">{fmtDate(s.created_at)}</span>
                <span className="fr-cliente">{s.customer_name}</span>
                <span style={{ fontSize: 11, color: "var(--t3)" }}>{s.tracking_code || "—"}</span>
                <span className="fr-val">{BRL(Number(s.custo_frete))}</span>
                {s.comprovante_url ? <span className="tag tag-green">✓ Comp.</span> : <span className="tag tag-red">Sem comp.</span>}
              </div>
            ))}
          </div>
        )}
        <div className="section-title">Todos os envios</div>
        <div className="table-wrap"><div className="scroll">
          <table>
            <thead><tr><th>Cliente</th><th>Cidade/UF</th><th>Rastreio</th><th>Frete</th><th>Status</th><th>E-mail</th><th>Ação</th></tr></thead>
            <tbody>
              {allEnvios.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--t3)" }}>Nenhum envio</td></tr>
              ) : allEnvios.map((s) => (
                <tr key={s.id} onClick={() => setSelectedVenda(s)}>
                  <td><strong>{s.customer_name || "—"}</strong></td>
                  <td>{s.address_city ? `${s.address_city}/${s.address_state}` : "—"}</td>
                  <td style={{ fontSize: 11, color: "var(--t3)" }}>{s.tracking_code || "—"}</td>
                  <td>{s.custo_frete ? BRL(Number(s.custo_frete)) : "—"}</td>
                  <td>{envioPill(s.envio_status, s.plano)}</td>
                  <td>{s.email_rastreio_enviado ? <span className="tag tag-green">✓</span> : <span className="tag tag-gray">—</span>}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setLabelVenda(s); }}>🏷️ Etiqueta</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </>
    );
  };

  /* ─── Render: Marketing ────────────────────────────── */
  const renderMkt = () => {
    const recTotal = utmData.reduce((s, [, d]) => s + d.receita, 0);
    const venTotal = utmData.reduce((s, [, d]) => s + d.vendas, 0);
    const maxR = Math.max(...utmData.map(([, d]) => d.receita), 1);
    const colors = ["#DC2626", "#F97316", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899"];
    return (
      <>
        <div className="page-head"><h2>Marketing</h2><p>Performance por origem (UTM source)</p></div>
        <div className="kpi-grid">
          <div className="kpi"><div className="label">Receita total</div><div className="value">{BRL(recTotal)}</div></div>
          <div className="kpi"><div className="label">Total vendas</div><div className="value">{venTotal}</div></div>
        </div>
        <div className="section-title">Receita por canal</div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          {utmData.map(([nome, d], i) => (
            <div className="bar-row" key={nome}>
              <span className="bar-label">{nome}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((d.receita / maxR) * 100)}%`, background: colors[i % 6] }} /></div>
              <span className="bar-value">{BRL(d.receita)}</span>
            </div>
          ))}
          {utmData.length === 0 && <p style={{ color: "var(--t3)", fontSize: 13 }}>Nenhum dado de origem disponível</p>}
        </div>
        <div className="section-title">Detalhamento</div>
        <div className="table-wrap"><div className="scroll">
          <table>
            <thead><tr><th>Canal</th><th>Vendas</th><th>Receita</th></tr></thead>
            <tbody>
              {utmData.map(([nome, d]) => (
                <tr key={nome} style={{ cursor: "default" }}><td><strong>{nome}</strong></td><td>{d.vendas}</td><td><strong>{BRL(d.receita)}</strong></td></tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </>
    );
  };

  /* ─── Render: GA4 Dashboard ─────────────────────────── */
  const renderGA4 = () => {
    const funnelSteps = [
      { event: "page_view", label: "Visita à LP", page: "redpower.com.br", color: "var(--blue)", auto: true },
      { event: "generate_lead", label: "Lead capturado", page: "/envio (load)", color: "var(--orange)", auto: false },
      { event: "begin_checkout", label: "Início do checkout", page: "/envio (submit)", color: "var(--yellow)", auto: false },
      { event: "purchase", label: "Compra confirmada", page: "/obrigado", color: "var(--green)", auto: false },
    ];
    const autoEvents = [
      { event: "page_view", desc: "Cada pageview em qualquer página" },
      { event: "scroll", desc: "Scroll de 90% da página" },
      { event: "user_engagement", desc: "Sessão com 10s+ de engajamento" },
      { event: "first_visit", desc: "Primeiro acesso do usuário" },
      { event: "session_start", desc: "Início de nova sessão" },
      { event: "form_start", desc: "Interação com formulário" },
      { event: "click", desc: "Cliques em links externos" },
    ];
    return (
      <>
        <div className="page-head">
          <h2>📊 Google Analytics 4</h2>
          <p>Rastreamento de comportamento e funil de vendas via GTM</p>
        </div>
        <div className="kpi-grid">
          <div className="kpi"><div className="label">Measurement ID</div><div className="value" style={{ fontSize: 18 }}>G-N8X7M0YNJB</div></div>
          <div className="kpi"><div className="label">GTM Container</div><div className="value" style={{ fontSize: 18 }}>GTM-TQF28M9</div></div>
          <div className="kpi ok"><div className="label">Status</div><div className="value" style={{ fontSize: 18 }}>Ativo ✓</div></div>
        </div>

        <div className="section-title">Funil de conversão</div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
            {funnelSteps.map((step, i) => (
              <div key={step.event} style={{ flex: 1, display: "flex", alignItems: "stretch" }}>
                <div style={{ flex: 1, padding: "20px 16px", background: `color-mix(in srgb, ${step.color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${step.color} 30%, transparent)`, borderRadius: i === 0 ? "10px 0 0 10px" : i === funnelSteps.length - 1 ? "0 10px 10px 0" : 0, textAlign: "center" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: step.color, fontWeight: 700, marginBottom: 8 }}>{step.event}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", marginBottom: 4 }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>{step.page}</div>
                  {!step.auto && <div style={{ marginTop: 8 }}><span className="pill pill-blue" style={{ fontSize: 9 }}>gtag custom</span></div>}
                </div>
                {i < funnelSteps.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", color: "var(--t3)", fontSize: 18, padding: "0 2px" }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid-2">
          <div>
            <div className="section-title">Eventos customizados (gtag)</div>
            <div className="card">
              <table style={{ width: "100%" }}>
                <thead><tr><th>Evento</th><th>Página</th><th>Tipo</th></tr></thead>
                <tbody>
                  {funnelSteps.filter(s => !s.auto).map(s => (
                    <tr key={s.event} style={{ cursor: "default" }}>
                      <td><strong style={{ color: s.color }}>{s.event}</strong></td>
                      <td style={{ color: "var(--t2)" }}>{s.page}</td>
                      <td><span className="pill pill-blue">Custom</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="section-title">Eventos automáticos (enhanced)</div>
            <div className="card">
              <table style={{ width: "100%" }}>
                <thead><tr><th>Evento</th><th>Descrição</th></tr></thead>
                <tbody>
                  {autoEvents.map(e => (
                    <tr key={e.event} style={{ cursor: "default" }}>
                      <td><strong>{e.event}</strong></td>
                      <td style={{ color: "var(--t2)" }}>{e.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="section-title">Acesso rápido</div>
        <div className="kpi-grid">
          <a href="https://analytics.google.com/analytics/web/#/a172435079p549908925/reports/intelligenthome" target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: "none" }}>
            <div className="pc-head"><span className="pc-icon">📈</span><div><div className="pc-name">Tempo Real</div><div className="pc-desc">Usuários ativos agora</div></div></div>
            <div className="pc-enter">Abrir no GA4 →</div>
          </a>
          <a href="https://analytics.google.com/analytics/web/#/a172435079p549908925/reports/dashboard" target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: "none" }}>
            <div className="pc-head"><span className="pc-icon">📊</span><div><div className="pc-name">Relatórios</div><div className="pc-desc">Visão geral de aquisição e comportamento</div></div></div>
            <div className="pc-enter">Abrir no GA4 →</div>
          </a>
          <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: "none" }}>
            <div className="pc-head"><span className="pc-icon">🏷️</span><div><div className="pc-name">Tag Manager</div><div className="pc-desc">Gerenciar tags e acionadores</div></div></div>
            <div className="pc-enter">Abrir GTM →</div>
          </a>
        </div>
      </>
    );
  };

  /* ─── Render: Meta Pixel Dashboard ────────────────── */
  const renderMetaPixel = () => {
    const pixelEvents = [
      { event: "PageView", label: "Visita à LP", page: "Todas as páginas", color: "var(--blue)", trigger: "Automático (layout.tsx)" },
      { event: "Lead", label: "Lead capturado", page: "/envio", color: "var(--orange)", trigger: "useEffect on mount" },
      { event: "InitiateCheckout", label: "Início do checkout", page: "/envio → Kiwify", color: "var(--yellow)", trigger: "Antes do redirect" },
      { event: "Purchase", label: "Compra confirmada", page: "/obrigado", color: "var(--green)", trigger: "useEffect on mount" },
    ];
    return (
      <>
        <div className="page-head">
          <h2>📱 Meta Pixel</h2>
          <p>Rastreamento de conversões para Facebook e Instagram Ads</p>
        </div>
        <div className="kpi-grid">
          <div className="kpi"><div className="label">Pixel ID</div><div className="value" style={{ fontSize: 18 }}>568578591290117</div></div>
          <div className="kpi ok"><div className="label">Status</div><div className="value" style={{ fontSize: 18 }}>Ativo ✓</div></div>
          <div className="kpi"><div className="label">Eventos configurados</div><div className="value">4</div></div>
        </div>

        <div className="section-title">Funil de conversão</div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
            {pixelEvents.map((step, i) => (
              <div key={step.event} style={{ flex: 1, display: "flex", alignItems: "stretch" }}>
                <div style={{ flex: 1, padding: "20px 16px", background: `color-mix(in srgb, ${step.color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${step.color} 30%, transparent)`, borderRadius: i === 0 ? "10px 0 0 10px" : i === pixelEvents.length - 1 ? "0 10px 10px 0" : 0, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: step.color, marginBottom: 6 }}>{step.event}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", marginBottom: 4 }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>{step.page}</div>
                </div>
                {i < pixelEvents.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", color: "var(--t3)", fontSize: 18, padding: "0 2px" }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="section-title">Detalhamento dos eventos</div>
        <div className="table-wrap"><div className="scroll">
          <table>
            <thead><tr><th>Evento fbq</th><th>Descrição</th><th>Página</th><th>Disparo</th><th>Parâmetros</th></tr></thead>
            <tbody>
              <tr style={{ cursor: "default" }}>
                <td><strong style={{ color: "var(--blue)" }}>PageView</strong></td>
                <td>Visita a qualquer página</td>
                <td style={{ color: "var(--t2)" }}>Todas</td>
                <td><span className="pill pill-gray">Auto</span></td>
                <td style={{ color: "var(--t3)" }}>—</td>
              </tr>
              <tr style={{ cursor: "default" }}>
                <td><strong style={{ color: "var(--orange)" }}>Lead</strong></td>
                <td>Usuário chegou na página de envio</td>
                <td style={{ color: "var(--t2)" }}>/envio</td>
                <td><span className="pill pill-blue">Custom</span></td>
                <td style={{ color: "var(--t3)", fontSize: 11 }}>content_name: plano</td>
              </tr>
              <tr style={{ cursor: "default" }}>
                <td><strong style={{ color: "var(--yellow)" }}>InitiateCheckout</strong></td>
                <td>Formulário enviado, indo para Kiwify</td>
                <td style={{ color: "var(--t2)" }}>/envio → Kiwify</td>
                <td><span className="pill pill-blue">Custom</span></td>
                <td style={{ color: "var(--t3)", fontSize: 11 }}>content_name, currency: BRL</td>
              </tr>
              <tr style={{ cursor: "default" }}>
                <td><strong style={{ color: "var(--green)" }}>Purchase</strong></td>
                <td>Compra confirmada pelo webhook</td>
                <td style={{ color: "var(--t2)" }}>/obrigado</td>
                <td><span className="pill pill-blue">Custom</span></td>
                <td style={{ color: "var(--t3)", fontSize: 11 }}>value, currency, content_name</td>
              </tr>
            </tbody>
          </table>
        </div></div>

        <div className="section-title" style={{ marginTop: 28 }}>Valores por plano</div>
        <div className="kpi-grid">
          <div className="kpi"><div className="label">RedUp (Purchase)</div><div className="value" style={{ color: "var(--green)" }}>R$ 97</div><div className="sub">value enviado ao pixel</div></div>
          <div className="kpi"><div className="label">RedMax (Purchase)</div><div className="value" style={{ color: "var(--green)" }}>R$ 297</div><div className="sub">value enviado ao pixel</div></div>
        </div>

        <div className="section-title">Acesso rápido</div>
        <div className="kpi-grid">
          <a href="https://business.facebook.com/events_manager/overview" target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: "none" }}>
            <div className="pc-head"><span className="pc-icon">📊</span><div><div className="pc-name">Gerenciador de Eventos</div><div className="pc-desc">Ver eventos recebidos pelo pixel</div></div></div>
            <div className="pc-enter">Abrir no Meta →</div>
          </a>
          <a href="https://business.facebook.com/events_manager/test_events" target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: "none" }}>
            <div className="pc-head"><span className="pc-icon">🧪</span><div><div className="pc-name">Testar eventos</div><div className="pc-desc">Validar disparos em tempo real</div></div></div>
            <div className="pc-enter">Abrir teste →</div>
          </a>
          <a href="https://www.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer" className="product-card" style={{ textDecoration: "none" }}>
            <div className="pc-head"><span className="pc-icon">📢</span><div><div className="pc-name">Gerenciador de Anúncios</div><div className="pc-desc">Criar campanhas usando os eventos</div></div></div>
            <div className="pc-enter">Abrir Ads Manager →</div>
          </a>
        </div>
      </>
    );
  };

  /* ─── Render: UTM Dashboard ─────────────────────────── */
  const renderUtms = () => {
    const utmSources: Record<string, { leads: number; vendas: number; receita: number }> = {};
    const utmMediums: Record<string, { leads: number; vendas: number; receita: number }> = {};
    const utmCampaigns: Record<string, { leads: number; vendas: number; receita: number }> = {};

    for (const s of sales) {
      const src = s.utm_source || "Direto";
      const med = s.utm_medium || "(nenhum)";
      const camp = s.utm_campaign || "(nenhuma)";
      if (!utmSources[src]) utmSources[src] = { leads: 0, vendas: 0, receita: 0 };
      if (!utmMediums[med]) utmMediums[med] = { leads: 0, vendas: 0, receita: 0 };
      if (!utmCampaigns[camp]) utmCampaigns[camp] = { leads: 0, vendas: 0, receita: 0 };
      utmSources[src].vendas++;
      utmMediums[med].vendas++;
      utmCampaigns[camp].vendas++;
      if (isPaid(s)) {
        const amt = Number(s.amount) || 0;
        utmSources[src].receita += amt;
        utmMediums[med].receita += amt;
        utmCampaigns[camp].receita += amt;
      }
    }

    // Count pre_checkouts as leads
    const totalLeads = preCheckouts.length;
    const convertedLeads = preCheckouts.filter(pc => pc.used).length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";
    const totalPaid = paidSales.length;

    const sortedSources = Object.entries(utmSources).sort((a, b) => b[1].receita - a[1].receita);
    const sortedMediums = Object.entries(utmMediums).sort((a, b) => b[1].receita - a[1].receita);
    const sortedCampaigns = Object.entries(utmCampaigns).sort((a, b) => b[1].receita - a[1].receita);
    const maxSourceR = Math.max(...sortedSources.map(([, d]) => d.receita), 1);
    const maxMediumR = Math.max(...sortedMediums.map(([, d]) => d.receita), 1);
    const colors = ["#DC2626", "#F97316", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B"];

    // Funnel data
    const funnelSteps = [
      { label: "Pré-checkouts", value: totalLeads, color: "var(--blue)", desc: "Preencheram /envio" },
      { label: "Convertidos", value: convertedLeads, color: "var(--orange)", desc: "Foram para Kiwify" },
      { label: "Vendas pagas", value: totalPaid, color: "var(--green)", desc: "Pagamento aprovado" },
    ];

    // Recent pre_checkouts not converted
    const abandoned = preCheckouts.filter(pc => !pc.used).slice(0, 10);

    return (
      <>
        <div className="page-head">
          <h2>🔗 UTMs & Funil</h2>
          <p>Rastreamento de origens, campanhas e conversão — dados reais do Supabase</p>
        </div>

        {/* Funnel KPIs */}
        <div className="kpi-grid">
          <div className="kpi"><div className="label">Pré-checkouts</div><div className="value">{totalLeads}</div><div className="sub">Preencheram /envio</div></div>
          <div className="kpi"><div className="label">Convertidos</div><div className="value">{convertedLeads}</div><div className="sub">Foram para Kiwify</div></div>
          <div className="kpi ok"><div className="label">Vendas pagas</div><div className="value">{totalPaid}</div><div className="sub">{BRL(receitaTotal)}</div></div>
          <div className={`kpi ${Number(conversionRate) > 0 ? "ok" : ""}`}><div className="label">Taxa de conversão</div><div className="value">{conversionRate}%</div><div className="sub">pré-checkout → venda</div></div>
        </div>

        {/* Visual Funnel */}
        <div className="section-title">Funil de conversão</div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, justifyContent: "center", height: 180 }}>
            {funnelSteps.map((step, i) => {
              const maxVal = Math.max(...funnelSteps.map(s => s.value), 1);
              const h = Math.max((step.value / maxVal) * 140, 20);
              return (
                <div key={step.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, maxWidth: 200 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: step.color, marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>{step.value}</div>
                  <div style={{ width: "100%", height: h, background: `color-mix(in srgb, ${step.color} 25%, transparent)`, border: `2px solid ${step.color}`, borderRadius: 8, transition: "height 0.5s" }} />
                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>{step.desc}</div>
                  {i < funnelSteps.length - 1 && i === 0 && totalLeads > 0 && (
                    <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>{((convertedLeads / totalLeads) * 100).toFixed(0)}% →</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* UTM Source */}
        <div className="section-title">Receita por Origem (utm_source)</div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          {sortedSources.map(([nome, d], i) => (
            <div className="bar-row" key={nome}>
              <span className="bar-label">{nome}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((d.receita / maxSourceR) * 100)}%`, background: colors[i % colors.length] }} /></div>
              <span className="bar-value">{BRL(d.receita)}</span>
            </div>
          ))}
          {sortedSources.length === 0 && <p style={{ color: "var(--t3)", fontSize: 13 }}>Nenhum dado de origem</p>}
        </div>

        <div className="grid-2">
          {/* Source table */}
          <div>
            <div className="section-title">Detalhamento por Source</div>
            <div className="table-wrap"><div className="scroll">
              <table>
                <thead><tr><th>Origem</th><th>Vendas</th><th>Receita</th></tr></thead>
                <tbody>
                  {sortedSources.map(([nome, d]) => (
                    <tr key={nome} style={{ cursor: "default" }}>
                      <td><strong>{nome}</strong></td>
                      <td>{d.vendas}</td>
                      <td><strong>{BRL(d.receita)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          </div>

          {/* Medium table */}
          <div>
            <div className="section-title">Por Medium (utm_medium)</div>
            <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: 20 }}>
              {sortedMediums.map(([nome, d], i) => (
                <div className="bar-row" key={nome}>
                  <span className="bar-label">{nome}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((d.receita / maxMediumR) * 100)}%`, background: colors[(i + 2) % colors.length] }} /></div>
                  <span className="bar-value">{BRL(d.receita)}</span>
                </div>
              ))}
              {sortedMediums.length === 0 && <p style={{ color: "var(--t3)", fontSize: 13 }}>—</p>}
            </div>
          </div>
        </div>

        {/* Campaigns */}
        <div className="section-title" style={{ marginTop: 24 }}>Por Campanha (utm_campaign)</div>
        <div className="table-wrap"><div className="scroll">
          <table>
            <thead><tr><th>Campanha</th><th>Vendas</th><th>Receita</th></tr></thead>
            <tbody>
              {sortedCampaigns.map(([nome, d]) => (
                <tr key={nome} style={{ cursor: "default" }}>
                  <td><strong>{nome}</strong></td>
                  <td>{d.vendas}</td>
                  <td><strong>{BRL(d.receita)}</strong></td>
                </tr>
              ))}
              {sortedCampaigns.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--t3)", padding: 20 }}>Nenhuma campanha registrada</td></tr>
              )}
            </tbody>
          </table>
        </div></div>

        {/* Abandoned pre-checkouts */}
        {abandoned.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 24 }}>Pré-checkouts não convertidos</div>
            <div className="table-wrap"><div className="scroll">
              <table>
                <thead><tr><th>Data</th><th>Nome</th><th>E-mail</th><th>Plano</th><th>Status</th></tr></thead>
                <tbody>
                  {abandoned.map((pc) => (
                    <tr key={pc.id} style={{ cursor: "default" }}>
                      <td>{fmtDate(pc.created_at)}</td>
                      <td><strong>{pc.customer_name || "—"}</strong></td>
                      <td style={{ color: "var(--t2)" }}>{pc.customer_email}</td>
                      <td>{planoPill(pc.plano)}</td>
                      <td><span className="pill pill-yellow">Abandonou</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          </>
        )}
      </>
    );
  };

  /* ─── Render: Implantação ──────────────────────────── */
  const renderImplantacao = () => {
    const implClients = productSales.filter((v) => {
      const plan = PLANS[v.plano];
      return plan?.implantacao && isPaid(v);
    });

    const parseImplData = (notas: string) => {
      try {
        const match = notas?.match(/\[IMPL:(.*?)\]/);
        if (match) return JSON.parse(match[1]) as { stage: string; cs: string; notes: string };
      } catch { /* ignore */ }
      return { stage: "boas_vindas", cs: "Não atribuído", notes: "" };
    };

    const updateImplData = async (venda: Venda, data: { stage: string; cs: string; notes: string }) => {
      const tag = `[IMPL:${JSON.stringify(data)}]`;
      const cleanNotas = (venda.notas || "").replace(/\[IMPL:.*?\]/, "").trim();
      const newNotas = cleanNotas ? `${cleanNotas} ${tag}` : tag;
      try {
        const res = await fetch("/api/vendas", {
          method: "PATCH",
          headers: opsHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ id: venda.id, notas: newNotas }),
        });
        if (res.ok) {
          setSales((prev) => prev.map((s) => s.id === venda.id ? { ...s, notas: newNotas } : s));
        }
      } catch { /* ignore */ }
    };

    const stageIndex = (stageId: string) => IMPL_STAGES.findIndex((s) => s.id === stageId);

    const statusCounts = { total: implClients.length, pending: 0, active: 0, done: 0 };
    implClients.forEach((v) => {
      const d = parseImplData(v.notas);
      const idx = stageIndex(d.stage);
      if (idx === 0 && d.cs === "Não atribuído") statusCounts.pending++;
      else if (idx >= IMPL_STAGES.length - 1) statusCounts.done++;
      else statusCounts.active++;
    });

    return (
      <>
        <div className="page-head">
          <h2>Implantação</h2>
          <p>Acompanhamento dos clientes RedMax e Revisão com implantação contratada</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi"><div className="label">Total</div><div className="value">{statusCounts.total}</div><div className="sub">clientes com implantação</div></div>
          <div className="kpi" style={{ borderColor: "var(--yellow)" }}><div className="label">Aguardando</div><div className="value" style={{ color: "var(--yellow)" }}>{statusCounts.pending}</div><div className="sub">sem CS atribuído</div></div>
          <div className="kpi" style={{ borderColor: "var(--blue)" }}><div className="label">Em andamento</div><div className="value" style={{ color: "var(--blue)" }}>{statusCounts.active}</div><div className="sub">implantação ativa</div></div>
          <div className="kpi ok"><div className="label">Concluídas</div><div className="value">{statusCounts.done}</div><div className="sub">acompanhamento final</div></div>
        </div>

        {implClients.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--t3)" }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>Nenhum cliente com implantação ainda</p>
            <p style={{ fontSize: 13 }}>Clientes RedMax e Revisão com pagamento aprovado aparecerão aqui</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {implClients.map((v) => {
              const d = parseImplData(v.notas);
              const currentIdx = stageIndex(d.stage);
              const plan = PLANS[v.plano];

              return (
                <div key={v.id} style={{
                  background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 12,
                  padding: 20, display: "flex", flexDirection: "column", gap: 16,
                }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>{v.customer_name}</div>
                      <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>{v.customer_email} · {v.customer_phone || "sem tel"}</div>
                      <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>Comprou em {fmtDate(v.created_at)} · {plan?.name || v.plano}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        value={d.cs}
                        onChange={(e) => updateImplData(v, { ...d, cs: e.target.value })}
                        style={{
                          background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: 6,
                          padding: "4px 8px", fontSize: 12, color: "var(--t1)", cursor: "pointer",
                        }}
                      >
                        {CS_TEAM.map((name) => (
                          <option key={name} value={name} style={{ background: "var(--s2)" }}>{name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Stage pipeline */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {IMPL_STAGES.map((stage, i) => {
                      const isActive = i === currentIdx;
                      const isDone = i < currentIdx;
                      const bg = isDone ? "color-mix(in srgb, var(--green) 20%, transparent)"
                        : isActive ? "color-mix(in srgb, var(--blue) 25%, transparent)"
                        : "var(--s2)";
                      const border = isDone ? "var(--green)" : isActive ? "var(--blue)" : "var(--b1)";
                      const color = isDone ? "var(--green)" : isActive ? "var(--blue)" : "var(--t3)";

                      return (
                        <button
                          key={stage.id}
                          onClick={() => updateImplData(v, { ...d, stage: stage.id })}
                          title={stage.desc}
                          style={{
                            flex: 1, minWidth: 80, padding: "8px 4px",
                            background: bg, border: `1px solid ${border}`, borderRadius: 8,
                            cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                          }}
                        >
                          <div style={{ fontSize: 16 }}>{stage.icon}</div>
                          <div style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color, marginTop: 2 }}>{stage.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const renderProductTab = () => {
    switch (productTab) {
      case "overview": return renderOverview();
      case "vendas": return renderVendas();
      case "envios": return renderEnvios();
      case "mkt": return renderMkt();
      case "implantacao": return renderImplantacao();
    }
  };

  /* ─── Sidebar ──────────────────────────────────────── */
  const renderSidebar = () => {
    if (view === "hub" || view === "ga4" || view === "meta-pixel" || view === "utms") {
      return (
        <nav>
          <a className={view === "hub" ? "active" : ""} onClick={goHub}><span className="icon">◉</span>Hub{enviosPendTotal > 0 && <span className="badge">{enviosPendTotal}</span>}</a>
          <div className="nav-section">Produtos</div>
          {PRODUCTS.filter((p) => p.active).map((p) => (
            <a key={p.id} onClick={() => goProduct(p.id)}><span className="icon">{p.icon}</span>{p.name}</a>
          ))}
          <div className="nav-section">Analytics</div>
          <a className={view === "ga4" ? "active" : ""} onClick={() => setView("ga4")}><span className="icon">📊</span>GA4</a>
          <a className={view === "meta-pixel" ? "active" : ""} onClick={() => setView("meta-pixel")}><span className="icon">📱</span>Meta Pixel</a>
          <a className={view === "utms" ? "active" : ""} onClick={() => setView("utms")}><span className="icon">🔗</span>UTMs</a>
        </nav>
      );
    }
    return (
      <nav>
        <a className="back" onClick={goHub}>← Hub</a>
        <div className="nav-section">{activeProd?.icon} {activeProd?.name}</div>
        {prodTabs.map((t) => (
          <a key={t.id} className={productTab === t.id ? "active" : ""} onClick={() => setProductTab(t.id)}>
            <span className="icon">{t.icon}</span>{t.label}
            {t.id === "envios" && prodEnviosPend > 0 && <span className="badge">{prodEnviosPend}</span>}
          </a>
        ))}
      </nav>
    );
  };

  if (locked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0000", padding: 24 }}>
        <form onSubmit={unlock} style={{ width: "100%", maxWidth: 360, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, textAlign: "center" }}>
          <div style={{ color: "#f5ede4", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Painel Operacional</div>
          <p style={{ color: "#8a7a6a", fontSize: 13, marginBottom: 20 }}>Acesso restrito. Informe a chave do painel.</p>
          <input
            type="password"
            autoFocus
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Chave de acesso"
            style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", padding: "12px 14px", color: "#f5ede4", fontSize: 14, outline: "none" }}
          />
          <button
            type="submit"
            disabled={!keyInput.trim() || loading}
            style={{ width: "100%", marginTop: 16, borderRadius: 999, border: "none", background: "#FF0025", color: "#fff", padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: !keyInput.trim() || loading ? 0.4 : 1 }}
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
          {toastMsg && <p style={{ color: "#ff7c7c", fontSize: 12, marginTop: 12 }}>{toastMsg}</p>}
        </form>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="rp-wrap">
        <aside className="sidebar">
          <div className="logo"><h1><em>RED</em>RIVE</h1><p>Painel Operacional</p></div>
          {renderSidebar()}
          <div className="user"><div className="name">Maicon</div><div className="role">Administrador</div></div>
        </aside>

        <main className="content">
          {view === "hub" ? renderHub()
           : view === "ga4" ? renderGA4()
           : view === "meta-pixel" ? renderMetaPixel()
           : view === "utms" ? renderUtms()
           : (
            <>
              <div className="breadcrumb">
                <a onClick={goHub}>Hub</a> / <span>{activeProd?.icon} {activeProd?.name}</span>
              </div>
              {renderProductTab()}
            </>
          )}
        </main>

        {selectedVenda && <DetailModal venda={selectedVenda} onClose={() => setSelectedVenda(null)} onSave={handleSave} />}
        {labelVenda && <LabelModal venda={labelVenda} onClose={() => setLabelVenda(null)} />}
        {toastMsg && <div className="toast">{toastMsg}</div>}
      </div>
    </>
  );
}
