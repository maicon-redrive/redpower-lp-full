import { RedriveLogoWhite } from "@/components/icons/RedriveLogoWhite";
import { GLANCYR_BOLD_EXPANDED } from "@/lib/typography";

const SOCIAL_LINKS = [
  { label: "Facebook", icon: "/images/social-facebook.svg", href: "#" },
  { label: "Instagram", icon: "/images/social-instagram.svg", href: "#" },
  { label: "LinkedIn", icon: "/images/social-linkedin.svg", href: "#" },
  { label: "YouTube", icon: "/images/social-youtube.svg", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-vermelho-redrive px-6 py-16 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-10">
        <div>
          <p className="text-2xl font-light text-white">Ficou com alguma dúvida?</p>
          <div className="mt-2 flex flex-wrap items-center gap-6">
            <h2
              className="max-w-lg font-display uppercase leading-tight text-white"
              style={{ fontSize: "40px", ...GLANCYR_BOLD_EXPANDED }}
            >
              Converse com um consultor agora
            </h2>
            <a
              href="#contato"
              className="btn-lp shrink-0 rounded-full bg-noite-cereja px-8 py-3.5 font-display text-sm font-bold text-white"
            >
              Conversar agora →
            </a>
          </div>
        </div>

        <div>
          <RedriveLogoWhite className="h-8 w-auto" />
          <p className="mt-4 text-sm text-white">Acompanhe nas redes</p>
          <div className="mt-2 flex gap-2">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="block"
              >
                <img src={s.icon} alt={s.label} width={38} height={38} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-16 text-center text-sm text-white">
        2026 © Redrive - Todos os direitos reservados | Operação inteligente. Crescimento
        previsível.
      </p>
    </footer>
  );
}
