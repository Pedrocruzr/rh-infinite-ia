"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <div className="w-full rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse sua conta para entrar na plataforma.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mb-4 inline-flex h-11 w-full items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
          >
            Continuar com Gmail
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@empresa.com"
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
                required
              />
            </label>

            <TurnstileWidget
              onTokenChange={setTurnstileToken}
              resetKey={turnstileResetKey}
            />

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/esqueci-senha" className="text-primary hover:underline">
              Esqueci minha senha
            </Link>

            {showResend ? (
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-left text-primary hover:underline"
              >
                Reenviar verificação
              </button>
            ) : null}

            <p className="text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="text-primary hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
