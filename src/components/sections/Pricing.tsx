"use client";

import { useState } from "react";
import Image from "next/image";
import { PLANS, formatBRL, installmentCents, cashPriceCents, type Plan } from "@/lib/plans";
import { getCheckoutUrl } from "@/lib/checkout";
import {
  GLANCYR_MEDIUM_EXPANDED,
  GLANCYR_LIGHT_CONDENSED,
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_REGULAR,
} from "@/lib/typography";

const REDUP_LEFT = [
  "12 meses de Redrive Enterprise inclusos",
  "Método Redrive — 8 aulas com o Daniel",
  "+ de 3h de conteúdo estratégico",
  "Aulas extras com Daniel Reginatto*",
];

const REDUP_RIGHT = [
  "Livro Magia da Conversa (impresso e e-book)",
  "Livro Chat First (impresso e e-book)",
  "Atualizações no método inclusas",
  "Acesso vitalício ao método",
];

const REDMAX_LEFT = [
  "12 meses de Redrive Enterprise inclusos",
  "Tudo do RedUp Full incluso",
  "Implantação técnica da Redrive",
  "Configuração dos fluxos e jornadas",
];

const REDMAX_RIGHT = [
  "Agentes de IA configurados para vender",
  "Treinamento operacional da equipe",
  "Aulas extras com Daniel Reginatto*",
  "Acesso vitalício ao método",
];

function PriceBlock({ reais, centavos, color }: { reais: string; centavos: string; color: string }) {
  return (
    <div className="flex" style={{ color }}>
      <span className="font-display self-start" style={{ fontSize: 35, lineHeight: 1, marginRight: 5, ...GLANCYR_LIGHT_CONDENSED }}>
        R$
      </span>
      <span className="font-display" style={{ fontSize: 97, lineHeight: 1, ...GLANCYR_BOLD_CONDENSED }}>
        {reais}
      </span>
      <span className="font-display self-end" style={{ fontSize: 35, lineHeight: 1, marginBottom: 20, ...GLANCYR_LIGHT_CONDENSED }}>
        ,{centavos}
      </span>
    </div>
  );
}

function PriceTerms({ plan }: { plan: Plan }) {
  const inst = formatBRL(installmentCents(plan));
  const cash = formatBRL(cashPriceCents(plan));
  return (
    <>
      <li>
        • {plan.installments}x de R$ {inst.reais},{inst.centavos} sem juros
      </li>
      <li>
        • À vista R$ {cash.reais},{cash.centavos} ({plan.cashDiscountPct}% de desconto)
      </li>
      <li>• Acesso imediato ao método após o pagamento</li>
    </>
  );
}

function FeatureList({ items, color, lastItalic, separatorColor }: { items: string[]; color: string; lastItalic?: string; separatorColor?: string }) {
  return (
    <div style={{ color }}>
      {items.map((f, i) => (
        <div key={i}>
          {i > 0 && <div style={{ height: 1, backgroundColor: separatorColor || "currentColor", opacity: 0.3 }} />}
          <p className="text-sm" style={{ lineHeight: "32px" }}>
            ✓ {f}
          </p>
        </div>
      ))}
      {lastItalic && (
        <>
          <div style={{ height: 1, backgroundColor: separatorColor || "currentColor", opacity: 0.3 }} />
          <p className="text-sm font-semibold italic" style={{ lineHeight: "32px", color }}>
            {lastItalic}
          </p>
        </>
      )}
    </div>
  );
}

function RevisaoFeatureList() {
  const items = [
    "Revisar a estrutura da operação e identificar gargalos",
    "Ativar funcionalidades que estão disponíveis mas não são usadas",
    "Corrigir configurações que limitam o desempenho",
    "Ajustar ou criar fluxos, jornadas e agentes de IA",
    "Trazer insights com base no que os dados da sua conta mostram",
    "Treinar a equipe nas práticas que realmente mudam resultado",
  ];
  return (
    <div className="text-sm text-bege-texto">
      {items.map((item, i) => (
        <div key={i}>
          {i > 0 && <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />}
          <p style={{ lineHeight: "28px", fontSize: 12 }} className="lg:text-sm">{`✓ ${item}`}</p>
        </div>
      ))}
    </div>
  );
}

function RedMaxRevisaoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[10px]" />
      <div
        className="relative z-10 w-full overflow-hidden rounded-[30px] border border-vermelho-redrive lg:rounded-[82px]"
        style={{ maxWidth: 1345, background: "#FF0025", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky right-0 top-4 z-20 ml-auto mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-2xl text-white hover:bg-black/50 lg:mr-8 lg:top-6"
        >
          ×
        </button>
        <div className="grid p-6 lg:grid-cols-[1fr_300px] lg:p-[40px_50px]">
          {/* Left column: title + content + price */}
          <div>
            <h3
              className="font-display text-creme-destaque"
              style={{ fontSize: "clamp(40px, 10vw, 90px)", lineHeight: 1, ...GLANCYR_LIGHT_CONDENSED }}
            >
              RedMax Revisão
            </h3>

            {/* Content + Price aligned by top of <p> */}
            <div className="mt-2 flex flex-col items-start lg:flex-row" style={{ gap: "clamp(20px, 5vw, 60px)" }}>
              {/* Left: text + checklist */}
              <div>
                <p className="font-display text-base text-creme-destaque" style={{ ...GLANCYR_REGULAR }}>
                  Para quem já usa a Redrive há 6 meses ou mais.*
                </p>

                <div className="mt-6 space-y-3 text-sm leading-[20px] text-white lg:text-base" style={{ maxWidth: 454 }}>
                  <p>
                    Você já tem a plataforma. Já passou pela curva de aprendizado. Mas toda operação que roda por meses acumula configurações que ficaram pela metade, funcionalidades que nunca foram ativadas e hábitos que limitam o resultado.
                  </p>
                  <p>O RedMax Revisão é a implantação para quem não está começando do zero — está evoluindo.</p>
                  <p>Nosso time mergulha na sua operação atual e trabalha junto com você para:</p>
                </div>

                {/* Items included + Revisão — two columns on mobile */}
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-0 lg:grid-cols-1 lg:gap-y-0" style={{ maxWidth: 600 }}>
                  <div>
                    <p className="font-display text-sm font-semibold text-creme-destaque" style={{ ...GLANCYR_REGULAR }}>
                      O que está incluso:
                    </p>
                    <div className="mt-2 text-sm text-bege-texto">
                      {[
                        "Método Redrive — 8 aulas com o Daniel",
                        "+ de 3h de conteúdo estratégico",
                        "Atualizações no método inclusas",
                        "Aulas extras com Daniel Reginatto*",
                        "Livro Magia da Conversa (digital)",
                        "Livro Chat First (digital)",
                        "Acesso vitalício",
                        "Implantação no formato Revisão",
                        "Treinamento operacional da equipe",
                      ].map((item, i) => (
                        <div key={i}>
                          {i > 0 && <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />}
                          <p style={{ lineHeight: "28px", fontSize: 12 }} className="lg:text-sm" >{`✓ ${item}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-creme-destaque" style={{ ...GLANCYR_REGULAR }}>
                      O que a Revisão cobre:
                    </p>
                    <div className="mt-2">
                      <RevisaoFeatureList />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: price + button + disclaimer — desktop only */}
              <div className="hidden shrink-0 lg:block" style={{ marginLeft: 100 }}>
                <PriceBlock reais="999" centavos="00" color="#ffedcd" />
                <ul className="mt-2 space-y-0.5 text-xs text-bege-texto">
                  <li>• À vista 10% de desconto</li>
                  <li>• Em até 3x sem juros no cartão</li>
                  <li>• Acesso imediato após o pagamento</li>
                </ul>

                <div style={{ marginTop: 30 }}>
                  <a
                    href="#contato"
                    className="btn-lp flex w-[251px] items-center justify-center gap-3 rounded-[19px] bg-[#201b1b] font-display text-white"
                    style={{ height: 50, fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}
                  >
                    Quero saber mais
                    <span className="text-lg">→</span>
                  </a>
                  <p className="mt-3 max-w-[247px] text-xs leading-[18px] text-creme-destaque">
                    *Modalidade disponível para clientes com 6 meses ou mais de plataforma ativa, validação via login Redrive.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile: price + button */}
            <div className="mt-8 flex flex-col items-center lg:hidden">
              <PriceBlock reais="999" centavos="00" color="#ffedcd" />
              <ul className="mt-2 space-y-0.5 text-center text-xs text-bege-texto">
                <li>• À vista 10% de desconto</li>
                <li>• Em até 3x sem juros no cartão</li>
                <li>• Acesso imediato após o pagamento</li>
              </ul>
              <a
                href="#contato"
                className="btn-lp mt-6 flex w-full max-w-[260px] items-center justify-center gap-3 rounded-[19px] bg-[#201b1b] font-display text-white"
                style={{ height: 50, fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}
              >
                Quero saber mais
                <span className="text-lg">→</span>
              </a>
              <p className="mt-3 text-center text-xs leading-[18px] text-creme-destaque">
                *Modalidade disponível para clientes com 6 meses ou mais de plataforma ativa, validação via login Redrive.
              </p>
            </div>
          </div>

          {/* Right column: photo — centered horizontally on mobile, right-aligned on desktop */}
          <div className="flex items-center justify-center lg:justify-end">
            <Image
              src="/images/redmax-revisao-photo.jpg"
              alt="RedMax Revisão"
              width={299}
              height={506}
              className="object-cover w-[200px] h-[340px] lg:w-[299px] lg:h-[506px]"
              style={{ borderRadius: 60 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Pricing() {
  const [showRevisao, setShowRevisao] = useState(false);
  const _showRevisaoHidden = false; // toggle to re-enable RedMax Revisão
  // Combos são a oferta principal na LP /full (RedUp Full / RedMax Full).
  const redup = PLANS["redup-full"];
  const redmax = PLANS["redmax-full"];
  const priceRedup = formatBRL(redup.priceCents);
  const priceRedmax = formatBRL(redmax.priceCents);

  return (
    <section id="planos" className="relative px-6 py-28 lg:px-16 lg:py-36">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <p
          className="flex items-center gap-2 text-white"
          style={{ fontSize: 16, lineHeight: "24px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />
          Escolha o seu nível
        </p>

        <div className="grid gap-10 lg:grid-cols-[1fr_416px]" style={{ marginTop: 16 }}>
          <h2
            className="font-display leading-[1.05]"
            style={{ fontSize: 44, ...GLANCYR_MEDIUM_EXPANDED }}
          >
            <span className="text-[#ff7c7c]">RedUp Full</span>{" "}
            <span className="text-white">ou </span>
            <span className="text-vermelho-redrive">
              RedMax Full.
              <br />
            </span>
            <span className="text-white">Método e operação com IA, do dia um.</span>
          </h2>
          <p className="self-end text-base leading-relaxed text-camurca-texto" style={{ maxWidth: 416 }}>
            Dois combos para operar a Redrive por um ano inteiro.
            <br />
            Um te dá o método e a operação com IA.
            <br />
            O outro soma a implantação feita com você.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 space-y-8 lg:-mx-10">
          {/* ── RedUp ── */}
          <div
            className="overflow-hidden rounded-[40px] border border-vermelho-redrive lg:rounded-[82px]"
            style={{ background: "rgba(255,124,124,0.78)" }}
          >
            {/* Desktop layout */}
            <div className="hidden lg:grid lg:grid-cols-[260px_1fr_1fr_320px]">
              <div className="flex items-center" style={{ paddingLeft: 40 }}>
                <Image src="/images/pricing-photo-redup2.png" alt="" width={170} height={370} className="object-cover" style={{ borderRadius: 60, width: 170, height: 370 }} />
              </div>
              <div className="py-10 pl-0 pr-6">
                <h3 className="font-display text-bege-texto" style={{ fontSize: 97, lineHeight: 1.05, ...GLANCYR_LIGHT_CONDENSED }}>RedUp Full</h3>
                <div className="mt-6 pt-4"><FeatureList items={REDUP_LEFT} color="var(--mogno)" /></div>
                <p className="mt-2 text-xs text-mogno" style={{ lineHeight: "20px" }}>*Aulas extras sem data ou quantidade fixa. Serão feitas conforme surgirem conteúdos relevantes.</p>
              </div>
              <div className="px-6 py-10">
                <p className="font-display text-bege-texto" style={{ fontSize: 16, lineHeight: "24px", ...GLANCYR_REGULAR }}>{redup.tagline}</p>
                <div className="mt-6 pt-4"><FeatureList items={REDUP_RIGHT} color="var(--mogno)" lastItalic="– Implantação não inclusa" /></div>
              </div>
              <div className="flex flex-col items-end px-10 py-10">
                <PriceBlock reais={priceRedup.reais} centavos={priceRedup.centavos} color="var(--bege-texto)" />
                <ul className="mt-2 self-end space-y-0.5 text-xs text-mogno" style={{ paddingRight: 68 }}><PriceTerms plan={redup} /></ul>
                <a href={getCheckoutUrl(redup.slug)} target="_blank" rel="noopener noreferrer" className="btn-lp mt-6 flex w-[284px] items-center justify-center gap-3 rounded-[19px] bg-vermelho-redrive font-display text-white" style={{ height: 50, fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}>{redup.ctaLabel} <span className="text-lg">→</span></a>
                <p className="mt-2 self-end text-[10px] text-mogno" style={{ paddingRight: 68 }}>✓ {redup.guaranteeDays} dias de garantia · Sem burocracia</p>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="flex flex-col items-center px-6 py-10 text-center lg:hidden">
              <h3 className="font-display text-bege-texto" style={{ fontSize: 60, lineHeight: 1.05, ...GLANCYR_LIGHT_CONDENSED }}>RedUp Full</h3>
              <p className="mt-3 font-display text-bege-texto" style={{ fontSize: 15, lineHeight: "22px", ...GLANCYR_REGULAR }}>{redup.tagline}</p>
              <div className="mt-6 w-full text-left"><FeatureList items={[...REDUP_LEFT, ...REDUP_RIGHT]} color="var(--mogno)" lastItalic="– Implantação não inclusa" /></div>
              <p className="mt-2 text-xs text-mogno" style={{ lineHeight: "20px" }}>*Aulas extras sem data ou quantidade fixa.</p>
              <div className="mt-6 flex justify-center"><PriceBlock reais={priceRedup.reais} centavos={priceRedup.centavos} color="var(--bege-texto)" /></div>
              <ul className="mt-2 space-y-0.5 text-xs text-mogno"><PriceTerms plan={redup} /></ul>
              <a href={getCheckoutUrl(redup.slug)} target="_blank" rel="noopener noreferrer" className="btn-lp mt-6 flex w-full max-w-[284px] items-center justify-center gap-3 rounded-[19px] bg-vermelho-redrive font-display text-white" style={{ height: 50, fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}>{redup.ctaLabel} <span className="text-lg">→</span></a>
              <p className="mt-2 text-[10px] text-mogno">✓ {redup.guaranteeDays} dias de garantia · Sem burocracia</p>
            </div>
          </div>

          {/* ── RedMax ── */}
          <div
            className="overflow-hidden rounded-[40px] border border-vermelho-redrive lg:rounded-[82px]"
            style={{ background: "rgba(255,0,0,0.78)" }}
          >
            {/* Desktop layout */}
            <div className="hidden lg:grid lg:grid-cols-[260px_1fr_1fr_320px]">
              <div className="flex items-center" style={{ paddingLeft: 40 }}>
                <Image src="/images/pricing-photo-redmax2.png" alt="" width={170} height={370} className="object-cover" style={{ borderRadius: 60, width: 170, height: 370 }} />
              </div>
              <div className="py-10 pl-0 pr-6">
                <h3 className="font-display text-creme-destaque" style={{ fontSize: 97, lineHeight: 1.05, ...GLANCYR_LIGHT_CONDENSED }}>RedMax Full</h3>
                <div className="mt-6 pt-4"><FeatureList items={REDMAX_LEFT} color="var(--bege-texto)" /></div>
                <p className="mt-2 text-xs text-bege-texto" style={{ lineHeight: "20px" }}>*Aulas extras sem data ou quantidade fixa. Serão feitas conforme surgirem conteúdos relevantes.</p>
              </div>
              <div className="px-6 py-10">
                <p className="font-display text-creme-destaque" style={{ fontSize: 16, lineHeight: "24px", ...GLANCYR_REGULAR }}>{redmax.tagline}</p>
                <div className="mt-6 pt-4"><FeatureList items={REDMAX_RIGHT} color="var(--bege-texto)" /></div>
              </div>
              <div className="flex flex-col items-end px-10 py-10">
                <PriceBlock reais={priceRedmax.reais} centavos={priceRedmax.centavos} color="#ffedcd" />
                <ul className="mt-2 self-end space-y-0.5 text-xs text-bege-texto" style={{ paddingRight: 68 }}><PriceTerms plan={redmax} /></ul>
                <a href={getCheckoutUrl(redmax.slug)} target="_blank" rel="noopener noreferrer" className="btn-lp mt-6 flex w-[284px] items-center justify-center gap-3 rounded-[19px] bg-[#201b1b] font-display text-white" style={{ height: 50, fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}>{redmax.ctaLabel} <span className="text-lg">→</span></a>
                <p className="mt-2 self-end text-[10px] text-bege-texto" style={{ paddingRight: 68 }}>Nosso time entra em contato para alinhar</p>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="flex flex-col items-center px-6 py-10 text-center lg:hidden">
              <h3 className="font-display text-creme-destaque" style={{ fontSize: 60, lineHeight: 1.05, ...GLANCYR_LIGHT_CONDENSED }}>RedMax Full</h3>
              <p className="mt-3 font-display text-creme-destaque" style={{ fontSize: 15, lineHeight: "22px", ...GLANCYR_REGULAR }}>{redmax.tagline}</p>
              <div className="mt-6 w-full text-left"><FeatureList items={[...REDMAX_LEFT, ...REDMAX_RIGHT]} color="var(--bege-texto)" /></div>
              <p className="mt-2 text-xs text-bege-texto" style={{ lineHeight: "20px" }}>*Aulas extras sem data ou quantidade fixa.</p>
              <div className="mt-6 flex justify-center"><PriceBlock reais={priceRedmax.reais} centavos={priceRedmax.centavos} color="#ffedcd" /></div>
              <ul className="mt-2 space-y-0.5 text-xs text-bege-texto"><PriceTerms plan={redmax} /></ul>
              <a href={getCheckoutUrl(redmax.slug)} target="_blank" rel="noopener noreferrer" className="btn-lp mt-6 flex w-full max-w-[284px] items-center justify-center gap-3 rounded-[19px] bg-[#201b1b] font-display text-white" style={{ height: 50, fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}>{redmax.ctaLabel} <span className="text-lg">→</span></a>
              <p className="mt-2 text-[10px] text-bege-texto">Nosso time entra em contato para alinhar</p>
            </div>
          </div>

          {/* ── Bottom bar — existing subscribers (RedMax Revisão - temporarily hidden) ── */}
          {_showRevisaoHidden && (
          <div
            className="flex flex-wrap items-center gap-6 rounded-[42px] border border-creme-destaque px-6 py-6 lg:flex-nowrap lg:px-10 lg:py-0"
            style={{ background: "rgba(255,0,0,0.78)", minHeight: 101 }}
          >
            <p
              className="shrink-0 font-display text-creme-destaque"
              style={{ fontSize: 30, lineHeight: 1, ...GLANCYR_LIGHT_CONDENSED, maxWidth: 225 }}
            >
              Assina a Redrive a mais de 6 meses?
            </p>

            <p className="flex-1 text-sm text-creme-destaque" style={{ lineHeight: "normal" }}>
              <strong className="font-semibold text-bege-texto">
                A implantação ainda funciona para você
              </strong>{" "}
              — no formato Revisão, com foco em evoluir o que já existe, ativar o que ficou para
              trás e trazer insights para potencializar seus resultados.
            </p>

            <button
              onClick={() => setShowRevisao(true)}
              className="btn-lp shrink-0 cursor-pointer rounded-[10px] bg-creme-destaque px-5 font-display text-vermelho-redrive"
              style={{ height: 32, lineHeight: "32px", fontSize: 12, ...GLANCYR_MEDIUM_EXPANDED }}
            >
              Acesse condições especiais →
            </button>
          </div>
          )}
        </div>
      </div>

      {_showRevisaoHidden && <RedMaxRevisaoModal open={showRevisao} onClose={() => setShowRevisao(false)} />}
    </section>
  );
}
