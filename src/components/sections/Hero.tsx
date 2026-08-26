import { Header } from "./Header";
import { HeroCarousel } from "./HeroCarousel";
import { OrbitingBadges } from "./OrbitingBadges";
import { GLANCYR_BOLD_EXPANDED, GLANCYR_THIN_CONDENSED_OBLIQUE } from "@/lib/typography";

const SIDE_LIST = ["Método Redrive", "Chat First (Livro)", "Magia da Conversa (livro)", "Implantação Redrive"];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-[120px] pb-28 lg:pt-32 lg:px-16 lg:pb-36">
      <Header />

      {/* "RedPower — Exclusivo" stays at original position */}
      <div className="relative mx-auto max-w-6xl">
        <p className="mb-0 flex items-center gap-2 text-sm italic text-white lg:mb-4">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />
          RedPower — Exclusivo para clientes Redrive
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
        <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <h1
              className="max-w-2xl font-display leading-[1.05] text-bege-texto"
              style={{ fontSize: "58px", ...GLANCYR_BOLD_EXPANDED }}
            >
              Sua operação de
              <br />
              vendas com IA, <span className="text-vermelho-redrive">do zero</span>
              <br />
              <span className="text-vermelho-redrive">à primeira venda</span>
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

          {/* Card carousel — shifted 15% right */}
          <div className="relative mx-auto h-[351px] w-[265px]" style={{ marginLeft: "10%" }}>
            <HeroCarousel />
            <OrbitingBadges />
          </div>
        </div>

        {/* Side list — right edge, bottom aligned with <p> (above CTA buttons) */}
        <ul className="absolute right-0 space-y-2" style={{ bottom: "60px" }}>
          {SIDE_LIST.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 whitespace-nowrap font-display text-white"
              style={{ fontSize: "16px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vermelho-redrive">
                <svg width="11" height="12" viewBox="0 0 11 12" fill="none"><path d="M0 7L0.28 5H4.28L5 0H7L6.28 5H10.28L10 7H6L5.32 12H3.32L4 7H0Z" fill="white"/></svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
