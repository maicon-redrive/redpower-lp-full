import Image from "next/image";
import { LavaBackground } from "./LavaBackground";
import {
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_THIN_CONDENSED,
} from "@/lib/typography";

const CARDS = [
  {
    title: "Configuração completa da plataforma",
    icon: "/images/impl-icon-config.png",
    body: "Seu ambiente Redrive configurado do zero: canais conectados, setores criados, permissões definidas e estrutura pronta para operar. Sem improviso, sem configuração errada.",
  },
  {
    title: "Fluxos de captação e jornadas de ativação",
    icon: "/images/impl-icon-flows.png",
    body: "Auxiliamos sua equipe a montar os fluxos de geração de leads e as jornadas de comunicação para cada etapa do funil — WhatsApp, e-mail e SMS integrados com contexto e estratégia.",
  },
  {
    title: "Agentes de IA configurados para vender",
    icon: "/images/impl-icon-ai.png",
    body: "O Maestro e os agentes ativos configurados para o seu produto, seu público e suas objeções. Uma IA que fala como seu melhor vendedor — não como um robô genérico.",
  },
  {
    title: "CRM e pipeline estruturados",
    icon: "/images/impl-icon-crm.png",
    body: "Funis, etapas e campos configurados para o seu processo comercial. Metodologias ativas (SPIN, BANT, AIDA) aplicadas nas conversas desde o primeiro dia.",
  },
];

export function Implementation() {
  return (
    <section id="implantacao" className="relative px-6 py-28 lg:px-16 lg:py-36">
      <div className="pointer-events-none absolute inset-0" style={{ overflowX: "clip", overflowY: "visible" }}>
        <LavaBackground />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Label */}
        <p
          className="flex items-center gap-2 text-white"
          style={{ fontSize: 16, lineHeight: "24px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />
          Exclusivo do RedMax
        </p>
      </div>

      {/* Ghost title — desktop: full width, overflows grid */}
      <p
        className="relative mt-4 hidden font-display uppercase whitespace-nowrap overflow-visible lg:block"
        style={{
          fontSize: "clamp(48px, 10.5vw, 159px)",
          lineHeight: 1.1,
          paddingTop: "0.1em",
          opacity: 0.5,
          background: "linear-gradient(to top, #170f0f 4.23%, red 158.72%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          ...GLANCYR_BOLD_EXPANDED,
        }}
      >
        IMPLANTAÇÃO
      </p>

      {/* Ghost title — mobile: gradient text with red stroke */}
      <p
        className="relative mx-auto mt-4 max-w-6xl px-6 text-center font-display uppercase lg:hidden"
        style={{
          fontSize: "clamp(32px, 9vw, 40px)",
          lineHeight: 1.1,
          opacity: 0.5,
          background: "linear-gradient(to top, #170f0f 4.23%, red 158.72%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          WebkitTextStroke: "1px var(--vermelho-redrive)",
          ...GLANCYR_BOLD_EXPANDED,
        }}
      >
        IMPLANTAÇÃO
      </p>

      <div className="relative mx-auto mt-4 max-w-6xl lg:-mt-10">
        {/* Two-column: text + dashboard */}
        <div className="grid gap-10 lg:grid-cols-[592px_1fr] lg:items-start">
          <div>
            {/* Headline */}
            <p
              className="font-display text-bege-texto"
              style={{ fontSize: 22, lineHeight: "30px", fontStretch: "100%", fontVariationSettings: '"wght" 550, "wdth" 100' }}
            >
              O método te dá o raciocínio. A implantação coloca tudo em prática — na sua conta, com a{" "}
              <span className="text-vermelho-redrive">sua operação, do jeito certo desde o início.</span>
            </p>

            {/* Body */}
            <div className="mt-8 text-base leading-relaxed text-bege-texto" style={{ maxWidth: 653 }}>
              <p>
                Nosso time de especialistas auxilia a sua equipe a configurar a Redrive para a sua
                realidade: estruturar os fluxos de captação, montar as jornadas de ativação,
                configurar os agentes de IA, organizar o CRM e treinar sua equipe para operar cada
                fase com autonomia.
              </p>
              <p className="mt-0">
                Você não precisa descobrir sozinho. Não precisa testar e errar durante meses.
              </p>
              <p className="mt-0 font-extrabold">
                A implantação é o atalho entre ter a ferramenta e ter a máquina funcionando.
              </p>
            </div>

            {/* Important callout */}
            <div
              className="mt-8 rounded-[35px] border border-vermelho-redrive bg-[#641f1c] px-8 py-5"
              style={{ maxWidth: 592 }}
            >
              <p className="text-sm leading-[22px] text-camurca-texto">
                <span className="font-semibold text-bege-texto">Importante: </span>
                A implantação não substitui o método — ela o complementa. Quem entende o porquê
                (método) e tem a execução feita junto com especialistas (implantação) chega muito
                mais rápido e erra muito menos.
              </p>
            </div>
          </div>

          {/* Dashboard screenshot */}
          <div className="relative hidden overflow-hidden rounded-2xl lg:block" style={{ height: 529 }}>
            <Image
              src="/images/impl-dashboard.png"
              alt="Painel Redrive"
              fill
              className="object-cover object-left-top"
              sizes="620px"
            />
          </div>
        </div>

        {/* Feature cards grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div key={card.title} className="rounded-[30px] bg-noite-cereja p-9" style={{ minHeight: 431 }}>
              <p
                className="font-display text-bege-texto"
                style={{ fontSize: 26, lineHeight: "34px", ...GLANCYR_THIN_CONDENSED }}
              >
                {card.title}
              </p>

              <div className="mt-6" style={{ width: 100, height: 103 }}>
                <Image
                  src={card.icon}
                  alt=""
                  width={100}
                  height={103}
                  className="object-contain"
                />
              </div>

              <p className="mt-6 text-sm leading-[20px] text-bege-texto">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* Training banner */}
        <div className="mt-4 grid gap-6 rounded-[30px] bg-noite-cereja p-9 lg:grid-cols-[225px_1fr_1fr]" style={{ minHeight: 141 }}>
          <p
            className="font-display text-bege-texto"
            style={{ fontSize: 26, lineHeight: "34px", ...GLANCYR_THIN_CONDENSED }}
          >
            Treinamento da equipe
          </p>

          <div style={{ width: 283, height: 102 }}>
            <Image
              src="/images/impl-icon-training.png"
              alt=""
              width={283}
              height={102}
              className="object-contain"
            />
          </div>

          <p className="text-sm leading-[20px] text-bege-texto" style={{ maxWidth: 376 }}>
            Sua equipe operando com autonomia desde o primeiro dia. Treinamos os vendedores,
            gestores e administradores para usar cada funcionalidade com intenção e resultado.
          </p>
        </div>
      </div>
    </section>
  );
}
