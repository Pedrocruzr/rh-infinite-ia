"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chrome, LockKeyhole } from "lucide-react";

import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePasswordStrength } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") || "completo";
  const supabase = useMemo(() => createClient(), []);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const googleOAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function precheck(action: "signup" | "google") {
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
          : "Não foi possível continuar com o Google."
      );
      setTurnstileResetKey((current) => current + 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!name.trim()) {
        throw new Error("Informe seu nome.");
      }

      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      if (password !== confirmPassword) {
        throw new Error("As senhas precisam ser iguais.");
      }

      if (!acceptedTerms) {
        throw new Error("Você precisa aceitar os termos e a política.");
      }

      await precheck("signup");

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/confirm?next=/app/agentes`,
          data: {
            full_name: name.trim(),
            signup_plan: planParam,
          },
        },
      });

      if (signupError) {
        const message = signupError.message.toLowerCase();

        if (message.includes("already")) {
          throw new Error("Este e-mail já está cadastrado. Tente entrar.");
        }

        throw signupError;
      }

      if (!data.user) {
        throw new Error("Não foi possível criar a conta.");
      }

      router.replace(`/verificar-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível criar a conta."
      );
      setTurnstileResetKey((current) => current + 1);
      setLoading(false);
      return;
    }

    setLoading(false);
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

            <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-white">
              Criar conta
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Use Gmail ou cadastre-se com e-mail e senha.
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

            <form onSubmit={handleSignup} className="space-y-5">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-100">Nome</span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  className="h-12 rounded-2xl border-white/12 bg-white/8 px-4 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </label>

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
                  placeholder="Crie uma senha forte"
                  className="h-12 rounded-2xl border-white/12 bg-white/8 px-4 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-100">Confirmar senha</span>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repita sua senha"
                  className="h-12 rounded-2xl border-white/12 bg-white/8 px-4 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/8"
                />
                <span>
                  Aceito os{" "}
                  <Link href="/termos" className="text-white underline-offset-4 hover:underline">
                    termos
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" className="text-white underline-offset-4 hover:underline">
                    política de privacidade
                  </Link>
                  .
                </span>
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

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="h-12 w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
              >
                {loading ? "Criando..." : "Criar conta"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Já tem conta?{" "}
              <Link href="/login" className="font-medium text-white underline-offset-4 hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
