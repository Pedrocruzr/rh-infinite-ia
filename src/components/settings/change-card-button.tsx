"use client";

import { useState } from "react";

export function ChangeCardButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChangeCard() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/account/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planCode: "start", method: "CREDIT_CARD" }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao abrir troca de cartão.");
      }

      const invoiceUrl = payload?.checkout?.invoiceUrl;
      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao abrir troca de cartão."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleChangeCard}
        disabled={disabled || loading}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-sky-400/30"
      >
        {loading ? "Abrindo..." : "Trocar de cartão"}
      </button>

      {error ? (
        <p className="text-right text-xs text-red-600 dark:text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
