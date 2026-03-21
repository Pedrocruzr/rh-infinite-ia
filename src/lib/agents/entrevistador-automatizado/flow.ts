export type EntrevistadorAutomatizadoSession = {
  recrutadorNome?: string;
  candidatoNome?: string;
  vagaAlvo?: string;
  contextoContratacao?: string;
  objetivoPrincipalVaga?: string;
  responsabilidadesCriticas?: string;
  competenciasTecnicas?: string;
  competenciasComportamentais?: string;
  desafiosFuncao?: string;
  criteriosEliminatorios?: string;
  nivelExperiencia?: string;
  observacoesFitCultural?: string;
  nomeGestorDireto?: string;
  aprovacaoFinalRh?: string;
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
  description: "Cria roteiros estruturados de entrevista com foco técnico e comportamental.",
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
  return normalizeText(value).replace(/[^a-z0-9\s]/g, "").trim();
}

function wordCount(value: string): number {
  return stripToAlphaNum(value)
    .split(" ")
    .filter(Boolean).length;
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
    "aaa",
    "bbb",
    "ccc",
  ]);

  if (blocked.has(text)) return true;

  const words = text.split(" ").filter(Boolean);
  if (words.length === 1) {
    const single = words[0];
    if (single.length <= 2) return true;
    if (!/[aeiou]/.test(single) && single.length >= 4) return true;
    if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(single)) return true;
  }

  return false;
}

function isExplicitNegative(value: string): boolean {
  const text = stripToAlphaNum(value);
  return [
    "nao",
    "não",
    "nenhum",
    "nenhuma",
    "sem mais informacoes",
    "sem mais informações",
    "nao ha",
    "não há",
    "nada adicional",
  ].includes(text);
}

function validateFullName(value: string): FlowValidationResult {
  const cleaned = value.trim();
  if (!cleaned) {
    return { valid: false, message: SHORT_BLOCK_MESSAGE };
  }

  if (!hasLetters(cleaned) || looksLikeGibberish(cleaned)) {
    return { valid: false, message: UNCLEAR_BLOCK_MESSAGE };
  }

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return { valid: false, message: SHORT_BLOCK_MESSAGE };
  }

  const allShort = parts.every((part) => part.length <= 2);
  if (allShort) {
    return { valid: false, message: UNCLEAR_BLOCK_MESSAGE };
  }

  return { valid: true };
}

function validateSemanticText(
  value: string,
  options?: { allowExplicitNegative?: boolean; minWords?: number }
): FlowValidationResult {
  const cleaned = value.trim();

  if (!cleaned) {
    return { valid: false, message: SHORT_BLOCK_MESSAGE };
  }

  if (!hasLetters(cleaned) || looksLikeGibberish(cleaned)) {
    return { valid: false, message: UNCLEAR_BLOCK_MESSAGE };
  }

  if (options?.allowExplicitNegative && isExplicitNegative(cleaned)) {
    return { valid: true };
  }

  const words = wordCount(cleaned);
  const normalized = stripToAlphaNum(cleaned);

  const clearSingleTerms = [
    "substituicao",
    "expansao",
    "recepcao",
    "recepcionista",
    "administrativo",
    "comercial",
    "vendas",
    "financeiro",
    "rh",
    "marketing",
    "operacional",
    "logistica",
    "junior",
    "pleno",
    "senior",
  ];

  if (words === 1 && clearSingleTerms.includes(normalized)) {
    return { valid: true };
  }

  if (words < (options?.minWords ?? 2)) {
    return { valid: false, message: SHORT_BLOCK_MESSAGE };
  }

  return { valid: true };
}

export const ENTREVISTADOR_AUTOMATIZADO_FLOW: FlowStep[] = [
  {
    key: "recrutadorNome",
    question: "Qual é o nome completo do recrutador responsável?",
    validate: validateFullName,
  },
  {
    key: "candidatoNome",
    question: "Qual é o nome completo do candidato?",
    validate: validateFullName,
  },
  {
    key: "vagaAlvo",
    question: "Qual é a vaga ou cargo avaliado?",
    validate: (value) => validateSemanticText(value, { minWords: 1 }),
  },
  {
    key: "contextoContratacao",
    question:
      "Qual é o contexto da contratação? Ex.: substituição, expansão, nova estrutura ou outro cenário relevante.",
    validate: (value) => validateSemanticText(value, { minWords: 1 }),
  },
  {
    key: "objetivoPrincipalVaga",
    question: "Qual é o principal objetivo dessa vaga dentro da operação?",
    validate: (value) => validateSemanticText(value, { minWords: 3 }),
  },
  {
    key: "responsabilidadesCriticas",
    question: "Quais são as responsabilidades mais críticas da função?",
    validate: (value) => validateSemanticText(value, { minWords: 3 }),
  },
  {
    key: "competenciasTecnicas",
    question: "Quais competências técnicas o candidato precisa demonstrar?",
    validate: (value) => validateSemanticText(value, { minWords: 3 }),
  },
  {
    key: "competenciasComportamentais",
    question: "Quais competências comportamentais são indispensáveis para essa vaga?",
    validate: (value) => validateSemanticText(value, { minWords: 3 }),
  },
  {
    key: "desafiosFuncao",
    question: "Quais desafios reais essa pessoa vai enfrentar no dia a dia da função?",
    validate: (value) => validateSemanticText(value, { minWords: 3 }),
  },
  {
    key: "criteriosEliminatorios",
    question: "Quais sinais de alerta ou critérios eliminatórios devem ser observados na entrevista?",
    validate: (value) => validateSemanticText(value, { minWords: 3 }),
  },
  {
    key: "nivelExperiencia",
    question: "Qual é o nível de experiência esperado para essa posição?",
    validate: (value) => validateSemanticText(value, { minWords: 1 }),
  },
  {
    key: "observacoesFitCultural",
    question:
      "Existe alguma observação importante sobre fit cultural, estilo de trabalho ou ambiente da equipe?",
    validate: (value) =>
      validateSemanticText(value, { minWords: 2, allowExplicitNegative: true }),
  },
  {
    key: "nomeGestorDireto",
    question: "Qual é o nome completo do gestor direto dessa posição?",
    validate: validateFullName,
  },
  {
    key: "aprovacaoFinalRh",
    question: "Qual é o nome completo do responsável pela aprovação final?",
    validate: validateFullName,
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
