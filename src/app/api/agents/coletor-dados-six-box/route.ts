import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runAgent } from "@/lib/agents/coletor-dados-six-box/runner";

type RequestBody = {
  session?: Record<string, any>;
  answer?: string;
  message?: string;
  currentField?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;

    const result = await runAgent({
      session: body.session ?? {},
      answer: body.answer ?? body.message ?? "",
      currentField: body.currentField ?? "start",
    });

    if (!result?.completed) {
      return NextResponse.json({
        session: result.session ?? {},
        currentField: result.currentField ?? null,
        nextField: result.nextField ?? null,
        completed: false,
        reply: result.reply ?? "",
        reportMarkdown: null,
      });
    }

    const reportMarkdown =
      result.reportMarkdown ??
      result.report ??
      result.reply ??
      "";

    const finalSession = {
      ...(result.session ?? {}),
      reportMarkdown,
      reportStatus: "generated",
      status: "completed",
    };

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name:
          finalSession.nomeEmpresa ??
          "Questionário Six Box",
        target_role:
          "Coletor de Dados Six Box",
        agent_name: "Coletor de Dados Six Box",
        agent_slug: "coletor-dados-six-box",
        raw_answers: finalSession,
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
          session: finalSession,
          completed: true,
          reply: `Relatório gerado, mas ocorreu erro ao salvar: ${error.message}`,
          reportMarkdown,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: {
        ...finalSession,
        assessmentId: data.id,
      },
      completed: true,
      reply: "Relatório gerado com sucesso e disponível em Avaliações recebidas.",
      reportMarkdown,
      assessmentId: data.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno desconhecido";

    return NextResponse.json(
      {
        completed: false,
        reply: `Falha interna ao processar o agente Coletor de Dados Six Box. ${message}`,
      },
      { status: 500 }
    );
  }
}
