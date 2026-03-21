import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  steps,
  type TaxaAderenciaField,
} from "@/lib/agents/taxa-de-aderencia-com-a-vaga/flow";
import { generateTaxaAderenciaReport } from "@/lib/agents/taxa-de-aderencia-com-a-vaga/runner";

type TaxaAderenciaSession = {
  assessmentId?: string;
  culturalMission?: string;
  culturalVision?: string;
  culturalValues?: string;
  culturalContext?: string;
  targetRole?: string;
  recruiterName?: string;
  validatorName?: string;
  approverName?: string;
  candidateName?: string;
  candidateExperience?: string;
  behavioralTestInput?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type RequestBody = {
  session?: TaxaAderenciaSession;
  currentField?: TaxaAderenciaField;
  answer?: string;
};

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
  if (!field) return "Avaliação concluída com sucesso.";
  const step = steps.find((item) => item.field === field);
  return step?.question ?? "Pergunta não encontrada.";
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function detectRole(value: string): string | null {
  const role = normalizeText(value);

  if (
    role.includes("recepcao") ||
    role.includes("recepcionista") ||
    role.includes("recepc")
  ) {
    return "Recepcionista";
  }

  if (
    role.includes("auxiliar administrativo") ||
    role.includes("assistente administrativo") ||
    role.includes("administrativo") ||
    role.includes("assist adm") ||
    role.includes("aux adm") ||
    role === "adm"
  ) {
    return "Auxiliar Administrativo / Assistente Administrativo";
  }

  if (
    role.includes("vendedor") ||
    role.includes("vendas") ||
    role.includes("comercial") ||
    role.includes("atendente comercial") ||
    role.includes("consultor comercial")
  ) {
    return "Vendedor / Atendente Comercial";
  }

  return null;
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
  if (normalized.length < 3) return true;

  return false;
}

function validateAnswer(field: TaxaAderenciaField, answer: string): string | null {
  const normalized = answer.trim();

  if (isWeakAnswer(normalized)) {
    return "Não consegui validar sua resposta. Responda exatamente o que foi pedido, com mais clareza.";
  }

  if (field === "candidateName") {
    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      return "Preciso do nome completo do candidato. Informe nome e sobrenome.";
    }
    if (parts.some((part) => part.length < 2)) {
      return "O nome informado parece incompleto. Pode escrever o nome completo do candidato?";
    }
  }

  if (field === "recruiterName" || field === "validatorName" || field === "approverName") {
    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      return "Preciso do nome completo. Informe nome e sobrenome.";
    }
  }

  if (
    field === "culturalMission" ||
    field === "culturalVision" ||
    field === "culturalContext" ||
    field === "candidateExperience" ||
    field === "behavioralTestInput"
  ) {
    if (normalized.length < 15) {
      return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
    }
  }

  if (field === "culturalValues") {
    const items = normalized
      .split(/\n|,|;|•/g)
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length < 3) {
      return "Preciso de pelo menos 3 valores da empresa para seguir com a análise.";
    }
  }

  if (field === "targetRole") {
    if (normalized.length < 4) {
      return "Não consegui identificar o cargo. Escreva o nome da vaga de forma mais completa.";
    }
  }

  return null;
}

function buildRoleAck(answer: string): { normalizedRole: string; reply: string } {
  const detected = detectRole(answer);

  if (detected) {
    return {
      normalizedRole: detected,
      reply: `Perfeito, identifiquei similaridade com o perfil de ${detected}. Já carreguei os requisitos e competências para a análise. Agora informe o nome completo do recrutador responsável pela avaliação.`,
    };
  }

  return {
    normalizedRole: answer.trim(),
    reply: `Não encontrei uma correspondência exata na base, mas vou estruturar a análise com base no cargo informado: ${answer.trim()}. Agora informe o nome completo do recrutador responsável pela avaliação.`,
  };
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

    const validationError = validateAnswer(currentField, answer);

    if (validationError) {
      return NextResponse.json({
        ok: true,
        session,
        nextField: currentField,
        reply: validationError,
        done: false,
      });
    }

    if (currentField === "targetRole") {
      const roleAck = buildRoleAck(answer);
      session.targetRole = roleAck.normalizedRole;

      return NextResponse.json({
        ok: true,
        session,
        nextField: "recruiterName",
        reply: roleAck.reply,
        done: false,
      });
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
