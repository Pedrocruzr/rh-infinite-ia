export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import {
  generateDiscReport,
  initializeDiscSession,
  runDiscStep,
  type DiscField,
  type DiscSession,
} from "@/lib/disc-runner";

type RequestBody = {
  session?: DiscSession;
  answer?: string;
  currentField?: DiscField;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const sessionUser = await getSessionUser();
    const recruiterId = sessionUser?.id ?? null;
    const body = (await req.json()) as RequestBody;
    const session = body.session ?? initializeDiscSession();
    const answer = body.answer ?? "";
    const currentField = body.currentField;

    const step = runDiscStep(session, answer, currentField);

    if (!step.completed) {
      return NextResponse.json({
        session: step.session,
        currentField: step.currentField,
        nextField: step.nextField,
        completed: false,
        reply: step.reply,
      });
    }

    const sessionData = step.session as DiscSession & Record<string, unknown>;
    const reportMarkdown = generateDiscReport(sessionData as any);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: [String(sessionData.nome ?? ""), String(sessionData.sobrenome ?? "")].filter(Boolean).join(" ") || "Não informado",
        target_role: "Perfil comportamental DISC",
        agent_name: "Teste de Perfil DISC",
        agent_slug: "teste-perfil-disc",
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
        reply: `Falha interna ao processar o Teste de Perfil DISC. ${message}`,
      },
      { status: 500 }
    );
  }
}
