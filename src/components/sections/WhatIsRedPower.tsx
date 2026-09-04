import { GLANCYR_MEDIUM_EXPANDED } from "@/lib/typography";

const AUDIENCES = [
  {
    title: "O MÉTODO",
    body: "Nascido de anos de operação real de vendas do nosso CEO — testado e ajustado na prática. 8 aulas com o Daniel e dois livros (como complemento) que mostram o que fazer em cada fase, e por quê.",
  },
  {
    title: "A FERRAMENTA",
    body: "1 ano de Redrive Enterprise, o Sistema Operacional de Vendas Agênticas, para a operação rodar de verdade — com IA embarcada vendendo em cada etapa.",
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
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />O que é o
          RedPower
        </p>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12">
          <div className="col-span-12 lg:col-span-5">
            <h2
              className="font-display leading-[1.05]"
              style={{ fontSize: "44px", ...GLANCYR_MEDIUM_EXPANDED }}
            >
              <span className="text-[#ff0000]">
                Método, ferramenta
                <br />
                e acompanhamento
              </span>{" "}
              <span className="text-white">
                — tudo num
                <br />
                só programa
              </span>
            </h2>
            <div className="mt-6 max-w-sm space-y-4 text-base leading-relaxed text-camurca-texto">
              <p>
                O <strong className="font-extrabold text-bege-texto">RedPower Full</strong> reúne
                tudo que uma operação de vendas precisa para sair do papel:{" "}
                <strong className="font-extrabold text-bege-texto">
                  o método, a ferramenta e o acompanhamento
                </strong>{" "}
                — juntos, do primeiro dia à primeira venda.
              </p>
              <p>
                O método não é teoria de internet: nasceu de{" "}
                <strong className="font-extrabold text-bege-texto">
                  anos de operação real de vendas do nosso CEO
                </strong>
                , testado e ajustado na prática. E não para na aula — nosso time acompanha a
                implantação para garantir que a operação realmente entre no ar.
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
