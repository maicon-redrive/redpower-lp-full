import type { NextRequest } from "next/server";

const API_SECRET = process.env.PANEL_API_SECRET || "";

/**
 * Auth guard for internal panel endpoints (the /ops sales panel:
 * /api/vendas and the /api/pre-checkout listing).
 *
 * - If PANEL_API_SECRET is set, require it via the `x-api-key` header or `?key=`.
 * - If it is NOT set, allow only outside production (local dev convenience).
 *   In production a missing secret FAILS CLOSED — the panel is never public.
 */
export function checkPanelAuth(req: NextRequest): boolean {
  if (!API_SECRET) return process.env.NODE_ENV !== "production";
  const token = req.headers.get("x-api-key") || req.nextUrl.searchParams.get("key");
  return token === API_SECRET;
}
