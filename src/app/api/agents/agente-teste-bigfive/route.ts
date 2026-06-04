export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import {
  generateBigFiveReport,
  initializeBigFiveSession,
  runBigFiveStep,
  type BigFiveField,
  type BigFiveSession,
} from "@/lib/agente-teste-bigfive-runner";

type RequestBody = {
  session?: BigFiveSession;
  answer?: string;
  currentField?: BigFiveField;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const sessionUser = await getSessionUser();
    const recruiterId = sessionUser?.id ?? null;
    const body = (await req.json()) as RequestBody;
    const session = body.session ?? initializeBigFiveSession();
    const answer = body.answer ?? "";
    const currentField = body.currentField;

    const step = runBigFiveStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const sessionData = step.session as BigFiveSession & Record<string, unknown>;
    const reportMarkdown = generateBigFiveReport(sessionData as any);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: [String(sessionData.nome ?? ""), String(sessionData.sobrenome ?? "")].filter(Boolean).join(" ") || "Não informado",
        target_role: "Perfil comportamental Big Five",
        agent_name: "Agente Teste Big Five",
        agent_slug: "agente-teste-bigfive",
        raw_answers: sessionData,
        report_markdown: reportMarkdown,
        status: "completed",
        report_status: "generated",
        ...(recruiterId ? { recruiter_id: recruiterId } : {}),
        updated_at: now,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        {
          session: sessionData,
          completed: true,
          reply: `Relatório gerado, mas ocorreu erro ao salvar: ${error.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: {
        ...sessionData,
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
        reply: `Falha interna ao processar o Agente Teste Big Five. ${message}`,
      },
      { status: 500 }
    );
  }
}
