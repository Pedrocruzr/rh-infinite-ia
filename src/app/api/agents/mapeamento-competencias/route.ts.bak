import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializeMapeamentoSession,
  runMapeamentoStep,
  type MapeamentoField,
  type MapeamentoSession,
} from "@/lib/agents/mapeamento-competencias/flow";
import { buildMapeamentoCompetenciasReport } from "@/lib/agents/mapeamento-competencias/runner";

type RequestBody = {
  session?: MapeamentoSession;
  answer?: string;
  message?: string;
  currentField?: MapeamentoField;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const session = body.session ?? initializeMapeamentoSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField;

    const step = runMapeamentoStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildMapeamentoCompetenciasReport(step.session);

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: step.session.cargo ?? "Mapeamento de Competências",
        target_role: step.session.cargo ?? "Mapeamento de Competências",
        agent_name: "Agente de Mapeamento de Competências",
        agent_slug: "mapeamento-competencias",
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
        reply: `Falha interna ao processar o agente de Mapeamento de Competências. ${message}`,
      },
      { status: 500 }
    );
  }
}
