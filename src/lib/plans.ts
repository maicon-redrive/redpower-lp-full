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
      "Implantação técnica da Redrive",
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
      "O programa completo para começar: o método do CEO + um ano de Redrive, o Sistema Operacional de Vendas Agênticas. Do conceito à primeira venda, sem intervalo.",
    includesImplementation: false,
    requiresShippingAddress: true,
    requiresOnboardingScheduling: false,
    guaranteeDays: 7,
    features: [
      "Tudo do RedUp incluso",
      "Método Redrive — 8 aulas com o Daniel",
      "Livros Magia da Conversa e Chat First (impresso e e-book)",
      "12 meses de Redrive Enterprise — o Sistema Operacional de Vendas Agênticas",
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
    guaranteeDays: 7,
    features: [
      "Tudo do RedMax incluso",
      "Implantação técnica da Redrive",
      "Agentes de IA configurados para vender",
      "Treinamento operacional da equipe",
      "12 meses de Redrive Enterprise — o Sistema Operacional de Vendas Agênticas",
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
  { label: "12 meses de Redrive Enterprise (Sistema Operacional de Vendas Agênticas)", redup: true, redmax: true },
  { label: "Método Redrive — 8 aulas com o Daniel", redup: true, redmax: true },
  { label: "+ de 3h de conteúdo conceitual e estratégico", redup: true, redmax: true },
  { label: "Livro Magia da Conversa (impresso e e-book)", redup: true, redmax: true },
  { label: "Livro Chat First (impresso e e-book)", redup: true, redmax: true },
  { label: "Acesso vitalício", redup: true, redmax: true },
  { label: "Implantação técnica da Redrive", redup: false, redmax: true },
  { label: "Configuração de fluxos e jornadas", redup: false, redmax: true },
  { label: "Agentes de IA configurados para vender", redup: false, redmax: true },
  { label: "Treinamento operacional da equipe", redup: false, redmax: true },
  { label: "Máquina operando na potência máxima", redup: false, redmax: true },
  { label: "Atualizações no método inclusas", redup: true, redmax: true },
  { label: "Aulas extras com Daniel Reginatto*", redup: true, redmax: true },
];

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "O que é a Redrive?",
    answer:
      "A Redrive é o Sistema Operacional de Vendas Agênticas: um sistema que conecta geração de leads, atendimento, CRM, automações e jornadas num só lugar — com IA embarcada (agentes) atuando em cada etapa para vender por você. No RedPower Full, você recebe 1 ano de Redrive Enterprise junto com o método para operá-la.",
  },
  {
    question: "O que é o RedPower Full?",
    answer:
      "É o programa que coloca sua operação de vendas com IA no ar, do zero à primeira venda. Você recebe o método completo do CEO (8 aulas, mais os dois livros como complemento) e 12 meses de Redrive Enterprise — o sistema onde a operação de fato roda.",
  },
  {
    question: "Preciso já conhecer ou já usar a Redrive?",
    answer:
      "Não. O RedPower Full foi feito para quem está começando: você recebe o acesso à Redrive e o método para operá-la juntos. Entender o método antes de operar encurta meses de curva de aprendizado e evita configurar do jeito errado logo no começo.",
  },
  {
    question: "Qual a diferença entre RedUp Full e RedMax Full?",
    answer:
      "Os dois incluem o método completo + 12 meses de Redrive Enterprise. No RedUp Full, você mesmo coloca a operação no ar com o método na mão. No RedMax Full, nosso time faz a implantação assistida junto com você — configura a Redrive, cria os fluxos, ativa os agentes de IA e treina sua equipe. Um te dá o conhecimento; o outro soma a execução.",
  },
  {
    question: "Quando recebo o acesso à Redrive e ao método?",
    answer:
      "O acesso ao método é imediato após a confirmação do pagamento. A sua conta na Redrive é criada pelo nosso time logo em seguida — você recebe os dados de acesso e as orientações para começar.",
  },
  {
    question: "O que acontece depois dos 12 meses de Redrive?",
    answer:
      "Os 12 meses de Redrive Enterprise já estão inclusos no combo. Ao fim do período, você pode renovar a assinatura para manter a operação rodando, sem obrigação. O acesso ao método e às aulas é vitalício — continua seu para sempre.",
  },
  {
    question: "Como funciona a implantação do RedMax Full?",
    answer:
      "Após a compra, nosso time entra em contato em até 48h para o alinhamento inicial. A implantação é assistida: você e sua equipe aprendem fazendo, com o suporte do nosso time em cada etapa — configuração da Redrive, fluxos, jornadas, agentes de IA e treinamento. Antes de começar, pedimos que você assista ao método e inicie a leitura do Magia da Conversa, para aproveitar muito mais cada sessão.",
  },
  {
    question: "Os livros são físicos ou digitais?",
    answer:
      "Os dois livros (Magia da Conversa e Chat First) entram como complemento do programa, em formato digital e físico — ebook para acesso imediato e o impresso enviado para o seu endereço.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Você pode pagar em até 12x no cartão, ou à vista com 10% de desconto.",
  },
  {
    question: "Tem garantia?",
    answer:
      "Sim — RedUp Full e RedMax Full têm 7 dias de garantia incondicional. Se por qualquer motivo não ficar satisfeito, devolvemos 100% do valor. Como o programa inclui o envio do livro físico, basta devolvê-lo nas mesmas condições em que recebeu — o frete de retorno fica por nossa conta.",
  },
];
