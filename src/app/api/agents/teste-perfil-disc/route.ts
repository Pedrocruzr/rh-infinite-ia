import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const reportMarkdown = generateDiscReport(step.session as any);

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        candidate_name: step.session.nome ?? "Não informado",
        target_role: "Perfil comportamental DISC",
        agent_name: "Teste de Perfil DISC",
        agent_slug: "teste-perfil-disc",
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
        reply: `Falha interna ao processar o Teste de Perfil DISC. ${message}`,
      },
      { status: 500 }
    );
  }
}
