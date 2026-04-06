import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import {
  Bot,
  BriefcaseBusiness,
  BookOpen,
  CircleHelp,
  FileText,
  Scale,
  Settings2,
} from "lucide-react";
import { InternalTopbar } from "@/components/layout/internal-topbar";

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

  if (!user.email_confirmed_at) {
    const verifyUrl = `/verificar-email?email=${encodeURIComponent(user.email ?? "")}`;
    redirect(verifyUrl);
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

  const { data: rawCreditGrants } = await supabase
    .from("credit_grants")
    .select("remaining_credits, expires_at")
    .eq("user_id", user.id);

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
    (rawCreditGrants ?? []).reduce((sum: number, item: any) => {
      const expiresAt = item?.expires_at ? new Date(item.expires_at) : null;
      if (expiresAt && expiresAt.getTime() <= Date.now()) {
        return sum;
      }

      return sum + Number(item?.remaining_credits ?? 0);
    }, 0) || (typeof wallet?.balance === "number" ? wallet.balance : 0);

  const navLinkClass =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-[#0d1a2b] dark:hover:text-neutral-100";

  const navigation = [
    { href: "/app/agentes", label: "Agentes", icon: Bot },
    { href: "/app/recrutador/assessments", label: "Relatórios Stackers", icon: FileText },
    { href: "/app/painel-de-vagas", label: "Painel de Vagas", icon: BriefcaseBusiness },
    { href: "/app/agentes/clt-ia", label: "CLT IA", icon: Scale },
    { href: "/app/tutorial", label: "Tutorial", icon: BookOpen },
    { href: "/app/suporte", label: "Suporte", icon: CircleHelp },
    { href: "/app/configuracoes", label: "Configurações", icon: Settings2 },
  ] as const;

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#07111f] dark:text-neutral-100">
      <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="hidden sticky top-0 h-screen border-r border-neutral-200 bg-white p-6 lg:block dark:border-[#122033] dark:bg-[#07111f]">
          <div className="flex w-full items-center justify-center overflow-hidden rounded-[1.1rem] border border-white/40 bg-white/65 px-4 py-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_18px_40px_rgba(2,8,23,0.35)]">
            <img
              src="/brand/stackers-infinite-light.png"
              alt="Stackers Infinite IA"
              className="block h-auto w-[376px] scale-[2] dark:hidden"
            />
            <img
              src="/brand/stackers-infinite-dark.png"
              alt="Stackers Infinite IA"
              className="hidden h-auto w-[376px] scale-[2] dark:block"
            />
          </div>

          <nav className="mt-10 space-y-3">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <InternalTopbar
            fullName={fullName}
            companyName={companyName}
            accountStatus={accountStatus}
            planName={planName}
            creditBalance={creditBalance}
            avatarUrl={avatarUrl}
          />

          {children}
        </section>
      </div>
    </div>
  );
}
