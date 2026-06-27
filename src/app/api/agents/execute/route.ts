export const maxDuration = 60;

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { executeAgentRuntime } from "@/lib/agents/runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const simulatedPlan = cookieStore.get("simulated_plan_code")?.value;

    const authSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          ok: false,
          stage: "auth",
          error: authError?.message ?? "Não autenticado",
        },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, name, slug, credit_cost")
      .eq("slug", body?.slug ?? "")
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        {
          ok: false,
          stage: "agent_lookup",
          error: agentError?.message ?? "Agente não encontrado",
        },
        { status: 500 }
      );
    }

    // Validate subscription status
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, plan_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let actualPlanCode = simulatedPlan;
    if (!actualPlanCode && subscription?.plan_id) {
      const { data: plan } = await supabase
        .from("plans")
        .select("code")
        .eq("id", subscription.plan_id)
        .maybeSingle();
      actualPlanCode = plan?.code;
    }

    if (actualPlanCode === "perfil_comportamental" && body?.slug !== "teste-perfil-comportamental") {
      return NextResponse.json(
        {
          ok: false,
          stage: "plan_restriction",
          error: "Este agente não está disponível no seu plano. Atualize sua assinatura para desbloquear todos os agentes.",
        },
        { status: 403 }
      );
    }

    const normalizedStatus = (subscription?.status || "").toLowerCase();
    const isMainActive = new Set(["active", "paid", "ativo"]).has(normalizedStatus);

    const isTrialingAndNotExpired =
      normalizedStatus === "trialing" &&
      subscription?.current_period_end &&
      new Date(subscription.current_period_end) > new Date();

    const isCanceledButNotExpired =
      normalizedStatus === "canceled" &&
      subscription?.current_period_end &&
      new Date(subscription.current_period_end) > new Date();

    const isBypassUser = user.email?.toLowerCase() === "rnsantos27@gmail.com";

    if (!isMainActive && !isTrialingAndNotExpired && !isCanceledButNotExpired && !isBypassUser) {
      return NextResponse.json(
        {
          ok: false,
          stage: "subscription_check",
          error: "Assinatura inativa ou suspensa. Ative o plano completo para poder executar agentes.",
        },
        { status: 403 }
      );
    }

    // Validate credits balance before execution
    const { data: wallet } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentBalance = wallet?.balance ?? 0;
    const requiredCredits = agent.credit_cost ?? 1;

    if (currentBalance < requiredCredits) {
      return NextResponse.json(
        {
          ok: false,
          stage: "credits_check",
          error: `Saldo de créditos insuficiente. Este agente custa ${requiredCredits} créditos, mas você possui apenas ${currentBalance}.`,
        },
        { status: 403 }
      );
    }

    const runtimeResult = await executeAgentRuntime({
      agentName: agent.name,
      context: body?.context ?? "",
      objective: body?.objective ?? "",
    });

    const { data: insertedRun, error: runError } = await supabase
      .from("agent_runs")
      .insert({
        user_id: user.id,
        agent_id: agent.id,
        status: "success",
        input_summary: body?.objective || body?.context || "execução manual",
        output_summary: runtimeResult.text,
        credits_consumed: agent.credit_cost ?? 1,
        prompt_version: runtimeResult.model,
        metadata: {
          context: body?.context ?? "",
          objective: body?.objective ?? "",
          mode: "real",
          model: runtimeResult.model,
        },
      })
      .select("id")
      .single();

    if (runError || !insertedRun) {
      return NextResponse.json(
        {
          ok: false,
          stage: "insert_run",
          error: runError?.message ?? "Falha ao criar agent_run",
        },
        { status: 500 }
      );
    }

    const { error: usageError } = await supabase
      .from("usage_events")
      .insert({
        user_id: user.id,
        agent_id: agent.id,
        agent_run_id: insertedRun.id,
        event_type: "agent_execution",
        credits_delta: -(agent.credit_cost ?? 1),
        metadata: {
          slug: agent.slug,
          mode: "real",
          model: runtimeResult.model,
        },
      });

    if (usageError) {
      return NextResponse.json(
        {
          ok: false,
          stage: "insert_usage_event",
          error: usageError?.message ?? "Falha ao criar usage_event",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      runId: insertedRun.id,
      slug: agent.slug,
      result: runtimeResult.text,
      creditsUsed: agent.credit_cost ?? 1,
      model: runtimeResult.model,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erro inesperado",
      },
      { status: 500 }
    );
  }
}
