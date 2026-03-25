import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

  let plan: any = null;

  if (subscription?.plan_id) {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .eq("id", subscription.plan_id)
      .maybeSingle();

    plan = data;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Assinatura</h1>
            <p className="mt-2 text-muted-foreground">
              Acompanhe plano, créditos, renovação e uso recente da sua conta.
            </p>
          </div>

          <Link
            href="/app/configuracoes"
            className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
          >
            Voltar
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Plano atual</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {plan?.name ?? "Sem plano ativo"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan ? formatCurrency(plan.price_cents) : "Ative um plano para liberar recursos pagos"}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Créditos disponíveis</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {wallet?.balance ?? 0}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Saldo atual da sua carteira
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Status da assinatura</p>
            <div className="mt-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                  subscription?.status
                )}`}
              >
                {formatStatus(subscription?.status ?? "sem_assinatura")}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {subscription?.cancel_at_period_end
                ? "Cancelamento agendado ao fim do período"
                : "Assinatura em acompanhamento"}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Próxima renovação</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {formatDate(subscription?.current_period_end)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan?.billing_interval
                ? `Intervalo: ${plan.billing_interval}`
                : "Sem periodicidade definida"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Resumo do plano
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dados atuais da sua assinatura e capacidade mensal.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium text-muted-foreground opacity-70"
              >
                Cancelar assinatura
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-background p-4">
                <p className="text-sm text-muted-foreground">Nome do plano</p>
                <p className="mt-2 text-lg font-semibold">
                  {plan?.name ?? "Sem plano"}
                </p>
              </div>

              <div className="rounded-2xl border bg-background p-4">
                <p className="text-sm text-muted-foreground">Créditos mensais</p>
                <p className="mt-2 text-lg font-semibold">
                  {plan?.monthly_credits ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border bg-background p-4">
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(plan?.price_cents)}
                </p>
              </div>

              <div className="rounded-2xl border bg-background p-4">
                <p className="text-sm text-muted-foreground">Início do período</p>
                <p className="mt-2 text-lg font-semibold">
                  {formatDate(subscription?.current_period_start)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border bg-background p-4">
              <p className="text-sm text-muted-foreground">Observação</p>
              <p className="mt-2 text-sm leading-6 text-foreground/90">
                A cobrança e o cancelamento real entram na próxima fase, junto com a integração de billing.
                Esta tela já mostra os dados reais disponíveis no banco.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">
              Movimentações de créditos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Histórico recente da carteira de créditos.
            </p>

            <div className="mt-6 space-y-3">
              {(transactions ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  Nenhuma movimentação encontrada.
                </div>
              ) : (
                transactions!.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {item.description ?? item.transaction_type ?? "Movimentação"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
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
                        <p className="mt-1 text-xs text-muted-foreground">
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

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Uso recente</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Eventos recentes de consumo dentro da plataforma.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted/50 text-left">
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
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Nenhum evento de uso encontrado.
                      </td>
                    </tr>
                  ) : (
                    usageEvents!.map((item: any) => (
                      <tr key={item.id} className="border-t">
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
