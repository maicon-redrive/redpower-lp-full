import { Header } from "./Header";
import { HeroCarousel } from "./HeroCarousel";
import { OrbitingBadges } from "./OrbitingBadges";
import { GLANCYR_BOLD_EXPANDED, GLANCYR_THIN_CONDENSED_OBLIQUE } from "@/lib/typography";

const SIDE_LIST = ["1 ano de Redrive", "Método", "Chat First", "Magia da Conversa", "Implantação"];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-[120px] pb-28 lg:pt-32 lg:px-16 lg:pb-36">
      <Header />

      {/* "RedPower — Exclusivo" stays at original position */}
      <div className="relative mx-auto max-w-6xl">
        <p className="mb-0 flex items-center gap-2 text-sm italic text-white lg:mb-4">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />
          RedPower Full — método + Redrive, do primeiro dia
        </p>
      </div>

      {/* Background REDPOWER text — desktop: absolute, mobile: inline between elements */}
      <p
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display uppercase leading-none text-white/15 hidden lg:block"
        style={{
          top: "18%",
          fontSize: "200px",
          ...GLANCYR_BOLD_EXPANDED,
        }}
      >
        REDPOWER
      </p>
      <div className="relative mx-auto max-w-6xl lg:hidden" style={{ marginTop: 12, marginBottom: 12 }}>
        <p
          className="pointer-events-none select-none whitespace-nowrap font-display uppercase leading-none text-white/15"
          style={{
            fontSize: 52,
            ...GLANCYR_BOLD_EXPANDED,
          }}
        >
          REDPOWER
        </p>
      </div>

      {/* Mobile layout: h1 → p → carousel → buttons */}
      <div className="relative mx-auto mt-0 max-w-6xl lg:hidden">
        <h1
          className="max-w-2xl font-display leading-[1.05] text-bege-texto"
          style={{ fontSize: 40, ...GLANCYR_BOLD_EXPANDED }}
        >
          Sua operação de vendas com IA,{" "}
          <span className="text-vermelho-redrive">do zero à primeira venda</span>
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-camurca-texto">
          A Redrive é o{" "}
          <strong className="font-semibold text-bege-texto">
            Sistema Operacional de Vendas Agênticas
          </strong>
          : leads, atendimento, CRM e automações conectados, com IA embarcada vendendo por você. O RedPower Full é o programa que coloca essa operação no ar{" "}
          <strong className="font-semibold text-bege-texto">
            do zero à primeira venda
          </strong>{" "}
          — por menos de <strong className="font-semibold text-bege-texto">R$30 por dia</strong>.
        </p>

        <div className="relative mx-auto mt-8 h-[351px] w-[265px]">
          <HeroCarousel />
          <OrbitingBadges />
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3">
          {SIDE_LIST.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 font-display text-white"
              style={{ fontSize: 14, ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vermelho-redrive">
                <svg width="11" height="12" viewBox="0 0 11 12" fill="none"><path d="M0 7L0.28 5H4.28L5 0H7L6.28 5H10.28L10 7H6L5.32 12H3.32L4 7H0Z" fill="white"/></svg>
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <a
            href="#redpower"
            className="btn-lp rounded-full bg-vermelho-redrive px-7 py-3.5 font-display text-sm font-bold text-white"
          >
            Conhecer o programa →
          </a>
          <a
            href="#planos"
            className="font-display text-xs font-medium text-white underline-offset-4 hover:underline"
          >
            Ver o que está incluso →
          </a>
        </div>
      </div>

      {/* Desktop layout: original grid */}
      <div className="relative mx-auto mt-24 hidden max-w-6xl lg:block">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <h1
              className="max-w-2xl font-display leading-[1.08] text-bege-texto"
              style={{ fontSize: "50px", ...GLANCYR_BOLD_EXPANDED }}
            >
              Sua operação de vendas com IA,
              <br />
              <span className="text-vermelho-redrive">do zero à primeira venda</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-camurca-texto">
              A Redrive é o{" "}
              <strong className="font-semibold text-bege-texto">
                Sistema Operacional de Vendas Agênticas
              </strong>
              : leads, atendimento, CRM e automações conectados, com IA embarcada vendendo por você. O RedPower Full é o programa que coloca essa operação no ar{" "}
              <strong className="font-semibold text-bege-texto">
                do zero à primeira venda
              </strong>{" "}
              — por menos de <strong className="font-semibold text-bege-texto">R$30 por dia</strong>.
            </p>

            {/* Inclusos — uma única linha horizontal entre o texto e o CTA */}
            <ul className="mt-6 flex flex-nowrap items-center gap-x-3">
              {SIDE_LIST.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 whitespace-nowrap font-display text-white"
                  style={{ fontSize: 12, ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-vermelho-redrive">
                    <svg width="9" height="10" viewBox="0 0 11 12" fill="none"><path d="M0 7L0.28 5H4.28L5 0H7L6.28 5H10.28L10 7H6L5.32 12H3.32L4 7H0Z" fill="white"/></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a
                href="#redpower"
                className="btn-lp rounded-full bg-vermelho-redrive px-7 py-3.5 font-display text-sm font-bold text-white"
              >
                Conhecer o programa →
              </a>
              <a
                href="#redpower"
                className="font-display text-xs font-medium text-white underline-offset-4 hover:underline"
              >
                Ver o que está incluso →
              </a>
            </div>
          </div>

          {/* Animação — maior e deslocada à direita, escala proporcional */}
          <div className="relative ml-auto h-[421px] w-[318px]">
            <div
              className="absolute left-1/2 top-1/2 h-[351px] w-[265px]"
              style={{ transform: "translate(-50%, -50%) scale(1.2)" }}
            >
              <HeroCarousel />
              <OrbitingBadges />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
