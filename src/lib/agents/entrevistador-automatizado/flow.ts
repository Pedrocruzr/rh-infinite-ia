export type EntrevistadorAutomatizadoSession = {
  candidatoNome?: string;
  vagaAlvo?: string;
  competenciasDesejadas?: string;
  historicoConversaEntrevistador?: { role: "user" | "assistant"; content: string }[];
};

export type FlowValidationResult = {
  valid: boolean;
  message?: string;
};

export type FlowStep = {
  key: keyof EntrevistadorAutomatizadoSession;
  question: string;
  validate: (value: string) => FlowValidationResult;
};

export const ENTREVISTADOR_AUTOMATIZADO_AGENT = {
  name: "Entrevistador Automatizado",
  slug: "entrevistador-automatizado",
  description:
    "Cria roteiros estruturados de entrevista por vaga e competências, com scorecard, gaps e relatório final.",
};

const SHORT_BLOCK_MESSAGE =
  "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";

const UNCLEAR_BLOCK_MESSAGE =
  "Não consegui interpretar sua resposta com segurança. Pode escrever de forma mais clara?";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function stripToAlphaNum(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9,\s/-]/g, "").trim();
}

function hasLetters(value: string): boolean {
  return /[a-zA-ZÀ-ÿ]/.test(value);
}

function looksLikeGibberish(value: string): boolean {
  const text = stripToAlphaNum(value);
  if (!text) return true;

  const blocked = new Set([
    "jrga",
    "rera",
    "erar",
    "dageasr",
    "rejg",
    "kkhjjpe",
    "qwe",
    "asd",
    "zxc",
  ]);

  if (blocked.has(text)) return true;

  const compact = text.replace(/\s+/g, "");
  if (compact.length <= 1) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(compact)) return true;

  return false;
}

function wordCount(value: string): number {
  return stripToAlphaNum(value)
    .split(/\s+/)
    .filter(Boolean).length;
}

function validateSemanticText(
  value: string,
  options?: { minWords?: number }
): FlowValidationResult {
  const cleaned = value.trim();

  if (!cleaned) {
    return { valid: false, message: SHORT_BLOCK_MESSAGE };
  }

  if (!hasLetters(cleaned) || looksLikeGibberish(cleaned)) {
    return { valid: false, message: UNCLEAR_BLOCK_MESSAGE };
  }

  const words = wordCount(cleaned);
  if (words < (options?.minWords ?? 1)) {
    return { valid: false, message: SHORT_BLOCK_MESSAGE };
  }

  return { valid: true };
}

function validateSimpleName(value: string): FlowValidationResult {
  const cleaned = value.trim();

  if (!cleaned) {
    return { valid: false, message: SHORT_BLOCK_MESSAGE };
  }

  if (!hasLetters(cleaned) || looksLikeGibberish(cleaned)) {
    return { valid: false, message: UNCLEAR_BLOCK_MESSAGE };
  }

  return { valid: true };
}

export const ENTREVISTADOR_AUTOMATIZADO_FLOW: FlowStep[] = [
  {
    key: "candidatoNome",
    question: "Qual é o nome do candidato?",
    validate: validateSimpleName,
  },
  {
    key: "vagaAlvo",
    question: "Para qual vaga você precisa de um roteiro de entrevista?",
    validate: (value) => validateSemanticText(value, { minWords: 1 }),
  },
  {
    key: "competenciasDesejadas",
    question:
      "Quais competências comportamentais e organizacionais você deseja avaliar nesta entrevista?",
    validate: (value) => validateSemanticText(value, { minWords: 2 }),
  },
];

export function getCurrentStepIndex(
  session: Partial<EntrevistadorAutomatizadoSession>
): number {
  return ENTREVISTADOR_AUTOMATIZADO_FLOW.findIndex((step) => {
    const value = session[step.key];
    return !value || !String(value).trim();
  });
}

export function getCurrentStep(
  session: Partial<EntrevistadorAutomatizadoSession>
): FlowStep | null {
  const index = getCurrentStepIndex(session);
  if (index === -1) return null;
  return ENTREVISTADOR_AUTOMATIZADO_FLOW[index];
}

export function isFlowComplete(
  session: Partial<EntrevistadorAutomatizadoSession>
): session is EntrevistadorAutomatizadoSession {
  return getCurrentStepIndex(session) === -1;
}

