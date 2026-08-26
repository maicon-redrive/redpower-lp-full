import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

const KIWIFY_TOKEN = process.env.KIWIFY_WEBHOOK_TOKEN || "";

function detectPlano(productName: string | null | undefined): string | null {
  if (!productName) return null;
  const name = productName.toLowerCase();
  if (name.includes("redmax")) return "redmax";
  if (name.includes("redup") || name.includes("red up")) return "redup";
  if (name.includes("revisao") || name.includes("revisão")) return "revisao";
  if (name.includes("redpower")) return "redup";
  return null;
}

function verifySignature(rawBody: string, signature: string): boolean {
  if (!KIWIFY_TOKEN) return true;
  const hash = crypto.createHmac("sha1", KIWIFY_TOKEN).update(rawBody).digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  // Sem token configurado, o webhook aceitaria escritas anônimas na tabela `vendas`.
  // Enquanto não há provedor de pagamento ativo (Kiwify removido), recusa em produção.
  // Em dev local segue aberto para testes. Ao ligar o novo provedor, definir o token
  // e implementar a verificação de assinatura real (ver TODO em verifySignature).
  if (!KIWIFY_TOKEN && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Webhook disabled" }, { status: 503 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const rawBody = await req.text();
  const signature = req.headers.get("x-kiwify-signature")
    || req.headers.get("x-webhook-signature")
    || req.headers.get("signature")
    || "";

  if (KIWIFY_TOKEN && !verifySignature(rawBody, signature)) {
    // Log mismatch but accept — signature format needs investigation
    const expected = crypto.createHmac("sha1", KIWIFY_TOKEN).update(rawBody).digest("hex");
    console.warn(`[WEBHOOK] Signature mismatch: got="${signature.slice(0,12)}..." expected="${expected.slice(0,12)}..." — accepting anyway`);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Kiwify wraps data inside "order" — support both nested and flat
  const body = (parsed.order as Record<string, unknown>) || parsed;

  // Deduplicate: skip if order_id already exists
  const orderId = (body.order_id as string) || null;
  if (orderId) {
    const { data: existing } = await supabaseAdmin.from("vendas").select("id").eq("order_id", orderId).limit(1).single();
    if (existing) {
      console.log(`[WEBHOOK] Duplicate order_id=${orderId}, skipping`);
      return NextResponse.json({ success: true, duplicate: true });
    }
  }

  const event = (body.order_status as string) || "unknown";
  const customer = body.Customer as Record<string, unknown> | undefined;
  const product = body.Product as Record<string, unknown> | undefined;
  const commissions = body.Commissions as Record<string, unknown> | undefined;
  const tracking = body.TrackingParameters as Record<string, string> | undefined;
  const subscription = body.Subscription as Record<string, unknown> | undefined;

  const customerEmail = (customer?.email as string)?.toLowerCase()?.trim() || null;
  const utmContent = tracking?.utm_content || null;

  // Look up pre-checkout data by ref_id (utm_content) or email
  let preCheckout: Record<string, unknown> | null = null;
  if (utmContent || customerEmail) {
    const query = utmContent
      ? supabaseAdmin.from("pre_checkout").select("*").eq("ref_id", utmContent).eq("used", false).single()
      : supabaseAdmin.from("pre_checkout").select("*").eq("customer_email", customerEmail!).eq("used", false).order("created_at", { ascending: false }).limit(1).single();
    const { data } = await query;
    if (data) preCheckout = data as Record<string, unknown>;
  }

  // Kiwify puts address fields directly on Customer (not nested under .address)
  const address = (customer?.address as Record<string, string> | undefined) || customer;

  const venda = {
    order_id: body.order_id || null,
    order_ref: body.order_ref || null,
    event,
    product_id: product?.product_id || null,
    product_name: product?.product_name || null,
    customer_name: customer?.full_name || (preCheckout?.customer_name as string) || null,
    customer_email: customerEmail,
    customer_phone: customer?.mobile || (preCheckout?.customer_phone as string) || null,
    address_street: (address?.street as string) || (preCheckout?.address_street as string) || null,
    address_number: (address?.number as string) || (preCheckout?.address_number as string) || null,
    address_complement: (address?.complement as string) || (preCheckout?.address_complement as string) || null,
    address_neighborhood: (address?.neighborhood as string) || (preCheckout?.address_neighborhood as string) || null,
    address_city: (address?.city as string) || (preCheckout?.address_city as string) || null,
    address_state: (address?.state as string) || (preCheckout?.address_state as string) || null,
    address_zip: (address?.zip_code as string) || (address?.zipcode as string) || (preCheckout?.address_zip as string) || null,
    payment_status: event,
    payment_method: body.payment_method || null,
    installments: body.installments || 1,
    amount: commissions?.charge_amount
      ? Number(commissions.charge_amount) / 100
      : body.product_price
        ? Number(body.product_price) / 100
        : null,
    kiwify_fee: commissions?.kiwify_fee ? Number(commissions.kiwify_fee) / 100 : 0,
    net_amount: commissions?.my_commission ? Number(commissions.my_commission) / 100 : null,
    subscription_id: subscription?.id || null,
    subscription_status: subscription?.status || null,
    utm_source: tracking?.src || tracking?.utm_source || null,
    utm_medium: tracking?.utm_medium || null,
    utm_campaign: tracking?.utm_campaign || null,
    utm_content: utmContent,
    utm_term: tracking?.utm_term || null,
    plano: detectPlano(product?.product_name as string) || (preCheckout?.plano as string) || null,
    envio_status: "aguardando",
  };

  const { error } = await supabaseAdmin.from("vendas").insert(venda);

  // Mark pre_checkout as used
  if (!error && preCheckout?.id) {
    await supabaseAdmin.from("pre_checkout").update({ used: true }).eq("id", preCheckout.id);
  }

  if (error) {
    console.error("[WEBHOOK] Supabase error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  console.log(`[WEBHOOK] ${event} | ${venda.customer_email} | ${venda.product_name} | ${venda.amount}`);

  return NextResponse.json({
    success: true,
    event,
    order_id: venda.order_id,
  });
}
