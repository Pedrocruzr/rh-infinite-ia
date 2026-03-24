import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializeOnboardingSession,
  runOnboardingStep,
  type OnboardingField,
  type OnboardingSession,
} from "@/lib/agents/onboarding-estrategico/flow";
import { buildOnboardingReport } from "@/lib/agents/onboarding-estrategico/runner";

type RequestBody = {
  session?: OnboardingSession;
  answer?: string;
  message?: string;
  currentField?: OnboardingField;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const session = body.session ?? initializeOnboardingSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField;

    const step = runOnboardingStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildOnboardingReport(step.session);
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: "Roteiro de Integração",
        target_role: step.session.departamentos ?? "Integração",
        agent_name: "Onboarding Estratégico",
        agent_slug: "onboarding-estrategico",
        raw_answers: step.session,
        report_markdown: reportMarkdown,
        status: "completed",
        report_status: "generated",
        updated_at: now,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        {
          session: step.session,
          completed: true,
          reply: `Relatório gerado, mas ocorreu erro ao salvar: ${error.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: {
        ...step.session,
        assessmentId: data.id,
      },
      completed: true,
      reply: "",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno desconhecido";

    return NextResponse.json(
      {
        completed: false,
        reply: `Falha interna ao processar o agente de onboarding. ${message}`,
      },
      { status: 500 }
    );
  }
}
