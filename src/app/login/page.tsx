"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  Chrome,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";

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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_48%,#f5f8fc_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(30,41,59,0.65),transparent_32%),linear-gradient(180deg,#020817_0%,#07111f_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:88px_88px]" />
      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 lg:px-8">
        <div className="grid w-full gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:px-8 md:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_24%)]" />
            <div className="relative">
              <Badge variant="outline" className="border-sky-200/80 bg-white/70 px-3 py-1 text-[0.7rem] uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                Etapa 1 • Login Codex
              </Badge>
              <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white md:text-5xl">
                Entrar na operação RH Infinite IA
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                Acesse sua conta para voltar direto para a central de agentes, revisar vagas abertas e seguir com a operação comercial já funcional.
              </p>

              <div className="mt-10 space-y-3">
                {[
                  { icon: Bot, label: "Catálogo de agentes já conectado ao produto funcional" },
                  { icon: BriefcaseBusiness, label: "Fluxo de vagas, suporte e configurações preservado" },
                  { icon: ShieldCheck, label: "Auth, billing e proteções mantidos sem alteração de lógica" }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-[1.35rem] border border-white/60 bg-white/70 px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/6 dark:text-slate-200"
                  >
                    <item.icon className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
                Visual Codex aplicado sem trocar o motor funcional
                <ArrowUpRight className="h-4 w-4 text-sky-600 dark:text-sky-300" />
              </div>
            </div>
          </section>

          <section className="flex min-h-[680px] items-center justify-center">
            <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/75 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 md:p-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                Entrar
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Entre com e-mail e senha ou siga pelo Google, mantendo a validação de segurança, mensagens e redirects já existentes.
              </p>

              {googleOAuthEnabled ? (
                <>
                  <Button
                    type="button"
                    onClick={() => void handleGoogle()}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                    className="mt-8 h-12 w-full justify-center rounded-2xl border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:bg-white/10"
                    title="Continuar com Google"
                  >
                    <Chrome className="h-4 w-4" />
                    {loading ? "Abrindo Google..." : "Continuar com Google"}
                  </Button>

                  <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                    <span>ou</span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                  </div>
                </>
              ) : null}

              <form onSubmit={handleLogin} className="space-y-5">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-100">E-mail</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@empresa.com"
                    className="h-12 rounded-2xl border-slate-200 bg-white/80 px-4 dark:border-white/10 dark:bg-white/6"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-100">Senha</span>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    className="h-12 rounded-2xl border-slate-200 bg-white/80 px-4 dark:border-white/10 dark:bg-white/6"
                    required
                  />
                </label>

                <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/4">
                  <TurnstileWidget
                    onTokenChange={setTurnstileToken}
                    resetKey={turnstileResetKey}
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                    {success}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="mt-6 flex flex-col gap-3 text-sm">
                <Link
                  href="/esqueci-senha"
                  className="text-slate-600 transition hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
                >
                  Esqueci minha senha
                </Link>

                {showResend ? (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-left text-slate-600 transition hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white"
                  >
                    Reenviar verificação
                  </button>
                ) : null}

                <p className="text-slate-500 dark:text-slate-400">
                  Ainda não tem conta?{" "}
                  <Link
                    href="/cadastro"
                    className="font-medium text-slate-950 underline-offset-4 hover:underline dark:text-white"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
