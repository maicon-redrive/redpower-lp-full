import { COMPARISON_ROWS } from "@/lib/plans";
import {
  GLANCYR_MEDIUM_EXPANDED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_BOLD_CONDENSED,
  GLANCYR_THIN_CONDENSED,
} from "@/lib/typography";

export function Comparison() {
  return (
    <section className="relative px-6 py-28 lg:px-16 lg:py-36">
      <div className="mx-auto max-w-[864px]">
        {/* Label */}
        <p className="flex items-center justify-center gap-2 text-white" style={{ fontSize: 16, lineHeight: "24px", ...GLANCYR_THIN_CONDENSED }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-vermelho-redrive" />
          COMPARATIVO
        </p>

        {/* Title */}
        <h2
          className="text-center font-display text-vermelho-redrive"
          style={{ fontSize: 58, lineHeight: 1.05, ...GLANCYR_MEDIUM_EXPANDED }}
        >
          O que muda entre os dois
        </h2>

        {/* Table */}
        <div className="mt-10 overflow-hidden rounded-[40px] border border-[#444343]">
          {/* Header */}
          <div className="grid grid-cols-[1fr_60px_60px] items-center rounded-t-[40px] bg-noite-cereja px-5 py-5 sm:grid-cols-[1fr_120px_120px] sm:px-10">
            <p className="font-display text-white" style={{ fontSize: 22, lineHeight: "30px", ...GLANCYR_BOLD_EXPANDED }}>
              O que está incluso
            </p>
            <p className="text-center font-display text-[#ff7c7c]" style={{ fontSize: 16, lineHeight: "22px", ...GLANCYR_BOLD_CONDENSED }}>
              RedUp Full
            </p>
            <p className="text-center font-display text-vermelho-redrive" style={{ fontSize: 16, lineHeight: "22px", ...GLANCYR_BOLD_CONDENSED }}>
              RedMax Full
            </p>
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_60px_60px] items-center border-t border-white/10 px-5 sm:grid-cols-[1fr_120px_120px] sm:px-10"
              style={{ minHeight: 55, paddingTop: 10, paddingBottom: 10 }}
            >
              <p className="font-display text-white" style={{ fontSize: 16, lineHeight: "22px", ...GLANCYR_THIN_CONDENSED }}>
                {row.label}
              </p>
              <p className="text-center" style={{ fontSize: 18 }}>
                {row.redup ? (
                  <span className="text-[#50f116]">✓</span>
                ) : (
                  <span className="font-bold text-vermelho-redrive">−</span>
                )}
              </p>
              <p className="text-center" style={{ fontSize: 18 }}>
                {row.redmax ? (
                  <span className="text-[#50f116]">✓</span>
                ) : (
                  <span className="font-bold text-vermelho-redrive">−</span>
                )}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs leading-[20px] text-bege-texto">
          *Aulas extras sem data ou quantidade fixa. Serão feitas conforme surgirem conteúdos
          relevantes.
        </p>
      </div>
    </section>
  );
}
