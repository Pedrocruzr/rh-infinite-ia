"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { validatePasswordStrength } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <div className="w-full rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">Criar conta</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use Gmail ou cadastre-se com e-mail e senha.
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

          <form onSubmit={handleSignup} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Nome</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Seu nome"
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
                required
              />
            </label>

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
                placeholder="Crie uma senha forte"
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Confirmar senha</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita sua senha"
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
                required
              />
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1"
              />
              <span>
                Aceito os{" "}
                <Link href="/termos" className="text-primary hover:underline">
                  termos
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" className="text-primary hover:underline">
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
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
