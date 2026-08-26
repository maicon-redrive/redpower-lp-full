import { GLANCYR_BOLD_EXPANDED } from "@/lib/typography";

const JOURNEYS = [
  {
    name: "RedUp",
    bg: "rgba(153, 0, 0, 0.24)",
    border: "#ff7c7c",
    headline: "Método Redrive em vídeo com o Daniel, mais os dois livros.",
    body: "Você aprende o raciocínio por trás de cada fase e aplica na sua operação com autonomia.",
  },
  {
    name: "RedMax",
    bg: "rgba(100, 31, 28, 0.24)",
    border: "#ff0000",
    headline: "Tudo do RedUp, mais a implantação, feita junto com nosso time.",
    body: "Configuração, fluxos, agentes de IA e treinamento. A máquina montada e operando.",
  },
];

export function Journeys() {
  return (
    <section className="relative px-6 pb-28 lg:px-16 lg:pb-36" style={{ marginTop: "-40px" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-12 items-start gap-x-4 gap-y-6">
          <p
            className="col-span-12 font-display text-bege-texto lg:col-span-3"
            style={{ fontSize: "22px", lineHeight: "30px", ...GLANCYR_BOLD_EXPANDED }}
          >
            O <span className="text-vermelho-redrive">RedPower</span> tem
            <br />
            duas jornadas:
          </p>

          {JOURNEYS.map((j, i) => (
            <div
              key={j.name}
              className={`col-span-12 rounded-[62px] border px-7 py-10 lg:col-span-4 ${i === 0 ? "lg:col-start-4" : "lg:col-start-9"}`}
              style={{ backgroundColor: j.bg, borderColor: j.border, height: "269px" }}
            >
                <p
                  className="font-display text-bege-texto"
                  style={{ fontSize: "22px", ...GLANCYR_BOLD_EXPANDED }}
                >
                  {j.name}
                </p>
                <div className="my-4 h-px w-5/6" style={{ backgroundColor: j.border }} />
                <p className="font-bold text-bege-texto">{j.headline}</p>
                <p className="mt-3 text-sm leading-relaxed text-bege-texto/90">{j.body}</p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
