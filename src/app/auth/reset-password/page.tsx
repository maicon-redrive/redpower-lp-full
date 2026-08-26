"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { LavaBackground } from "@/components/sections/LavaBackground";
import {
  GLANCYR_LIGHT_CONDENSED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_REGULAR,
} from "@/lib/typography";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowser();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/metodo"), 2000);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 overflow-hidden" style={{ background: "var(--background)" }}>
      <LavaBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <Image src="/images/redrive-logo-white.svg" alt="Redrive" width={140} height={32} className="mx-auto mb-6" />
          <h1 className="font-display text-creme-destaque" style={{ fontSize: 48, lineHeight: 1, ...GLANCYR_LIGHT_CONDENSED }}>
            Nova Senha
          </h1>
          <p className="mt-2 font-display text-camurca-texto" style={{ fontSize: 14, ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
            Defina sua nova senha de acesso
          </p>
        </div>

        {success ? (
          <div className="rounded-[30px] border border-green-500/30 p-8 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="mb-4 text-4xl">✓</div>
            <p className="text-bege-texto" style={{ ...GLANCYR_REGULAR }}>Senha alterada com sucesso!</p>
            <p className="mt-2 text-sm text-camurca-texto">Redirecionando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-[30px] border border-white/10 p-8" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="font-display text-bege-texto" style={{ fontSize: 18, ...GLANCYR_REGULAR }}>
              {ready ? "Defina sua nova senha" : "Aguardando verificação..."}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-camurca-texto">Nova senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bege-texto outline-none transition-colors placeholder:text-white/20 focus:border-vermelho-redrive"
                  disabled={!ready}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-camurca-texto">Confirmar senha</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bege-texto outline-none transition-colors placeholder:text-white/20 focus:border-vermelho-redrive"
                  disabled={!ready}
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-vermelho-redrive">{error}</p>}

            <button
              type="submit"
              disabled={loading || !ready}
              className="btn-lp mt-6 flex w-full items-center justify-center gap-3 rounded-[16px] bg-vermelho-redrive py-3.5 font-display text-white disabled:opacity-50"
              style={{ fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}
            >
              {loading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Salvar nova senha"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
