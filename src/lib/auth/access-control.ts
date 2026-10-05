export type PlanType = "completo" | "recrutamento" | "perfil";

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
  return true;
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

