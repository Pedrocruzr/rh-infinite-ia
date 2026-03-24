import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializeAnalistaDiagnosticoSixBoxSession,
  runAnalistaDiagnosticoSixBoxStep,
  type AnalistaDiagnosticoSixBoxField,
  type AnalistaDiagnosticoSixBoxSession,
} from "@/lib/agents/analista-diagnostico-six-box/flow";
import { buildAnalistaDiagnosticoSixBoxReport } from "@/lib/agents/analista-diagnostico-six-box/runner";

type RequestBody = {
  session?: AnalistaDiagnosticoSixBoxSession;
  answer?: string;
  message?: string;
  currentField?: AnalistaDiagnosticoSixBoxField | string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const session = body.session ?? initializeAnalistaDiagnosticoSixBoxSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField ?? "start";

    const step = runAnalistaDiagnosticoSixBoxStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildAnalistaDiagnosticoSixBoxReport(step.session);
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: "Diagnóstico Six Box",
        target_role: "Analista de Diagnóstico Six Box",
        agent_name: "Analista de Diagnóstico Six Box",
        agent_slug: "analista-diagnostico-six-box",
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
        reportMarkdown,
      },
      completed: true,
      reply: "",
      reportMarkdown,
      assessmentId: data.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno desconhecido";

    return NextResponse.json(
      {
        completed: false,
        reply: `Falha interna ao processar o agente Analista de Diagnóstico Six Box. ${message}`,
      },
      { status: 500 }
    );
  }
}
