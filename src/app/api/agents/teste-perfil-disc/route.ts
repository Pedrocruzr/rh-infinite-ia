import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateDiscReport,
  initializeDiscSession,
  runDiscStep,
} from "@/lib/disc-runner";
import type { DiscField, DiscSession } from "@/lib/disc-flow";

type RequestBody = {
  session?: DiscSession;
  answer?: string;
  currentField?: DiscField;
};

function mapSessionToRow(session: DiscSession & { reportMarkdown?: string | null }) {
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
    report_markdown: session.reportMarkdown ?? null,
    agent_name: "Teste de Perfil DISC",
    agent_slug: "teste-perfil-disc",
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
    if (token.length >= 5 && !token.includes(" ")) {
      if (!/[aeiou]/.test(token) || weirdTokens.length === 1) return true;
    }
  }

  return weirdTokens.length === tokens.length;
}

function validateAnswer(field: DiscField, answer: string): string | null {
  const normalized = answer.trim();

  if (isBlockedAnswer(normalized) || looksLikeGibberish(normalized)) {
    return "Não consegui interpretar sua resposta com segurança. Pode escrever de forma mais clara?";
  }

  if (field === "nome") {
    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      return "Preciso do nome completo. Informe nome e sobrenome.";
    }
    return null;
  }

  if (field === "vaga") {
    if (normalized.length < 4) {
      return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
    }
    return null;
  }

  if (normalized.length < 12) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
  }

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
  }

  return null;
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

    const validationError = validateAnswer(body.currentField!, body.answer!.trim());

    if (validationError) {
      return NextResponse.json({
        session,
        done: false,
        reply: validationError,
        nextField: body.currentField ?? null,
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

    let finalSession: DiscSession & { reportMarkdown?: string | null } = {
      ...result.session,
      assessmentId: session.assessmentId,
      reportMarkdown: null,
    };

    if (result.done) {
      const reportMarkdown = await generateDiscReport(finalSession);

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
          error: `Erro ao salvar respostas DISC: ${updateError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: finalSession,
      done: result.done,
      reply: result.done ? "Relatório DISC gerado com sucesso." : result.reply,
      nextField: result.nextField ?? null,
      reportMarkdown: finalSession.reportMarkdown ?? null,
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
