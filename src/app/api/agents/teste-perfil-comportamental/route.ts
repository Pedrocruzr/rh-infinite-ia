import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initializeProfileSession,
  runProfileStep,
} from "@/lib/agents/profile/profile-runner";
import type {
  ProfileField,
  ProfileSession,
} from "@/lib/agents/profile/profile-flow";

type RequestBody = {
  session?: ProfileSession;
  currentField?: ProfileField;
  answer?: string;
};

function mapSessionToRow(session: ProfileSession) {
  return {
    candidate_name: session.nome ?? "",
    target_role: session.vaga ?? "",
    competencies: session.competenciasPrincipais ?? [],
    disc_answer: session.discResposta ?? null,
    motivation_answer: session.motivacao ?? null,
    example_1: session.competenciaExemplo1 ?? null,
    example_2: session.competenciaExemplo2 ?? null,
    example_3: session.competenciaExemplo3 ?? null,
    status: session.status ?? "in_progress",
    report_status: session.reportStatus ?? "pending",
    agent_name: "Teste de Perfil Comportamental",
    updated_at: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const supabase = createAdminClient();

    let session: ProfileSession = body.session ?? initializeProfileSession();

    if (!session.assessmentId) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

      const { data: created, error: createError } = await supabase
        .from("profile_assessments")
        .insert({
          candidate_name: "",
          target_role: "",
          competencies: [],
          status: "in_progress",
          report_status: "pending",
          agent_name: "Teste de Perfil Comportamental",
          expires_at: expiresAt,
        })
        .select("id")
        .single();

      if (createError) {
        return NextResponse.json(
          {
            error: `Erro ao criar avaliação: ${createError.message}`,
          },
          { status: 500 }
        );
      }

      session = {
        ...session,
        assessmentId: created.id,
      };
    }

    const result = await runProfileStep({
      session,
      currentField: body.currentField,
      answer: body.answer,
    });

    const finalSession: ProfileSession = {
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
          error: `Erro ao salvar respostas: ${updateError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: finalSession,
      done: result.done,
      reply: result.reply,
      nextQuestion: result.nextQuestion,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao processar o agente de teste de perfil comportamental.",
      },
      { status: 500 }
    );
  }
}
