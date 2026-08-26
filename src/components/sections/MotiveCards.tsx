import Image from "next/image";
import { MagnetPeopleIcon } from "@/components/icons/MagnetPeopleIcon";

const GLANCYR_LIGHT_CONDENSED = {
  fontWeight: 400,
  fontStretch: "75%",
  fontVariationSettings: '"wght" 400, "wdth" 75',
} as const;

const GLANCYR_REGULAR = {
  fontWeight: 550,
  fontStretch: "87.5%",
  fontVariationSettings: '"wght" 550, "wdth" 87.5',
} as const;

const CARDS = [
  {
    word: "LEADS",
    lines: ["sendo gerados,", "mas sem cadência"],
    body: "A captação funciona, mas o follow-up some depois do primeiro contato. O funil enche pelo topo e vaza no meio.",
    gradientFrom: "var(--vermelho-redrive)",
    gradientTo: "#900",
    wordColor: "text-creme-destaque",
    lineColor: "text-bege-texto",
    bodyColor: "text-bege-texto",
    icon: "magnet",
    iconColor: "text-creme-destaque",
    /* cascade offsets, percentage of row width/height, from Figma node 474:7 */
    iconPos: { left: "1.3%", size: "7.2%" },
    wordPos: { left: "14%" },
    linePos: { left: "37.2%" },
  },
  {
    word: "IA ATIVA",
    lines: ["mas não configurada", "para vender"],
    body: "O Maestro e os agentes existem na conta. Mas sem o conceito certo, viram só respostas automáticas — não vendedores digitais.",
    gradientFrom: "#444343",
    gradientTo: "#0c0909",
    wordColor: "text-vermelho-redrive",
    lineColor: "text-bege-texto",
    bodyColor: "text-bege-texto",
    icon: "sparkle",
    iconColor: "",
    iconPos: { left: "4.4%", size: "10%" },
    wordPos: { left: "19.9%" },
    linePos: { left: "46.5%" },
  },
  {
    word: "CRM",
    lines: ["preenchido, mas sem", "inteligência sendo gerada"],
    body: 'Os dados estão lá. Mas sem metodologia aplicada, o pipeline é um cemitério de oportunidades marcadas como "em andamento".',
    gradientFrom: "var(--creme-destaque)",
    gradientTo: "var(--bege-texto)",
    wordColor: "text-vermelho-redrive",
    lineColor: "text-black",
    bodyColor: "text-black",
    icon: "crm",
    iconColor: "",
    iconPos: { left: "9.6%", size: "8.7%" },
    wordPos: { left: "22.1%" },
    linePos: { left: "51.6%" },
  },
] as const;

/* Paragraph anchors to the same column (≈ start of the 10th of 12 columns) on every row. */
const PARAGRAPH_LEFT = "76.9%";

export function MotiveCards() {
  return (
    <section className="bg-background px-4 py-16 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        {CARDS.map((card) => (
          <div key={card.word}>
            {/* Desktop: original aspect-ratio layout */}
            <div
              className="relative hidden w-full lg:block"
              style={{ aspectRatio: "1216/219", containerType: "size" }}
            >
              <div
                className="absolute left-1/2 top-1/2 h-full -translate-x-1/2 -translate-y-1/2 border border-transparent"
                style={{
                  width: "110.61%",
                  borderRadius: "37.44cqh",
                  background: `linear-gradient(to right, ${card.gradientFrom}, ${card.gradientTo}) padding-box, linear-gradient(to left, ${card.gradientFrom}, ${card.gradientTo}) border-box`,
                }}
              />

              <div
                className={`absolute top-1/2 aspect-square -translate-y-1/2 ${card.iconColor}`}
                style={{ left: card.iconPos.left, width: card.iconPos.size }}
              >
                {card.icon === "magnet" && <MagnetPeopleIcon className="size-full" />}
                {card.icon === "sparkle" && (
                  <Image src="/icons/ia-ativa-sparkle.png" alt="" fill className="object-contain" />
                )}
                {card.icon === "crm" && (
                  <Image src="/icons/crm-monitor.png" alt="" fill className="object-contain" />
                )}
              </div>

              <p
                className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-display uppercase leading-[1.05] ${card.wordColor}`}
                style={{
                  left: card.wordPos.left,
                  fontSize: "clamp(1.75rem, 7.945cqw, 6.04rem)",
                  ...GLANCYR_LIGHT_CONDENSED,
                }}
              >
                {card.word}
              </p>

              <div
                className={`absolute top-1/2 -translate-y-1/2 font-display text-sm leading-6 sm:text-base ${card.lineColor}`}
                style={{ left: card.linePos.left, ...GLANCYR_REGULAR }}
              >
                {card.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>

              <p
                className={`absolute top-1/2 w-[16rem] -translate-y-1/2 text-sm leading-6 sm:w-[17rem] sm:text-base ${card.bodyColor}`}
                style={{ left: PARAGRAPH_LEFT }}
              >
                {card.body}
              </p>
            </div>

            {/* Mobile: stacked layout matching Figma 460-1057 */}
            <div
              className="relative overflow-hidden rounded-[82px] border border-transparent px-[56px] py-[25px] lg:hidden"
              style={{
                background: `linear-gradient(to right, ${card.gradientFrom}, ${card.gradientTo}) padding-box, linear-gradient(to left, ${card.gradientFrom}, ${card.gradientTo}) border-box`,
              }}
            >
              <div className={`relative h-[51px] w-[51px] ${card.iconColor}`}>
                {card.icon === "magnet" && <MagnetPeopleIcon className="size-full" />}
                {card.icon === "sparkle" && (
                  <Image src="/icons/ia-ativa-sparkle.png" alt="" fill className="object-contain" />
                )}
                {card.icon === "crm" && (
                  <Image src="/icons/crm-monitor.png" alt="" fill className="object-contain" />
                )}
              </div>
              <div className="mt-1 flex items-end gap-3">
                <p
                  className={`shrink-0 font-display uppercase leading-[1.05] ${card.wordColor}`}
                  style={{ fontSize: 40, ...GLANCYR_LIGHT_CONDENSED }}
                >
                  {card.word}
                </p>
                <div className={`font-display ${card.lineColor}`} style={{ fontSize: 13, lineHeight: "16px", ...GLANCYR_REGULAR }}>
                  {card.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
              <p className={`mt-4 ${card.bodyColor}`} style={{ fontSize: 15, lineHeight: "20px" }}>
                {card.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
