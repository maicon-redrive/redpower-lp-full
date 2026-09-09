import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { PLANS, cashPriceCents, type PlanSlug } from "@/lib/plans";

const VALID_COMBOS: PlanSlug[] = ["redup-full", "redmax-full"];

export async function POST(req: NextRequest) {
  let body: { plano?: string; ref_id?: string; pagamento?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plano = body.plano as PlanSlug;
  if (!plano || !VALID_COMBOS.includes(plano)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const plan = PLANS[plano];
  const avista = body.pagamento === "avista";
  const amount = avista ? cashPriceCents(plan) : plan.priceCents;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: amount,
            product_data: {
              name: plan.name,
              description: avista
                ? "Pagamento à vista (10% de desconto)"
                : "Pagamento parcelado em até 12x",
            },
          },
        },
      ],
      // Parcelamento só no fluxo "12x"; à vista é pagamento único com desconto.
      ...(avista
        ? {}
        : { payment_method_options: { card: { installments: { enabled: true } } } }),
      client_reference_id: body.ref_id || undefined,
      metadata: {
        plano,
        ref_id: body.ref_id || "",
        pagamento: avista ? "avista" : "12x",
        ops_product: plan.opsProductId || "",
      },
      success_url: `${origin}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/envio?plano=${plano}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[CHECKOUT] Stripe error:", e);
    return NextResponse.json({ error: "Erro ao criar o checkout" }, { status: 500 });
  }
}
