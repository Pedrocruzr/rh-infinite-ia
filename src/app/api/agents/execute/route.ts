import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { executeAgentRuntime } from "@/lib/agents/runtime";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    const runtimeResult = await executeAgentRuntime({
      agentName: agent.name,
      context: body?.context ?? "",
      objective: body?.objective ?? "",
    });

    const { data: insertedRun, error: runError } = await supabase
      .from("agent_runs")
      .insert({
        user_id: DEV_USER_ID,
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
        user_id: DEV_USER_ID,
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
