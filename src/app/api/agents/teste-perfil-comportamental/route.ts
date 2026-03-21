import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateProfileReport,
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

function mapSessionToRow(session: ProfileSession & { reportMarkdown?: string | null }) {
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
    report_markdown: session.reportMarkdown ?? null,
    agent_name: "Teste de Perfil Comportamental",
    agent_slug: "teste-perfil-comportamental",
    raw_answers: session,
    updated_at: new Date().toISOString(),
  };
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function isWeakAnswer(value: string): boolean {
  const normalized = normalizeText(value);

  const blocked = new Set([
    "oi",
    "ola",
    "olá",
    "ok",
    "sim",
    "nao",
    "não",
    "teste",
    "aaa",
    "bbb",
    "123",
    "asd",
    "qwe",
  ]);

  if (blocked.has(normalized)) return true;
  if (normalized.length < 2) return true;

  return false;
}

function validateAnswer(field: ProfileField, answer: string): string | null {
  const normalized = answer.trim();

  if (isWeakAnswer(normalized)) {
    return "Não consegui validar sua resposta. Responda exatamente o que foi pedido, com mais clareza.";
  }

  if (field === "nome") {
    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      return "Preciso do nome completo. Informe nome e sobrenome.";
    }
  }

  if (field === "vaga" && normalized.length < 4) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
  }

  if (
    field === "competenciaExemplo1" ||
    field === "competenciaExemplo2" ||
    field === "competenciaExemplo3"
  ) {
    if (normalized.length < 20) {
      return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const supabase = createAdminClient();

    let session: ProfileSession = body.session ?? initializeProfileSession();

    if (body.currentField && typeof body.answer === "string") {
      const validationError = validateAnswer(body.currentField, body.answer.trim());

      if (validationError) {
        const retryResult = await runProfileStep({
          session,
        });

        return NextResponse.json({
          session,
          done: false,
          reply: validationError,
          nextQuestion: retryResult.nextQuestion,
          reportMarkdown: null,
        });
      }
    }

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
          report_markdown: null,
          agent_name: "Teste de Perfil Comportamental",
          agent_slug: "teste-perfil-comportamental",
          raw_answers: {},
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

    let finalSession: ProfileSession & { reportMarkdown?: string | null } = {
      ...result.session,
      assessmentId: session.assessmentId,
      reportMarkdown: null,
    };

    if (result.done) {
      const reportMarkdown = generateProfileReport(finalSession);

      finalSession = {
        ...finalSession,
        status: "completed",
        reportStatus: "generated",
        reportMarkdown,
      };
    }

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
      reply: result.done
        ? "Relatório de perfil comportamental gerado com sucesso."
        : result.reply,
      nextQuestion: result.nextQuestion,
      reportMarkdown: finalSession.reportMarkdown ?? null,
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
