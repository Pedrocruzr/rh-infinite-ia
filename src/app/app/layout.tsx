import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { UserAccountMenu } from "@/components/auth/user-account-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const dynamic = "force-dynamic";

export default async function InternalAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (rawProfile ?? {}) as any;

  const { data: rawSubscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const subscription = (rawSubscription ?? null) as any;

  const { data: rawWallet } = await supabase
    .from("credit_wallets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const wallet = (rawWallet ?? null) as any;

  let plan: any = null;

  if (subscription?.plan_id) {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .eq("id", subscription.plan_id)
      .maybeSingle();

    plan = data;
  }

  const fullName =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Usuário";

  const companyName =
    typeof user.user_metadata?.company_name === "string" &&
    user.user_metadata.company_name.trim()
      ? user.user_metadata.company_name.trim()
      : "Empresa não informada";

  const avatarUrl =
    profile?.avatar_url ||
    (typeof user.user_metadata?.avatar_url === "string" &&
    user.user_metadata.avatar_url.trim()
      ? user.user_metadata.avatar_url.trim()
      : null);

  const normalizedStatus =
    typeof subscription?.status === "string"
      ? subscription.status.toLowerCase()
      : "";

  const activeStatuses = new Set(["active", "trialing", "paid", "ativo"]);
  const accountStatus = activeStatuses.has(normalizedStatus)
    ? "Ativo"
    : "Inativo";

  const planName =
    typeof plan?.name === "string" && plan.name.trim()
      ? plan.name.trim()
      : "Sem plano ativo";

  const creditBalance =
    typeof wallet?.balance === "number" ? wallet.balance : 0;

  const navLinkClass =
    "block rounded-lg px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-100";

  return (
    <div className="min-h-screen bg-card text-foreground dark:bg-neutral-950 dark:text-neutral-100">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        <aside className="border-r border-border bg-card p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-muted-foreground dark:text-neutral-400">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold">RH Infinite IA</h1>

          <nav className="mt-10 space-y-3">
            <Link href="/app/agentes" className={navLinkClass}>
              Agentes
            </Link>
            <Link href="/app/tutorial" className={navLinkClass}>
              Tutorial
            </Link>
            <Link href="/app/suporte" className={navLinkClass}>
              Suporte
            </Link>
            <Link href="/app/recrutador/assessments" className={navLinkClass}>
              Relatórios Stackers
            </Link>
            <Link href="/app/painel-de-vagas" className={navLinkClass}>
              Painel de Vagas
            </Link>
            <Link href="/app/configuracoes" className={navLinkClass}>
              Configurações
            </Link>
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="flex items-center justify-end border-b border-border bg-card px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserAccountMenu
                fullName={fullName}
                companyName={companyName}
                accountStatus={accountStatus}
                planName={planName}
                creditBalance={creditBalance}
                avatarUrl={avatarUrl}
              />
            </div>
          </div>

          {children}
        </section>
      </div>
    </div>
  );
}
