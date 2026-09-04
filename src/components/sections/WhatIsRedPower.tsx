import { GLANCYR_MEDIUM_EXPANDED } from "@/lib/typography";

const AUDIENCES = [
  {
    title: "A FERRAMENTA",
    body: "A Redrive: geração de leads, atendimento com agentes de IA, CRM e jornadas num só sistema, com IA vendendo em cada etapa. 1 ano de Redrive Enterprise incluso.",
  },
  {
    title: "O MÉTODO",
    body: "Nascido de anos de operação real de vendas do nosso CEO. 8 aulas com o Daniel e dois livros que mostram o que fazer em cada fase, e por quê.",
  },
  {
    title: "O ACOMPANHAMENTO",
    body: "No RedMax Full, nosso time implanta a Redrive com você: configura o ambiente, cria os fluxos, ativa os agentes de IA e treina a sua equipe.",
  },
];

export function WhatIsRedPower() {
  return (
    <section id="redpower" className="relative z-10 px-6 py-28 lg:px-16 lg:pb-20 lg:pt-36">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 flex items-center gap-2 text-sm italic text-white">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />O que é a
          Redrive
        </p>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12">
          <div className="col-span-12 lg:col-span-5">
            <h2
              className="font-display leading-[1.05]"
              style={{ fontSize: "44px", ...GLANCYR_MEDIUM_EXPANDED }}
            >
              <span className="text-[#ff0000]">
                A Redrive faz
                <br />
                a operação girar.
              </span>{" "}
              <span className="text-white">
                O programa faz
                <br />
                ela vender por você.
              </span>
            </h2>
            <div className="mt-6 max-w-sm space-y-4 text-base leading-relaxed text-camurca-texto">
              <p>
                A <strong className="font-extrabold text-bege-texto">Redrive</strong> é o{" "}
                <strong className="font-extrabold text-bege-texto">
                  Sistema Operacional de Vendas Agênticas
                </strong>{" "}
                — um só lugar onde a operação inteira acontece. Ela capta e qualifica leads, atende
                com agentes de IA que conversam como seus melhores vendedores, organiza tudo num CRM
                e conduz cada contato por jornadas automáticas até a venda.
              </p>
              <p>
                Mas ferramenta poderosa não entrega sozinha. O{" "}
                <strong className="font-extrabold text-bege-texto">RedPower Full</strong> soma o
                método — nascido de anos de operação real de vendas do nosso CEO — e o
                acompanhamento do nosso time na implantação, para a Redrive rodar de verdade no seu
                negócio desde o começo.
              </p>
              <p>
                Quem entende o método opera diferente.
                <br />
                Configura diferente. Cresce diferente.
              </p>
            </div>
          </div>

          <div className="col-span-12 flex flex-col gap-6 lg:col-span-7 lg:col-start-6">
            {AUDIENCES.map((a) => (
              <div
                key={a.title}
                className="grid max-w-full gap-2 overflow-hidden border border-transparent px-6 py-7 lg:px-10 lg:py-9 sm:grid-cols-[1fr_1.4fr] sm:items-start"
                style={{
                  borderRadius: "clamp(30px, 8vw, 66px)",
                  background:
                    "linear-gradient(to right, var(--vermelho-redrive), #900) padding-box, linear-gradient(to left, var(--vermelho-redrive), #900) border-box",
                }}
              >
                <h3
                  className="w-[182px] font-display uppercase text-white"
                  style={{
                    fontSize: "26px",
                    lineHeight: "34px",
                    fontWeight: 250,
                    fontStretch: "75%",
                    fontVariationSettings: '"wght" 250, "wdth" 75',
                  }}
                >
                  {a.title}
                </h3>
                <p className="text-base text-bege-texto" style={{ lineHeight: "24px" }}>
                  {a.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
