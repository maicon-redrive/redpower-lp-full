"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  GLANCYR_MEDIUM_EXPANDED,
  GLANCYR_EXTRA_LIGHT_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_THIN_CONDENSED,
} from "@/lib/typography";

const BADGES = [
  { label: "8 AULAS", circle: "/images/method-icon-book.svg", inner: "/images/method-icon-screen.png" },
  { label: "DE 3H DE CONTEÚDO", circle: "/images/method-icon-plus.svg" },
  { label: "ACESSO VITALÍCIO", circle: "/images/method-icon-book.svg", inner: "/images/method-icon-infinity.png" },
  { label: "ATUALIZAÇÕES NO MÉTODO INCLUSAS", circle: "/images/method-icon-book.svg", inner: "/images/method-icon-star.png" },
  { label: "AULAS EXTRAS COM DANIEL REGINATTO", circle: "/images/method-icon-plus.svg" },
];

interface Phase {
  fase: string;
  title: string;
  headline: string;
  body: string;
  photo?: string;
  chips?: { label: string; icon: string }[];
  icons?: string[];
  hint?: { description: string; topics: string[] };
}

const PHASES: Phase[] = [
  {
    fase: "FASE 01",
    title: "MATÉRIA-PRIMA",
    headline: "GERAMOS LEADS EM ABUNDÂNCIA",
    body: "Sua equipe nunca mais vai reclamar de falta de gente pra \"ligar\".",
    photo: "/images/method-fase1.jpg",
    hint: {
      description: "Como gerar volume de leads qualificados sem depender de uma única fonte.",
      topics: [
        "Diversificação de canais de captação",
        "Estratégias de tráfego pago e orgânico",
        "Qualificação automática na entrada",
        "Métricas de custo por lead",
      ],
    },
  },
  {
    fase: "FASE 02",
    title: "ATIVAÇÃO",
    headline: "CRIAMOS DEMANDAS ATIVAS",
    body: "Ativar é fazer o funil viver.\nE a Redrive dá o fôlego que ele precisa.",
    photo: "/images/method-fase2.jpg",
    hint: {
      description: "Transformar contatos parados em oportunidades reais de venda.",
      topics: [
        "Cadências de follow-up personalizadas",
        "Gatilhos de reengajamento por comportamento",
        "Criação de demanda ativa via WhatsApp",
        "Recuperação de leads inativos",
      ],
    },
  },
  {
    fase: "FASE 03",
    title: "ESCALA",
    headline: "ATENDEMOS\nCOM IA",
    body: "Uma IA que pensa como seu melhor vendedor.\nE trabalha enquanto você dorme.",
    chips: [
      { label: "Agentes ativos", icon: "/images/method-chip-agentes.png" },
      { label: "Maestro - IA Generativa", icon: "/images/method-chip-maestro.png" },
      { label: "Jornadas", icon: "/images/method-chip-jornadas.png" },
    ],
    hint: {
      description: "Escalar o atendimento com IA sem perder qualidade na conversa.",
      topics: [
        "Agentes de IA com personalidade treinada",
        "Maestro — IA generativa da Redrive",
        "Jornadas automatizadas por perfil de lead",
        "Atendimento 24h sem aumentar equipe",
      ],
    },
  },
  {
    fase: "FASE 04",
    title: "CONTROLE",
    headline: "GESTÃO E\nCONTROLE",
    body: "Somos o Sistema Operacional de vendas que conversa e é especialista em vendas conversacionais",
    icons: ["/images/method-f4-icon1.png", "/images/method-f4-icon2.png", "/images/method-f4-icon3.png"],
    hint: {
      description: "Visão completa da operação com métricas e indicadores em tempo real.",
      topics: [
        "Dashboard de performance comercial",
        "Indicadores de conversão por etapa",
        "Gestão de equipe e produtividade",
        "Decisões baseadas em dados, não em achismo",
      ],
    },
  },
];

