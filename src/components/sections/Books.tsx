import Image from "next/image";
import { GLANCYR_MEDIUM_EXPANDED, GLANCYR_BOLD_EXPANDED, GLANCYR_THIN_CONDENSED_OBLIQUE } from "@/lib/typography";

const BOOKS = [
  {
    title: "CHAT FIRST",
    url: "https://chatfirst.com.br/",
    hook: "Como redesenhar empresas para operar por linguagem natural.",
    mockup: "/images/book-chatfirst-mobile.png",
    cardBg: "bg-gradient-to-b from-vermelho-redrive to-[#900]",
    textColor: "text-white",
    btnBg: "bg-[#a00] border-[#ff7c7c]",
    btnText: "text-white",
  },
  {
    title: "A MAGIA DA CONVERSA",
    url: "https://magiadaconversa.com.br/",
    hook: "A máquina de vendas previsível pelo WhatsApp.",
    mockup: "/images/book-magia-mockup.png",
    cardBg: "bg-gradient-to-b from-[#ffe4b4] to-[#ba8931]",
    textColor: "text-black",
    btnBg: "bg-[#c59847] border-[#9d6f1f]",
    btnText: "text-black",
  },
];

export function Books() {
  return (
    <section id="livros" className="relative px-6 py-20 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="flex items-center justify-center gap-2 text-sm italic text-white" style={GLANCYR_THIN_CONDENSED_OBLIQUE}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />
          Complemento do programa
        </p>
        <h2
          className="mt-2 text-center font-display leading-[1.05]"
          style={{ fontSize: 40, ...GLANCYR_MEDIUM_EXPANDED }}
        >
          <span className="text-bege-texto">Os dois livros do CEO,</span>{" "}
          <span className="text-vermelho-redrive">inclusos</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-camurca-texto">
          A base conceitual do método, para você aprofundar quando quiser. Já entram no RedPower Full
          — em formato físico e e-book.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {BOOKS.map((book) => (
            <div key={book.title} className={`flex items-center gap-5 rounded-[32px] px-6 py-6 ${book.cardBg}`}>
              <div className="relative h-[128px] w-[96px] shrink-0">
                <Image src={book.mockup} alt={book.title} fill className="object-contain" sizes="96px" />
              </div>
              <div className="min-w-0">
                <h3
                  className={`font-display ${book.textColor}`}
                  style={{ fontSize: 24, lineHeight: "26px", fontWeight: 1000, fontStretch: "100%", fontStyle: "oblique", fontVariationSettings: '"wght" 1000, "wdth" 100, "obli" 1' }}
                >
                  {book.title}
                </h3>
                <p className={`mt-2 text-sm ${book.textColor}`} style={{ lineHeight: "18px" }}>
                  {book.hook}
                </p>
                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn-lp mt-4 inline-flex items-center justify-center gap-2 rounded-[14px] border px-4 font-display ${book.btnBg} ${book.btnText}`}
                  style={{ height: 40, fontSize: 13, ...GLANCYR_BOLD_EXPANDED }}
                >
                  Conheça o livro <span className="text-base">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
