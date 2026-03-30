import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Coins,
  CreditCard,
  ReceiptText,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { SubscriptionPlans } from "@/components/settings/subscription-plans";

export const dynamic = "force-dynamic";

function formatCurrency(cents?: number | null) {
  if (typeof cents !== "number") return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(status?: string | null) {
  if (!status) return "Sem status";
  return status.replaceAll("_", " ");
}

function statusClass(status?: string | null) {
  switch (status) {
    case "active":
    case "ativo":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "trialing":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "pending_payment":
    case "past_due":
    case "incomplete":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "canceled":
    case "cancelled":
    case "cancelado":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-700";
  }
}

export default async function AssinaturaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: wallet } = await supabase
    .from("credit_wallets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: creditGrants } = await supabase
    .from("credit_grants")
    .select("remaining_credits, expires_at")
    .eq("user_id", user.id);

  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: usageEvents } = await supabase
    .from("usage_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("active", true)
    .eq("code", "start");

  const { data: topupProducts } = await supabase
    .from("topup_products")
    .select("*")
    .eq("active", true)
    .order("credits", { ascending: true });

  let plan: any = null;

  if (subscription?.plan_id) {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .eq("id", subscription.plan_id)
      .maybeSingle();

    plan = data;
  }

  const activeBalance =
    (creditGrants ?? []).reduce((sum, item: any) => {
      const expiresAt = item?.expires_at ? new Date(item.expires_at) : null;
      if (expiresAt && expiresAt.getTime() <= Date.now()) {
        return sum;
      }

      return sum + Number(item?.remaining_credits ?? 0);
    }, 0) || wallet?.balance || 0;

  const startPlan = ((plans ?? [])[0] ?? null) as any;
  const displayPlanName = plan?.name ?? startPlan?.name ?? "Sem plano ativo";
  const displayPlanPrice = plan?.price_cents
    ? formatCurrency(plan.price_cents)
    : startPlan?.price_cents
      ? formatCurrency(startPlan.price_cents)
      : "Escolha um plano para começar";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                <BadgeCheck className="h-3.5 w-3.5" />
                Cobrança e créditos
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                Assinatura
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                Acompanhe plano, créditos, renovação e uso recente da sua conta mantendo o motor comercial atual intacto.
              </p>
            </div>

            <Link
              href="/app/configuracoes"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-sky-400/30 dark:hover:bg-white/8"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Planos ativos
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Escolha e acompanhe sua assinatura.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Carteira de créditos
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Saldo e movimentações recentes.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                  <ReceiptText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Uso recente
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Histórico visual sem mudar backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SubscriptionPlans
          startPlan={startPlan}
          topupProducts={(topupProducts ?? []) as any[]}
          currentPlanCode={plan?.code ?? null}
          currentStatus={subscription?.status ?? null}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#102033]/72">
            <p className="text-sm text-slate-500 dark:text-slate-400">Plano atual</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {displayPlanName}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {displayPlanPrice}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#102033]/72">
            <p className="text-sm text-slate-500 dark:text-slate-400">Créditos disponíveis</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {activeBalance}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Saldo atual da sua carteira
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#102033]/72">
            <p className="text-sm text-slate-500 dark:text-slate-400">Status da assinatura</p>
            <div className="mt-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                  subscription?.status
                )}`}
              >
                {formatStatus(subscription?.status ?? "sem_assinatura")}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {subscription?.status === "pending_payment"
                ? "Aguardando pagamento manual por PIX"
                : subscription?.cancel_at_period_end
                  ? "Cancelamento agendado ao fim do período"
                  : "Assinatura em acompanhamento"}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#102033]/72">
            <p className="text-sm text-slate-500 dark:text-slate-400">Próxima renovação</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {formatDate(subscription?.current_period_end)}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {plan?.billing_interval
                ? `Intervalo: ${plan.billing_interval}`
                : "Sem periodicidade definida"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Resumo do plano
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Dados atuais da sua assinatura e capacidade mensal.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-medium text-slate-400 opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
              >
                Cancelar assinatura
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Nome do plano</p>
                <p className="mt-2 text-lg font-semibold">
                  {plan ? "Start" : "Sem plano"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Créditos mensais</p>
                <p className="mt-2 text-lg font-semibold">
                  {plan?.monthly_credits ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Valor</p>
                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(plan?.price_cents)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Início do período</p>
                <p className="mt-2 text-lg font-semibold">
                  {formatDate(subscription?.current_period_start)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Consumo estimado</p>
              <p className="mt-2 text-sm leading-6 text-foreground/90">
                Tarefa simples consome 1 crédito. Tarefa média consome 2 créditos.
                Tarefa mais robusta consome de 3 a 4 créditos.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72">
            <h2 className="text-2xl font-semibold tracking-tight">
              Movimentações de créditos
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Histórico recente da carteira de créditos.
            </p>

            <div className="mt-6 space-y-3">
              {(transactions ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  Nenhuma movimentação encontrada.
                </div>
              ) : (
                transactions!.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {item.description ?? item.transaction_type ?? "Movimentação"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            item.delta >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {item.delta >= 0 ? "+" : ""}
                          {item.delta}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Saldo após: {item.balance_after ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72">
          <h2 className="text-2xl font-semibold tracking-tight">Uso recente</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Eventos recentes de consumo dentro da plataforma.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-100/80 text-left dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Evento</th>
                    <th className="px-4 py-3 font-medium">Créditos</th>
                  </tr>
                </thead>
                <tbody>
                  {(usageEvents ?? []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                      >
                        Nenhum evento de uso encontrado.
                      </td>
                    </tr>
                  ) : (
                    usageEvents!.map((item: any) => (
                      <tr key={item.id} className="border-t border-slate-200/80 dark:border-white/10">
                        <td className="px-4 py-3">{formatDateTime(item.created_at)}</td>
                        <td className="px-4 py-3">{item.event_type ?? "—"}</td>
                        <td className="px-4 py-3">{item.credits_delta ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
