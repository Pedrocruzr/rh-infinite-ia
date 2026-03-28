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

type ManualPixInfo = {
  beneficiary: string;
  key: string;
  city: string;
  instructions: string;
};

type RequestResult = {
  plan: {
    code: string;
    name: string;
    price_cents: number;
    monthly_credits: number;
  };
  ticket: {
    id: string;
    subject: string;
    status: string;
  };
  pix: ManualPixInfo;
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
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RequestResult | null>(null);

  const sortedPlans = [...plans].sort(
    (a, b) => order.indexOf(a.code) - order.indexOf(b.code)
  );

  async function handleRequest(planCode: string) {
    try {
      setLoadingCode(planCode);
      setError(null);

      const response = await fetch("/api/account/subscription/request-manual-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planCode }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao solicitar pagamento.");
      }

      setResult(payload as RequestResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao solicitar pagamento.");
    } finally {
      setLoadingCode(null);
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

              <button
                type="button"
                onClick={() => void handleRequest(plan.code)}
                disabled={loadingCode === plan.code || isCurrent}
                className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium transition ${
                  isPopular
                    ? "bg-white text-black hover:opacity-90 disabled:opacity-60 dark:bg-neutral-950 dark:text-neutral-100"
                    : "border hover:bg-muted disabled:opacity-60"
                }`}
              >
                {isCurrent
                  ? "Plano atual"
                  : loadingCode === plan.code
                    ? "Solicitando..."
                    : "Solicitar via PIX"}
              </button>
            </div>
          );
        })}
      </div>

      {result ? (
        <div className="mt-6 rounded-2xl border bg-background p-5">
          <h3 className="text-lg font-semibold">Pagamento manual via PIX</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Solicitação registrada com sucesso. Após o pagamento, a liberação da assinatura será feita manualmente.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-4">
              <p className="text-sm text-muted-foreground">Plano</p>
              <p className="mt-1 font-semibold">{result.plan.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">Valor</p>
              <p className="mt-1 font-semibold">{formatCurrency(result.plan.price_cents)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Créditos mensais</p>
              <p className="mt-1 font-semibold">{result.plan.monthly_credits}</p>
            </div>

            <div className="rounded-2xl border p-4">
              <p className="text-sm text-muted-foreground">Favorecido</p>
              <p className="mt-1 font-semibold">{result.pix.beneficiary}</p>
              <p className="mt-2 text-sm text-muted-foreground">Chave PIX</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-semibold break-all">{result.pix.key}</p>
                <button
                  type="button"
                  onClick={() => void copy(result.pix.key)}
                  className="rounded-lg border px-2 py-1 text-xs hover:bg-muted"
                >
                  Copiar
                </button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Cidade</p>
              <p className="mt-1 font-semibold">{result.pix.city}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground">Instruções</p>
            <p className="mt-2 text-sm leading-6">{result.pix.instructions}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Protocolo da solicitação: {result.ticket.id}
            </p>
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
