"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#020817_0%,#07111f_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:88px_88px]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:px-8">
        <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.32)] backdrop-blur-xl md:p-10">
          <div className="w-full max-w-xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200">
              {status === "loading" ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <BadgeCheck className="h-5 w-5" />}
            </div>

            <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-white">
              {status === "success" ? "Conta confirmada" : "Confirmação de conta"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>

            {status === "loading" ? (
              <div className="mt-6 rounded-2xl border border-white/12 bg-white/5 px-4 py-4">
                <div className="h-4 w-40 rounded-full bg-white/10" />
              </div>
            ) : null}

            {status === "error" ? (
              <div className="mt-8 flex flex-col gap-3">
                <Button asChild size="lg" className="h-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                  <Link href="/login">Ir para login</Link>
                </Button>

                <Button asChild type="button" size="lg" variant="ghost" className="h-12 rounded-2xl border border-white/10">
                  <Link href="/cadastro">Criar conta novamente</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
