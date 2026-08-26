const VALID_PLANS = ["redup", "redmax", "redup-full", "redmax-full"];

export function getCheckoutUrl(planSlug: string): string {
  if (!VALID_PLANS.includes(planSlug)) return "#";
  return `/envio?plano=${planSlug}`;
}
