import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(request: Request, context: Context) {
  try {
    const params = await context.params;
    const authSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const supabase = createAdminClient();

    // 1. Fetch assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from("profile_assessments")
      .select("id, agent_slug, recruiter_id")
      .eq("id", params.id)
      .maybeSingle();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: "Avaliação não encontrada." },
        { status: 404 }
      );
    }

    // Check ownership
    if (assessment.recruiter_id !== user.id) {
      return NextResponse.json(
        { error: "Acesso negado. Você não é o recrutador desta avaliação." },
        { status: 403 }
      );
    }

    // 2. Check if already unlocked
    const { data: existingUnlock } = await supabase
      .from("usage_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_type", "report_unlock")
      .eq("metadata->>assessment_id", params.id)
      .maybeSingle();

    if (existingUnlock) {
      return NextResponse.json({ ok: true, message: "Já desbloqueado." });
    }

    // 3. Find agent to get credit cost
    const { data: agent } = await supabase
      .from("agents")
      .select("id, name, credit_cost")
      .eq("slug", assessment.agent_slug)
      .maybeSingle();

    const cost = agent?.credit_cost ?? 2;

    // 4. Validate credits
    const { data: wallet } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentBalance = wallet?.balance ?? 0;

    if (currentBalance < cost) {
      return NextResponse.json(
        {
          error: `Saldo de créditos insuficiente. Desbloquear este relatório de ${agent?.name || "Avaliação"} custa ${cost} créditos, mas você possui apenas ${currentBalance}.`,
        },
        { status: 403 }
      );
    }

    // 5. Deduct credits (insert usage event)
    const { error: usageError } = await supabase
      .from("usage_events")
      .insert({
        user_id: user.id,
        agent_id: agent?.id || null,
        event_type: "report_unlock",
        credits_delta: -cost,
        metadata: {
          assessment_id: assessment.id,
          agent_slug: assessment.agent_slug,
          mode: "unlock_report"
        }
      });

    if (usageError) {
      return NextResponse.json(
        { error: `Erro ao debitar créditos: ${usageError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno." },
      { status: 500 }
    );
  }
}
