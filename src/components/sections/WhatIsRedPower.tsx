import { GLANCYR_MEDIUM_EXPANDED } from "@/lib/typography";

const AUDIENCES = [
  {
    title: "PARA QUEM JÁ É CLIENTE REDRIVE",
    body: "Você tem a ferramenta. O RedPower te dá o raciocínio que faltava para extrair o máximo de cada funcionalidade — sem tentativa e erro, sem configurar do jeito errado e perder tempo.",
  },
  {
    title: "PARA QUEM ESTÁ COMEÇANDO",
    body: "Entender o método antes de operar, encurta meses de curva de aprendizado. Você começa a construir a operação certa desde o primeiro dia — não descobrindo isso depois de 6 meses.",
  },
  {
    title: "PARA QUEM QUER RESULTADOS MAIS RÁPIDOS",
    body: "O Daniel levou anos construindo e testando esse método. No RedPower, você comprime essa curva em 8 aulas e dois livros — e aplica imediatamente na sua operação.",
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
                Ajuste, encaixe
                <br />
                e lubrifique
              </span>{" "}
              <span className="text-white">
                todas
                <br />
                as engrenagens
                <br />
                da Redrive
              </span>
            </h2>
            <div className="mt-6 max-w-sm space-y-4 text-base leading-relaxed text-camurca-texto">
              <p>
                A Redrive tem tudo que uma operação de vendas precisa para ser previsível,
                escalável e eficiente. O RedPower é o programa que te ensina a fazer isso
                acontecer — com o método certo, os livros do CEO e, se quiser, a implantação do
                nosso time.
              </p>
              <p>
                Não é mais uma série de vídeos.{" "}
                <strong className="font-extrabold text-bege-texto">
                  É o entendimento completo de como um Sistema Operacional de Vendas funciona
                </strong>{" "}
                — fase por fase, engrenagem por engrenagem — para que você saiba não só o que
                fazer, mas porque cada decisão importa.
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
