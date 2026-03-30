import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Building2, UserRound } from "lucide-react";

import { ProfileForm } from "@/components/settings/profile-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, document_number")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (rawProfile ?? {}) as any;

  const initialCompanyName =
    typeof user.user_metadata?.company_name === "string"
      ? user.user_metadata.company_name
      : "";

  const initialAvatarUrl =
    profile?.avatar_url ||
    (typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : "");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 md:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                <BadgeCheck className="h-3.5 w-3.5" />
                Configurações da conta
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                Perfil
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                Atualize os dados principais da sua conta, empresa e identificação fiscal sem alterar o fluxo funcional atual.
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
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Identidade da conta
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nome, e-mail e avatar.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Dados da empresa
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Base para cobrança e operação.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Fluxo preservado
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Mesmo endpoint e mesma validação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProfileForm
          userId={user.id}
          email={user.email ?? ""}
          initialFullName={profile?.full_name ?? ""}
          initialAvatarUrl={initialAvatarUrl}
          initialCompanyName={initialCompanyName}
          initialDocumentNumber={profile?.document_number ?? ""}
        />
      </section>
    </main>
  );
}
