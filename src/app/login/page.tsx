"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { login, signup, resetPassword } from "@/lib/auth";
import { LavaBackground } from "@/components/sections/LavaBackground";
import {
  GLANCYR_LIGHT_CONDENSED,
  GLANCYR_BOLD_EXPANDED,
  GLANCYR_THIN_CONDENSED_OBLIQUE,
  GLANCYR_REGULAR,
} from "@/lib/typography";

type Mode = "login" | "signup" | "reset";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/metodo";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Erro ao fazer login.");
      setLoading(false);
      return;
    }
    router.push(redirect);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setLoading(true);
    const result = await signup(email, password);
    if (!result.success) {
      setError(result.error || "Erro ao criar conta.");
      setLoading(false);
      return;
    }
    if (result.needsConfirmation) {
      setInfo("Verifique seu e-mail para confirmar a conta. Enviamos um link de ativação.");
      setLoading(false);
      return;
    }
    localStorage.removeItem("redpower_onboarding");
    router.push(redirect);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Informe seu e-mail.");
      return;
    }
    setLoading(true);
    const result = await resetPassword(email);
    if (!result.success) {
      setError(result.error || "Erro ao enviar e-mail.");
      setLoading(false);
      return;
    }
    setInfo("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    setLoading(false);
  }

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setError("");
    setInfo("");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 overflow-hidden" style={{ background: "var(--background)" }}>
      <LavaBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <Image src="/images/redpower-by-redrive.svg" alt="RedPower by Redrive" width={260} height={24} className="mx-auto mb-6" />
          <p className="mt-3 font-display text-camurca-texto" style={{ fontSize: 14, ...GLANCYR_THIN_CONDENSED_OBLIQUE }}>
            {mode === "login" && "Acesse o método e comece a transformar sua operação"}
            {mode === "signup" && "Crie sua conta para acessar o método"}
            {mode === "reset" && "Recupere o acesso à sua conta"}
          </p>
        </div>

        <form
          onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleReset}
          className="rounded-[30px] border border-white/10 p-8"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <p className="font-display text-bege-texto" style={{ fontSize: 18, ...GLANCYR_REGULAR }}>
            {mode === "login" && "Entrar na sua conta"}
            {mode === "signup" && "Criar nova conta"}
            {mode === "reset" && "Recuperar senha"}
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-camurca-texto">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bege-texto outline-none transition-colors placeholder:text-white/20 focus:border-vermelho-redrive"
                autoComplete="email"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label className="mb-1.5 block text-xs text-camurca-texto">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Mínimo 8 caracteres" : "••••••••"}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bege-texto outline-none transition-colors placeholder:text-white/20 focus:border-vermelho-redrive"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-xs text-camurca-texto">Confirmar senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bege-texto outline-none transition-colors placeholder:text-white/20 focus:border-vermelho-redrive"
                  autoComplete="new-password"
                />
              </div>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-vermelho-redrive">{error}</p>}
          {info && <p className="mt-3 text-sm text-green-400">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-lp mt-6 flex w-full items-center justify-center gap-3 rounded-[16px] bg-vermelho-redrive py-3.5 font-display text-white disabled:opacity-50"
            style={{ fontSize: 14, ...GLANCYR_BOLD_EXPANDED }}
          >
            {loading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                {mode === "login" && <>Acessar o método <span className="text-lg">→</span></>}
                {mode === "signup" && <>Criar conta <span className="text-lg">→</span></>}
                {mode === "reset" && <>Enviar link de recuperação</>}
              </>
            )}
          </button>

          <div className="mt-4 space-y-2 text-center text-xs text-camurca-texto">
            {mode === "login" && (
              <>
                <p>
                  Esqueceu a senha?{" "}
                  <button type="button" onClick={() => switchMode("reset")} className="text-vermelho-redrive underline underline-offset-2">
                    Recuperar acesso
                  </button>
                </p>
                <p>
                  Não tem conta?{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="text-vermelho-redrive underline underline-offset-2">
                    Criar conta
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p>
                Já tem uma conta?{" "}
                <button type="button" onClick={() => switchMode("login")} className="text-vermelho-redrive underline underline-offset-2">
                  Fazer login
                </button>
              </p>
            )}
            {mode === "reset" && (
              <p>
                Lembrou a senha?{" "}
                <button type="button" onClick={() => switchMode("login")} className="text-vermelho-redrive underline underline-offset-2">
                  Voltar ao login
                </button>
              </p>
            )}
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-camurca-texto/60">
          © {new Date().getFullYear()} Redrive. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
