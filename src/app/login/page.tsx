"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome, LockKeyhole } from "lucide-react";

import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const googleOAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const oauthError = params.get("error");
    const message = params.get("message");

    if (emailParam) setEmail(emailParam);
    if (oauthError === "oauth") {
      setError("Não foi possível entrar com o Google. Tente novamente.");
    }
    if (message) {
      setSuccess(message);
    }
  }, []);

  async function precheck(action: "login" | "google" | "resend") {
    const response = await fetch("/api/auth/precheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        token: turnstileToken,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || "Falha na validação de segurança.");
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await precheck("google");

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=/app/agentes`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar com o Google."
      );
      setTurnstileResetKey((current) => current + 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setShowResend(false);
    setError("");
    setSuccess("");

    try {
      await precheck("login");

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        const message = loginError.message.toLowerCase();

        if (message.includes("email not confirmed")) {
          setShowResend(true);
          throw new Error(
            "Você precisa verificar seu e-mail antes de acessar a plataforma."
          );
        }

        throw new Error("Não foi possível entrar com essas credenciais.");
      }

      if (!data.user?.email_confirmed_at) {
        setShowResend(true);
        router.replace(`/verificar-email?email=${encodeURIComponent(email)}`);
        return;
      }

      router.replace("/app/agentes");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar com essas credenciais."
      );
      setTurnstileResetKey((current) => current + 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!email) {
      setError("Informe o e-mail para reenviar a verificação.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await precheck("resend");

      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/confirm?next=/app/agentes`,
        },
      });

      if (resendError) {
        throw resendError;
      }

      setSuccess("E-mail de verificação reenviado.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível reenviar o e-mail."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#020817_0%,#07111f_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:88px_88px]" />
      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:px-8">
        <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.32)] backdrop-blur-xl md:p-10">
          <div className="w-full max-w-xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-white">
                Entrar
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Acesse sua conta para entrar na plataforma.
              </p>

              <Button
                type="button"
                onClick={() => void handleGoogle()}
                disabled={loading || !googleOAuthEnabled}
                variant="outline"
                size="lg"
                className="mt-8 h-12 w-full justify-center rounded-2xl border-white/10 bg-white/6 text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                title="Continuar com Google"
              >
                <Chrome className="h-4 w-4" />
                {loading ? "Abrindo Google..." : "Continuar com Google"}
              </Button>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-slate-500">
                <div className="h-px flex-1 bg-white/10" />
                <span>ou</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-100">E-mail</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@empresa.com"
                    className="h-12 rounded-2xl border-white/12 bg-white/8 px-4 text-slate-100 placeholder:text-slate-400"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-100">Senha</span>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    className="h-12 rounded-2xl border-white/12 bg-white/8 px-4 text-slate-100 placeholder:text-slate-400"
                    required
                  />
                </label>

                <TurnstileWidget
                  onTokenChange={setTurnstileToken}
                  resetKey={turnstileResetKey}
                />

                {error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {success}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="h-12 w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="mt-6 flex flex-col gap-3 text-sm">
                <Link
                  href="/esqueci-senha"
                  className="text-slate-300 transition hover:text-white hover:underline"
                >
                  Esqueci minha senha
                </Link>

                {showResend ? (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-left text-slate-300 transition hover:text-white hover:underline"
                  >
                    Reenviar verificação
                  </button>
                ) : null}

                <p className="text-slate-400">
                  Ainda não tem conta?{" "}
                  <Link
                    href="/cadastro"
                    className="font-medium text-white underline-offset-4 hover:underline"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
          </div>
        </div>
      </section>
    </main>
  );
}
