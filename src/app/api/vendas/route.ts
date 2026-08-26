import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkPanelAuth } from "@/lib/panelAuth";

export async function GET(req: NextRequest) {
  if (!checkPanelAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);
  const offset = parseInt(searchParams.get("offset") || "0");
  const status = searchParams.get("status");
  const plano = searchParams.get("plano");
  const product = searchParams.get("product");

  let query = getSupabaseAdmin()
    .from("vendas")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("payment_status", status);
  if (plano) query = query.eq("plano", plano);
  if (product) query = query.ilike("product_name", `%${product}%`);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vendas: data, total: count });
}

export async function PATCH(req: NextRequest) {
  if (!checkPanelAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const allowed = [
    "plano", "cliente_redrive", "envio_status", "tracking_code",
    "custo_frete", "comprovante_url", "email_rastreio_enviado", "notas",
    "customer_name", "customer_email", "customer_phone",
    "address_street", "address_number", "address_complement",
    "address_neighborhood", "address_city", "address_state", "address_zip",
    "amount", "payment_status", "product_name", "kiwify_fee", "net_amount",
  ];

  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key];
  }

  const { data, error } = await getSupabaseAdmin()
    .from("vendas")
    .update(filtered)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ venda: data });
}
