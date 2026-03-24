import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializeDesligamentoSession,
  runDesligamentoStep,
  type DesligamentoField,
  type DesligamentoSession,
} from "@/lib/agents/desligamento-humanizado/flow";
import { buildDesligamentoReport } from "@/lib/agents/desligamento-humanizado/runner";

type RequestBody = {
  session?: DesligamentoSession;
  answer?: string;
  message?: string;
  currentField?: DesligamentoField;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const session = body.session ?? initializeDesligamentoSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField;

    const step = runDesligamentoStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildDesligamentoReport(step.session);
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: step.session.colaboradorNome ?? "Desligamento Humanizado",
        target_role: step.session.cargoAtual ?? "Desligamento Humanizado",
        agent_name: "Agente de Desligamento Humanizado",
        agent_slug: "desligamento-humanizado",
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
        reply: `Falha interna ao processar o agente de Desligamento Humanizado. ${message}`,
      },
      { status: 500 }
    );
  }
}
