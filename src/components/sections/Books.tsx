import Image from "next/image";
import {
  GLANCYR_MEDIUM_EXPANDED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
} from "@/lib/typography";

const BOOKS = [
  {
    title: "CHAT FIRST",
    url: "https://chatfirst.com.br/",
    subtitle: "A RENDIÇÃO DAS MÁQUINAS.\nCOMO REDESENHAR EMPRESAS PARA\nOPERAR POR LINGUAGEM NATURAL",
    hook: "A interface está morrendo.\nA conversa está nascendo.",
    body: "Por 110 anos, empresas ensinaram humanos a operar máquinas: formulários, cliques, menus, apps. Esse paradigma acabou — e as empresas que não se adaptarem serão deixadas para trás. Chat First apresenta o conceito de linguagem natural como a nova interface do negócio: onde tudo que pode virar conversa, vira.",
    meta: ["DANIEL REGINATTO • 2026", "201 PÁGINAS", "LIVRO FÍSICO E E-BOOK", "Kindle · PDF · EPUB"],
    bullets: [
      "Os 10 princípios inegociáveis do paradigma conversacional — e por que eles já estão acontecendo",
      "A Matriz Conversacional: como mapear seus processos atuais e transformá-los em fluxos de chat",
      "Por que Chat First não é sobre tecnologia — é sobre como as pessoas querem se relacionar com marcas",
      "Como implementar sem precisar refazer tudo de uma vez — o caminho incremental que funciona",
      "O papel da IA conversacional nessa transformação — e como a Redrive já entrega isso hoje",
    ],
    mockup: "/images/book-chatfirst-mockup.png",
    mockupMobile: "/images/book-chatfirst-mobile.png",
    cardBg: "bg-gradient-to-b from-vermelho-redrive to-[#900]",
    outerBg: "",
    textColor: "text-white",
    badgeBg: "bg-[rgba(255,0,0,0.5)] border-vermelho-redrive",
    btnBg: "bg-[#a00] border-[#ff7c7c]",
    btnText: "text-white",
    bulletBorder: "border-white/20",
    badges: ["/images/badge-amazon-bestseller.png", "/images/badge-amazon-seller.png"],
  },
  {
    title: "A MAGIA DA CONVERSA",
    url: "https://magiadaconversa.com.br/",
    subtitle: "CONECTE-SE, INFLUENCIE E VENDA\nA FÓRMULA SECRETA PARA CONSTRUIR\nRELACIONAMENTOS LUCRATIVOS",
    hook: "Como parar de perseguir leads e construir uma máquina de vendas previsível pelo WhatsApp.",
    body: "O WhatsApp é o canal de vendas mais usado no Brasil — e também o mais mal usado. A maioria das equipes dispara mensagens sem contexto, sem método e sem cadência. Este livro ensina o caminho oposto: como transformar cada conversa em uma oportunidade real, com abordagem, timing e personalização que geram resposta.",
    meta: ["DANIEL REGINATTO • 2025", "208 PÁGINAS", "LIVRO FÍSICO E E-BOOK", "Kindle · PDF · EPUB"],
    bullets: [
      "Por que venda ativa é diferente de venda invasiva — e como fazer a distinção na prática",
      "Pirâmide de Holmes: como identificar quem está pronto para comprar agora e focar neles primeiro",
      "A anatomia de uma conversa que converte — do primeiro \"oi\" ao fechamento",
      "Como escalar o atendimento pelo WhatsApp sem perder o toque humano que gera confiança",
      "Segmentação inteligente: mensagem certa, para a pessoa certa, na hora certa",
    ],
    mockup: "/images/book-magia-mockup.png",
    mockupMobile: "/images/book-magia-mockup.png",
    cardBg: "bg-gradient-to-b from-[#ffe4b4] to-[#ba8931]",
    outerBg: "",
    textColor: "text-black",
    badgeBg: "bg-[rgba(236,190,111,0.5)] border-[#dea236]",
    btnBg: "bg-[#c59847] border-[#9d6f1f]",
    btnText: "text-black",
    bulletBorder: "border-black/20",
    badges: [],
  },
];

