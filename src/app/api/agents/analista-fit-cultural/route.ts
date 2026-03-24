import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializeFitCulturalSession,
  runFitCulturalStep,
  type FitCulturalField,
  type FitCulturalSession,
} from "@/lib/agents/analista-fit-cultural/flow";
import { buildFitCulturalReport } from "@/lib/agents/analista-fit-cultural/runner";

type RequestBody = {
  session?: FitCulturalSession;
  answer?: string;
  message?: string;
  currentField?: FitCulturalField;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const session = body.session ?? initializeFitCulturalSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField;

    const step = runFitCulturalStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildFitCulturalReport(step.session as any);

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: "Análise de Fit Cultural",
        target_role: "Fit Cultural",
        agent_name: "Analista Fit Cultural",
        agent_slug: "analista-fit-cultural",
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
        reply: `Falha interna ao processar o Analista Fit Cultural. ${message}`,
      },
      { status: 500 }
    );
  }
}
