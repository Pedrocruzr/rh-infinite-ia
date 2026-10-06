export type PlanType = "completo" | "recrutamento" | "perfil" | "vagas" | "turnover";

export const RECRUTAMENTO_AGENTS = new Set([
  "taxa-aderencia-vaga",
  "teste-perfil-comportamental",
  "teste-perfil-disc",
  "agente-teste-bigfive",
  "entrevistador-automatizado",
  "mentor-dinamicas",
  "mentor-de-dinamicas",
  "parecer-tecnico-entrevista",
  "custo-contratacao",
  "custo-por-contratacao",
  "clt-ia",
]);

export const PERFIL_AGENTS = new Set([
  "teste-perfil-comportamental",
  "teste-perfil-disc",
  "agente-teste-bigfive",
]);

export function resolvePlanType(planCode?: string | null): PlanType {
  const code = String(planCode || "").trim().toLowerCase();

  if (
    code === "turnover" ||
    code === "turnover_start" ||
    code === "turnover_pro" ||
    code === "painel_turnover" ||
    code.includes("turnover")
  ) {
    return "turnover";
  }

  if (
    code === "vagas" ||
    code === "vagas_start" ||
    code === "vagas_pro" ||
    code === "painel_vagas" ||
    code.includes("vagas")
  ) {
    return "vagas";
  }

  if (
    code === "recrutamento" ||
    code === "recrutamento_selecao" ||
    code.includes("recrutamento")
  ) {
    return "recrutamento";
  }

  if (
    code === "perfil" ||
    code === "perfil_comportamental" ||
    code.startsWith("perfil_")
  ) {
    return "perfil";
  }

  // Por padrão ou planos "start", "completo", "stacks_infinity" -> completo
  return "completo";
}

export function isFeatureAllowed(
  planType: PlanType,
  feature: "painel-de-vagas" | "painel-de-turnover" | "clt-ia"
): boolean {
  if (planType === "completo") return true;
  if (planType === "recrutamento") return true;
  if (planType === "vagas") {
    return feature === "painel-de-vagas";
  }
  if (planType === "turnover") {
    return feature === "painel-de-turnover";
  }
  if (planType === "perfil") return false;
  return true;
}

export function isAgentAllowed(planType: PlanType, agentSlug: string): boolean {
  if (planType === "completo") return true;
  if (planType === "recrutamento") {
    return RECRUTAMENTO_AGENTS.has(agentSlug);
  }
  if (planType === "perfil") {
    return PERFIL_AGENTS.has(agentSlug);
  }
  if (planType === "vagas" || planType === "turnover") {
    return false; // Todos os agentes travados, abrindo pop-up de upgrade
  }
  return true;
}

export function getTurnoverLimits(planCode?: string | null): { maxAtivos: number; maxDesligados: number } {
  const code = String(planCode || "").trim().toLowerCase();
  if (code.includes("pro") || code === "97") {
    return { maxAtivos: 25, maxDesligados: 25 };
  }
  if (code.includes("start") || code === "67" || code.includes("turnover")) {
    return { maxAtivos: 10, maxDesligados: 10 };
  }
  return { maxAtivos: Infinity, maxDesligados: Infinity };
}

export function getJobOpeningsLimit(planCode?: string | null): number {
  const code = String(planCode || "").trim().toLowerCase();
  if (code.includes("pro") || code === "97") {
    return 25;
  }
  if (code.includes("start") || code === "67" || code.includes("vagas")) {
    return 10;
  }
  return Infinity;
}

export async function getUserPlanType(
  supabase: any,
  user: any,
  simulatedPlan?: string | null
): Promise<PlanType> {
  if (simulatedPlan) {
    return resolvePlanType(simulatedPlan);
  }
  if (!user) return "completo";

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_id, plans(code)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const planCode = (subscription as any)?.plans?.code;
  if (planCode) {
    return resolvePlanType(planCode);
  }

  const signupPlan = user.user_metadata?.signup_plan;
  if (signupPlan) {
    return resolvePlanType(signupPlan);
  }

  return "completo";
}

