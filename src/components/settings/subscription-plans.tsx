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
    code: "topup_perfil_avulso",
    name: "Avaliação Avulsa Extra",
    price: "R$ 129,00",
    credits: 3,
    estimate: "1 teste de perfil comportamental extra (R$ 129,00 / teste)",
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

  const isIndividual = activePlanCode === "perfil_comportamental" || (activePlanCode ? activePlanCode.startsWith("perfil_") : false);
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

  async function handleUpgradePlan(planCode: string, method: "PIX" | "CREDIT_CARD") {
    try {
      const key = `upgrade:${planCode}:${method}`;
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
        throw new Error(payload?.error || "Erro ao iniciar alteração de plano.");
      }

      const invoiceUrl = payload?.checkout?.invoiceUrl;
      if (invoiceUrl) {
        window.location.assign(invoiceUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar alteração de plano.");
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="space-y-8">
      {!isIndividual && (
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              Créditos extras
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Recargas avulsas para usar até a próxima renovação. Os créditos extras têm validade de 30 dias.
            </p>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
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
      )}

      {isIndividual && (
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              Planos do Teste de Perfil Comportamental
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Escolha um plano abaixo para fazer upgrade ou alterar sua assinatura atual diretamente via Asaas.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* Start Plan Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider dark:text-sky-400">Plano Start</p>
                <h3 className="mt-2 text-xl font-semibold">Start</h3>
                <p className="mt-4 text-3xl font-semibold">R$ 129<span className="text-sm font-normal text-slate-500">/mês</span></p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li>• 1 avaliação inclusa/mês</li>
                  <li>• Custo de R$ 129,00 por teste</li>
                  <li>• Acesso ao painel completo</li>
                </ul>
              </div>

              {activePlanCode === "perfil_start" ? (
                <button
                  disabled
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-400 dark:bg-white/5 dark:text-neutral-500"
                >
                  Plano Ativo
                </button>
              ) : (
                <div className="mt-6 grid gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("perfil_start", "PIX")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:border-white dark:bg-white dark:text-slate-950"
                  >
                    {loadingKey === "upgrade:perfil_start:PIX" ? "Gerando..." : "Comprar com PIX"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("perfil_start", "CREDIT_CARD")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-2 text-xs font-semibold text-slate-800 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                  >
                    {loadingKey === "upgrade:perfil_start:CREDIT_CARD" ? "Abrindo..." : "Comprar com cartão"}
                  </button>
                </div>
              )}
            </div>

            {/* Essencial Plan Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider dark:text-sky-400">Plano Essencial</p>
                <h3 className="mt-2 text-xl font-semibold">Essencial</h3>
                <p className="mt-4 text-3xl font-semibold">R$ 447<span className="text-sm font-normal text-slate-500">/mês</span></p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li>• 5 avaliações inclusas/mês</li>
                  <li>• Custo reduzido de R$ 89,40/teste</li>
                  <li>• Acesso ao painel completo</li>
                </ul>
              </div>

              {activePlanCode === "perfil_essencial" ? (
                <button
                  disabled
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-400 dark:bg-white/5 dark:text-neutral-500"
                >
                  Plano Ativo
                </button>
              ) : (
                <div className="mt-6 grid gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("perfil_essencial", "PIX")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:border-white dark:bg-white dark:text-slate-950"
                  >
                    {loadingKey === "upgrade:perfil_essencial:PIX" ? "Gerando..." : "Comprar com PIX"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("perfil_essencial", "CREDIT_CARD")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-2 text-xs font-semibold text-slate-800 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                  >
                    {loadingKey === "upgrade:perfil_essencial:CREDIT_CARD" ? "Abrindo..." : "Comprar com cartão"}
                  </button>
                </div>
              )}
            </div>

            {/* Profissional Plan Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider dark:text-sky-400">Plano Profissional</p>
                <h3 className="mt-2 text-xl font-semibold">Profissional</h3>
                <p className="mt-4 text-3xl font-semibold">R$ 897<span className="text-sm font-normal text-slate-500">/mês</span></p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li>• 12 avaliações inclusas/mês</li>
                  <li>• Custo reduzido de R$ 74,75/teste</li>
                  <li>• Acesso ao painel completo</li>
                </ul>
              </div>

              {activePlanCode === "perfil_profissional" ? (
                <button
                  disabled
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-400 dark:bg-white/5 dark:text-neutral-500"
                >
                  Plano Ativo
                </button>
              ) : (
                <div className="mt-6 grid gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("perfil_profissional", "PIX")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:border-white dark:bg-white dark:text-slate-950"
                  >
                    {loadingKey === "upgrade:perfil_profissional:PIX" ? "Gerando..." : "Comprar com PIX"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("perfil_profissional", "CREDIT_CARD")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-2 text-xs font-semibold text-slate-800 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                  >
                    {loadingKey === "upgrade:perfil_profissional:CREDIT_CARD" ? "Abrindo..." : "Comprar com cartão"}
                  </button>
                </div>
              )}
            </div>

            {/* Corporativo Plan Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider dark:text-purple-400">Plano Corporativo</p>
                <h3 className="mt-2 text-xl font-semibold">Corporativo</h3>
                <p className="mt-4 text-3xl font-semibold">Sob Consulta</p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li>• 20+ avaliações/mês</li>
                  <li>• Âncora interna R$ 59–69</li>
                  <li>• Suporte dedicado</li>
                </ul>
              </div>
              <a
                href="https://wa.me/5511999999999?text=Olá!%20Quero%20solicitar%20um%20orçamento%20para%20o%20plano%20Corporativo%20do%20Teste%20de%20Perfil%20Comportamental%20do%20Stacker."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-800 transition hover:border-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                Falar com Consultor
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Planos Stacker: Recrutamento & Seleção e Stacks Infinity */}
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
            Assinaturas Disponíveis
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Planos Stacker & Checkout Integrado Asaas
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Assine ou faça upgrade do seu plano com faturamento imediato via PIX, Cartão ou pelo link direto do Asaas.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Card Recrutamento & Seleção */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-sky-500/30 bg-gradient-to-b from-sky-500/5 to-transparent p-6 shadow-sm dark:border-sky-400/20 dark:from-sky-400/5">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  Recrutamento & Seleção
                </span>
                {(activePlanCode === "recrutamento" || activePlanCode === "recrutamento_selecao") && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Plano Ativo
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-xl font-bold">Stacker Recrutamento</h3>
              <p className="mt-4 text-3xl font-extrabold">
                R$ 297<span className="text-sm font-normal text-slate-500">/mês</span>
              </p>
              <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li>• <strong>20 créditos mensais</strong> para gestão de vagas e triagem</li>
                <li>• Painel de Vagas Kanban + SLA de Fechamento com IA</li>
                <li>• E-book Recrutamento Inteligente + Templates inclusos</li>
                <li>• Envio automático de acesso via Titan Mail</li>
              </ul>
            </div>

            <div className="mt-6 space-y-3">
              {(activePlanCode === "recrutamento" || activePlanCode === "recrutamento_selecao") ? (
                <button
                  disabled
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-400 dark:bg-white/5 dark:text-neutral-500"
                >
                  Plano Ativo
                </button>
              ) : (
                <div className="grid gap-2 grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("recrutamento", "PIX")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-sky-600 bg-sky-600 px-2 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
                  >
                    {loadingKey === "upgrade:recrutamento:PIX" ? "Gerando..." : "Comprar com PIX"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("recrutamento", "CREDIT_CARD")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-2 text-xs font-semibold text-slate-800 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100"
                  >
                    {loadingKey === "upgrade:recrutamento:CREDIT_CARD" ? "Abrindo..." : "Comprar com Cartão"}
                  </button>
                </div>
              )}
              <a
                href="https://www.asaas.com/c/zk0bke5r9tjucy02"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-3 text-xs font-medium text-slate-700 transition hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
              >
                Checkout Direto Asaas (R$ 297,00) →
              </a>
            </div>
          </div>

          {/* Card Stacks Infinity */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Plano Completo
                </span>
                {activePlanCode === "start" && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Plano Ativo
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-xl font-bold">Stacks Infinity</h3>
              <p className="mt-4 text-3xl font-extrabold">
                R$ 297<span className="text-sm font-normal text-slate-500">/mês</span>
              </p>
              <ul className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li>• <strong>29 créditos mensais</strong> para todos os agentes de IA</li>
                <li>• Módulos de Turnover, Clima, Feedbacks e Descrição de Cargos</li>
                <li>• Suporte prioritário via WhatsApp</li>
                <li>• Renovação mensal automática via Asaas</li>
              </ul>
            </div>

            <div className="mt-6 space-y-3">
              {activePlanCode === "start" ? (
                <button
                  disabled
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-400 dark:bg-white/5 dark:text-neutral-500"
                >
                  Plano Ativo
                </button>
              ) : (
                <div className="grid gap-2 grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("start", "PIX")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:border-white dark:bg-white dark:text-slate-950"
                  >
                    {loadingKey === "upgrade:start:PIX" ? "Gerando..." : "Comprar com PIX"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpgradePlan("start", "CREDIT_CARD")}
                    disabled={loadingKey !== null}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-2 text-xs font-semibold text-slate-800 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/6 dark:text-slate-100"
                  >
                    {loadingKey === "upgrade:start:CREDIT_CARD" ? "Abrindo..." : "Comprar com Cartão"}
                  </button>
                </div>
              )}
              <a
                href="https://www.asaas.com/c/qmacegbjbnml820m"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-3 text-xs font-medium text-slate-700 transition hover:border-sky-400 hover:text-sky-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
              >
                Checkout Direto Asaas (R$ 297,00) →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
