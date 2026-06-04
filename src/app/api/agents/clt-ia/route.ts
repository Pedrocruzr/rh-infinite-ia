export const maxDuration = 60;

import { NextResponse } from "next/server";
import { formatCltAnswer, searchCltKnowledge } from "@/lib/agents/clt-ia/pdf-search";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query =
      typeof body?.message === "string"
        ? body.message.trim()
        : typeof body?.query === "string"
          ? body.query.trim()
          : "";

    if (!query) {
      return NextResponse.json(
        {
          ok: false,
          reply: "Digite um tema, artigo ou dúvida sobre a CLT para pesquisar.",
        },
        { status: 400 }
      );
    }

    // 1. Auth — precisa estar logado
    const authSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          ok: false,
          reply: "Faça login para poder consultar a CLT.",
        },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // 2. Validate subscription status
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

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
          reply: "Assinatura inativa ou suspensa. Ative o plano completo para poder usar a CLT IA.",
        },
        { status: 403 }
      );
    }

    // 3. Get CLT Agent and required credits
    const { data: agent } = await supabase
      .from("agents")
      .select("id, credit_cost")
      .eq("slug", "clt-ia")
      .single();

    const requiredCredits = agent?.credit_cost ?? 1;

    // 4. Validate credits balance before execution
    const { data: wallet } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentBalance = wallet?.balance ?? 0;

    if (currentBalance < requiredCredits) {
      return NextResponse.json(
        {
          ok: false,
          reply: `Saldo de créditos insuficiente. Esta consulta custa ${requiredCredits} crédito, mas você possui apenas ${currentBalance}.`,
        },
        { status: 403 }
      );
    }

    // 5. Execute search
    const result = await searchCltKnowledge(query);

    // 6. Record run and deduct credits
    const { data: insertedRun } = await supabase
      .from("agent_runs")
      .insert({
        user_id: user.id,
        agent_id: agent?.id || null,
        status: "success",
        input_summary: query,
        output_summary: result.matches.slice(0, 3).map(m => m.article).join(", ") || "nenhum resultado",
        credits_consumed: requiredCredits,
        prompt_version: "clt-search-v1",
        metadata: {
          query,
          matchesCount: result.matches.length
        },
      })
      .select("id")
      .single();

    await supabase
      .from("usage_events")
      .insert({
        user_id: user.id,
        agent_id: agent?.id || null,
        agent_run_id: insertedRun?.id || null,
        event_type: "agent_execution",
        credits_delta: -requiredCredits,
        metadata: {
          slug: "clt-ia"
        },
      });

    return NextResponse.json({
      ok: true,
      reply: formatCltAnswer(query, result.matches),
      matches: result.matches.map((item) => ({
        article: item.article,
        theme: item.theme,
        rigor: item.rigor,
      })),
    });
  } catch (error) {
    console.error("CLT_IA_ROUTE_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        reply: "Erro ao consultar a base legislativa.",
      },
      { status: 500 }
    );
  }
}
