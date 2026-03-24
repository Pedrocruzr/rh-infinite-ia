import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializeCustoContratacaoSession,
  runCustoContratacaoStep,
  type CustoContratacaoField,
  type CustoContratacaoSession,
} from "@/lib/agents/custo-contratacao/flow";
import { buildCustoContratacaoReport } from "@/lib/agents/custo-contratacao/runner";

type RequestBody = {
  session?: CustoContratacaoSession;
  answer?: string;
  message?: string;
  currentField?: CustoContratacaoField | string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const session = body.session ?? initializeCustoContratacaoSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField ?? "periodo";

    const step = runCustoContratacaoStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildCustoContratacaoReport(step.session);
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: "Cálculo de Custo por Contratação",
        target_role: "Custo de Contratação",
        agent_name: "Custo de Contratação",
        agent_slug: "custo-contratacao",
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
        reply: `Falha interna ao processar o agente Custo de Contratação. ${message}`,
      },
      { status: 500 }
    );
  }
}
