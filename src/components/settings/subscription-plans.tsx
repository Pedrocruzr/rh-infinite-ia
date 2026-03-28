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

type CheckoutResult = {
  checkout: {
    customerId: string;
    paymentId: string;
    status?: string;
    invoiceUrl?: string | null;
    pixQrCode?: string | null;
    pixCopyPaste?: string | null;
  };
};

type Props = {
  plans: Plan[];
  currentPlanCode?: string | null;
  currentStatus?: string | null;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

const order = ["essencial", "profissional", "intensivo"];

export function SubscriptionPlans({
  plans,
  currentPlanCode,
  currentStatus,
}: Props) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const sortedPlans = [...plans].sort(
    (a, b) => order.indexOf(a.code) - order.indexOf(b.code)
  );

  async function startCheckout(planCode: string, method: "PIX" | "CREDIT_CARD") {
    try {
      const key = `${planCode}:${method}`;
      setLoadingKey(key);
      setError(null);

      const response = await fetch("/api/account/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planCode, method }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao iniciar cobrança.");
      }

      setResult(payload as CheckoutResult);

      const invoiceUrl = payload?.checkout?.invoiceUrl;
      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar cobrança.");
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
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">
          Escolha seu plano
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Todos os agentes liberados. Você escolhe apenas o volume de uso.
        </p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {sortedPlans.map((plan) => {
          const isPopular = plan.code === "profissional";
          const isCurrent =
            currentPlanCode === plan.code &&
            ["active", "trialing", "ativo"].includes(
              (currentStatus || "").toLowerCase()
            );

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                isPopular
                  ? "border-neutral-900 bg-neutral-950 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
                  : "bg-background"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={`text-sm ${
                      isPopular ? "text-white/70 dark:text-neutral-600" : "text-muted-foreground"
                    }`}
                  >
                    {plan.description || "Plano"}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{plan.name}</h3>
                </div>

                {isPopular ? (
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium dark:border-neutral-300">
                    Mais popular
                  </span>
                ) : null}
              </div>

              <div className="mt-6">
                <p className="text-3xl font-semibold">
                  {formatCurrency(plan.price_cents)}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    isPopular ? "text-white/70 dark:text-neutral-600" : "text-muted-foreground"
                  }`}
                >
                  {plan.billing_interval === "month" ? "por mês" : plan.billing_interval}
                </p>
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <p>{plan.monthly_credits} créditos mensais</p>
                <p>Todos os agentes liberados</p>
                <p>Uso estimado: simples 1 · média 2 · robusta 3 a 4 créditos</p>
              </div>

              <div className="mt-6 grid gap-2">
                <button
                  type="button"
                  onClick={() => void startCheckout(plan.code, "PIX")}
                  disabled={loadingKey !== null || isCurrent}
                  className={`inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium transition ${
                    isPopular
                      ? "bg-white text-black hover:opacity-90 disabled:opacity-60 dark:bg-neutral-950 dark:text-neutral-100"
                      : "border hover:bg-muted disabled:opacity-60"
                  }`}
                >
                  {isCurrent
                    ? "Plano atual"
                    : loadingKey === `${plan.code}:PIX`
                      ? "Gerando PIX..."
                      : "Pagar com PIX"}
                </button>

                <button
                  type="button"
                  onClick={() => void startCheckout(plan.code, "CREDIT_CARD")}
                  disabled={loadingKey !== null || isCurrent}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                >
                  {loadingKey === `${plan.code}:CREDIT_CARD`
                    ? "Abrindo cartão..."
                    : "Pagar com cartão"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {result?.checkout?.pixCopyPaste ? (
        <div className="mt-6 rounded-2xl border bg-background p-5">
          <h3 className="text-lg font-semibold">PIX gerado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Use o código abaixo no seu banco ou aplicativo de pagamento.
          </p>

          <div className="mt-4 rounded-2xl border p-4">
            <p className="break-all text-sm leading-6">
              {result.checkout.pixCopyPaste}
            </p>

            <button
              type="button"
              onClick={() => void copy(result.checkout.pixCopyPaste || "")}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm hover:bg-muted"
            >
              Copiar PIX
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </section>
  );
}
