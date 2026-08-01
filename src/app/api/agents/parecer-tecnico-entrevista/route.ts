export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import {
  initializeParecerSession,
  runParecerStep,
} from "@/lib/parecer-runner";
import type { ParecerField, ParecerSession } from "@/lib/parecer-flow";

type RequestBody = {
  session?: ParecerSession;
  answer?: string;
  currentField?: ParecerField;
};

function mapSessionToRow(session: ParecerSession) {
  return {
    candidate_name: session.candidato ?? "",
    target_role: session.vaga ?? "",
    competencies: [],
    disc_answer: null,
    motivation_answer: session.motivacao ?? null,
    example_1: session.gestaoProcessos ?? session.competenciasTecnicas ?? null,
    example_2: session.analiseKpis ?? session.competenciasComportamentais ?? null,
    example_3: session.evidenciasLideranca ?? session.pontosDesenvolvimento ?? null,
    example_4: session.recomendacaoFinal ?? null,
    status: session.status ?? "in_progress",
    report_status: session.reportStatus ?? "pending",
    report_markdown: session.reportMarkdown ?? null,
    agent_name: "Parecer Técnico de Entrevista",
    agent_slug: "parecer-tecnico-entrevista",
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

function isBlockedAnswer(value: string): boolean {
  const normalized = normalizeText(value);
  const blocked = new Set([
    "oi",
    "ola",
    "ok",
    "sim",
    "teste",
    "aaa",
    "bbb",
    "123",
    "asd",
    "qwe",
  ]);
  return blocked.has(normalized);
}

function looksLikeGibberish(value: string): boolean {
  const normalized = normalizeText(value)
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return true;

  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 0) return true;

  const weirdTokens = tokens.filter((token) => {
    if (/^\d+$/.test(token)) return false;
    if (token.length <= 2) return false;
    const vowels = (token.match(/[aeiou]/g) ?? []).length;
    if (token.length >= 4 && vowels === 0) return true;
    if (token.length >= 5 && vowels <= 1) return true;
    if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(token)) return true;
    return false;
  });

  if (tokens.length === 1) {
    const token = tokens[0];
    if (token.length >= 5 && !/[aeiou]/.test(token)) return true;
  }

  return weirdTokens.length === tokens.length;
}

function validateAnswer(field: ParecerField, answer: string): string | null {
  const normalized = answer.trim();
  const normalizedText = normalizeText(normalized);

  if (isBlockedAnswer(normalized) || looksLikeGibberish(normalized)) {
    return "Não consegui interpretar sua resposta com segurança. Pode escrever de forma mais clara?";
  }

  // Aceitar respostas negativas ou curtas de acompanhamento ("não", "não teve", "N/A", "nenhum", etc.)
  const shortNegatives = new Set([
    "nao",
    "não",
    "nao teve",
    "não teve",
    "nao possui",
    "não possui",
    "nenhum",
    "nenhuma",
    "sem",
    "n/a",
    "nao se aplica",
    "não se aplica",
    "nada",
    "nao informado",
    "não informado",
    "nao relata",
    "não relata",
    "sem evidencias",
    "sem evidências",
    "sem dados",
    "nao consta",
    "não consta",
    "sem indicacao",
    "sem indicação",
    "sem referencias",
    "sem referências",
    "sem certificacao",
    "sem certificação",
  ]);

  if (shortNegatives.has(normalizedText)) {
    return null;
  }

  if (field === "empresa" || field === "vaga") {
    if (normalized.length < 2) {
      return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
    }
    return null;
  }

  if (
    field === "candidato" ||
    field === "entrevistadores" ||
    field === "validacaoGestor" ||
    field === "aprovacaoFinalRh"
  ) {
    if (normalized.length < 2) {
      return "Preciso de um nome ou nome e cargo válidos para continuar.";
    }
    return null;
  }

  if (field === "formacao") {
    if (normalized.length < 2) {
      return "Por favor, informe a formação acadêmica do candidato (ex.: Administração, RH, Engenharia).";
    }
    return null;
  }

  if (field === "dataEntrevista") {
    if (normalized.length < 4) {
      return "Preciso da data da entrevista de forma mais clara para continuar.";
    }
    return null;
  }

  if (field === "recomendacaoFinal") {
    const value = normalizeText(normalized);
    const hasStatus =
      value.includes("aprovado") ||
      value.includes("aprovado com restricoes") ||
      value.includes("aprovado com restrições") ||
      value.includes("reprovado");

    if (!hasStatus || normalized.length < 8) {
      return "Preciso da recomendação final com status (Aprovado, Aprovado com Restrições ou Reprovado) e uma breve justificativa.";
    }
    return null;
  }

  if (field === "contextoContratacao") {
    const acceptedShortAnswers = [
      "substituicao",
      "substituição",
      "expansao",
      "expansão",
      "nova estrutura",
      "promocao interna",
      "promoção interna",
      "reposicao",
      "reposição",
      "aumento de quadro",
      "troca de colaborador",
    ];

    if (acceptedShortAnswers.includes(normalizedText) || normalized.length >= 3) {
      return null;
    }
  }

  // Aceita qualquer resposta legítima com pelo menos 3 caracteres
  if (normalized.length < 3) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    let session = body.session ?? initializeParecerSession();

    const hasIncomingAnswer =
      typeof body.answer === "string" &&
      body.answer.trim().length > 0 &&
      typeof body.currentField === "string";

    if (!hasIncomingAnswer) {
      const result = await runParecerStep({ session });

      return NextResponse.json({
        session,
        done: false,
        reply: result.reply,
        nextField: result.nextField ?? null,
        reportMarkdown: null,
      });
    }

    const validationError = validateAnswer(body.currentField!, body.answer!.trim());

    if (validationError) {
      return NextResponse.json({
        session,
        done: false,
        reply: validationError,
        nextField: body.currentField ?? null,
        reportMarkdown: null,
      });
    }

    const supabase = createAdminClient();

    if (!session.assessmentId) {
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000
      ).toISOString();
      const sessionUser = await getSessionUser();
      const recruiterId = sessionUser?.id ?? null;

      const { data: created, error: createError } = await supabase
        .from("profile_assessments")
        .insert({
          candidate_name: "",
          target_role: "Pendente",
          competencies: [],
          status: "in_progress",
          report_status: "pending",
          report_markdown: null,
          agent_name: "Parecer Técnico de Entrevista",
          agent_slug: "parecer-tecnico-entrevista",
          raw_answers: {},
          expires_at: expiresAt,
          ...(recruiterId ? { recruiter_id: recruiterId } : {}),
        })
        .select("id")
        .single();

      if (createError) {
        return NextResponse.json(
          {
            error: `Erro ao criar avaliação do parecer técnico: ${createError.message}`,
          },
          { status: 500 }
        );
      }

      session = {
        ...session,
        assessmentId: created.id,
      };
    }

    const result = await runParecerStep({
      session,
      answer: body.answer,
      currentField: body.currentField,
    });

    const finalSession: ParecerSession = {
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
          error: `Erro ao salvar respostas do parecer técnico: ${updateError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: finalSession,
      done: result.done,
      reply: result.reply,
      nextField: result.nextField ?? null,
      reportMarkdown: result.reportMarkdown ?? null,
    });
  } catch (error) {
    console.error("Erro na rota parecer-tecnico-entrevista:", error);

    return NextResponse.json(
      { error: "Erro ao processar o agente de parecer técnico de entrevista." },
      { status: 500 }
    );
  }
}
