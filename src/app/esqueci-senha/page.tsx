"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const supabase = useMemo(() => createClient(), []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const precheckResponse = await fetch("/api/auth/precheck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reset",
        }),
      });

      const precheckPayload = await precheckResponse.json();

      if (!precheckResponse.ok) {
        throw new Error(precheckPayload?.error || "Tente novamente.");
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${siteUrl}/resetar-senha`,
        }
      );

      if (resetError) {
        throw new Error(
          "Se o e-mail existir, você receberá um link para redefinir a senha."
        );
      }

      setSuccess(
        "Se o e-mail existir, você receberá um link para redefinir a senha."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível processar a solicitação."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <div className="w-full rounded-3xl border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            Esqueci minha senha
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Informe seu e-mail para receber o link seguro de redefinição.
          </p>

          <form onSubmit={handleReset} className="mt-6 space-y-4">
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
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-4 inline-flex text-sm text-primary hover:underline"
          >
            Voltar para login
          </Link>
        </div>
      </section>
    </main>
  );
}
