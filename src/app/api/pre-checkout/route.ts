import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkPanelAuth } from "@/lib/panelAuth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  // Listing exposes customer addresses — restrict to the /ops panel.
  if (!checkPanelAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("pre_checkout")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pre_checkouts: data });
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { plano, customer_name, customer_email, customer_phone,
    address_street, address_number, address_complement,
    address_neighborhood, address_city, address_state, address_zip } = body;

  if (!plano || !customer_name || !customer_email || !address_street || !address_city || !address_state || !address_zip) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const ref_id = crypto.randomBytes(8).toString("hex");

  const { data, error } = await getSupabaseAdmin().from("pre_checkout").insert({
    ref_id,
    plano,
    customer_name: customer_name.trim(),
    customer_email: customer_email.trim().toLowerCase(),
    customer_phone: customer_phone?.trim() || null,
    address_street: address_street.trim(),
    address_number: address_number?.trim() || null,
    address_complement: address_complement?.trim() || null,
    address_neighborhood: address_neighborhood?.trim() || null,
    address_city: address_city.trim(),
    address_state: address_state.trim().toUpperCase(),
    address_zip: address_zip.replace(/\D/g, ""),
  }).select().single();

  if (error) {
    console.error("[PRE-CHECKOUT] Error:", error);
    return NextResponse.json({ error: "Erro ao salvar dados" }, { status: 500 });
  }

  return NextResponse.json({ success: true, ref_id: data.ref_id });
}
