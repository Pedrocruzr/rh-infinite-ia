import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ENTREVISTADOR_AUTOMATIZADO_AGENT,
  applyAnswer,
  getInitialQuestion,
  isFlowComplete,
  type EntrevistadorAutomatizadoSession,
} from "@/lib/agents/entrevistador-automatizado/flow";
import { buildEntrevistadorAutomatizadoReport } from "@/lib/agents/entrevistador-automatizado/runner";

type RouteBody = {
  message?: string;
  session?: Partial<EntrevistadorAutomatizadoSession>;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, key);
}

function buildExpiryDate(): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + 3);
  return expires.toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RouteBody;
    const session = body.session ?? {};
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({
        ok: true,
        completed: false,
        session,
        agent: ENTREVISTADOR_AUTOMATIZADO_AGENT,
        reply: getInitialQuestion(),
        retentionNotice:
          "Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
      });
    }

    const result = applyAnswer(session, message);

    if (!result.ok) {
      return NextResponse.json({
        ok: false,
        completed: false,
        session: result.session,
        agent: ENTREVISTADOR_AUTOMATIZADO_AGENT,
        reply: result.error,
        repeatQuestion: result.currentQuestion,
        retentionNotice:
          "Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
      });
    }

    if (!isFlowComplete(result.session)) {
      return NextResponse.json({
        ok: true,
        completed: false,
        session: result.session,
        agent: ENTREVISTADOR_AUTOMATIZADO_AGENT,
        reply: result.nextQuestion,
        retentionNotice:
          "Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
      });
    }

    const finalSession = result.session;
    const reportHtml = buildEntrevistadorAutomatizadoReport(finalSession);
    const now = new Date().toISOString();
    const expiresAt = buildExpiryDate();

    const supabase = getSupabaseAdmin();

    const payload = {
      candidate_name: `Roteiro de entrevista - ${finalSession.vagaAlvo ?? "vaga"}`,
      target_role: finalSession.vagaAlvo ?? null,
      agent_name: ENTREVISTADOR_AUTOMATIZADO_AGENT.name,
      agent_slug: ENTREVISTADOR_AUTOMATIZADO_AGENT.slug,
      raw_answers: finalSession,
      report_markdown: reportHtml,
      status: "completed",
      report_status: "generated",
      expires_at: expiresAt,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao salvar avaliação do Entrevistador Automatizado:", error);

      return NextResponse.json(
        {
          ok: false,
          completed: true,
          session: finalSession,
          agent: ENTREVISTADOR_AUTOMATIZADO_AGENT,
          reply: "O relatório foi gerado, mas ocorreu um erro ao salvar a avaliação final.",
          technicalError: error.message,
          reportHtml,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      completed: true,
      saved: true,
      assessmentId: data.id,
      session: finalSession,
      agent: ENTREVISTADOR_AUTOMATIZADO_AGENT,
      reply:
        "Roteiro e relatório gerados com sucesso. Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
      reportHtml,
      retentionNotice:
        "Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
    });
  } catch (error) {
    console.error("Erro na rota do Entrevistador Automatizado:", error);
    const message =
      error instanceof Error ? error.message : "Erro interno desconhecido";

    return NextResponse.json(
      {
        ok: false,
        completed: false,
        reply: `Falha interna ao processar o agente Entrevistador Automatizado. ${message}`,
      },
      { status: 500 }
    );
  }
}
