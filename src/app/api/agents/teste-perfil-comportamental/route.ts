import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";

export const maxDuration = 60;
import {
  generateProfileReport,
  initializeProfileSession,
  runProfileStep,
} from "@/lib/agents/profile/profile-runner";
import {
  getDominantProfile,
  type ProfileField,
  type ProfileSession,
} from "@/lib/agents/profile/profile-flow";
import { ENNEA_DATA_ROUTE, buildEnneagramScoresRoute, getEnneaDominantRoute, getEnneaWingRoute } from "@/lib/enneagram-helpers";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function generateCompetencyAnalysis(session: ProfileSession & Record<string, unknown>): Promise<string> {
  try {
    const competencias =
      Array.isArray(session.competenciasPrincipais) && session.competenciasPrincipais.length === 3
        ? session.competenciasPrincipais
        : ["Competência 1", "Competência 2", "Competência 3"];

    const examples = [
      { name: competencias[0], answer: String(session.competenciaExemplo1 ?? "") },
      { name: competencias[1], answer: String(session.competenciaExemplo2 ?? "") },
      { name: competencias[2], answer: String(session.competenciaExemplo3 ?? "") },
    ];

    const prompt = `Você é especialista em avaliação por competências com base no método STAR (Situação, Ação, Resultado) e no Mapeamento de Competências (C.H.A. — Conhecimento, Habilidade e Atitude).

Para cada competência abaixo, analise a resposta do candidato e classifique o Nível de Evidência como:
- Alto: resposta com estrutura clara (situação + ação + resultado), protagonismo direto, impacto mensurável.
- Médio: resposta com ação clara mas pouco resultado ou contexto genérico.
- Baixo: resposta vaga, sem evidência prática, sem protagonismo ou impacto.

Em seguida, escreva uma justificativa objetiva de 2 a 3 frases explicando por que esse nível foi atribuído, mencionando elementos concretos da resposta.

Candidato: ${String(session.nome ?? "Participante")}
Vaga: ${String(session.vaga ?? "não informada")}

${examples.map((e, i) => `COMPETÊNCIA ${i + 1}: ${e.name}\nResposta: "${e.answer}"`).join("\n\n")}

Retorne APENAS JSON válido, sem markdown, no seguinte formato exato:
[
  {"competencia": "${examples[0].name}", "nivel": "Alto|Médio|Baixo", "justificativa": "..."},
  {"competencia": "${examples[1].name}", "nivel": "Alto|Médio|Baixo", "justificativa": "..."},
  {"competencia": "${examples[2].name}", "nivel": "Alto|Médio|Baixo", "justificativa": "..."}
]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content ?? "[]";
    const clean = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    JSON.parse(clean); // validate
    return clean;
  } catch {
    return "[]";
  }
}

async function generateEnneagramAnalysis(session: ProfileSession & Record<string, unknown>): Promise<string> {
  try {
    const scores = buildEnneagramScoresRoute(session);
    const dominant = getEnneaDominantRoute(scores);
    const wing = getEnneaWingRoute(scores, dominant);
    const typeData = ENNEA_DATA_ROUTE[dominant];
    const topTypes = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t, v]) => `Tipo ${t} (${ENNEA_DATA_ROUTE[parseInt(t)]?.name ?? t}): ${v} pts`)
      .join(", ");

    const forcedAnswers = ["ea","eb","ec","ed","ee"]
      .map(f => `${f.toUpperCase()}=${String(session[f] ?? "-")}`)
      .join(", ");
    const likertAnswers = ["el1","el2","el3","el4","el5","el6","el7","el8","el9","el10"]
      .map((f, i) => `L${i+1}=${String(session[f] ?? "-")}`)
      .join(", ");

    const prompt = `Você é especialista em Eneagrama aplicado ao contexto profissional. Analise o perfil abaixo e gere um relatório completo personalizado em português brasileiro.

DADOS DO PERFIL:
- Tipo principal: ${dominant} — ${typeData.name}
- Asa: ${dominant}w${wing}
- Centro: ${typeData.centerLabel}
- Medo central: ${typeData.core_fear}
- Desejo central: ${typeData.core_desire}
- Top 3 tipos por pontuação: ${topTypes}

RESPOSTAS DO QUESTIONÁRIO:
Escolha forçada: ${forcedAnswers}
Likert (1-5): ${likertAnswers}

RESPOSTAS ABERTAS:
Q1 (Sob pressão): "${String(session.eq1 ?? "não respondido")}"
Q2 (Motivação para projetos): "${String(session.eq2 ?? "não respondido")}"
Q3 (Conflitos): "${String(session.eq3 ?? "não respondido")}"

Retorne APENAS JSON válido, sem markdown:
{
  "resumo_perfil": "3-4 frases descrevendo o padrão comportamental predominante, conectando o tipo com as respostas. Mencione a asa e o centro.",
  "motivadores_medos": "2-3 parágrafos sobre como o medo e o desejo central se manifestam no trabalho desta pessoa.",
  "pontos_fortes": ["força 1 personalizada", "força 2", "força 3", "força 4"],
  "desafios": ["desafio 1 personalizado", "desafio 2", "desafio 3", "desafio 4"],
  "comunicacao_decisao": "2 parágrafos sobre como esta pessoa tende a comunicar e decidir.",
  "estresse": "2 parágrafos: gatilhos de estresse desta pessoa e como ela reage tipicamente.",
  "desenvolvimento": ["sugestão prática 1", "sugestão prática 2", "sugestão prática 3", "sugestão prática 4", "sugestão prática 5"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const clean = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    JSON.parse(clean);
    return clean;
  } catch {
    return "{}";
  }
}

type RequestBody = {
  session?: ProfileSession;
  currentField?: ProfileField;
  answer?: string;
};

function mapSessionToRow(session: ProfileSession & { reportMarkdown?: string | null }, recruiterId?: string | null) {
  return {
    candidate_name: session.nome ?? "",
    target_role: session.vaga ?? "",
    competencies: session.competenciasPrincipais ?? [],
    disc_answer: session.discScores ? getDominantProfile(session.discScores) : null,
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
    ...(recruiterId ? { recruiter_id: recruiterId } : {}),
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

function isPlausibleName(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length < 2) return false;
  if (/\d/.test(trimmed)) return false;

  const tokens = trimmed
    .split(/\s+/)
    .map((token) => token.replace(/^[-'.\s]+|[-'.\s]+$/g, ""))
    .filter(Boolean);

  if (tokens.length === 0) return false;

  const hasValidToken = tokens.some(
    (token) => /^[\p{L}][\p{L}'’.-]{1,}$/u.test(token) && /[\p{L}]/u.test(token)
  );

  if (!hasValidToken) return false;

  const normalized = normalizeText(trimmed);
  const compact = normalized.replace(/\s+/g, "");

  if (compact.length < 3) return false;

  const obviousNoise = [
    /(.)\1{3,}/,
    /^[bcdfghjklmnpqrstvwxyz]{6,}$/i,
    /^[aeiou]{5,}$/i,
    /^[a-z]{1,2}$/i,
  ];

  if (obviousNoise.some((pattern) => pattern.test(compact))) {
    return false;
  }

  return true;
}

function validateAnswer(field: ProfileField, answer: string): string | null {
  const normalized = answer.trim();

  // Valida range numérico para campos de múltipla escolha
  const numericChoiceMax: Record<string, number> = {
    motivacao: 4,
    sexo: 3,
    statusProfissional: 2,
    disc1: 4, disc2: 4, disc3: 4, disc4: 4, disc5: 4, disc6: 4,
  };
  if (field in numericChoiceMax) {
    const num = parseInt(normalized, 10);
    if (!Number.isNaN(num) && (num < 1 || num > numericChoiceMax[field])) {
      return `Opção inválida. Escolha entre 1 e ${numericChoiceMax[field]}.`;
    }
    return null;
  }

  // Perguntas de múltipla escolha aceitam "1".."4", "a".."d" ou palavra-chave.
  if (
    /^e[abcde]$/.test(field) ||
    /^el([1-9]|10)$/.test(field) ||
    /^eq[1-3]$/.test(field)
  ) {
    return null;
  }

  // Campos opcionais de dados pessoais — aceita qualquer resposta incluindo vazio
  if (["sobrenome","telefone","email","estado","cidade","empresa","area","cargo"].includes(field)) {
    return null;
  }

  if (isWeakAnswer(normalized)) {
    return "Não consegui validar sua resposta. Responda exatamente o que foi pedido, com mais clareza.";
  }

  if (field === "nome") {
    if (!isPlausibleName(normalized)) {
      return "Não consegui validar seu nome. Informe pelo menos um nome real, como por exemplo Pedro, Ana, John ou María.";
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
    const sessionUser = await getSessionUser();
    const recruiterId = sessionUser?.id ?? null;

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
          currentField: retryResult.nextQuestion?.field ?? body.currentField ?? null,
          nextField: retryResult.nextQuestion?.field ?? body.currentField ?? null,
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
          ...(recruiterId ? { recruiter_id: recruiterId } : {}),
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
      const sessionWithEnnea = finalSession as ProfileSession & Record<string, unknown>;
      const hasEnnea =
        ["ea","eb","ec","ed","ee"].every(k => !!sessionWithEnnea[k]) &&
        ["el1","el2","el3","el4","el5","el6","el7","el8","el9","el10"].every(k => {
          const v = parseInt(String(sessionWithEnnea[k] ?? "0"), 10);
          return v >= 1 && v <= 5;
        });

      if (hasEnnea) {
        (sessionWithEnnea as Record<string, unknown>).enneaAnalysis = await generateEnneagramAnalysis(sessionWithEnnea);
      }

      (sessionWithEnnea as Record<string, unknown>).competenciaAnalysis = await generateCompetencyAnalysis(sessionWithEnnea);

      const reportMarkdown = generateProfileReport(sessionWithEnnea as ProfileSession);

      finalSession = {
        ...finalSession,
        status: "completed",
        reportStatus: "generated",
        reportMarkdown,
      };
    }

    const { error: updateError } = await supabase
      .from("profile_assessments")
      .update(mapSessionToRow(finalSession, recruiterId))
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
      currentField: result.nextQuestion?.field ?? null,
      nextField: result.nextQuestion?.field ?? null,
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
