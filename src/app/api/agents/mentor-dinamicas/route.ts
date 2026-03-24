import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  MENTOR_DINAMICAS_AGENT,
  applyAnswer,
  getInitialQuestion,
  type MentorDinamicasSession,
} from "@/lib/agents/mentor-dinamicas/flow";
import { buildMentorDinamicasReport } from "@/lib/agents/mentor-dinamicas/runner";

type RouteBody = {
  message?: string;
  session?: Partial<MentorDinamicasSession>;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
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
        agent: MENTOR_DINAMICAS_AGENT,
        reply: getInitialQuestion(),
        reportHtml: null,
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
        agent: MENTOR_DINAMICAS_AGENT,
        reply: result.error,
        reportHtml: null,
        retentionNotice:
          "Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
      });
    }

    const finalSession: MentorDinamicasSession = {
      ...result.session,
      status: "completed",
      reportStatus: "generated",
    };

    const reportMarkdown = buildMentorDinamicasReport(finalSession);
    const now = new Date().toISOString();
    const expiresAt = buildExpiryDate();
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({
        ok: true,
        completed: true,
        saved: false,
        session: {
          ...finalSession,
          reportMarkdown,
        },
        agent: MENTOR_DINAMICAS_AGENT,
        reply: "",
        reportHtml: null,
        retentionNotice:
          "Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
      });
    }

    const payload = {
      candidate_name: `Dinâmicas - ${finalSession.categoria ?? "categoria"}`,
      target_role: finalSession.categoria ?? null,
      agent_name: MENTOR_DINAMICAS_AGENT.name,
      agent_slug: MENTOR_DINAMICAS_AGENT.slug,
      raw_answers: finalSession,
      report_markdown: reportMarkdown,
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
      console.error("Erro ao salvar avaliação do Mentor de Dinâmicas:", error);

      return NextResponse.json(
        {
          ok: false,
          completed: true,
          session: finalSession,
          agent: MENTOR_DINAMICAS_AGENT,
          reply: `O material foi gerado, mas ocorreu um erro ao salvar em Avaliações recebidas. ${error.message}`,
          reportHtml: null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      completed: true,
      saved: true,
      assessmentId: data.id,
      session: {
        ...finalSession,
        assessmentId: data.id,
      },
      agent: MENTOR_DINAMICAS_AGENT,
      reply: "",
      reportHtml: null,
      retentionNotice:
        "Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
    });
  } catch (error) {
    console.error("Erro na rota do Mentor de Dinâmicas:", error);
    const message =
      error instanceof Error ? error.message : "Erro interno desconhecido";

    return NextResponse.json(
      {
        ok: false,
        completed: false,
        reply: `Falha interna ao processar o agente Mentor de Dinâmicas. ${message}`,
        reportHtml: null,
      },
      { status: 500 }
    );
  }
}
