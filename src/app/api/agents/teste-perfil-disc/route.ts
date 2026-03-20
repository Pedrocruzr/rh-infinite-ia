import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializeDiscSession,
  runDiscStep,
} from "@/lib/disc-runner";
import type { DiscField, DiscSession } from "@/lib/disc-flow";

type RequestBody = {
  session?: DiscSession;
  answer?: string;
  currentField?: DiscField;
};

function mapSessionToRow(session: DiscSession) {
  return {
    candidate_name: session.nome ?? "",
    target_role: session.vaga ?? "",
    competencies: [],
    disc_answer: null,
    motivation_answer: null,
    example_1: session.resposta1 ?? null,
    example_2: session.resposta2 ?? null,
    example_3: session.resposta3 ?? null,
    example_4: session.resposta4 ?? null,
    status: session.status ?? "in_progress",
    report_status: session.reportStatus ?? "pending",
    report_markdown: null,
    agent_name: "Teste de Perfil DISC",
    agent_slug: "teste-perfil-disc",
    raw_answers: session,
    updated_at: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;

    let session = body.session ?? initializeDiscSession();

    const hasIncomingAnswer =
      typeof body.answer === "string" &&
      body.answer.trim().length > 0 &&
      typeof body.currentField === "string";

    if (!hasIncomingAnswer) {
      const result = await runDiscStep({
        session,
      });

      return NextResponse.json({
        session,
        done: false,
        reply: result.reply,
        nextField: result.nextField ?? null,
      });
    }

    session = {
      ...session,
      [body.currentField!]: body.answer!.trim(),
    };

    const supabase = createAdminClient();

    if (!session.assessmentId) {
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data: created, error: createError } = await supabase
        .from("profile_assessments")
        .insert({
          candidate_name: "",
          target_role: "Pendente",
          competencies: [],
          status: "in_progress",
          report_status: "pending",
          report_markdown: null,
          agent_name: "Teste de Perfil DISC",
          agent_slug: "teste-perfil-disc",
          raw_answers: {},
          expires_at: expiresAt,
        })
        .select("id")
        .single();

      if (createError) {
        return NextResponse.json(
          {
            error: `Erro ao criar avaliação DISC: ${createError.message}`,
          },
          { status: 500 }
        );
      }

      session.assessmentId = created.id;
    }

    const result = await runDiscStep({
      session,
      answer: body.answer,
      currentField: body.currentField,
    });

    const finalSession: DiscSession = {
      ...result.session,
      assessmentId: session.assessmentId,
    };

    const { error: updateError } = await supabase
      .from("profile_assessments")
      .update(mapSessionToRow(finalSession))
      .eq("id", finalSession.assessmentId!);

    if (updateError) {
      return NextResponse.json(
        {
          error: `Erro ao salvar respostas DISC: ${updateError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: finalSession,
      done: result.done,
      reply: result.reply,
      nextField: result.nextField ?? null,
    });
  } catch (error) {
    console.error("Erro na rota teste-perfil-disc:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao processar o agente de perfil DISC.",
      },
      { status: 500 }
    );
  }
}
