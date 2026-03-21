export type EntrevistadorAutomatizadoSession = {
  candidatoNome?: string;
  vagaAlvo?: string;
  competenciasDesejadas?: string;
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

export function applyAnswer(
  session: Partial<EntrevistadorAutomatizadoSession>,
  answer: string
):
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
    } {
  const step = getCurrentStep(session);

  if (!step) {
    return {
      ok: true,
      session,
      nextQuestion: null,
      completed: true,
    };
  }

  const validation = step.validate(answer);

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
    [step.key]: answer.trim(),
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