function BookCardDesktop({ book }: { book: (typeof BOOKS)[number] }) {
  return (
    <div className="relative hidden lg:block" style={{ minHeight: 772 }}>
      <div
        className="pointer-events-none absolute z-10"
        style={{ width: 426, height: 519, left: 70, top: -130 }}
      >
        <Image src={book.mockup} alt={book.title} fill className="object-contain object-left-bottom" sizes="400px" />
      </div>

      <div className={`relative overflow-hidden rounded-[174px] px-16 py-16 ${book.cardBg}`} style={{ minHeight: 772 }}>
        <div className="grid gap-8 lg:grid-cols-[460px_1fr]">
          <div className="flex flex-col justify-between">
            <div style={{ height: 300 }} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {book.meta.map((m) => (
                <span key={m} className={`flex items-center justify-center whitespace-nowrap rounded-[11px] border px-2 font-display ${book.badgeBg} ${book.textColor}`} style={{ height: 24, fontSize: 14, ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
                  {m}
                </span>
              ))}
            </div>
            <div className="mt-auto">
              <p className={`mt-10 text-base ${book.textColor}`}>Quer conhecer mais sobre o livro:</p>
              <a href={book.url} target="_blank" rel="noopener noreferrer" className={`btn-lp mt-3 flex w-[268px] items-center justify-center gap-3 rounded-[19px] border font-display ${book.btnBg} ${book.btnText}`} style={{ height: 50, fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}>
                Conheça mais <span className="text-lg">→</span>
              </a>
            </div>
          </div>
          <div>
            <div className="flex items-start gap-4">
              <h3 className={`font-display ${book.textColor}`} style={{ fontSize: 40, lineHeight: "44px", fontWeight: 1000, fontStretch: "100%", fontStyle: "oblique", fontVariationSettings: '"wght" 1000, "wdth" 100, "obli" 1' }}>
                {book.title}
              </h3>
              {book.badges.length > 0 && (
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  {book.badges.map((b, i) => (
                    <Image key={i} src={b} alt="Amazon" width={i === 0 ? 122 : 126} height={i === 0 ? 122 : 126} className="object-contain" style={{ width: i === 0 ? 122 : 126, height: i === 0 ? 122 : 126 }} />
                  ))}
                </div>
              )}
            </div>
            <p className={`whitespace-pre-line font-display uppercase ${book.textColor}`} style={{ marginTop: 10, fontSize: 22, lineHeight: "30px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              {book.subtitle}
            </p>
            <p className={`mt-2 whitespace-pre-line text-lg font-semibold ${book.textColor}`} style={{ lineHeight: "26px" }}>{book.hook}</p>
            <p className={`mt-6 text-base leading-relaxed ${book.textColor}`} style={{ maxWidth: 592 }}>{book.body}</p>
            <ul className="mt-6">
              {book.bullets.map((b, i) => (
                <li key={i}>
                  <div className={`border-t ${book.bulletBorder}`} />
                  <div className={`flex items-start gap-3 py-3 font-display ${book.textColor}`} style={{ fontSize: 16, lineHeight: "24px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "#67D43F" }} />
                    {b}
                  </div>
                </li>
              ))}
              <div className={`border-t ${book.bulletBorder}`} />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookCardMobile({ book }: { book: (typeof BOOKS)[number] }) {
  return (
    <div className="relative lg:hidden">
      {/* Card — image sits inside with 20% overflow at top */}
      <div className={`relative overflow-visible rounded-[90px] px-5 pb-10 ${book.cardBg}`} style={{ paddingTop: 60 }}>
        {/* Mockup — 80% inside card, 20% overflows top */}
        <div className="pointer-events-none relative z-10 mx-auto" style={{ width: 268, height: 305, marginTop: -120 }}>
          <Image src={book.mockupMobile || book.mockup} alt={book.title} fill className="object-contain" sizes="268px" />
        </div>

        {/* Meta badges 2×2 */}
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
          {book.meta.map((m) => (
            <span key={m} className={`flex items-center justify-center whitespace-nowrap rounded-[11px] border px-2 font-display ${book.badgeBg} ${book.textColor}`} style={{ height: 24, fontSize: 13, ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
              {m}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className={`mt-6 text-center font-display ${book.textColor}`} style={{ fontSize: 34, lineHeight: "36px", fontWeight: 1000, fontStretch: "100%", fontStyle: "oblique", fontVariationSettings: '"wght" 1000, "wdth" 100, "obli" 1' }}>
          {book.title}
        </h3>

        {/* Subtitle */}
        <p className={`mt-4 text-center font-display uppercase ${book.textColor}`} style={{ fontSize: 18, lineHeight: "24px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
          {book.subtitle.replace(/\n/g, " ")}
        </p>

        {/* Hook */}
        <p className={`mt-4 text-center font-semibold ${book.textColor}`} style={{ fontSize: 15, lineHeight: "22px" }}>
          {book.hook.replace(/\n/g, " ")}
        </p>

        {/* Body */}
        <p className={`mt-4 text-center ${book.textColor}`} style={{ fontSize: 14, lineHeight: "20px" }}>
          {book.body}
        </p>

        {/* Bullets with separators */}
        <ul className="mt-6 px-2">
          {book.bullets.map((b, i) => (
            <li key={i}>
              <div className={`border-t ${book.bulletBorder}`} />
              <div className={`flex items-start gap-2 py-3 font-display ${book.textColor}`} style={{ fontSize: 16, lineHeight: "22px", ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "#67D43F" }} />
                {b}
              </div>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <div className="mt-6 flex justify-center">
          <a href={book.url} target="_blank" rel="noopener noreferrer" className={`btn-lp flex items-center justify-center gap-3 rounded-[19px] border font-display ${book.btnBg} ${book.btnText}`} style={{ width: 260, height: 50, fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}>
            Conheça mais <span className="text-lg">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function BookCard({ book }: { book: (typeof BOOKS)[number] }) {
  return (
    <>
      <BookCardDesktop book={book} />
      <BookCardMobile book={book} />
    </>
  );
}

export function Books() {
  return (
    <section id="livros" className="relative px-6 py-28 lg:px-16 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <h2
          className="text-center font-display leading-[1.05]"
          id="livros-title"
          style={{ fontSize: "58px", ...GLANCYR_MEDIUM_EXPANDED }}
        >
          <span className="text-bege-texto">Dois livros</span>
          <br />
          <span className="text-vermelho-redrive" style={{ textShadow: "0 4px 6px rgba(255,0,0,0.38)" }}>
            Duas mudanças
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-base text-camurca-texto">
          Cada livro aprofunda um dos pilares do método. Juntos, formam a base conceitual e
          estratégica que a maioria dos profissionais de vendas nunca teve acesso — e que muda
          como você pensa, aborda e fecha.
        </p>

        <div className="mt-20 flex flex-col gap-16 lg:mt-[180px] lg:gap-[200px]">
          {BOOKS.map((book) => (
            <BookCard key={book.title} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
