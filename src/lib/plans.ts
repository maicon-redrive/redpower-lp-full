export type PlanSlug = "redup" | "redmax" | "redup-full" | "redmax-full";

/** Standalone method plans (no bundled Redrive subscription). */
export type BasePlanSlug = "redup" | "redmax";

/** Redrive Enterprise subscription price, per month, in cents. */
export const REDRIVE_ENTERPRISE_MONTHLY_CENTS = 69700;
/** Number of Redrive Enterprise months bundled in the RedPower Full combos. */
export const REDRIVE_COMBO_MONTHS = 12;
/** Combined value of the bundled Redrive subscription (12 × R$697), in cents. */
export const REDRIVE_COMBO_VALUE_CENTS = REDRIVE_ENTERPRISE_MONTHLY_CENTS * REDRIVE_COMBO_MONTHS;

export interface Plan {
  slug: PlanSlug;
  name: string;
  priceCents: number;
  tagline: string;
  includesImplementation: boolean;
  /** Customer must provide a shipping address for the physical books. */
  requiresShippingAddress: true;
  /** RedMax purchases require Redrive's CS team to schedule onboarding calls. */
  requiresOnboardingScheduling: boolean;
  guaranteeDays: number | null;
  features: string[];
  ctaLabel: string;
  /** Months of Redrive Enterprise subscription bundled (combos only). */
  redriveMonths?: number;
  /** Card installments offered (e.g. 12x). */
  installments?: number;
  /** Cash-payment discount, in percent (applies to the full price). */
  cashDiscountPct?: number;
  /** For combos: the standalone method plan this combo is built on. */
  basePlan?: BasePlanSlug;
  /** OPS product identifier — groups sales for monitoring + manual Redrive provisioning. */
  opsProductId?: string;
  /** Sale requires the team to manually create a Redrive account (no automation yet). */
  requiresRedriveProvisioning?: boolean;
}

export const PLANS: Record<PlanSlug, Plan> = {
  redup: {
    slug: "redup",
    name: "RedUp",
    priceCents: 99700,
    tagline:
      "A operação ganha ritmo e sobe de nível. Mais leads, mais cadência, mais previsibilidade — com o método certo na mão.",
    includesImplementation: false,
    requiresShippingAddress: true,
    requiresOnboardingScheduling: false,
    guaranteeDays: 7,
    features: [
      "Método Redrive — 8 aulas com o Daniel",
      "+ de 3h de conteúdo conceitual e estratégico",
      "Atualizações no método inclusas",
      "Aulas extras com Daniel Reginatto*",
      "Livro Magia da Conversa (impresso e e-book)",
      "Livro Chat First (impresso e e-book)",
      "Acesso vitalício",
    ],
    ctaLabel: "Garantir o RedUp",
  },
  redmax: {
    slug: "redmax",
    name: "RedMax",
    priceCents: 199700,
    tagline:
      "Potência total. A máquina ajustada e operando em 100% — método, livros e a implantação que coloca tudo em prática.",
    includesImplementation: true,
    requiresShippingAddress: true,
    requiresOnboardingScheduling: true,
    guaranteeDays: null,
    features: [
      "Tudo do RedUp incluso",
      "Implantação técnica da plataforma",
      "Configuração dos fluxos e jornadas",
      "Agentes de IA configurados para vender",
      "Treinamento operacional da equipe",
      "Máquina operando na potência máxima",
      "Aulas extras com Daniel Reginatto*",
      "Acesso vitalício",
    ],
    ctaLabel: "Quero a força do RedMax",
  },
  "redup-full": {
    slug: "redup-full",
    name: "RedUp Full",
    // R$997 (RedUp) + 12 × R$697 (Redrive Enterprise) = R$9.361
    priceCents: 99700 + REDRIVE_COMBO_VALUE_CENTS,
    tagline:
      "O programa completo para começar: o método do CEO + um ano de Redrive, o Sistema Operacional de Vendas com IA. Do conceito à primeira venda, sem intervalo.",
    includesImplementation: false,
    requiresShippingAddress: true,
    requiresOnboardingScheduling: false,
    guaranteeDays: 7,
    features: [
      "Tudo do RedUp incluso",
      "Método Redrive — 8 aulas com o Daniel",
      "Livros Magia da Conversa e Chat First (impresso e e-book)",
      "12 meses de Redrive Enterprise — o Sistema Operacional de Vendas com IA",
      "Acesso vitalício ao método",
    ],
    ctaLabel: "Garantir o RedUp Full",
    redriveMonths: REDRIVE_COMBO_MONTHS,
    installments: 12,
    cashDiscountPct: 10,
    basePlan: "redup",
    opsProductId: "RedPowerFull",
    requiresRedriveProvisioning: true,
  },
  "redmax-full": {
    slug: "redmax-full",
    name: "RedMax Full",
    // R$1.997 (RedMax) + 12 × R$697 (Redrive Enterprise) = R$10.361
    priceCents: 199700 + REDRIVE_COMBO_VALUE_CENTS,
    tagline:
      "Potência total, do zero à operação no ar. Método, implantação técnica e um ano de Redrive Enterprise — a máquina montada, configurada e rodando por você.",
    includesImplementation: true,
    requiresShippingAddress: true,
    requiresOnboardingScheduling: true,
    guaranteeDays: null,
    features: [
      "Tudo do RedMax incluso",
      "Implantação técnica da plataforma",
      "Agentes de IA configurados para vender",
      "Treinamento operacional da equipe",
      "12 meses de Redrive Enterprise — o Sistema Operacional de Vendas com IA",
      "Acesso vitalício ao método",
    ],
    ctaLabel: "Quero o RedMax Full",
    redriveMonths: REDRIVE_COMBO_MONTHS,
    installments: 12,
    cashDiscountPct: 10,
    basePlan: "redmax",
    opsProductId: "RedPowerFull",
    requiresRedriveProvisioning: true,
  },
};

