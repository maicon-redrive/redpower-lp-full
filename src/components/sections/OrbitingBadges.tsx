"use client";

import { useEffect, useState } from "react";

const ALL_BADGES = [
  // 4 originais do Figma
  "RELATÓRIOS",
  "AGENTES DE IA",
  "JORNADAS",
  "REDRIVE 360º",
  // 10 sugeridos
  "AUTOMAÇÕES",
  "DASHBOARDS",
  "CHATBOTS",
  "CRM INTEGRADO",
  "FUNIS DE VENDA",
  "METODOLOGIA DE VENDAS COM IA",
  "OMNICHANNEL",
  "MÉTRICAS",
  "LEADS SCORING",
  "TEMPLATES",
];

const VISIBLE = 4;
const CYCLE_MS = 4000;

const SLOTS = [
  { x: -220, y: -50, orbit: "orbit-tl" },
  { x: 100, y: -70, orbit: "orbit-tr" },
  { x: -200, y: 80, orbit: "orbit-bl" },
  { x: 130, y: 55, orbit: "orbit-br" },
] as const;

export function OrbitingBadges() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((o) => (o + VISIBLE) % ALL_BADGES.length);
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  const visible = Array.from({ length: VISIBLE }, (_, i) =>
    ALL_BADGES[(offset + i) % ALL_BADGES.length]
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes orbit-tl {
  0%   { transform: translate(0px, 0px); }
  14%  { transform: translate(30px, -20px); }
  28%  { transform: translate(-15px, -35px); }
  42%  { transform: translate(-35px, 10px); }
  56%  { transform: translate(10px, 30px); }
  70%  { transform: translate(25px, -15px); }
  85%  { transform: translate(-20px, 20px); }
  100% { transform: translate(0px, 0px); }
}
@keyframes orbit-tr {
  0%   { transform: translate(0px, 0px); }
  12%  { transform: translate(-25px, 25px); }
  28%  { transform: translate(20px, 35px); }
  44%  { transform: translate(30px, -15px); }
  58%  { transform: translate(-15px, -30px); }
  72%  { transform: translate(-30px, 10px); }
  88%  { transform: translate(15px, -20px); }
  100% { transform: translate(0px, 0px); }
}
@keyframes orbit-bl {
  0%   { transform: translate(0px, 0px); }
  16%  { transform: translate(35px, 15px); }
  32%  { transform: translate(-10px, 35px); }
  48%  { transform: translate(-30px, -10px); }
  62%  { transform: translate(15px, -30px); }
  78%  { transform: translate(25px, 20px); }
  90%  { transform: translate(-20px, -15px); }
  100% { transform: translate(0px, 0px); }
}
@keyframes orbit-br {
  0%   { transform: translate(0px, 0px); }
  18%  { transform: translate(-30px, -25px); }
  34%  { transform: translate(15px, -35px); }
  50%  { transform: translate(35px, 15px); }
  66%  { transform: translate(-10px, 30px); }
  80%  { transform: translate(-25px, -10px); }
  92%  { transform: translate(20px, -20px); }
  100% { transform: translate(0px, 0px); }
}
@keyframes badge-in {
  0%   { opacity: 0; scale: 0.6; filter: blur(6px); }
  100% { opacity: 1; scale: 1;   filter: blur(0px); }
}
@keyframes badge-out {
  0%   { opacity: 1; scale: 1;   filter: blur(0px); }
  100% { opacity: 0; scale: 0.6; filter: blur(6px); }
}
          `,
        }}
      />
      {SLOTS.map((slot, i) => (
        <span
          key={`${offset}-${i}`}
          className="pointer-events-none absolute left-1/2 top-1/2 z-40 flex items-center gap-2 whitespace-nowrap rounded-full border border-vermelho-redrive bg-vermelho-redrive/50 px-3 py-1 text-[11px] italic text-white backdrop-blur-sm"
          style={{
            marginLeft: slot.x,
            marginTop: slot.y,
            animation: `badge-in 0.6s ease-out, ${slot.orbit} ${6 + i * 1.3}s ease-in-out infinite, badge-out 0.5s ease-in ${CYCLE_MS - 600}ms forwards`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {visible[i]}
        </span>
      ))}
    </>
  );
}
