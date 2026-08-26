import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

// Criado sob demanda: no `next build` (CI sem envs) os módulos das rotas são
// importados durante o "collecting page data" e um client criado no escopo
// do módulo derrubaria o build com "supabaseUrl is required".
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );
  }
  return adminClient;
}
