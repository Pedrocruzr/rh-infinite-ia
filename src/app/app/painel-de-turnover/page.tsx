import { TurnoverClient } from "@/components/turnover/turnover-client";
import { getTurnoverEmployees } from "@/lib/turnover/repository";
import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";
import { getUserPlanType, isFeatureAllowed } from "@/lib/auth/access-control";
import { FeatureLockedScreen } from "@/components/layout/feature-locked-screen";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function PainelDeTurnoverPage() {
  const access = await resolveJobOpeningsAccess();
  const cookieStore = await cookies();
  const simulatedPlan = cookieStore.get("simulated_plan_code")?.value;

  if (access.userId && access.db) {
    const planType = await getUserPlanType(access.db, { id: access.userId }, simulatedPlan);

    if (!isFeatureAllowed(planType, "painel-de-turnover")) {
      return (
        <FeatureLockedScreen
          featureName="Painel de Turnover"
          description="O Painel de Turnover & Retenção é exclusivo dos planos Painel de Turnover, Recrutamento & Seleção e Stacks Infinity. O seu plano atual não inclui esta funcionalidade."
          availablePlans="Painel de Turnover (Start/Pro), Recrutamento ou Stacks Infinity"
        />
      );
    }
  }

  const initialEmployees = await getTurnoverEmployees();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:py-10">
        <TurnoverClient initialEmployees={initialEmployees} />
      </section>
    </main>
  );
}
