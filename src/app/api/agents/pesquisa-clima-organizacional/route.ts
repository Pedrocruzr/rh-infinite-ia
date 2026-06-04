export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import {
  initializeClimaSession,
  runClimaStep,
  type ClimaField,
  type ClimaSession,
} from "@/lib/agents/pesquisa-clima-organizacional/flow";
import {
  buildClimaReport,
  getClimaTargetRole,
} from "@/lib/agents/pesquisa-clima-organizacional/runner";

type RequestBody = {
  session?: ClimaSession;
  answer?: string;
  message?: string;
  currentField?: ClimaField;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const session = body.session ?? initializeClimaSession();
    const answer = body.answer ?? body.message ?? "";
    const currentField = body.currentField;

    const step = runClimaStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const reportMarkdown = buildClimaReport(step.session);
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const sessionUser = await getSessionUser();
    const recruiterId = sessionUser?.id ?? null;

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: "Pesquisa de Clima Organizacional",
        target_role: getClimaTargetRole(step.session),
        agent_name: "Pesquisa de Clima Organizacional",
        agent_slug: "pesquisa-clima-organizacional",
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
      console.error("[pesquisa-clima] Supabase insert error:", error.message);
      return NextResponse.json({
        session: step.session,
        completed: true,
        reply: "",
      });
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
        reply: `Falha interna ao processar o agente de pesquisa de clima organizacional. ${message}`,
      },
      { status: 500 }
    );
  }
}
