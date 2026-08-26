"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import Image from "next/image";
import { GLANCYR_BOLD_EXPANDED, GLANCYR_REGULAR, GLANCYR_THIN_CONDENSED_OBLIQUE } from "@/lib/typography";

declare global { interface Window { fbq?: (...args: unknown[]) => void; gtag?: (...args: unknown[]) => void } }

const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=5541992215850&text=Oi!%20Quero%20suporte%20da%20Redrive";

const PLAN_VALUES: Record<string, number> = { redup: 97, redmax: 297 };

function ObrigadoContent() {
  const params = useSearchParams();
  const plan = params.get("plano") || "redup";
  const nome = params.get("nome");
  const isRedMax = plan === "redmax";
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const value = PLAN_VALUES[plan] || 97;
    const label = isRedMax ? "RedMax" : "RedUp";
    window.fbq?.("track", "Purchase", { value, currency: "BRL", content_name: label });
    window.gtag?.("event", "purchase", { event_category: "funnel", event_label: label, value, currency: "BRL" });
  }, [plan, isRedMax]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0000] px-6 py-20 text-center">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(220,38,38,0.15), transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[600px]">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/images/redpower-by-redrive.svg"
            alt="RedPower by Redrive"
            width={260}
            height={22}
            className="mx-auto"
          />
        </div>

        {/* Check icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#166534] shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Heading */}
        <h1
          className="mb-4 text-4xl text-[#f5ede4] md:text-5xl"
          style={GLANCYR_BOLD_EXPANDED}
        >
          Parabéns{nome ? `, ${nome}` : ""}!
        </h1>

        <p className="mb-2 text-lg text-[#c4b5a3]" style={GLANCYR_REGULAR}>
          Sua compra do <span className="font-bold text-[#f5ede4]">{isRedMax ? "RedMax" : "RedUp"}</span> foi confirmada.
        </p>

        <p className="mb-12 text-sm text-[#8a7a6a]" style={GLANCYR_THIN_CONDENSED_OBLIQUE}>
          Você vai receber um e-mail com todos os detalhes de acesso.
        </p>

        {/* Steps */}
        <div className="mb-12 space-y-4 text-left">
          <Step n={1} title="Acesse seu e-mail" desc="Procure o e-mail da Kiwify com os dados de acesso à área de membros." />
          <Step n={2} title="Entre na área de membros" desc="Use o link do e-mail para acessar o Método Redrive — 8 aulas com o Daniel." />
          <Step n={3} title="Seus livros estão a caminho" desc="O Magia da Conversa e o Chat First serão enviados para o endereço cadastrado. Você receberá o código de rastreamento por e-mail." />
          {isRedMax && (
            <Step n={4} title="Implantação começa em breve" desc="Nosso time entrará em contato em até 48h para o meet de boas-vindas e início da implantação." highlight />
          )}
        </div>

        {/* CTA */}
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-vermelho-redrive px-8 py-3 text-sm text-white transition-opacity hover:opacity-90"
          style={GLANCYR_BOLD_EXPANDED}
        >
          Voltar ao site
        </a>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs text-[#5a4a3a]">
            Dúvidas? Fale com a gente pelo WhatsApp ou responda o e-mail de confirmação.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, desc, highlight }: { n: number; title: string; desc: string; highlight?: boolean }) {
  return (
    <div className={`flex gap-4 rounded-2xl border p-4 ${highlight ? "border-vermelho-redrive/30 bg-vermelho-redrive/5" : "border-white/5 bg-white/[0.03]"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${highlight ? "bg-vermelho-redrive text-white" : "bg-white/10 text-[#c4b5a3]"}`}
      >
        {n}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#f5ede4]" style={GLANCYR_REGULAR}>{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[#8a7a6a]">{desc}</p>
      </div>
    </div>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0a0000]" />}>
      <ObrigadoContent />
    </Suspense>
  );
}
