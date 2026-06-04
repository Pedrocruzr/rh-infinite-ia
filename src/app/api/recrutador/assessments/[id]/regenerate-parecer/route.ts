import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateParecer } from "@/lib/parecer-runner";
import type { ParecerSession } from "@/lib/parecer-flow";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_req: NextRequest, context: Params) {
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

    // 2. Fetch assessment details
    const { data: assessment, error } = await supabase
      .from("profile_assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !assessment) {
      return NextResponse.json(
        { error: "Avaliação não encontrada." },
        { status: 404 }
      );
    }

    // Check ownership
    if (assessment.recruiter_id && assessment.recruiter_id !== user.id) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    if (assessment.agent_slug !== "parecer-tecnico-entrevista") {
      return NextResponse.json(
        { error: "Regeneração disponível apenas para o agente de parecer técnico." },
        { status: 400 }
      );
    }

    // 3. Validate credits (cost is 2 credits for technical feedback report)
    const cost = 2;

    const { data: wallet } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentBalance = wallet?.balance ?? 0;

    if (currentBalance < cost) {
      return NextResponse.json(
        { error: `Saldo de créditos insuficiente. Ajustar este parecer custa ${cost} créditos, mas seu saldo atual é ${currentBalance}.` },
        { status: 403 }
      );
    }

    const raw = (assessment.raw_answers ?? {}) as ParecerSession;

    const session: ParecerSession = {
      ...raw,
      assessmentId: assessment.id,
      empresa: raw.empresa ?? "",
      vaga: raw.vaga ?? assessment.target_role ?? "",
      candidato: raw.candidato ?? assessment.candidate_name ?? "",
      status: "completed",
      reportStatus: "generated",
    };

    // 4. Run IA generation
    const reportMarkdown = await generateParecer(session);

    const { error: updateError } = await supabase
      .from("profile_assessments")
      .update({
        candidate_name: session.candidato ?? assessment.candidate_name ?? "",
        target_role: session.vaga ?? assessment.target_role ?? "",
        status: "completed",
        report_status: "generated",
        report_markdown: reportMarkdown,
        raw_answers: {
          ...raw,
          ...session,
          status: "completed",
          reportStatus: "generated",
          reportMarkdown,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", assessment.id);

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
        assessment_id: assessment.id,
        agent_slug: assessment.agent_slug,
        mode: "regenerate_report"
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao tempo de regeneração parecer:", error);

    return NextResponse.json(
      { error: "Erro ao regenerar o relatório do parecer técnico." },
      { status: 500 }
    );
  }
}
