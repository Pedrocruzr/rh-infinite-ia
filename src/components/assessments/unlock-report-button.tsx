"use client";

import { useState } from "react";
import { Lock, Sparkles } from "lucide-react";

export default function UnlockReportButton({
  assessmentId,
  cost,
  currentBalance,
}: {
  assessmentId: string;
  cost: number;
  currentBalance: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/recrutador/assessments/${assessmentId}/unlock`, {
        method: "POST",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao desbloquear relatório.");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao desbloquear.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl text-center py-12 px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-300">
        <Lock className="h-8 w-8 animate-pulse" />
      </div>

      <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
        Relatório Bloqueado
      </h2>

      <p className="mt-3 text-base text-slate-500 dark:text-slate-400 leading-relaxed">
        Este é um relatório detalhado gerado pela inteligência artificial. Para visualizar o conteúdo completo e baixar a versão em PDF, você precisa desbloqueá-lo.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-around gap-4 text-left">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custo do desbloqueio</p>
            <p className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">{cost} créditos</p>
          </div>
          <div className="h-10 w-px bg-slate-200 dark:bg-white/10" />
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Seu saldo atual</p>
            <p className="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-200">{currentBalance} créditos</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={handleUnlock}
          disabled={loading || currentBalance < cost}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            "Processando..."
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Desbloquear Relatório
            </>
          )}
        </button>
      </div>
      
      {currentBalance < cost && (
        <p className="mt-3 text-xs text-red-500 dark:text-red-400">
          Você não tem saldo suficiente. Compre mais créditos nas configurações.
        </p>
      )}
    </div>
  );
}
