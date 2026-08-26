"use client";

import { useState } from "react";
import { type OnboardingData } from "@/lib/auth";
import { saveOnboardingRemote } from "@/lib/user-data";
import {
  GLANCYR_LIGHT_CONDENSED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_REGULAR,
} from "@/lib/typography";

const STEPS = [
  { key: "companyName" as const, question: "Qual o nome da sua empresa?", placeholder: "Ex: Loja Premium LTDA" },
  { key: "segment" as const, question: "Qual o segmento de atuação?", placeholder: "Ex: E-commerce de moda, Clínica odontológica, SaaS B2B..." },
  { key: "teamSize" as const, question: "Quantas pessoas tem na equipe de vendas?", placeholder: "Ex: 3 vendedores + 1 gestor" },
  { key: "mainChallenge" as const, question: "Qual o maior desafio hoje na sua operação de vendas?", placeholder: "Ex: Leads não respondem, equipe não usa o CRM, sem previsibilidade..." },
  { key: "currentTools" as const, question: "Quais ferramentas você usa hoje além da Redrive?", placeholder: "Ex: Instagram, Google Ads, RD Station, planilha Excel..." },
  { key: "goal" as const, question: "Qual resultado você espera alcançar com o RedPower?", placeholder: "Ex: Dobrar a conversão em 3 meses, automatizar 60% do atendimento..." },
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [currentValue, setCurrentValue] = useState("");

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function handleNext() {
    if (!currentValue.trim()) return;
    const updated = { ...data, [current.key]: currentValue.trim() };
    setData(updated);
    setCurrentValue("");

    if (isLast) {
      saveOnboardingRemote(updated as unknown as OnboardingData).then(onComplete).catch(() => onComplete());
    } else {
      setStep(step + 1);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors duration-300"
              style={{ background: i <= step ? "var(--vermelho-redrive)" : "rgba(255,255,255,0.1)" }}
            />
          ))}
        </div>

        {/* Agent avatar + intro */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vermelho-redrive">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 17v-2.5" />
            </svg>
          </div>
          <div>
            <p className="font-display text-white" style={{ fontSize: 14, ...GLANCYR_REGULAR }}>
              Agente RedPower
            </p>
            <div className="mt-1 rounded-2xl rounded-tl-md bg-white/5 px-4 py-3">
              <p className="text-sm leading-relaxed text-bege-texto">
                {step === 0
                  ? "Antes de começar, preciso conhecer um pouco sobre a sua empresa. Isso vai me ajudar a personalizar as respostas e sugestões durante todo o método. São só 6 perguntas rápidas!"
                  : current.question}
              </p>
            </div>
          </div>
        </div>

        {/* Question display (only on step 0) */}
        {step === 0 && (
          <p
            className="mb-4 pl-14 font-display text-creme-destaque"
            style={{ fontSize: 18, ...GLANCYR_LIGHT_CONDENSED }}
          >
            {current.question}
          </p>
        )}

        {/* Input */}
        <div className="pl-14">
          <input
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
            placeholder={current.placeholder}
            autoFocus
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bege-texto outline-none placeholder:text-white/20 focus:border-vermelho-redrive"
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-camurca-texto" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              {step + 1} de {STEPS.length}
            </p>
            <button
              onClick={handleNext}
              disabled={!currentValue.trim()}
              className="btn-lp flex items-center gap-2 rounded-xl bg-vermelho-redrive px-6 py-2.5 font-display text-sm text-white disabled:opacity-30"
              style={{ ...GLANCYR_BOLD_EXPANDED }}
            >
              {isLast ? "Concluir" : "Próximo"} <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
