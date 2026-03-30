import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck, TriangleAlert } from "lucide-react";

import { SecurityForm } from "@/components/settings/security-form";

export default function SegurancaPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 md:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Segurança da conta
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                Segurança
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                Gerencie senha e recuperação de acesso da sua conta sem alterar o fluxo funcional já existente.
              </p>
            </div>

            <Link
              href="/app/configuracoes"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-sky-400/30 dark:hover:bg-white/8"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Senha de acesso
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Atualização direta e segura.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Recuperação
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Fluxo separado já preservado.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
                  <TriangleAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Fluxo sensível
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Só a casca visual foi alterada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SecurityForm />
      </section>
    </main>
  );
}