function normalizeForComparison(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isConfusedOrAsking(text: string): boolean {
  const trimmed = text.trim();
  const n = normalizeForComparison(trimmed);

  if (trimmed.endsWith("?") && trimmed.split(/\s+/).length <= 8) return true;

  const confusionPatterns = [
    "em qual sentido",
    "o que voce quer dizer",
    "nao entendi",
    "pode explicar",
    "como assim",
    "nao compreendi",
    "nao sei",
    "nao entendo",
    "o que isso significa",
    "pode detalhar",
    "o que e isso",
    "o que significa",
    "me explica",
    "pode me explicar",
    "explica melhor",
    "nao estou entendendo",
    "nao to entendendo",
    "qual sentido",
    "que sentido",
  ];

  return confusionPatterns.some((p) => n.includes(p));
}

async function analisarMensagemUsuarioEntrevistador(
  perguntaUsuario: string,
  step: FlowStep,
  session: Partial<EntrevistadorAutomatizadoSession>
): Promise<{ isDoubt: boolean; reply: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const questionText = step.question;
  const historico = session.historicoConversaEntrevistador ?? [];

  if (!apiKey) {
    const confused = isConfusedOrAsking(perguntaUsuario);
    if (confused) {
      return {
        isDoubt: true,
        reply: `Sem problema, deixa eu explicar melhor!\n\n${questionText}`
      };
    }
    return { isDoubt: false, reply: "" };
  }

  const candidato = session.candidatoNome ? `Nome do candidato: "${session.candidatoNome}". ` : "";
  const vaga = session.vagaAlvo ? `Vaga alvo: "${session.vagaAlvo}". ` : "";
  const contextoVaga = candidato || vaga ? `\nContexto atual da entrevista: ${candidato}${vaga}\n` : "";

  try {
    const messages = [
      {
        role: "system",
        content: `Você é o Agente Entrevistador Automatizado. O usuário está na etapa da pergunta: "${questionText}".${contextoVaga}
Sua tarefa é analisar a mensagem do usuário e decidir se ela é uma resposta válida à pergunta ou se representa uma dúvida, questionamento, esclarecimento ou reclamação (como dizer "já falei", "não entendi", "voltar", "mudar vaga").

Se o usuário estiver apenas respondendo à pergunta diretamente (por exemplo, fornecendo o nome do candidato, a vaga desejada como "auxiliar de rh", "desenvolvedor", ou listando as competências comportamentais/organizacionais que quer avaliar), retorne estritamente a palavra: PASS.

Se o usuário NÃO estiver respondendo diretamente, ou se expressar dúvidas, perguntas, confusão ou reclamações (como "não sei quais competências usar", "como assim?", "qual a diferença?", "quem é o candidato?"), você deve agir como um especialista em Recrutamento e Seleção / RH e conversar de forma inteligente e dinâmica. 
Interprete a mensagem dele:
- Se ele tiver dúvidas sobre como definir competências ou quais perguntar, dê sugestões de competências comuns (comportamentais ou técnicas) para a vaga indicada, ou explique o que ele pode preencher.
- Se ele estiver confuso sobre o nome do candidato ou vaga, explique com clareza o objetivo desta etapa.
- Mantenha a conversa natural, cordial e fluida. NÃO use frases prontas ou automáticas engessadas. NÃO use formatação em negrito (**).
- Ajude-o a destravar a resposta e, de forma sutil, natural e fluida, convide-o a responder à pergunta atual quando ele se sentir pronto.`
      },
      ...historico,
      { role: "user", content: perguntaUsuario }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      throw new Error("Erro na chamada da OpenAI");
    }

    const data = await response.json();
    const content = (data.choices?.[0]?.message?.content ?? "").trim();
    
    if (content.toUpperCase() === "PASS" || content.toUpperCase().startsWith("PASS")) {
      return { isDoubt: false, reply: "" };
    }

    return { isDoubt: true, reply: content.replaceAll("**", "") };
  } catch (error) {
    console.error("Erro na análise da OpenAI (Entrevistador):", error);
    return { isDoubt: false, reply: "" };
  }
}

export async function applyAnswer(
  session: Partial<EntrevistadorAutomatizadoSession>,
  answer: string
): Promise<
  | {
      ok: true;
      session: Partial<EntrevistadorAutomatizadoSession>;
      nextQuestion: string | null;
      completed: boolean;
    }
  | {
      ok: false;
      error: string;
      session: Partial<EntrevistadorAutomatizadoSession>;
      currentQuestion: string;
    }
> {
  const step = getCurrentStep(session);

  if (!step) {
    return {
      ok: true,
      session,
      nextQuestion: null,
      completed: true,
    };
  }

  const raw = answer.trim();

  // Call OpenAI doubts check
  const analise = await analisarMensagemUsuarioEntrevistador(raw, step, session);

  if (analise.isDoubt) {
    const novoHistorico = [
      ...(session.historicoConversaEntrevistador ?? []),
      { role: "user" as const, content: raw },
      { role: "assistant" as const, content: analise.reply }
    ];

    return {
      ok: false,
      error: analise.reply,
      session: {
        ...session,
        historicoConversaEntrevistador: novoHistorico
      },
      currentQuestion: step.question
    };
  }

  const validation = step.validate(raw);

  if (!validation.valid) {
    return {
      ok: false,
      error: validation.message ?? UNCLEAR_BLOCK_MESSAGE,
      session,
      currentQuestion: step.question,
    };
  }

  const updatedSession = {
    ...session,
    [step.key]: raw,
  };

  const nextStep = getCurrentStep(updatedSession);

  return {
    ok: true,
    session: updatedSession,
    nextQuestion: nextStep ? nextStep.question : null,
    completed: !nextStep,
  };
}

export function getInitialQuestion(): string {
  return ENTREVISTADOR_AUTOMATIZADO_FLOW[0].question;
}
