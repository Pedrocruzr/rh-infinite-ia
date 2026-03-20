import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateTaxaAderenciaReport } from "@/lib/agents/taxa-de-aderencia-com-a-vaga/runner";

type TaxaAderenciaField =
  | "candidateName"
  | "targetRole"
  | "recruiterName"
  | "validatorName"
  | "approverName"
  | "culturalMission"
  | "culturalVision"
  | "culturalValues"
  | "culturalContext"
  | "behavioralTestInput";

type TaxaAderenciaSession = {
  assessmentId?: string;
  candidateName?: string;
  targetRole?: string;
  recruiterName?: string;
  validatorName?: string;
  approverName?: string;
  culturalMission?: string;
  culturalVision?: string;
  culturalValues?: string;
  culturalContext?: string;
  behavioralTestInput?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type RequestBody = {
  session?: TaxaAderenciaSession;
  currentField?: TaxaAderenciaField;
  answer?: string;
};

const steps: Array<{ field: TaxaAderenciaField; question: string }> = [
  {
    field: "candidateName",
    question: "Para começarmos, qual é o nome completo do candidato?",
  },
  {
    field: "targetRole",
    question: "Qual é a vaga analisada?",
  },
  {
    field: "recruiterName",
    question: "Informe o nome do recrutador responsável pela avaliação.",
  },
  {
    field: "validatorName",
    question: "Informe o nome do responsável pela validação (gestor direto/liderança).",
  },
  {
    field: "approverName",
    question: "Informe o nome do responsável pela aprovação final (diretoria/RH).",
  },
  {
    field: "culturalMission",
    question: "Qual é a missão da empresa?",
  },
  {
    field: "culturalVision",
    question: "Qual é a visão da empresa?",
  },
  {
    field: "culturalValues",
    question: "Quais são os valores da empresa? Separe por vírgula ou por linha.",
  },
  {
    field: "culturalContext",
    question:
      "Descreva o contexto cultural da empresa: estilo de trabalho, ambiente da equipe, rituais, comportamentos valorizados e comportamentos não tolerados.",
  },
  {
    field: "behavioralTestInput",
    question:
      "Cole aqui o teste de perfil comportamental (DISC, Eneagrama e Perfil de Competências).",
  },
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function buildInitialSession(): TaxaAderenciaSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

function findNextField(session: TaxaAderenciaSession): TaxaAderenciaField | null {
  for (const step of steps) {
    const value = session[step.field];
    if (!value || !String(value).trim()) {
      return step.field;
    }
  }
  return null;
}

function getQuestion(field: TaxaAderenciaField | null): string {
  if (!field) {
    return "Avaliação concluída com sucesso.";
  }

  const step = steps.find((item) => item.field === field);
  return step?.question ?? "Pergunta não encontrada.";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.session && !body.currentField && !body.answer) {
      const session = buildInitialSession();
      const nextField = findNextField(session);

      return NextResponse.json({
        ok: true,
        session,
        nextField,
        reply: getQuestion(nextField),
        done: false,
      });
    }

    const session: TaxaAderenciaSession = {
      ...buildInitialSession(),
      ...(body.session ?? {}),
    };

    const currentField = body.currentField;
    const answer = (body.answer ?? "").trim();

    if (!currentField) {
      return NextResponse.json(
        { ok: false, error: "Campo atual não informado." },
        { status: 400 },
      );
    }

    if (!answer) {
      return NextResponse.json(
        { ok: false, error: "Resposta vazia." },
        { status: 400 },
      );
    }

    session[currentField] = answer;

    const nextField = findNextField(session);

    if (nextField) {
      return NextResponse.json({
        ok: true,
        session,
        nextField,
        reply: getQuestion(nextField),
        done: false,
      });
    }

    const supabase = createAdminClient();
    const reportHtml = generateTaxaAderenciaReport(session);
    const now = new Date().toISOString();
    const expiresAt = addDays(new Date(), 3);

    const payload = {
      candidate_name: session.candidateName ?? "",
      target_role: session.targetRole ?? "",
      agent_slug: "taxa-aderencia-vaga",
      agent_name: "Especialista em Taxa de Aderência com a Vaga",
      status: "completed",
      report_status: "generated",
      report_markdown: reportHtml,
      raw_answers: {
        ...session,
        status: "completed",
        reportStatus: "generated",
      },
      expires_at: expiresAt,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        ...payload,
        created_at: now,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    const finalSession: TaxaAderenciaSession = {
      ...session,
      assessmentId: data.id,
      status: "completed",
      reportStatus: "generated",
    };

    return NextResponse.json({
      ok: true,
      session: finalSession,
      nextField: null,
      reply: "Relatório gerado com sucesso. A avaliação já está disponível em Avaliações recebidas.",
      done: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao processar o agente.",
      },
      { status: 500 },
    );
  }
}
