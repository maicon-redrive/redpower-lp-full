"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { GLANCYR_BOLD_EXPANDED, GLANCYR_REGULAR, GLANCYR_THIN_CONDENSED_OBLIQUE } from "@/lib/typography";

declare global { interface Window { fbq?: (...args: unknown[]) => void; gtag?: (...args: unknown[]) => void } }

// TODO: substituir os placeholders "#" pelas URLs do novo provedor de pagamento
// (RedPower Full — pagamento em 12x, ou à vista com 10% de desconto).
const CHECKOUT_URLS: Record<string, string> = {
  redup: "https://pay.kiwify.com.br/UaDtSGp",
  redmax: "https://pay.kiwify.com.br/yNBDdF6",
  "redup-full": "#",
  "redmax-full": "#",
};

const PLAN_NAMES: Record<string, string> = {
  redup: "RedUp",
  redmax: "RedMax",
  "redup-full": "RedUp Full",
  "redmax-full": "RedMax Full",
};

const UF_OPTIONS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA",
  "PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

function EnvioContent() {
  const params = useSearchParams();
  const plano = params.get("plano") || "redup";
  const planName = PLAN_NAMES[plano] || "RedUp";
  const checkoutUrl = CHECKOUT_URLS[plano] || CHECKOUT_URLS.redup;

  const [form, setForm] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    address_zip: "", address_street: "", address_number: "",
    address_complement: "", address_neighborhood: "", address_city: "",
    address_state: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.fbq?.("track", "Lead", { content_name: planName });
    window.gtag?.("event", "generate_lead", { event_category: "funnel", event_label: planName });
  }, [planName]);
  const [error, setError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const lookupCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((p) => ({
          ...p,
          address_street: data.logradouro || p.address_street,
          address_neighborhood: data.bairro || p.address_neighborhood,
          address_city: data.localidade || p.address_city,
          address_state: data.uf || p.address_state,
        }));
      }
    } catch { /* ignore */ }
    finally { setCepLoading(false); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pre-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plano }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao salvar"); setLoading(false); return; }

      window.fbq?.("track", "InitiateCheckout", { content_name: planName, currency: "BRL" });
      window.gtag?.("event", "begin_checkout", { event_category: "funnel", event_label: planName, currency: "BRL" });
      const sep = checkoutUrl.includes("?") ? "&" : "?";
      window.location.href = `${checkoutUrl}${sep}utm_source=site&utm_medium=envio&utm_content=${data.ref_id}`;
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  const filled = form.customer_name && form.customer_email && form.address_street && form.address_city && form.address_state && form.address_zip;

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#0a0000] px-4 py-12 sm:py-20">
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(220,38,38,0.12), transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-[520px]">
        <div className="mb-6 text-center">
          <Image src="/images/redpower-by-redrive.svg" alt="RedPower by Redrive" width={200} height={18} className="mx-auto mb-6" />
          <h1 className="text-2xl text-[#f5ede4] sm:text-3xl" style={GLANCYR_BOLD_EXPANDED}>
            Dados de envio
          </h1>
          <p className="mt-2 text-sm text-[#8a7a6a]" style={GLANCYR_THIN_CONDENSED_OBLIQUE}>
            Preencha seus dados para recebermos seu endereço de entrega dos livros do <span className="text-[#f5ede4]">{planName}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-[#c4b5a3]">Seus dados</h2>

          <div>
            <label className="mb-1 block text-xs text-[#8a7a6a]">Nome completo *</label>
            <input type="text" required value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" placeholder="Seu nome" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#8a7a6a]">E-mail *</label>
              <input type="email" required value={form.customer_email} onChange={(e) => set("customer_email", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8a7a6a]">WhatsApp</label>
              <input type="tel" value={form.customer_phone} onChange={(e) => set("customer_phone", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" placeholder="(11) 99999-9999" />
            </div>
          </div>

          <hr className="border-white/5" />
          <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-[#c4b5a3]">Endereço de entrega</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#8a7a6a]">CEP *</label>
              <input type="text" required maxLength={9} value={form.address_zip}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                  const formatted = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
                  set("address_zip", formatted);
                  if (v.length === 8) lookupCep(v);
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" placeholder="00000-000" />
              {cepLoading && <span className="mt-1 block text-xs text-red-400">Buscando CEP...</span>}
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8a7a6a]">Estado *</label>
              <select required value={form.address_state} onChange={(e) => set("address_state", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30">
                <option value="" className="bg-[#1a1a1a]">UF</option>
                {UF_OPTIONS.map((uf) => <option key={uf} value={uf} className="bg-[#1a1a1a]">{uf}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#8a7a6a]">Cidade *</label>
            <input type="text" required value={form.address_city} onChange={(e) => set("address_city", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" placeholder="Cidade" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_100px]">
            <div>
              <label className="mb-1 block text-xs text-[#8a7a6a]">Rua / Avenida *</label>
              <input type="text" required value={form.address_street} onChange={(e) => set("address_street", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" placeholder="Rua Exemplo" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8a7a6a]">Número *</label>
              <input type="text" required value={form.address_number} onChange={(e) => set("address_number", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" placeholder="123" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#8a7a6a]">Complemento</label>
              <input type="text" value={form.address_complement} onChange={(e) => set("address_complement", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" placeholder="Apto, Bloco..." />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#8a7a6a]">Bairro</label>
              <input type="text" value={form.address_neighborhood} onChange={(e) => set("address_neighborhood", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f5ede4] outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" placeholder="Bairro" />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={!filled || loading}
            className="w-full rounded-full bg-vermelho-redrive px-8 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={GLANCYR_BOLD_EXPANDED}>
            {loading ? "Salvando..." : `Ir para o checkout ${planName}`}
          </button>

          <p className="text-center text-[10px] text-[#5a4a3a]" style={GLANCYR_REGULAR}>
            Seus dados são usados apenas para envio dos livros. Após preencher, você será redirecionado para o checkout seguro.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function EnvioPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0a0000]" />}>
      <EnvioContent />
    </Suspense>
  );
}
