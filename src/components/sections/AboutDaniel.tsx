import Image from "next/image";
import { GLANCYR_MEDIUM_EXPANDED, GLANCYR_THIN_CONDENSED_OBLIQUE, GLANCYR_REGULAR } from "@/lib/typography";

const CREDENTIALS = [
  "Fundador e CEO da Redrive",
  "Diretor de tecnologia no grupo Wiser / Wise Up (~10 anos)",
  "Co-fundador do meuSucesso.com",
  "Autor de A Magia da Conversa e Chat First",
  "Redrive em +30 países",
  "+20 mil vendedores ativos",
];

export function AboutDaniel() {
  return (
    <section id="daniel" className="relative px-6 py-24 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-5xl">
        <p className="flex items-center gap-2 text-sm italic text-white" style={GLANCYR_THIN_CONDENSED_OBLIQUE}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />
          Quem está por trás do método
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr] lg:items-stretch">
          {/* Foto com moldura de borda animada */}
          <div className="mx-auto lg:mx-0 lg:h-full">
            <div className="daniel-photo-frame h-[336px] w-[224px] lg:h-full lg:w-[264px]">
              <div className="daniel-photo-inner">
                <Image
                  src="/images/daniel-reginatto.webp"
                  alt="Daniel Reginatto"
                  fill
                  className="object-cover"
                  sizes="264px"
                />
                {/* tom avermelhado escuro no fundo da foto */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "radial-gradient(120% 85% at 50% 100%, rgba(150,0,0,0.5), transparent 68%)" }}
                />
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <h2 className="font-display leading-[1.05] text-bege-texto" style={{ fontSize: 40, ...GLANCYR_MEDIUM_EXPANDED }}>
              Daniel Reginatto
            </h2>
            <p className="mt-2 font-display text-vermelho-redrive" style={{ fontSize: 16, ...GLANCYR_REGULAR }}>
              Fundador e CEO da Redrive · Autor
            </p>

            <div className="mt-5 space-y-4 text-base leading-relaxed text-camurca-texto">
              <p>
                Quase três décadas em tecnologia: foi desenvolvedor no ReclameAqui, diretor de
                tecnologia no grupo Wiser (Wise Up), do Flávio Augusto, por cerca de dez anos, e
                co-fundou o meuSucesso.com.
              </p>
              <p>
                Em 2020 fundou a <strong className="font-semibold text-bege-texto">Redrive</strong> para
                resolver um problema de escala que viveu na pele. Com um método próprio de vendas pelo
                WhatsApp, já ajudou milhares de empresas em{" "}
                <strong className="font-semibold text-bege-texto">mais de 30 países</strong> — a Redrive
                cresceu 3.000% no primeiro ano e hoje passa de 20 mil vendedores ativos.
              </p>
              <p>
                É autor de <strong className="font-semibold text-bege-texto">A Magia da Conversa</strong>{" "}
                e <strong className="font-semibold text-bege-texto">Chat First</strong>. O método do
                RedPower Full nasce dessa trajetória — anos de operação real de vendas, destilados em aula.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {CREDENTIALS.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-vermelho-redrive/60 bg-vermelho-redrive/10 px-3 py-1 text-xs text-bege-texto"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
