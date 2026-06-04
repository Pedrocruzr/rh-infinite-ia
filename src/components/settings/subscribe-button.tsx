"use client";

import { useState } from "react";

export function SubscribeButton({
  disabled = false,
  label = "Ativar plano completo",
}: {
  disabled?: boolean;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
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
        throw new Error(payload?.error || "Erro ao abrir checkout de assinatura.");
      }

      const invoiceUrl = payload?.checkout?.invoiceUrl;
      if (invoiceUrl) {
        window.location.assign(invoiceUrl);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao abrir checkout."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={disabled || loading}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 shadow-sm disabled:opacity-60 dark:bg-sky-500 dark:hover:bg-sky-400"
      >
        {loading ? "Abrindo..." : label}
      </button>

      {error ? (
        <p className="text-xs text-red-600 dark:text-red-300 max-w-xs">{error}</p>
      ) : null}
    </div>
  );
}
