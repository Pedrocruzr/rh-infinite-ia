"use client";

import { useState } from "react";

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
  topupProducts: TopupProduct[];
  activePlanCode?: string | null;
};

type BillingMethod = "PIX" | "CREDIT_CARD";

const STANDARD_TOPUPS = [
  {
    code: "topup_essencial",
    name: "Essencial",
    price: "R$ 100,00",
    credits: 10,
    estimate: "10 créditos extras (R$ 10,00 / crédito)",
  },
  {
    code: "topup_profissional",
    name: "Profissional",
    price: "R$ 190,00",
    credits: 20,
    estimate: "20 créditos extras (R$ 9,50 / crédito)",
  },
  {
    code: "topup_intensivo",
    name: "Intensivo",
    price: "R$ 270,00",
    credits: 30,
    estimate: "30 créditos extras (R$ 9,00 / crédito)",
  },
] as const;

const INDIVIDUAL_TOPUPS = [
  {
    code: "topup_individual_avulso",
    name: "Avulso",
    price: "R$ 30,00",
    credits: 3,
    estimate: "1 teste de perfil comportamental (R$ 30,00 / teste)",
  },
  {
    code: "topup_individual_dupla",
    name: "Dupla",
    price: "R$ 58,00",
    credits: 6,
    estimate: "2 testes de perfil comportamental (R$ 29,00 / teste)",
  },
  {
    code: "topup_individual_trio",
    name: "Trio",
    price: "R$ 84,00",
    credits: 9,
    estimate: "3 testes de perfil comportamental (R$ 28,00 / teste)",
  },
] as const;

function getTopupDisplay(
  itemCode: string,
  fallbackCents: number,
  fallbackCredits: number,
  isIndividual: boolean
) {
  const list = isIndividual ? INDIVIDUAL_TOPUPS : STANDARD_TOPUPS;
  const fixed = list.find((item) => item.code === itemCode);

  if (fixed) {
    return fixed;
  }

  return {
    code: itemCode,
    name: "Recarga Extra",
    price: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(fallbackCents / 100),
    credits: fallbackCredits,
    estimate: isIndividual
      ? "Uso estimado: 1 teste de perfil comportamental"
      : "Uso estimado: simples 1 · média 2 · robusta 3 a 4 créditos",
  };
}

export function SubscriptionPlans({
  topupProducts,
  activePlanCode,
}: Props) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const isIndividual = activePlanCode === "perfil_comportamental";
  const displayList = isIndividual ? INDIVIDUAL_TOPUPS : STANDARD_TOPUPS;

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
        window.location.assign(invoiceUrl);
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
          Recargas avulsas para usar até a próxima renovação. Os créditos extras têm validade de 30 dias.
        </p>
      </div>

      <div className={`mt-6 grid gap-4 ${isIndividual ? "max-w-md xl:grid-cols-1" : "xl:grid-cols-3"}`}>
        {displayList.map((fixedTopup) => {
          const topup =
            topupProducts.find((item) => item.code === fixedTopup.code) ?? null;
          const checkoutCode = topup?.code ?? fixedTopup.code;
          const display = getTopupDisplay(
            fixedTopup.code,
            topup?.price_cents ?? 0,
            topup?.credits ?? fixedTopup.credits,
            isIndividual
          );

          return (
            <div
              key={display.code}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Recarga avulsa
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{display.name}</h3>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-3xl font-semibold">{display.price}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {display.credits} créditos
                </p>
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <p>Validade de {topup?.expires_in_days ?? 30} dias</p>
                <p>Recarga extra até a renovação</p>
                <p>{display.estimate}</p>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void startTopupCheckout(checkoutCode, "PIX")}
                  disabled={loadingKey !== null}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 dark:border-white dark:bg-white dark:text-slate-950"
                >
                  {loadingKey === `${checkoutCode}:PIX`
                    ? "Gerando PIX..."
                    : "Comprar com PIX"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void startTopupCheckout(checkoutCode, "CREDIT_CARD")
                  }
                  disabled={loadingKey !== null}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-800 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                >
                  {loadingKey === `${checkoutCode}:CREDIT_CARD`
                    ? "Abrindo cartão..."
                    : "Comprar com cartão"}
                </button>
              </div>
            </div>
          );
        })}
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
