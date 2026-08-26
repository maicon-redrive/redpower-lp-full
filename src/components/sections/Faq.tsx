"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/plans";
import {
  GLANCYR_MEDIUM_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_LIGHT_CONDENSED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_REGULAR,
} from "@/lib/typography";

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

function ImplantacaoUpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[10px]" />
      <div
        className="relative z-10 w-full overflow-hidden rounded-[30px] border border-vermelho-redrive lg:rounded-[82px]"
        style={{ maxWidth: 800, background: "#FF0025", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky right-0 top-4 z-20 ml-auto mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-2xl text-white hover:bg-black/50 lg:mr-8 lg:top-6"
        >
          ×
        </button>
        <div className="p-6 lg:p-[40px_50px]">
          <h3
            className="font-display text-creme-destaque"
            style={{ fontSize: "clamp(32px, 8vw, 60px)", lineHeight: 1, ...GLANCYR_LIGHT_CONDENSED }}
          >
            Adicionar Implantação
          </h3>

          <p className="mt-4 font-display text-base text-creme-destaque" style={{ ...GLANCYR_REGULAR }}>
            Exclusivo para quem já é RedUp
          </p>

          <div className="mt-6 space-y-3 text-sm leading-[20px] text-white lg:text-base" style={{ maxWidth: 600 }}>
            <p>
              A Implantação é o item que transforma conhecimento em resultado. Com ela, nosso time de especialistas
              configura a Redrive junto com você — do zero ou ajustando o que já existe — para que cada funcionalidade
              opere no máximo potencial desde o primeiro dia.
            </p>
            <p>
              Sem a implantação, você aprende o método mas precisa aplicar sozinho. Com ela, você tem o time Redrive
              ao lado, garantindo que nada fique pela metade: fluxos de captação, jornadas de ativação, agentes de IA,
              CRM estruturado e equipe treinada.
            </p>
            <p className="font-semibold">
              É o atalho entre ter a Redrive e ter a máquina funcionando de verdade.
            </p>
          </div>

          <div className="mt-6 text-sm text-bege-texto">
            {[
              "Implantação técnica da Redrive",
              "Configuração de fluxos e jornadas",
              "Agentes de IA configurados para vender",
              "Treinamento operacional da equipe",
              "CRM e pipeline estruturados",
            ].map((item, i) => (
              <div key={i}>
                {i > 0 && <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />}
                <p style={{ lineHeight: "32px" }}>✓ {item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center">
            <PriceBlock reais="999" centavos="00" color="#ffedcd" />
            <ul className="mt-2 space-y-0.5 text-center text-xs text-bege-texto">
              <li>• À vista 10% de desconto</li>
              <li>• Em até 3x sem juros no cartão</li>
              <li>• Acesso imediato após o pagamento</li>
            </ul>
            <a
              href="#contato"
              className="btn-lp mt-6 flex w-full max-w-[284px] items-center justify-center gap-3 rounded-[19px] bg-[#201b1b] font-display text-white"
              style={{ height: 50, fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}
            >
              Quero a Implantação
              <span className="text-lg">→</span>
            </a>
            <p className="mt-3 text-center text-xs leading-[18px] text-creme-destaque">
              Nosso time entra em contato para alinhar os detalhes e dar início à implantação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnswerText({ text, onCtaClick }: { text: string; onCtaClick: () => void }) {
  if (!text.includes("{{CTA_IMPLANTACAO}}")) {
    return <>{text}</>;
  }
  const parts = text.split("{{CTA_IMPLANTACAO}}");
  return (
    <>
      {parts[0]}
      <button
        type="button"
        onClick={onCtaClick}
        className="cursor-pointer font-semibold text-vermelho-redrive underline underline-offset-2 hover:brightness-125"
      >
        Clique aqui
      </button>
      {parts[1]}
    </>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showImplModal, setShowImplModal] = useState(false);

  return (
    <section className="relative px-6 py-28 lg:px-16 lg:py-36">
      <div className="relative mx-auto max-w-5xl">
        {/* Red gradient top border — wider than grid */}
        <div
          className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-t-[40px]"
          style={{ height: 178, background: "linear-gradient(180deg, rgba(255,0,0,0.25) 0%, transparent 100%)", width: 1250, maxWidth: "100vw" }}
        />

        <div className="relative pt-[58px] px-6 sm:px-12">
          {/* Label */}
          <p
            className="text-white"
            style={{ fontSize: 16, lineHeight: "24px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
          >
            Tire suas dúvidas
          </p>

          {/* Title */}
          <h2
            className="mt-2 font-display text-white"
            style={{ fontSize: 50, lineHeight: 1.05, ...GLANCYR_MEDIUM_EXPANDED }}
          >
            Perguntas frequentes
          </h2>

          {/* Questions */}
          <div className="mt-10">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.question} className={`border-t border-white/10 transition-colors duration-200 ${isOpen ? "lg:bg-transparent lg:rounded-none lg:px-0 lg:py-0 bg-[rgba(255,0,0,0.08)] rounded-2xl px-4 py-2 my-2" : ""}`}>
                  <button
                    type="button"
                    className="group flex w-full items-center justify-between gap-4 px-2 py-6 text-left transition-colors duration-200 hover:text-vermelho-redrive"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`font-display transition-colors duration-200 group-hover:text-vermelho-redrive ${isOpen ? "text-vermelho-redrive lg:text-bege-texto lg:group-hover:text-vermelho-redrive" : "text-bege-texto"}`}
                      style={{ fontSize: 22, lineHeight: "24px", fontStretch: "100%", fontVariationSettings: '"wght" 550, "wdth" 100' }}
                    >
                      {item.question}
                    </span>
                    <span
                      className="shrink-0 font-display text-vermelho-redrive"
                      style={{ fontSize: 58, lineHeight: 1.05, ...GLANCYR_MEDIUM_EXPANDED }}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="mb-6 max-w-3xl px-2 text-base leading-relaxed text-camurca-texto">
                      <AnswerText text={item.answer} onCtaClick={() => setShowImplModal(true)} />
                    </p>
                  )}
                </div>
              );
            })}
            <div className="border-t border-white/10" />
          </div>
        </div>
      </div>

      <ImplantacaoUpgradeModal open={showImplModal} onClose={() => setShowImplModal(false)} />
    </section>
  );
}
