import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { regenerateReportBySlug } from "@/lib/reports/regenerate";
import { applyReportAdjustment } from "@/lib/ai/apply-report-adjustment";

function safeStableStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Auth — precisa estar logado
    const authSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const supabase = createAdminClient();

    const body = await req.json().catch(() => ({}));
    const instruction = String(body?.instruction || "").trim();

    // 2. Fetch assessment details
    const { data, error } = await supabase
      .from("profile_assessments")
      .select("id, agent_slug, raw_answers, recruiter_id")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      );
    }

    // Check ownership
    if (data.recruiter_id && data.recruiter_id !== user.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    // 3. Determine cost
    const complexSlugs = new Set([
      "teste-perfil-comportamental",
      "teste-perfil-disc",
      "analista-fit-cultura",
      "analista-diagnostico-six-box",
      "parecer-tecnico-entrevista",
      "entrevistador-automatizado"
    ]);

    const cost = complexSlugs.has(data.agent_slug) ? 2 : 1;

    // 4. Validate credit balance
    const { data: wallet } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentBalance = wallet?.balance ?? 0;

    if (currentBalance < cost) {
      return NextResponse.json(
        { error: `Saldo de créditos insuficiente. Ajustar este relatório custa ${cost} créditos, mas seu saldo atual é ${currentBalance}.` },
        { status: 403 }
      );
    }

    const originalRawAnswers = data.raw_answers ?? {};
    let adjustedRawAnswers = originalRawAnswers;

    if (instruction) {
      adjustedRawAnswers = await applyReportAdjustment(originalRawAnswers, instruction);
    }

    const changed =
      safeStableStringify(originalRawAnswers) !== safeStableStringify(adjustedRawAnswers);

    console.log("[assessments/regenerate] id:", id);
    console.log("[assessments/regenerate] slug:", String(data.agent_slug || "").trim());
    console.log("[assessments/regenerate] instruction:", instruction);
    console.log("[assessments/regenerate] changed:", changed);

    const reportMarkdown = regenerateReportBySlug(
      String(data.agent_slug || "").trim(),
      adjustedRawAnswers
    );

    const { error: updateError } = await supabase
      .from("profile_assessments")
      .update({
        raw_answers: adjustedRawAnswers,
        report_markdown: reportMarkdown,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: `Erro ao atualizar relatório: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 5. Deduct credits (insert usage event)
    await supabase.from("usage_events").insert({
      user_id: user.id,
      agent_id: null,
      event_type: "report_regeneration",
      credits_delta: -cost,
      metadata: {
        assessment_id: id,
        agent_slug: data.agent_slug,
        mode: "regenerate_report"
      }
    });

    return NextResponse.json({
      ok: true,
      changed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao regenerar relatório",
      },
      { status: 500 }
    );
  }
}
