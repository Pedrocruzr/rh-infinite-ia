"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function VerificarEmailPage() {
  const supabase = useMemo(() => createClient(), []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") ?? "");
  }, []);

  async function handleResend() {
    if (!email) {
      setError("Não foi possível identificar o e-mail.");
      return;
    }

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
          action: "resend",
        }),
      });

      const precheckPayload = await precheckResponse.json();

      if (!precheckResponse.ok) {
        throw new Error(precheckPayload?.error || "Tente novamente.");
      }

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
          <h1 className="text-3xl font-semibold tracking-tight">
            Verifique seu e-mail
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Enviamos um link de confirmação para:
          </p>

          <p className="mt-2 break-all rounded-xl border bg-background px-3 py-2 text-sm font-medium">
            {email || "e-mail não identificado"}
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="h-11 rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              {loading ? "Reenviando..." : "Reenviar e-mail"}
            </button>

            <Link
              href="/cadastro"
              className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
            >
              Trocar e-mail
            </Link>

            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Ir para login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
