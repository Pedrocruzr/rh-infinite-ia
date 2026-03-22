import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializePdiSession,
  runPdiStep,
  type PdiField,
  type PdiSession,
} from "@/lib/agents/analista-pdi/flow";
import { buildPdiReport } from "@/lib/agents/analista-pdi/runner";

type RequestBody = {
  session?: PdiSession;
  answer?: string;
  message?: string;
  currentField?: PdiField;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const session = body.session ?? initializePdiSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField;

    const step = runPdiStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildPdiReport(step.session);
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: step.session.colaboradorNome ?? "Plano de Desenvolvimento Individual",
        target_role: step.session.cargoDesejado ?? step.session.cargoAtual ?? "PDI",
        agent_name: "Analista de PDI",
        agent_slug: "analista-pdi",
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
        reply: `Falha interna ao processar o agente Analista de PDI. ${message}`,
      },
      { status: 500 }
    );
  }
}
