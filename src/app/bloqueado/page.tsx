"use client";

import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, LogOut, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function BloqueadoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "completo";
  const supabase = useMemo(() => createClient(), []);
  const [loadingSignOut, setLoadingSignOut] = useState(false);

  async function handleSignOut() {
    setLoadingSignOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Erro ao sair:", err);
    } finally {
      setLoadingSignOut(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.1),transparent_24%),linear-gradient(180deg,#020817_0%,#07111f_100%)] text-foreground flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:88px_88px]" />
      
      <section className="relative mx-auto flex w-full max-w-xl items-center justify-center px-6 py-10 lg:px-8">
        <div className="w-full rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.32)] backdrop-blur-xl md:p-10 text-center">
          
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 mx-auto">
            <LockKeyhole className="h-5 w-5" />
          </div>

          <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-white">
            ⚠️ Acesso Bloqueado
          </h1>
          
          <p className="mt-4 text-sm leading-relaxed text-slate-300 max-w-sm mx-auto">
            Sua assinatura está inativa ou suspensa. Ative seu plano para liberar o acesso ao Stacker.
          </p>

          <div className="mt-8 space-y-4">
            {plan === "perfil" ? (
              <a
                href="https://pay.hotmart.com/E106520584A?bid=1784062638573&checkoutMode=2"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button
                  type="button"
                  className="h-12 w-full justify-center rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2"
                >
                  Ativar Teste de Perfil (R$ 67,90/mês)
                </Button>
              </a>
            ) : plan === "recrutamento" ? (
              <a
                href="https://pay.kiwify.com.br/pt8zNzz"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button
                  type="button"
                  className="h-12 w-full justify-center rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2"
                >
                  Ativar Stacker de Recrutamento & Seleção
                </Button>
              </a>
            ) : (
              <a
                href="https://www.asaas.com/c/qmacegbjbnml820m"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button
                  type="button"
                  className="h-12 w-full justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  Assinar Plano Completo (R$ 297,00/mês)
                </Button>
              </a>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
            <button
              onClick={handleSignOut}
              disabled={loadingSignOut}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              {loadingSignOut ? "Saindo..." : "Sair da conta"}
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}

export default function BloqueadoPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#020817] text-white flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">Carregando...</p>
      </main>
    }>
      <BloqueadoContent />
    </Suspense>
  );
}
