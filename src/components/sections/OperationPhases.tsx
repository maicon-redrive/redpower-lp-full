"use client";
import { useState, useEffect, useCallback } from "react";
import {
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_LIGHT_CONDENSED,
} from "@/lib/typography";

/* ---- Data ---- */

interface CarouselItem {
  label: string;
  icon: string;
}

interface Phase {
  number: string;
  title: string;
  bg: string;
  carouselItems: CarouselItem[];
  contentCards: number;
  progressPerStep: string[];
}

const PHASE01_ITEMS: CarouselItem[] = [
  { label: "Captação Grupos Whatsapp", icon: "/images/carousel-icon-whatsapp.png" },
  { label: "Captação Contatos Whatsapp", icon: "/images/carousel-icon-whatsapp.png" },
  { label: "Captação Conversas Whatsapp", icon: "/images/carousel-icon-whatsapp.png" },
  { label: "Captação Instagram", icon: "/images/carousel-icon-instagram.png" },
  { label: "Captação Google Maps e Bing Maps", icon: "/images/carousel-icon-maps.png" },
  { label: "Captação Cadastro Nacional de Empresas", icon: "/images/carousel-icon-cadastro.png" },
];

const PHASE02_ITEMS: CarouselItem[] = [
  { label: "Atendimento ativo", icon: "/images/carousel-icon-whatsapp.png" },
  { label: "Disparos de mensagem configurados", icon: "/images/carousel-icon-whatsapp.png" },
  { label: "Setores configurados", icon: "/images/carousel-icon-whatsapp.png" },
];

const PHASE03_ITEMS: CarouselItem[] = [
  { label: "Jornadas criadas", icon: "/images/carousel-icon-whatsapp.png" },
  { label: "Agentes de IA ativos", icon: "/images/carousel-icon-whatsapp.png" },
  { label: "Maestro treinado", icon: "/images/carousel-icon-whatsapp.png" },
];

const PHASE04_ITEMS: CarouselItem[] = [
  { label: "Relatórios", icon: "/images/carousel-icon-whatsapp.png" },
  { label: "Previsão de receitas", icon: "/images/carousel-icon-whatsapp.png" },
  { label: "Redrive 360º ativa", icon: "/images/carousel-icon-whatsapp.png" },
];

const phases: Phase[] = [
  {
    number: "01",
    title: "MATÉRIA-PRIMA",
    bg: "rgba(100,31,28,0.24)",
    carouselItems: PHASE01_ITEMS,
    contentCards: 3,
    progressPerStep: ["30%", "30%", "60%", "90%", "COMPLETADA"],
  },
  {
    number: "02",
    title: "ATIVAÇÃO",
    bg: "#3f0615",
    carouselItems: PHASE02_ITEMS,
    contentCards: 2,
    progressPerStep: ["30%", "30%", "60%", "COMPLETADA"],
  },
  {
    number: "03",
    title: "ESCALA",
    bg: "#3b2020",
    carouselItems: PHASE03_ITEMS,
    contentCards: 2,
    progressPerStep: ["30%", "30%", "60%", "COMPLETADA"],
  },
  {
    number: "04",
    title: "CONTROLE",
    bg: "#3b2034",
    carouselItems: PHASE04_ITEMS,
    contentCards: 3,
    progressPerStep: ["30%", "30%", "60%", "90%", "COMPLETADA"],
  },
];

function getStepCount(phase: Phase) {
  return 2 + phase.contentCards;
}

/* ---- Phase Icon (red dot) ---- */
function PhaseIcon({ size = 18 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#ff0000",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.55} height={size * 0.65} viewBox="0 0 10 12" fill="none">
        <path d="M5 0C2.24 0 0 2.24 0 5c0 3.5 5 7 5 7s5-3.5 5-7c0-2.76-2.24-5-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="white" />
      </svg>
    </span>
  );
}

/* ---- Bottom bar — renders independently, no content fade ---- */
function BottomBar({ phase, progressText }: { phase: Phase; progressText: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-8 pb-8" style={{ zIndex: 10 }}>
      <div className="flex items-end justify-between">
        <div>
          <PhaseIcon />
          <div
            className="font-display"
            style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE, fontSize: 18, color: "white", lineHeight: 1.2, marginTop: 6 }}
          >
            FASE {phase.number}
          </div>
          <div
            className="font-display"
            style={{ ...GLANCYR_BOLD_CONDENSED, fontSize: 20, color: "white", lineHeight: 1.2 }}
          >
            {phase.title}
          </div>
        </div>
        <div
          className="font-display flex items-center gap-1"
          style={{ ...GLANCYR_LIGHT_CONDENSED, fontSize: 14, color: "#50f116" }}
        >
          <span>✓</span>
          <span>{progressText}</span>
        </div>
      </div>
    </div>
  );
}

