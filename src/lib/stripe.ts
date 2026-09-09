import Stripe from "stripe";

let _stripe: Stripe | null = null;

/** Lazy Stripe client — só instancia quando há chave (evita quebrar o build). */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}
