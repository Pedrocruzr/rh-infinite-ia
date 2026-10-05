import Link from "next/link";
import { Lock, Sparkles, ArrowLeft } from "lucide-react";

interface FeatureLockedScreenProps {
  featureName: string;
  description: string;
  availablePlans?: string;
}

export function FeatureLockedScreen({
  featureName,
  description,
  availablePlans = "Recrutamento & Seleção ou Stacks Infinity",
}: FeatureLockedScreenProps) {
  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-[#1e2733] dark:bg-[#102033]/85 dark:shadow-[0_24px_80px_rgba(15,23,42,0.3)]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Lock className="h-7 w-7" />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Recurso Exclusivo
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {featureName} Bloqueado
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>

          <div className="mt-6 w-full rounded-2xl border border-slate-200/60 bg-slate-50/60 p-5 text-left dark:border-white/5 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Disponível nos planos:
            </p>
            <p className="mt-1 text-sm font-bold text-sky-700 dark:text-sky-300">
              {availablePlans}
            </p>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3">
            <Link
              href="/app/configuracoes/assinatura"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-500 hover:shadow-sky-500/35"
            >
              Ver Opções de Upgrade
            </Link>
            <Link
              href="/app/agentes"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-transparent py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Agentes Liberados
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
