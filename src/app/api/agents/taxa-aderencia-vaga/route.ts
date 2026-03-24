import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializeProdutividadeSession,
  runProdutividadeStep,
  type ProdutividadeField,
  type ProdutividadeSession,
} from "@/lib/agents/taxa-aderencia-vaga/flow";
import { buildProdutividadeReport } from "@/lib/agents/taxa-aderencia-vaga/runner";

type RequestBody = {
  session?: ProdutividadeSession;
  answer?: string;
  message?: string;
  currentField?: ProdutividadeField | string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const session = body.session ?? initializeProdutividadeSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField ?? "nomeColaborador";

    const step = runProdutividadeStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildProdutividadeReport(step.session);
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: "Análise de Produtividade",
        target_role: "Taxa de Produtividade por Colaborador",
        agent_name: "Taxa de Produtividade por Colaborador",
        agent_slug: "taxa-aderencia-vaga",
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
        reply: `Falha interna ao processar o agente Taxa de Produtividade por Colaborador. ${message}`,
      },
      { status: 500 }
    );
  }
}
