export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import {
  FIRST_FIELD,
  initializeAderenciaVagaSession,
  runAderenciaVagaStep,
  type AderenciaVagaField,
  type AderenciaVagaSession,
} from "@/lib/agents/taxa-aderencia-vaga/flow";
import { buildAderenciaVagaReport } from "@/lib/agents/taxa-aderencia-vaga/runner";

type RequestBody = {
  session?: AderenciaVagaSession;
  answer?: string;
  message?: string;
  currentField?: AderenciaVagaField | string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const session = body.session ?? initializeAderenciaVagaSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField ?? FIRST_FIELD;

    const step = runAderenciaVagaStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildAderenciaVagaReport(step.session);
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const sessionUser = await getSessionUser();
    const recruiterId = sessionUser?.id ?? null;

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: step.session.candidateName || "Candidato não informado",
        target_role: step.session.targetRole || "Cargo não informado",
        agent_name: "Taxa de Aderência com a Vaga",
        agent_slug: "taxa-aderencia-vaga",
        raw_answers: step.session,
        report_markdown: reportMarkdown,
        status: "completed",
        report_status: "generated",
        updated_at: now,
        ...(recruiterId ? { recruiter_id: recruiterId } : {}),
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
        reply: `Falha interna ao processar o agente Taxa de Aderência com a Vaga. ${message}`,
      },
      { status: 500 }
    );
  }
}
