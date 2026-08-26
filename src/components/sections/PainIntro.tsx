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
            <span className="text-vermelho-redrive">Ter a ferramenta certa</span> não é o mesmo que{" "}
            <span className="text-bege-texto">operar no limite dela</span>
          </h2>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-camurca-texto">
            <p>
              A <strong className="font-semibold text-bege-texto">Redrive</strong> é um{" "}
              <strong className="font-semibold text-bege-texto">Sistema Operacional de Vendas</strong>{" "}
              completo.{" "}
              <strong className="font-semibold text-bege-texto">
                Geração de leads, ativação, atendimento com IA, CRM, automações, jornadas,
                previsibilidade — tudo conectado.
              </strong>
            </p>
            <p>
              Mas usar a ferramenta sem entender o método por trás é como ter uma equipe de alta
              performance e não dar playbook pra eles. O esforço acontece. O resultado não vem no
              potencial que poderia.
            </p>
            <p className="font-semibold text-bege-texto">
              O problema não é a plataforma.
              <br />É a ausência de método para operá-la.
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
