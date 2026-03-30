"use client";

import { useState } from "react";

export function CancelSubscriptionButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/account/subscription/cancel", {
        method: "POST",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao cancelar assinatura.");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar assinatura.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={disabled || loading}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:text-red-700 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-red-500/30 dark:hover:text-red-200"
      >
        {loading ? "Cancelando..." : "Cancelar assinatura"}
      </button>

      {error ? (
        <p className="text-right text-xs text-red-600 dark:text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
