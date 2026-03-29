"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.98),rgba(2,6,23,1)_58%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:88px_88px]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:px-8">
        <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.32)] backdrop-blur-xl md:p-10">
          <div className="w-full max-w-xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200">
              <MailCheck className="h-5 w-5" />
            </div>

            <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-white">
              Verifique seu e-mail
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Enviamos um link de confirmação para continuar o acesso à plataforma.
            </p>

            <div className="mt-6 rounded-2xl border border-white/12 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                E-mail enviado para
              </p>
              <p className="mt-2 break-all text-sm font-medium text-slate-100">
                {email || "e-mail não identificado"}
              </p>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3">
              <Button
                type="button"
                onClick={handleResend}
                disabled={loading}
                size="lg"
                variant="secondary"
                className="h-12 rounded-2xl"
              >
                {loading ? "Reenviando..." : "Reenviar e-mail"}
              </Button>

              <Button asChild type="button" size="lg" variant="ghost" className="h-12 rounded-2xl border border-white/10">
                <Link href="/cadastro">Trocar e-mail</Link>
              </Button>

              <Button asChild type="button" size="lg" className="h-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                <Link href="/login">Ir para login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
