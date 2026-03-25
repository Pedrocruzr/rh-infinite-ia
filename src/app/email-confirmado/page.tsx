"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function EmailConfirmadoPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirmando sua conta...");

  useEffect(() => {
    async function run() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setStatus("success");
          setMessage("Conta confirmada com sucesso. Redirecionando...");
          setTimeout(() => {
            router.replace("/app/agentes");
            router.refresh();
          }, 1200);
          return;
        }

        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;

        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error) {
            setStatus("success");
            setMessage("Conta confirmada com sucesso. Redirecionando...");
            setTimeout(() => {
              router.replace("/app/agentes");
              router.refresh();
            }, 1200);
            return;
          }
        }

        setStatus("error");
        setMessage("Não foi possível validar a confirmação da conta.");
      } catch {
        setStatus("error");
        setMessage("Ocorreu um erro ao confirmar sua conta.");
      }
    }

    void run();
  }, [router, supabase]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <div className="w-full rounded-3xl border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            {status === "success" ? "Conta confirmada" : "Confirmação de conta"}
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">{message}</p>

          {status === "loading" ? (
            <div className="mt-6 h-11 w-full rounded-xl border bg-background" />
          ) : null}

          {status === "error" ? (
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Ir para login
              </Link>

              <Link
                href="/cadastro"
                className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
              >
                Criar conta novamente
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
