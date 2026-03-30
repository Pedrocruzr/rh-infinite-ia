"use client";

import { useMemo, useState } from "react";

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

type BillingMethod = "PIX" | "CREDIT_CARD";

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
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);

  const sortedPlans = [...plans].sort(
    (a, b) => order.indexOf(a.code) - order.indexOf(b.code)
  );

  const selectedPlan = useMemo(
    () => sortedPlans.find((plan) => plan.code === selectedPlanCode) ?? null,
    [sortedPlans, selectedPlanCode]
  );

  function selectPlan(planCode: string) {
    setSelectedPlanCode(planCode);
    setError(null);
    setResult(null);
  }

  async function startCheckout(planCode: string, method: BillingMethod) {
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
        throw new Error(payload?.error || "Erro ao escolher plano.");
      }

      setResult(payload as CheckoutResult);

      const invoiceUrl = payload?.checkout?.invoiceUrl;
      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao escolher plano.");
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
          Créditos Extras
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
          const isSelected = selectedPlanCode === plan.code;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                isPopular
                  ? "border-slate-950 bg-slate-950 text-white dark:border-sky-200/20 dark:bg-white dark:text-slate-950"
                  : "border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/5"
              } ${isSelected ? "ring-2 ring-sky-400/40" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={`text-sm ${
                      isPopular ? "text-white/70 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"
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
                {plan.billing_interval === "month" ? null : (
                  <p
                    className={`mt-1 text-sm ${
                      isPopular ? "text-white/70 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {plan.billing_interval}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <p>{plan.monthly_credits} créditos</p>
                <p>Todos os agentes liberados</p>
                <p>Uso estimado: simples 1 · média 2 · robusta 3 a 4 créditos</p>
              </div>

              <div className="mt-6 grid gap-2">
                <button
                  type="button"
                  onClick={() => selectPlan(plan.code)}
                  disabled={loadingKey !== null || isCurrent}
                  className={`inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium transition ${
                    isPopular
                      ? "bg-white text-black hover:opacity-90 disabled:opacity-60 dark:bg-slate-950 dark:text-white"
                      : "border border-slate-200 bg-white/80 text-slate-800 hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                  }`}
                >
                  {isCurrent
                    ? "Plano atual"
                    : isSelected
                      ? "Créditos extras"
                      : "Créditos extras"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlan ? (
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold">Plano selecionado</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Agora escolha a forma de pagamento.
          </p>

          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{selectedPlan.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedPlan.monthly_credits} créditos
                </p>
              </div>
              <p className="text-lg font-semibold">
                {formatCurrency(selectedPlan.price_cents)}
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => void startCheckout(selectedPlan.code, "PIX")}
                disabled={loadingKey !== null}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 dark:border-white dark:bg-white dark:text-slate-950"
              >
                {loadingKey === `${selectedPlan.code}:PIX`
                  ? "Gerando PIX..."
                  : "Pagar com PIX"}
              </button>


              <button
                type="button"
                onClick={() => void startCheckout(selectedPlan.code, "CREDIT_CARD")}
                disabled={loadingKey !== null}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-800 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
              >
                {loadingKey === `${selectedPlan.code}:CREDIT_CARD`
                  ? "Abrindo cartão..."
                  : "Cartão de crédito"}
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              PIX e cartão de crédito disponíveis. A cobrança abre em nova aba quando o Asaas retornar invoiceUrl.
            </p>
          </div>
        </div>
      ) : null}

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
              onClick={() => void copy(result.checkout.pixCopyPaste || "")}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-800 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
            >
              Copiar código PIX
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}
    </section>
  );
}
