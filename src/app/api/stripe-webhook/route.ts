import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PLANS, type PlanSlug } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature") || "";
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] Assinatura inválida:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const supabase = getSupabaseAdmin();

  // Deduplica pelo id da sessão
  const orderId = session.id;
  const { data: existing } = await supabase
    .from("vendas")
    .select("id")
    .eq("order_id", orderId)
    .limit(1)
    .maybeSingle();
  if (existing) return NextResponse.json({ received: true, duplicate: true });

  const meta = session.metadata || {};
  const refId = meta.ref_id || (session.client_reference_id as string) || null;
  const plano = (meta.plano as PlanSlug) || null;
  const plan = plano ? PLANS[plano] : null;
  const customerEmail = session.customer_details?.email?.toLowerCase().trim() || null;

  // Liga com o pré-checkout (endereço) por ref_id ou e-mail
  let pre: Record<string, unknown> | null = null;
  if (refId) {
    const { data } = await supabase.from("pre_checkout").select("*").eq("ref_id", refId).maybeSingle();
    if (data) pre = data as Record<string, unknown>;
  }
  if (!pre && customerEmail) {
    const { data } = await supabase
      .from("pre_checkout")
      .select("*")
      .eq("customer_email", customerEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) pre = data as Record<string, unknown>;
  }

  const venda = {
    order_id: orderId,
    order_ref: (session.payment_intent as string) || null,
    event: "paid",
    product_id: plan?.opsProductId || meta.ops_product || null,
    product_name: plan?.name || null,
    customer_name: session.customer_details?.name || (pre?.customer_name as string) || null,
    customer_email: customerEmail,
    customer_phone: session.customer_details?.phone || (pre?.customer_phone as string) || null,
    address_street: (pre?.address_street as string) || null,
    address_number: (pre?.address_number as string) || null,
    address_complement: (pre?.address_complement as string) || null,
    address_neighborhood: (pre?.address_neighborhood as string) || null,
    address_city: (pre?.address_city as string) || null,
    address_state: (pre?.address_state as string) || null,
    address_zip: (pre?.address_zip as string) || null,
    payment_status: "paid",
    payment_method: "credit_card",
    amount: session.amount_total != null ? session.amount_total / 100 : null,
    plano: plano || (pre?.plano as string) || null,
    utm_content: refId,
    envio_status: "aguardando",
    cliente_redrive: false,
  };

  const { error } = await supabase.from("vendas").insert(venda);
  if (!error && pre?.id) {
    await supabase.from("pre_checkout").update({ used: true }).eq("id", pre.id);
  }
  if (error) {
    console.error("[STRIPE-WEBHOOK] Supabase error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
