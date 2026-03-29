"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#020817_0%,#07111f_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:88px_88px]" />
      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:px-8">
        <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.32)] backdrop-blur-xl md:p-10">
          <div className="w-full max-w-xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-white">
              Esqueci minha senha
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Informe seu e-mail para receber o link seguro de redefinição.
            </p>

            <form onSubmit={handleReset} className="mt-8 space-y-5">
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
                {loading ? "Enviando..." : "Enviar link"}
              </Button>
            </form>

            <Link
              href="/login"
              className="mt-6 inline-flex text-sm text-slate-300 hover:text-white hover:underline"
            >
              Voltar para login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