export const PLAN_LIST = Object.values(PLANS);

/** Combos with a bundled Redrive subscription — the primary offer on /full. */
export const COMBO_PLANS: Plan[] = [PLANS["redup-full"], PLANS["redmax-full"]];

export function formatBRL(cents: number): { reais: string; centavos: string } {
  const reais = Math.floor(cents / 100).toLocaleString("pt-BR");
  const centavos = (cents % 100).toString().padStart(2, "0");
  return { reais, centavos };
}

/** Price for cash payment, after applying the plan's cash discount. */
export function cashPriceCents(plan: Plan): number {
  const pct = plan.cashDiscountPct ?? 0;
  return Math.round(plan.priceCents * (1 - pct / 100));
}

/** Per-installment amount for the plan's card installments (defaults to 1x). */
export function installmentCents(plan: Plan): number {
  const n = plan.installments && plan.installments > 0 ? plan.installments : 1;
  return Math.round(plan.priceCents / n);
}

export const COMPARISON_ROWS: { label: string; redup: boolean; redmax: boolean }[] = [
  { label: "12 meses de Redrive Enterprise (Sistema Operacional de Vendas com IA)", redup: true, redmax: true },
  { label: "Método Redrive — 8 aulas com o Daniel", redup: true, redmax: true },
  { label: "+ de 3h de conteúdo conceitual e estratégico", redup: true, redmax: true },
  { label: "Livro Magia da Conversa (impresso e e-book)", redup: true, redmax: true },
  { label: "Livro Chat First (impresso e e-book)", redup: true, redmax: true },
  { label: "Acesso vitalício", redup: true, redmax: true },
  { label: "Implantação técnica da plataforma", redup: false, redmax: true },
  { label: "Configuração de fluxos e jornadas", redup: false, redmax: true },
  { label: "Agentes de IA configurados para vender", redup: false, redmax: true },
  { label: "Treinamento operacional da equipe", redup: false, redmax: true },
  { label: "Máquina operando na potência máxima", redup: false, redmax: true },
  { label: "Atualizações no método inclusas", redup: true, redmax: true },
  { label: "Aulas extras com Daniel Reginatto*", redup: true, redmax: true },
];

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "O RedUp serve para quem está começando com a Redrive?",
    answer:
      "Sim — e é especialmente valioso nesse momento. Entender o método antes de operar a plataforma encurta muito a curva de aprendizado e evita configurar as coisas do jeito errado logo no começo.",
  },
  {
    question: "Qual a diferença entre o RedUp e o RedMax na prática?",
    answer:
      "O RedUp te dá o conhecimento — o que fazer, como pensar, qual lógica aplicar em cada fase. O RedMax soma a execução: nosso time ajuda a configurar a plataforma para a sua realidade, criar os fluxos, configurar os agentes de IA e treinar sua equipe. Um ensina a dirigir. O outro ajusta o carro para a sua pista.",
  },
  {
    question: "Já tenho a Redrive há algum tempo. O método ainda faz sentido?",
    answer:
      'Faz — provavelmente mais sentido ainda. Quem já usa a plataforma tende a aplicar o método imediatamente, porque reconhece cada conceito no contexto real da operação. Muitos clientes relatam que só entenderam o "porquê" de certas funcionalidades depois do método.',
  },
  {
    question: "Em quanto tempo consigo assistir as 8 aulas?",
    answer:
      "São cerca de 3 horas de conteúdo. Você pode assistir em um fim de semana ou distribuir ao longo da semana. O acesso é permanente — sem prazo para terminar.",
  },
  {
    question: "Os livros são físicos ou digitais?",
    answer:
      "No programa, os dois livros são entregues em formato digital e físico — você recebe o ebook para acesso imediato e o impresso enviado para o seu endereço.",
  },
  {
    question: "Tem garantia?",
    answer:
      "Sim. Tanto o RedUp quanto o RedMax têm 7 dias de garantia incondicional. Se por qualquer motivo não ficar satisfeito, devolvemos 100% do valor sem perguntas. Como ambos os planos incluem o envio do livro físico, basta devolvê-lo nas mesmas condições em que recebeu — o frete de devolução fica por nossa conta.",
  },
  {
    question: "Comprei o RedMax. Quando a implantação começa?",
    answer:
      "Após a compra, nosso time entra em contato em até 48h para um meet de boas-vindas e alinhamento inicial. Antes de começar a implantação, pedimos que você assista ao Método Redrive e inicie a leitura do Magia da Conversa — isso garante que você já chega na implantação com o raciocínio certo, aproveitando muito mais cada sessão. Com isso feito ou em andamento, traçamos juntos o plano de ação e damos início à implantação pensada para o seu negócio.",
  },
  {
    question: "A implantação é feita pelo time da Redrive ou preciso fazer eu mesmo?",
    answer:
      "A implantação do RedMax é assistida — o que significa que você e sua equipe aprendem fazendo, com o suporte ativo do nosso time em cada etapa. O objetivo não é só configurar a plataforma, mas garantir que vocês saibam operar, ajustar e evoluir a operação com autonomia. Quando necessário, colocamos a mão na massa — mas o protagonismo é de vocês, porque é assim que o aprendizado se consolida.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer: "RedUp e RedMax estão disponíveis para pagamento via cartão de crédito, Pix e boleto bancário.",
  },
  {
    question: "Comprei o RedUp, mas quero adicionar a Implantação. Consigo contratar depois?",
    answer:
      "Sim, você pode fazer o upgrade para o RedMax a qualquer momento. {{CTA_IMPLANTACAO}} e garanta a Implantação com condições especiais para quem já é RedUp.",
  },
];
