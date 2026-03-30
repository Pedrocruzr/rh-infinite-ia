"use client";

import { useState } from "react";

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price_cents: number;
  billing_interval: string;
  monthly_credits: number;
};

type TopupProduct = {
  id: string;
  code: string;
  name: string;
  credits: number;
  price_cents: number;
  expires_in_days: number;
};

type CheckoutResult = {
  checkout: {
    customerId: string;
    paymentId?: string;
    subscriptionId?: string;
    status?: string;
    invoiceUrl?: string | null;
    pixQrCode?: string | null;
    pixCopyPaste?: string | null;
  };
};

type Props = {
  startPlan: Plan | null;
  topupProducts: TopupProduct[];
  currentPlanCode?: string | null;
  currentStatus?: string | null;
};

type BillingMethod = "PIX" | "CREDIT_CARD";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function SubscriptionPlans({
  startPlan,
  topupProducts,
  currentPlanCode,
  currentStatus,
}: Props) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const isStartActive =
    currentPlanCode === "start" &&
    ["active", "trialing", "ativo", "pending_payment"].includes(
      (currentStatus || "").toLowerCase()
    );

  async function startSubscription(method: BillingMethod) {
    if (!startPlan) return;

    try {
      const key = `subscription:${method}`;
      setLoadingKey(key);
      setError(null);

      const response = await fetch("/api/account/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planCode: startPlan.code, method }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao iniciar assinatura.");
      }

      setResult(payload as CheckoutResult);

      const invoiceUrl = payload?.checkout?.invoiceUrl;
      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar assinatura.");
    } finally {
      setLoadingKey(null);
    }
  }

  async function startTopupCheckout(
    topupCode: string,
    method: BillingMethod
  ) {
    try {
      const key = `${topupCode}:${method}`;
      setLoadingKey(key);
      setError(null);

      const response = await fetch("/api/account/topups/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topupCode, method }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao comprar créditos extras.");
      }

      setResult(payload as CheckoutResult);

      const invoiceUrl = payload?.checkout?.invoiceUrl;
      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao comprar créditos extras."
      );
    } finally {
      setLoadingKey(null);
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">
          Créditos extras
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          O plano Start é recorrente e as recargas extras continuam avulsas. Os créditos extras têm validade de 30 dias.
        </p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Assinatura recorrente
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                {startPlan?.name ?? "Start"}
              </h3>
            </div>

            {isStartActive ? (
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                Ativo
              </span>
            ) : null}
          </div>

          <div className="mt-6">
            <p className="text-3xl font-semibold">
              {startPlan ? formatCurrency(startPlan.price_cents) : "R$ 197,00"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              120 créditos por mês
            </p>
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <p>Renovação mensal automática</p>
            <p>Todos os agentes liberados</p>
            <p>Os créditos mensais não acumulam</p>
          </div>

          <div className="mt-6 grid gap-2">
            <button
              type="button"
              onClick={() => void startSubscription("CREDIT_CARD")}
              disabled={!startPlan || loadingKey !== null || isStartActive}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-medium text-slate-800 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
            >
              {loadingKey === "subscription:CREDIT_CARD"
                ? "Abrindo cartão..."
                : isStartActive
                  ? "Plano ativo"
                  : "Assinar Start"}
            </button>
          </div>
        </div>

        {topupProducts.map((topup) => (
          <div
            key={topup.id}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Recarga avulsa
                </p>
                <h3 className="mt-2 text-2xl font-semibold">{topup.name}</h3>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-3xl font-semibold">
                {formatCurrency(topup.price_cents)}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {topup.credits} créditos
              </p>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <p>Validade de {topup.expires_in_days} dias</p>
              <p>Recarga extra até a renovação</p>
              <p>Uso estimado: simples 1 · média 2 · robusta 3 a 4 créditos</p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => void startTopupCheckout(topup.code, "PIX")}
                disabled={loadingKey !== null}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 dark:border-white dark:bg-white dark:text-slate-950"
              >
                {loadingKey === `${topup.code}:PIX`
                  ? "Gerando PIX..."
                  : "Comprar com PIX"}
              </button>

              <button
                type="button"
                onClick={() => void startTopupCheckout(topup.code, "CREDIT_CARD")}
                disabled={loadingKey !== null}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-800 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
              >
                {loadingKey === `${topup.code}:CREDIT_CARD`
                  ? "Abrindo cartão..."
                  : "Comprar com cartão"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {result?.checkout?.pixCopyPaste ? (
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">PIX gerado</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Se a janela da cobrança abriu, você também pode concluir por lá.
          </p>

          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="break-all text-sm leading-6">
              {result.checkout.pixCopyPaste}
            </p>

            <button
              type="button"
              onClick={() => void copy(result.checkout.pixCopyPaste!)}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-800 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
            >
              Copiar código PIX
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}
    </section>
  );
}
