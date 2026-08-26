import { GLANCYR_MEDIUM_EXPANDED } from "@/lib/typography";
import { OperationPhases } from "./OperationPhases";

export function PainIntro() {
  return (
    <section className="relative px-6 py-28 lg:px-16 lg:py-36">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2
            className="font-display leading-[1.1]"
            style={{ fontSize: "44px", ...GLANCYR_MEDIUM_EXPANDED }}
          >
            <span className="text-vermelho-redrive">Vender com consistência</span> não é sorte —{" "}
            <span className="text-bege-texto">é sistema</span>
          </h2>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-camurca-texto">
            <p>
              A <strong className="font-semibold text-bege-texto">Redrive</strong> é o{" "}
              <strong className="font-semibold text-bege-texto">Sistema Operacional de Vendas com IA</strong>.{" "}
              <strong className="font-semibold text-bege-texto">
                Geração de leads, ativação, atendimento com IA, CRM, automações, jornadas,
                previsibilidade — tudo conectado.
              </strong>
            </p>
            <p>
              Mas um sistema desses não vende sozinho. Sem o método por trás, é como ter uma equipe
              de alta performance sem playbook: o esforço acontece, o resultado não vem no
              potencial que poderia.
            </p>
            <p className="font-semibold text-bege-texto">
              Por isso o RedPower Full é um programa:
              <br />o Sistema Operacional de Vendas com IA e o método para operá-lo, juntos desde o dia um.
            </p>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <OperationPhases />
        </div>
      </div>
    </section>
  );
}
