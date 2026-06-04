import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import OpenAI from "openai";

export const maxDuration = 60;

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

    const prompt = `Você é especialista em avaliação por competências com base no método STAR (Situação, Ação, Resultado) e no Mapeamento de Competências (C.H.A.).

Para cada competência abaixo, analise a resposta do candidato e classifique o Nível de Evidência como:
- Alto: resposta com estrutura clara (situação + ação + resultado), protagonismo direto, impacto mensurável.
- Médio: resposta com ação clara mas pouco resultado ou contexto genérico.
- Baixo: resposta vaga, sem evidência prática, sem protagonismo ou impacto.

Escreva uma justificativa objetiva de 2 a 3 frases mencionando elementos concretos da resposta.

Candidato: ${String(session.nome ?? "Participante")}
Vaga: ${String(session.vaga ?? "não informada")}

${examples.map((e, i) => `COMPETÊNCIA ${i + 1}: ${e.name}\nResposta: "${e.answer}"`).join("\n\n")}

Retorne APENAS JSON válido, sem markdown:
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
    JSON.parse(clean);
    return clean;
  } catch {
    return "[]";
  }
}

// ── Perfil Comportamental ─────────────────────────────────────────────────────
import {
  generateProfileReport,
  initializeProfileSession,
  runProfileStep,
} from "@/lib/agents/profile/profile-runner";
import {
  getDominantProfile,
  updateProfileSession,
  type ProfileField,
  type ProfileSession,
} from "@/lib/agents/profile/profile-flow";
import {
  ENNEA_DATA_ROUTE,
  buildEnneagramScoresRoute,
  getEnneaDominantRoute,
  getEnneaWingRoute,
} from "@/lib/enneagram-helpers";

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
      .map(f => `${f.toUpperCase()}=${String(session[f] ?? "-")}`).join(", ");
    const likertAnswers = ["el1","el2","el3","el4","el5","el6","el7","el8","el9","el10"]
      .map((f, i) => `L${i+1}=${String(session[f] ?? "-")}`).join(", ");

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

// ── DISC ──────────────────────────────────────────────────────────────────────
import {
  generateDiscReport,
  initializeDiscSession,
  runDiscStep,
  type DiscField,
  type DiscSession,
} from "@/lib/disc-runner";

// ── Big Five ──────────────────────────────────────────────────────────────────
import {
  generateBigFiveReport,
  initializeBigFiveSession,
  runBigFiveStep,
  type BigFiveField,
  type BigFiveSession,
} from "@/lib/agente-teste-bigfive-runner";

// ─────────────────────────────────────────────────────────────────────────────

type TermsData = {
  nome?: string;
  sobrenome?: string;
  sexo?: string;
  telefone?: string;
  email?: string;
  estado?: string;
  cidade?: string;
  empresa?: string;
  statusProfissional?: string;
  area?: string;
  cargo?: string;
};

type RequestBody = {
  session?: ProfileSession | DiscSession | Record<string, unknown>;
  currentField?: string;
  answer?: string;
  termsData?: TermsData;
};

// ── mappers ───────────────────────────────────────────────────────────────────

function mapProfileSessionToRow(
  session: ProfileSession & { reportMarkdown?: string | null },
  recruiterId: string,
  termsData?: TermsData | null
) {
  const fullName = termsData
    ? (`${termsData.nome ?? ""} ${termsData.sobrenome ?? ""}`.trim() || (session.nome ?? ""))
    : session.nome ?? "";

  return {
    candidate_name: fullName,
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
    raw_answers: { ...session, ...(termsData ? { termsData } : {}) },
    recruiter_id: recruiterId,
    updated_at: new Date().toISOString(),
  };
}

function mapDiscSessionToRow(
  session: any,
  recruiterId: string,
  agentSlug?: string
) {
  const isBigFive = agentSlug === "agente-teste-bigfive";
  return {
    candidate_name: [String(session.nome ?? ""), String(session.sobrenome ?? "")].filter(Boolean).join(" ") || "Não informado",
    target_role: isBigFive ? "Perfil comportamental Big Five" : "Perfil comportamental DISC",
    competencies: [],
    status: session.status ?? "in_progress",
    report_status: session.reportStatus ?? "pending",
    report_markdown: session.reportMarkdown ?? null,
    agent_name: isBigFive ? "Agente Teste Big Five" : "Teste de Perfil DISC",
    agent_slug: agentSlug ?? "teste-perfil-disc",
    raw_answers: session,
    recruiter_id: recruiterId,
    updated_at: new Date().toISOString(),
  };
}

// ── validators ────────────────────────────────────────────────────────────────

function validateProfileAnswer(field: ProfileField, answer: string): string | null {
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

  // Campos de múltipla escolha / numéricos — sem validação de tamanho
  if (
    /^e[abcde]$/.test(field) ||        // ea eb ec ed ee (eneagrama forçado)
    /^el([1-9]|10)$/.test(field) ||    // el1..el10 (likert 1-5)
    /^eq[1-3]$/.test(field)            // eq1 eq2 eq3 (qualitativas abertas)
  ) return null;

  // Campos opcionais de dados pessoais — aceita qualquer resposta
  if (["sobrenome","telefone","email","estado","cidade","empresa","area","cargo"].includes(field)) {
    return null;
  }

  if (normalized.length < 2) return "Não consegui validar sua resposta. Pode ser mais específico?";
  if (field === "nome" && !/^[\p{L}\s'.-]{2,}/u.test(normalized))
    return "Por favor, informe seu nome completo.";
  if (field === "vaga" && normalized.length < 4)
    return "Descreva um pouco mais a vaga ou cargo.";
  if (
    (field === "competenciaExemplo1" ||
      field === "competenciaExemplo2" ||
      field === "competenciaExemplo3") &&
    normalized.length < 20
  )
    return "Sua resposta ficou muito curta. Pode detalhar mais a situação?";
  return null;
}

// ── handler principal ─────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const supabase = createAdminClient();

    const { data: invitation, error: invError } = await supabase
      .from("assessment_invitations")
      .select("id, recruiter_id, vaga, status, expires_at, assessment_id, agent_slug")
      .eq("token", token)
      .single();

    if (invError || !invitation) {
      return NextResponse.json({ error: "Link inválido ou não encontrado." }, { status: 404 });
    }

    if (invitation.status === "completed") {
      return NextResponse.json({ error: "Esta avaliação já foi respondida." }, { status: 410 });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await supabase.from("assessment_invitations").update({ status: "expired" }).eq("id", invitation.id);
      return NextResponse.json({ error: "Este link expirou." }, { status: 410 });
    }

    const body = (await req.json()) as RequestBody;
    const agentSlug = invitation.agent_slug ?? "teste-perfil-comportamental";

    // ── fluxo DISC e Big Five ────────────────────────────────────────────────
    if (agentSlug === "teste-perfil-disc" || agentSlug === "agente-teste-bigfive") {
      const isBigFive = agentSlug === "agente-teste-bigfive";
      const discTerms = (body.termsData as TermsData) ?? null;

      // Respective functions dynamically mapped
      const initSession = isBigFive ? initializeBigFiveSession : initializeDiscSession;
      const runStep = isBigFive ? runBigFiveStep : runDiscStep;
      const generateReport = isBigFive ? generateBigFiveReport : generateDiscReport;

      let session = (body.session ?? initSession()) as any;

      // Pre-populate personal fields from termsData so the flow jumps straight to q1
      if (discTerms && !session.nome) {
        session = {
          ...session,
          nome: discTerms.nome ?? "",
          sobrenome: discTerms.sobrenome ?? "",
          sexo: discTerms.sexo ?? "",
          telefone: discTerms.telefone ?? "",
          email: discTerms.email ?? "",
          estado: discTerms.estado ?? "",
          cidade: discTerms.cidade ?? "",
          empresa: discTerms.empresa ?? "",
          statusProfissional: discTerms.statusProfissional ?? "",
          area: discTerms.area ?? "",
          cargo: discTerms.cargo ?? "",
          termsData: discTerms,
        };
      }

      if (!session.assessmentId) {
        const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
        const { data: created, error: createError } = await supabase
          .from("profile_assessments")
          .insert({
            candidate_name: "",
            target_role: isBigFive ? "Perfil comportamental Big Five" : "Perfil comportamental DISC",
            competencies: [],
            status: "in_progress",
            report_status: "pending",
            report_markdown: null,
            agent_name: isBigFive ? "Agente Teste Big Five" : "Teste de Perfil DISC",
            agent_slug: agentSlug,
            raw_answers: {},
            recruiter_id: invitation.recruiter_id,
            expires_at: expiresAt,
          })
          .select("id")
          .single();

        if (createError) {
          return NextResponse.json({ error: `Erro ao criar avaliação: ${createError.message}` }, { status: 500 });
        }

        session = { ...session, assessmentId: created.id };
        await supabase.from("assessment_invitations").update({ assessment_id: created.id }).eq("id", invitation.id);
      }

      const step = runStep(
        session,
        body.answer ?? "",
        body.currentField as any
      );

      let finalSession = {
        ...step.session,
        assessmentId: session.assessmentId,
        reportMarkdown: null,
      } as any;

      if (step.completed) {
        const reportMarkdown = generateReport(finalSession as any);
        finalSession = { ...finalSession, status: "completed" as const, reportStatus: "generated" as const, reportMarkdown };
        await supabase.from("assessment_invitations").update({ status: "completed", assessment_id: finalSession.assessmentId }).eq("id", invitation.id);
      }

      await supabase
        .from("profile_assessments")
        .update(mapDiscSessionToRow(finalSession, invitation.recruiter_id, agentSlug))
        .eq("id", finalSession.assessmentId!);

      return NextResponse.json({
        session: finalSession,
        done: step.completed,
        reply: step.completed
          ? `Suas respostas foram registradas com sucesso! O recrutador já pode acessar seu perfil ${isBigFive ? "Big Five" : "DISC"}.`
          : step.reply,
        currentField: step.nextField ?? null,
        nextField: step.nextField ?? null,
        agentSlug: agentSlug,
      });
    }

    // ── fluxo Perfil Comportamental (padrão) ────────────────────────────────
    const termsData: TermsData | null = (body.termsData as TermsData) ?? null;
    let session: ProfileSession = (body.session as ProfileSession) ?? initializeProfileSession();

    if (!session.vaga && invitation.vaga) {
      session = updateProfileSession(session, "vaga", invitation.vaga);
    }

    // Pre-populate personal fields from termsData so the flow skips those questions
    if (termsData && !session.nome) {
      const personalMap: Array<[ProfileField, string]> = [
        ["nome",              termsData.nome ?? ""],
        ["sobrenome",         termsData.sobrenome ?? ""],
        ["sexo",              termsData.sexo ?? ""],
        ["telefone",          termsData.telefone ?? ""],
        ["email",             termsData.email ?? ""],
        ["estado",            termsData.estado ?? ""],
        ["cidade",            termsData.cidade ?? ""],
        ["empresa",           termsData.empresa ?? ""],
        ["statusProfissional",termsData.statusProfissional ?? ""],
        ["area",              termsData.area ?? ""],
        ["cargo",             termsData.cargo ?? ""],
      ];
      for (const [f, v] of personalMap) {
        if (v) session = updateProfileSession(session, f, v);
      }
    }

    if (body.currentField && typeof body.answer === "string") {
      const validationError = validateProfileAnswer(body.currentField as ProfileField, body.answer.trim());
      if (validationError) {
        const retryResult = await runProfileStep({ session });
        return NextResponse.json({
          session,
          done: false,
          reply: validationError,
          currentField: retryResult.nextQuestion?.field ?? body.currentField ?? null,
          nextField: retryResult.nextQuestion?.field ?? body.currentField ?? null,
          nextQuestion: retryResult.nextQuestion,
        });
      }
    }

    if (!session.assessmentId) {
      const candidateName = termsData
        ? `${termsData.nome ?? ""} ${termsData.sobrenome ?? ""}`.trim()
        : "";
      const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      const { data: created, error: createError } = await supabase
        .from("profile_assessments")
        .insert({
          candidate_name: candidateName,
          target_role: invitation.vaga ?? "",
          competencies: [],
          status: "in_progress",
          report_status: "pending",
          report_markdown: null,
          agent_name: "Teste de Perfil Comportamental",
          agent_slug: "teste-perfil-comportamental",
          raw_answers: termsData ? { termsData } : {},
          recruiter_id: invitation.recruiter_id,
          expires_at: expiresAt,
        })
        .select("id")
        .single();

      if (createError) {
        return NextResponse.json({ error: `Erro ao criar avaliação: ${createError.message}` }, { status: 500 });
      }

      session = { ...session, assessmentId: created.id };
      await supabase.from("assessment_invitations").update({ assessment_id: created.id }).eq("id", invitation.id);
    }

    const result = await runProfileStep({
      session,
      currentField: body.currentField as ProfileField | undefined,
      answer: body.answer,
    });

    let finalSession: ProfileSession & { reportMarkdown?: string | null } = {
      ...result.session,
      assessmentId: session.assessmentId,
      reportMarkdown: null,
    };

    if (result.done) {
      const sessionWithAI = finalSession as ProfileSession & Record<string, unknown>;

      // Análise Eneagrama (igual ao uso interno)
      const hasEnnea =
        ["ea","eb","ec","ed","ee"].every(k => !!(sessionWithAI[k])) &&
        ["el1","el2","el3","el4","el5","el6","el7","el8","el9","el10"].every(k => {
          const v = parseInt(String(sessionWithAI[k] ?? "0"), 10);
          return v >= 1 && v <= 5;
        });
      if (hasEnnea) {
        sessionWithAI.enneaAnalysis = await generateEnneagramAnalysis(sessionWithAI);
      }

      sessionWithAI.competenciaAnalysis = await generateCompetencyAnalysis(sessionWithAI);
      const reportMarkdown = generateProfileReport(sessionWithAI as ProfileSession);
      finalSession = { ...finalSession, status: "completed", reportStatus: "generated", reportMarkdown };
      await supabase.from("assessment_invitations").update({ status: "completed", assessment_id: finalSession.assessmentId }).eq("id", invitation.id);
    }

    await supabase
      .from("profile_assessments")
      .update(mapProfileSessionToRow(finalSession, invitation.recruiter_id, termsData))
      .eq("id", finalSession.assessmentId!);

    return NextResponse.json({
      session: finalSession,
      done: result.done,
      reply: result.done
        ? "Suas respostas foram registradas com sucesso! O recrutador já pode acessar seu perfil comportamental."
        : result.reply,
      currentField: result.nextQuestion?.field ?? null,
      nextField: result.nextQuestion?.field ?? null,
      nextQuestion: result.nextQuestion,
      agentSlug: "teste-perfil-comportamental",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