function TabBlock({ fase, title, fluid }: { fase: string; title: string; fluid?: boolean }) {
  return (
    <div className="flex flex-col justify-center rounded-[20px] bg-noite-cereja px-9" style={{ width: fluid ? "100%" : 280, height: 74 }}>
      <p className="font-display text-white" style={{ fontSize: "18px", lineHeight: "28px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
        {fase}
      </p>
      <p className="font-display text-white" style={{ fontSize: "20px", lineHeight: "24px", ...GLANCYR_BOLD_CONDENSED }}>
        {title}
      </p>
    </div>
  );
}

function BodyBlock({ phase, photoFirst, extraTop, fluid }: { phase: Phase; photoFirst?: boolean; extraTop?: number; fluid?: boolean }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-[30px] bg-noite-cereja px-9 pb-8" style={{ width: fluid ? "100%" : 280, minHeight: 350, paddingTop: extraTop ? extraTop + 32 : 32 }}>
      {phase.chips && (
        <Image
          src="/images/method-circles-bg.svg"
          alt=""
          width={280}
          height={351}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-auto w-full"
          style={{ objectFit: "cover", objectPosition: "center bottom" }}
        />
      )}

      {photoFirst && phase.photo && (
        <div className="relative z-10 mx-auto mb-4 overflow-hidden" style={{ width: 240, height: 156, borderRadius: 60 }}>
          <Image src={phase.photo} alt={phase.headline} fill className="object-cover" sizes="240px" />
        </div>
      )}

      <h3 className="relative z-10 font-display whitespace-pre-line uppercase text-white" style={{ fontSize: "26px", lineHeight: "34px", ...GLANCYR_THIN_CONDENSED }}>
        {phase.headline}
      </h3>

      {!photoFirst && phase.photo && (
        <div className="relative z-10 mx-auto mt-4 overflow-hidden" style={{ width: 240, height: 156, borderRadius: 60 }}>
          <Image src={phase.photo} alt={phase.headline} fill className="object-cover" sizes="240px" />
        </div>
      )}

      <div className={`relative z-10 mt-4 whitespace-pre-line text-sm leading-[20px] text-bege-texto${phase.icons ? " max-w-[140px]" : ""}`}>
        {phase.body}
      </div>

      {phase.chips && (
        <ul className="relative z-10 mt-auto space-y-2 pt-4">
          {phase.chips.map((chip) => (
            <li key={chip.label} className="flex items-center gap-2">
              <Image src={chip.icon} alt="" width={20} height={20} className="shrink-0 object-contain" />
              <span className="font-display text-white" style={{ fontSize: "16px", lineHeight: "24px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
                {chip.label}
              </span>
            </li>
          ))}
        </ul>
      )}

      {phase.icons && (
        <div className="absolute right-5 z-10 flex flex-col gap-4" style={{ top: 30 }}>
          {phase.icons.map((icon, i) => (
            <div key={i} className="flex items-center justify-center rounded-full bg-vermelho-redrive" style={{ width: 71, height: 71 }}>
              <Image src={icon} alt="" width={40} height={40} className="object-contain" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  const tabFirst = index % 2 === 0;
  const bodyFirst = !tabFirst;
  return (
    <div className="group/phase relative flex flex-col" style={{ gap: 10 }}>
      {tabFirst ? (
        <>
          <TabBlock fase={phase.fase} title={phase.title} />
          <BodyBlock phase={phase} />
        </>
      ) : (
        <>
          <BodyBlock phase={phase} photoFirst={!!phase.photo} extraTop={bodyFirst && !phase.photo ? 84 : 0} />
          <TabBlock fase={phase.fase} title={phase.title} />
        </>
      )}
      {phase.hint && (
        <div
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-[20px] opacity-0 transition-opacity duration-300 group-hover/phase:opacity-100"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)" }}
        >
          <div className="px-6 py-5">
            <p className="mb-3 text-sm leading-relaxed text-white/90" style={{ fontFamily: "var(--font-figtree)" }}>
              {phase.hint.description}
            </p>
            <ul className="space-y-1.5">
              {phase.hint.topics.map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-white/70" style={{ fontFamily: "var(--font-figtree)" }}>
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-vermelho-redrive" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function MobilePhaseCarousel() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    setProgress(0);
    startRef.current = Date.now();
  }, []);

  useEffect(() => {
    const DURATION = 4000;
    const TICK = 50;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        setActive((prev) => {
          const next = (prev + 1) % PHASES.length;
          startRef.current = Date.now();
          setProgress(0);
          return next;
        });
      }
    }, TICK);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const phase = PHASES[active];

  return (
    <div className="mt-12 lg:hidden">
      {/* Card — same as desktop PhaseCard */}
      <div className="mx-auto" style={{ maxWidth: 300 }}>
        <PhaseCard phase={phase} index={active} />
      </div>

      {/* Phase indicators */}
      <div className="mx-auto mt-6 flex justify-center gap-4">
        {PHASES.map((p, i) => (
          <button
            key={p.fase}
            onClick={() => goTo(i)}
            className="relative flex h-[28px] items-center justify-center overflow-hidden rounded-full border border-vermelho-redrive px-3"
            style={{ background: "rgba(255,0,0,0.3)", minWidth: 64 }}
          >
            {i === active && (
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-vermelho-redrive"
                style={{ width: `${progress * 100}%`, transition: "width 50ms linear" }}
              />
            )}
            <span
              className="relative z-10 font-display text-white"
              style={{ fontSize: 12, lineHeight: "24px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
            >
              {p.fase}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Method() {
  const h2Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h2 = h2Ref.current;
    if (!h2) return;

    const body = document.body;
    body.style.transition = "background-color 1s ease-out";

    const booksP = document.querySelector("#livros p");
    const implSection = document.querySelector("#implantacao");
    const planosSection = document.querySelector("#planos");

    function setMogno() { body.style.backgroundColor = "var(--mogno)"; }
    function setDefault() { body.style.backgroundColor = ""; }

    const observers: IntersectionObserver[] = [];

    // Mogno ON when Method h2 enters viewport
    const h2Observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setMogno();
      else if (entry.boundingClientRect.top > 0) setDefault();
    }, { threshold: 0 });
    h2Observer.observe(h2);
    observers.push(h2Observer);

    // Mogno OFF when Books <p> enters viewport; ON again when it leaves going up (reverse scroll)
    if (booksP) {
      const o = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setDefault();
        else if (entry.boundingClientRect.top > 0) setMogno();
      }, { threshold: 0 });
      o.observe(booksP);
      observers.push(o);
    }

    // Mogno ON again when Implementation section enters viewport
    if (implSection) {
      const o = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setMogno();
      }, { threshold: 0 });
      o.observe(implSection);
      observers.push(o);
    }

    // Mogno OFF when Planos section enters viewport
    if (planosSection) {
      const o = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setDefault();
      }, { threshold: 0 });
      o.observe(planosSection);
      observers.push(o);
    }

    return () => {
      observers.forEach(o => o.disconnect());
      body.style.transition = "";
      body.style.backgroundColor = "";
    };
  }, []);

  return (
    <section id="metodo" className="relative px-6 py-28 lg:px-16 lg:py-36">
      <div className="mx-auto max-w-6xl">
        {/* Subtitle */}
        <p
          className="flex items-center gap-2 text-white"
          style={{ fontSize: "16px", lineHeight: "24px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />
          O conceito por trás do potencial crescimento
        </p>

        {/* Two-column header */}
        <div className="grid gap-10 lg:grid-cols-[1fr_443px]" style={{ marginTop: "50px" }}>
          <div>
            <h2
              ref={h2Ref}
              className="font-display uppercase"
              style={{ fontSize: "44px", lineHeight: "1.05", ...GLANCYR_MEDIUM_EXPANDED }}
            >
              <span className="text-white">MÉTODO</span>{" "}
              <span className="text-vermelho-redrive">REDRIVE</span>
            </h2>
            <p
              className="font-display text-vermelho-redrive"
              style={{ marginTop: "56px", fontSize: "34px", lineHeight: "1.05", ...GLANCYR_EXTRA_LIGHT_EXPANDED }}
            >
              O método que ensina cada engrenagem da operação.
            </p>
          </div>
          <div className="flex max-w-[443px] flex-col justify-between">
            <p className="text-base leading-relaxed text-bege-texto">
              O Daniel na frente da câmera ensinando o conceito por trás de cada fase, para que
              você saiba não só o que configurar, mas por que cada decisão muda o resultado da
              sua operação.
            </p>
            <p
              className="mt-4 font-display text-bege-texto"
              style={{ fontSize: "16px", lineHeight: "24px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
            >
              Cerca de 3 horas de conteúdo conceitual e estratégico
              <br />
              · Acesso vitalício · Assista no seu ritmo
            </p>
          </div>
        </div>

        {/* Daniel bio — full width */}
        <p className="mt-12 leading-relaxed text-bege-texto/70" style={{ fontSize: "16px" }}>
          Daniel Reginatto é CEO e fundador da Redrive e foi CTO da Wiser Educação, do Flávio Augusto, por 10 anos. Ao longo dessa
          jornada e da operação da Redrive, lapidou o Método Redrive. Tudo que ele ensina aqui,
          é aplicado e validado no dia a dia pelo comercial da Redrive.
        </p>

        {/* Badges row */}
        <div className="grid grid-cols-1 gap-4 lg:flex lg:flex-wrap lg:items-center lg:justify-between" style={{ marginTop: "48px" }}>
          {BADGES.map((b) => (
            <span
              key={b.label}
              className="flex items-center gap-2 font-display text-white"
              style={{ fontSize: "16px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
            >
              <span className="relative flex h-[26px] w-[26px] shrink-0 items-center justify-center">
                <Image src={b.circle} alt="" width={26} height={26} />
                {b.inner && (
                  <Image src={b.inner} alt="" width={14} height={14} className="absolute object-contain" />
                )}
              </span>
              {b.label}
            </span>
          ))}
        </div>

        {/* Phase cards — desktop: staggered 2×2 grid */}
        <div className="hidden flex-wrap justify-center gap-6 lg:flex lg:flex-nowrap lg:gap-8" style={{ marginTop: "86px" }}>
          {PHASES.map((phase, i) => (
            <PhaseCard key={phase.fase} phase={phase} index={i} />
          ))}
        </div>

        {/* Phase cards — mobile: carousel */}
        <MobilePhaseCarousel />
      </div>
    </section>
  );
}