/* ---- Slot-machine vertical carousel ---- */
const PILL_H = 59;
const PILL_GAP = 14;
const SLOT_STEP = PILL_H + PILL_GAP;
const VISIBLE_SLOTS = 3;
const STRIP_LEN = 20;

function CarouselPill({ item, isCenter }: { item: CarouselItem; isCenter: boolean }) {
  return (
    <div
      className="font-display flex items-center gap-3"
      style={{
        height: PILL_H,
        minHeight: PILL_H,
        borderRadius: 9999,
        border: isCenter ? "1.5px solid rgba(255,0,0,0.85)" : "0.5px solid rgba(255,0,0,0.3)",
        paddingLeft: 16,
        paddingRight: 28,
        width: "auto",
        ...GLANCYR_THIN_CONDENSED_OBLIQUE,
        color: "white",
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      <span style={{ color: "#50f116", fontSize: 14, flexShrink: 0 }}>✓</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.icon}
        alt=""
        style={{ width: 29, height: 29, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
      <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
    </div>
  );
}

function SlotCarousel({ items, carouselIndex }: { items: CarouselItem[]; carouselIndex: number }) {
  const len = items.length;
  const containerH = SLOT_STEP * VISIBLE_SLOTS;
  const centerIdx = carouselIndex + 1;

  return (
    <div
      className="flex justify-center"
      style={{
        height: containerH,
        overflow: "hidden",
        maskImage: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 20%, black 35%, black 60%, rgba(0,0,0,0.3) 78%, rgba(0,0,0,0.15) 100%)`,
        WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 20%, black 35%, black 60%, rgba(0,0,0,0.3) 78%, rgba(0,0,0,0.15) 100%)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: PILL_GAP,
          transform: `translateY(-${carouselIndex * SLOT_STEP}px)`,
          transition: "transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {Array.from({ length: STRIP_LEN }, (_, i) => {
          const idx = ((i - 1) % len + len) % len;
          return <CarouselPill key={i} item={items[idx]} isCenter={i === centerIdx} />;
        })}
      </div>
    </div>
  );
}

/* ---- Wipe-right wrapper ---- */
function WipeReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div style={{ animation: `wipeRight 0.6s ease ${delay}s both` }}>
      {children}
    </div>
  );
}

/* ---- Phase 01 Content Cards ---- */

function Phase01Content({ index }: { index: number }) {
  // Card 0: "Tags adicionadas" green pill
  if (index === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <WipeReveal>
          <div
            style={{
              backgroundColor: "#50f116",
              borderRadius: 9999,
              height: 59,
              display: "flex",
              alignItems: "center",
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            <span className="font-display" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE, fontSize: 14, color: "var(--mogno)" }}>
              Tags adicionadas
            </span>
          </div>
        </WipeReveal>
      </div>
    );
  }
  // Card 1: "Grupos de contatos organizados" — orange pill with avatar cluster
  if (index === 1) {
    return (
      <div className="flex items-center justify-center h-full">
        <WipeReveal>
          <div
            style={{
              backgroundColor: "#f17c16",
              borderRadius: 9999,
              height: 59,
              width: 251,
              display: "flex",
              alignItems: "center",
              paddingLeft: 4,
              paddingRight: 20,
              gap: 10,
            }}
          >
            {/* Avatar cluster circle */}
            <div style={{ width: 51, height: 51, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
              {/* Simplified avatar dots */}
              {[[-6,-8],[6,-8],[0,2],[-8,6],[8,6]].map(([x,y], i) => (
                <div key={i} style={{ position: "absolute", width: 9, height: 9, borderRadius: "50%", backgroundColor: i < 3 ? "#3f0000" : "rgba(63,0,0,0.5)", left: `calc(50% + ${x}px - 4.5px)`, top: `calc(50% + ${y}px - 4.5px)` }} />
              ))}
            </div>
            <span className="font-display" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE, fontSize: 14, color: "var(--mogno)" }}>
              Grupos de contatos organizados
            </span>
          </div>
        </WipeReveal>
      </div>
    );
  }
  // Card 2: Tag cloud — colored pills (Figma 323:109)
  const tags = [
    { label: "Instagram", color: "#f61e8d", dark: true, w: 110 },
    { label: "Facebook", color: "#0c62f7", dark: true, w: 110 },
    { label: "WhatsApp", color: "#30eb66", dark: false, w: 110 },
    { label: "Google Maps", color: "#4285f4", dark: true, w: 110 },
    { label: "Importação Base de Clientes", color: "#0ff", dark: false, w: 133 },
    { label: "Clientes Interessados Site", color: "#0ff", dark: false, w: 133 },
    { label: "Feira Abril", color: "#f7990c", dark: false, w: 110 },
    { label: "Cliente", color: "#50f116", dark: false, w: 87 },
    { label: "Captação PAP", color: "#f7d40c", dark: false, w: 110 },
    { label: "Campanha X", color: "#a416f1", dark: true, w: 87 },
  ];
  return (
    <div className="flex flex-wrap gap-2 justify-center items-center h-full px-6">
      {tags.map((tag, i) => (
        <WipeReveal key={i} delay={i * 0.06}>
          <div
            style={{
              backgroundColor: tag.color,
              borderRadius: 9999,
              height: 39,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 14,
              paddingRight: 14,
              minWidth: tag.w * 0.85,
            }}
          >
            <span className="font-display" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE, fontSize: 9, color: tag.dark ? "var(--bege-texto)" : "var(--mogno)" }}>
              {tag.label}
            </span>
          </div>
        </WipeReveal>
      ))}
    </div>
  );
}

/* ---- Phase 02 Content Cards ---- */

const BUBBLE_NAMES = [
  { name: "Carlos chamou", avatar: "/images/method-f2-avatar-carlos.png" },
  { name: "Mauren chamou", avatar: "/images/method-f2-avatar-collage.png" },
  { name: "Ana chamou", avatar: "/images/method-f2-avatar-collage.png" },
  { name: "Antônio chamou", avatar: "/images/method-f2-avatar-collage.png" },
  { name: "João chamou", avatar: "/images/method-f2-avatar-collage.png" },
];
const BUBBLE_STRIP = 16;
const BUBBLE_H = 59;
const BUBBLE_GAP = 10;
const BUBBLE_STEP = BUBBLE_H + BUBBLE_GAP;

function BubbleCarousel({ bubbleIndex }: { bubbleIndex: number }) {
  const len = BUBBLE_NAMES.length;
  const containerH = BUBBLE_STEP * 4;

  return (
    <div
      style={{
        height: containerH,
        overflow: "hidden",
        maskImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 15%, black 30%, black 65%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.1) 100%)`,
        WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 15%, black 30%, black 65%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.1) 100%)`,
        width: "100%",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: BUBBLE_GAP,
          transform: `translateY(-${bubbleIndex * BUBBLE_STEP}px)`,
          transition: "transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {Array.from({ length: BUBBLE_STRIP }, (_, i) => {
          const idx = i % len;
          const isLeft = i % 2 === 0;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isLeft ? "flex-start" : "flex-end",
              }}
            >
              <div
                className="font-display flex items-center gap-3"
                style={{
                  backgroundColor: "#50f116",
                  borderRadius: 9999,
                  height: BUBBLE_H,
                  paddingLeft: 4,
                  paddingRight: 20,
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 41,
                  height: 41,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  backgroundColor: "#ddd",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BUBBLE_NAMES[idx].avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE, fontSize: 14, color: "var(--mogno)" }}>
                  {BUBBLE_NAMES[idx].name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Phase02Content({ index, bubbleIndex }: { index: number; bubbleIndex: number }) {
  if (index === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <WipeReveal>
          <div style={{ backgroundColor: "#50f116", borderRadius: 9999, height: 59, display: "flex", alignItems: "center", paddingLeft: 24, paddingRight: 24 }}>
            <span className="font-display" style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE, fontSize: 14, color: "var(--mogno)" }}>Atendimento ativo</span>
          </div>
        </WipeReveal>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-full">
      <BubbleCarousel bubbleIndex={bubbleIndex} />
    </div>
  );
}

/* ---- Phase 03 Content Cards ---- */

function Phase03Content({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <WipeReveal>
          <div style={{ backgroundColor: "white", borderRadius: 24, padding: 20, width: "100%", maxWidth: 310 }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "#50f116" }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>Passo Inicial</span>
            </div>
            <p style={{ fontSize: 11, color: "#666", lineHeight: 1.4, marginBottom: 12 }}>
              O fluxo começa aqui. Arraste a conexão de Norte para criar seu fluxo.
            </p>
            <div className="flex gap-2">
              <div style={{ backgroundColor: "#50f116", borderRadius: 9999, height: 28, display: "inline-flex", alignItems: "center", paddingInline: 10, fontSize: 10, fontWeight: 600, color: "#111" }}>Enviar no whatsapp</div>
              <div style={{ backgroundColor: "#222", borderRadius: 9999, height: 28, display: "inline-flex", alignItems: "center", paddingInline: 10, fontSize: 10, fontWeight: 600, color: "white" }}>Iniciar com Instagram</div>
            </div>
          </div>
        </WipeReveal>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-full px-6">
      <WipeReveal>
        <div style={{ backgroundColor: "#1a1a1a", borderRadius: 24, padding: 24, width: "100%", maxWidth: 310, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#ff0000", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
          <div className="font-display" style={{ ...GLANCYR_BOLD_CONDENSED, fontSize: 22, color: "white", marginBottom: 8 }}>Maestro</div>
          <p className="font-display" style={{ ...GLANCYR_LIGHT_CONDENSED, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>Interação configurada e inteligência artificial treinada</p>
        </div>
      </WipeReveal>
    </div>
  );
}

/* ---- Phase 04 Content Cards ---- */

function Phase04Content({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <WipeReveal>
          <div className="grid grid-cols-2 gap-3" style={{ width: "100%", maxWidth: 310 }}>
            {[
              { value: "230", sub: "Mensagens Enviadas", green: true },
              { value: "244,4%", sub: "", green: true },
              { value: "76,2%", sub: "", green: false },
              { value: "21 (82%)", sub: "", green: true },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 14, textAlign: "center" }}>
                <div className="font-display" style={{ ...GLANCYR_BOLD_CONDENSED, fontSize: 22, color: s.green ? "#50f116" : "white" }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>✓ {s.sub}</div>}
              </div>
            ))}
          </div>
        </WipeReveal>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <WipeReveal>
          <div style={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 24, padding: 20, width: "100%", maxWidth: 310 }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>Nova Jornada</span>
              <span style={{ backgroundColor: "#50f116", borderRadius: 9999, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#111" }}>Ativa</span>
            </div>
            <div className="flex gap-4">
              {[["58", "leads"], ["89%", "abertura"], ["1h", "tempo"]].map(([v, l]) => (
                <div key={l} style={{ fontSize: 12, color: "#555" }}><strong style={{ color: "#111" }}>{v}</strong> {l}</div>
              ))}
            </div>
          </div>
        </WipeReveal>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center h-full px-8">
      <WipeReveal>
        <div className="font-display" style={{ ...GLANCYR_BOLD_CONDENSED, fontSize: 16, color: "white", marginBottom: 16 }}>Funil de Oportunidade</div>
        <div className="flex flex-col gap-3">
          {[
            { label: "Leads", pct: 90, color: "#50f116" },
            { label: "Qualificados", pct: 65, color: "#f7990c" },
            { label: "Propostas", pct: 40, color: "#0c62f7" },
            { label: "Fechados", pct: 20, color: "#ff0000" },
          ].map((b, i) => (
            <div key={i}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 2, display: "block" }}>{b.label}</span>
              <div style={{ height: 18, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div style={{ width: `${b.pct}%`, height: "100%", backgroundColor: b.color, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      </WipeReveal>
    </div>
  );
}

function ContentCard({ phaseIndex, contentIndex, bubbleIndex }: { phaseIndex: number; contentIndex: number; bubbleIndex: number }) {
  if (phaseIndex === 0) return <Phase01Content index={contentIndex} />;
  if (phaseIndex === 1) return <Phase02Content index={contentIndex} bubbleIndex={bubbleIndex} />;
  if (phaseIndex === 2) return <Phase03Content index={contentIndex} />;
  return <Phase04Content index={contentIndex} />;
}

/* ---- Main Component ---- */

export function OperationPhases() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [contentOpacity, setContentOpacity] = useState(1);
  const [shellOpacity, setShellOpacity] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [bubbleIndex, setBubbleIndex] = useState(0);

  const phase = phases[phaseIndex];
  const totalSteps = getStepCount(phase);
  const isIntro = stepIndex === 0;
  const isChecklist = stepIndex === 1;
  const isContent = stepIndex >= 2;
  const contentIndex = stepIndex - 2;

  const progressText = phase.progressPerStep[Math.min(stepIndex, phase.progressPerStep.length - 1)];

  const advanceStep = useCallback(() => {
    const nextStep = stepIndex + 1;
    if (nextStep < totalSteps) {
      // Within same phase: fade content only, bottom bar stays
      setContentOpacity(0);
      setTimeout(() => {
        setStepIndex(nextStep);
        setCarouselIndex(0);
        setBubbleIndex(0);
        setContentOpacity(1);
      }, 350);
    } else {
      // Phase change: fade entire shell
      setShellOpacity(0);
      setTimeout(() => {
        const nextPhase = (phaseIndex + 1) % phases.length;
        setPhaseIndex(nextPhase);
        setStepIndex(0);
        setCarouselIndex(0);
        setBubbleIndex(0);
        setContentOpacity(1);
        setShellOpacity(1);
      }, 400);
    }
  }, [stepIndex, totalSteps, phaseIndex]);

  // Auto-advance steps
  useEffect(() => {
    const isLastContentPhase2 = phaseIndex === 1 && isContent && contentIndex === phase.contentCards - 1;
    const duration = isIntro ? 2000 : isChecklist ? 8000 : isLastContentPhase2 ? 5000 : 2500;
    const t = setTimeout(advanceStep, duration);
    return () => clearTimeout(t);
  }, [phaseIndex, stepIndex, advanceStep, isIntro, isChecklist, isContent, contentIndex, phase.contentCards]);

  // Carousel auto-scroll (all phases during checklist step)
  useEffect(() => {
    if (!isChecklist) return;
    const interval = setInterval(() => {
      setCarouselIndex((c) => c < STRIP_LEN - 4 ? c + 1 : c);
    }, 1800);
    return () => clearInterval(interval);
  }, [isChecklist, phaseIndex]);

  // Bubble carousel for Phase 02 last content card
  useEffect(() => {
    if (!(phaseIndex === 1 && isContent && contentIndex === phase.contentCards - 1)) return;
    const interval = setInterval(() => {
      setBubbleIndex((c) => c < BUBBLE_STRIP - 5 ? c + 1 : c);
    }, 1200);
    return () => clearInterval(interval);
  }, [phaseIndex, isContent, contentIndex, phase.contentCards]);

  const showBottomBar = !isIntro;

  return (
    <div className="w-full max-w-[384px]">
      {/* Card shell */}
      <div
        style={{
          width: "100%",
          maxWidth: 384,
          height: 429,
          borderRadius: 62,
          border: "1px solid #ff0000",
          opacity: shellOpacity,
          transition: "opacity 0.4s ease",
          backgroundColor: phase.bg,
        }}
        className="relative overflow-hidden"
      >
        {/* Content area — fades between sub-cards */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: contentOpacity,
            transition: "opacity 0.35s ease",
          }}
        >
          {/* INTRO */}
          {isIntro && (
            <div className="flex flex-col items-start justify-center h-full" style={{ padding: 32 }}>
              <PhaseIcon size={18} />
              <div
                className="font-display"
                style={{ ...GLANCYR_THIN_CONDENSED_OBLIQUE, fontSize: 28, color: "white", marginTop: 8 }}
              >
                FASE {phase.number}
              </div>
              <div
                className="font-display"
                style={{ ...GLANCYR_BOLD_CONDENSED, fontSize: 31, color: "white", marginTop: 2 }}
              >
                {phase.title}
              </div>
            </div>
          )}

          {/* CHECKLIST — Slot-machine carousel (all phases) */}
          {isChecklist && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ bottom: 100, paddingLeft: 24, paddingRight: 24 }}>
              <SlotCarousel items={phase.carouselItems} carouselIndex={carouselIndex} />
            </div>
          )}

          {/* CONTENT */}
          {isContent && (
            <div style={{ position: "absolute", inset: 0, bottom: 80 }}>
              <ContentCard phaseIndex={phaseIndex} contentIndex={contentIndex} bubbleIndex={bubbleIndex} />
            </div>
          )}
        </div>

        {/* Bottom bar — outside contentOpacity so it stays fixed */}
        {showBottomBar && (
          <BottomBar phase={phase} progressText={progressText} />
        )}
      </div>
    </div>
  );
}
