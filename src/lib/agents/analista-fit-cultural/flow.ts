export type FitCulturalField =
  | "objetivo"
  | "culturaAtual"
  | "valoresDecisoes"
  | "discrepancia"
  | "comportamentosRecompensados"
  | "evolucaoDesejada"
  | "diferenciaisCulturais"
  | "proposito"
  | "sucesso"
  | "comportamentosInaceitaveis"
  | "lideranca";

export type FitCulturalSession = {
  assessmentId?: string;
  objetivo?: string;
  culturaAtual?: string;
  valoresDecisoes?: string;
  discrepancia?: string;
  comportamentosRecompensados?: string;
  evolucaoDesejada?: string;
  diferenciaisCulturais?: string;
  proposito?: string;
  sucesso?: string;
  comportamentosInaceitaveis?: string;
  lideranca?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type FlowQuestion = {
  field: FitCulturalField;
  question: string;
};

const FLOW: FlowQuestion[] = [
  { field: "objetivo", question: "Gostaria de atualizar ou criar o fit cultural da sua empresa?" },
  { field: "culturaAtual", question: "Como você descreveria a cultura atual da sua organização?" },
  { field: "valoresDecisoes", question: "Quais são os três principais valores que guiam as decisões na empresa?" },
  { field: "discrepancia", question: "Existe alguma discrepância entre a cultura declarada e a praticada? Se sim, qual?" },
  { field: "comportamentosRecompensados", question: "Quais comportamentos são recompensados na sua organização?" },
  { field: "evolucaoDesejada", question: "Como você gostaria que a cultura evoluísse nos próximos anos?" },
  { field: "diferenciaisCulturais", question: "O que diferencia sua empresa dos concorrentes em termos culturais?" },
  { field: "proposito", question: "Qual é o propósito fundamental da sua organização?" },
  { field: "sucesso", question: "Como você definiria sucesso para sua empresa além dos resultados financeiros?" },
  { field: "comportamentosInaceitaveis", question: "Quais comportamentos são inaceitáveis na sua cultura?" },
  { field: "lideranca", question: "Como a liderança exemplifica os valores da empresa?" },
];

function normalizeText(value: string) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function cleanToken(token: string) {
  return token.replace(/[^a-zA-ZÀ-ÿ0-9-]/g, "");
}

function hasVowel(token: string) {
  return /[aeiouáàâãéêíóôõúü]/i.test(token);
}

function isAllowedShortAnswer(token: string) {
  const normalized = token.toLowerCase();
  return [
    "ok",
    "sim",
    "não",
    "nao",
    "criar",
    "atualizar",
    "revisar",
    "ajustar",
  ].includes(normalized);
}

function looksLikeNoise(token: string) {
  const clean = cleanToken(token).toLowerCase();

  if (!clean) return true;
  if (clean.length <= 2) return true;
  if (!hasVowel(clean)) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(clean)) return true;
  if (/^(.)\1{2,}$/.test(clean)) return true;

  return false;
}

function looksComprehensibleWord(token: string) {
  const clean = cleanToken(token);

  if (!clean) return false;
  if (isAllowedShortAnswer(clean)) return true;
  if (looksLikeNoise(clean)) return false;
  if (clean.length < 4) return false;
  if (!hasVowel(clean)) return false;

  return true;
}

function countComprehensibleWords(value: string) {
  const tokens = normalizeText(value)
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean);

  return tokens.filter(looksComprehensibleWord).length;
}

function looksStructuredAnswer(value: string) {
  const text = normalizeText(value);
  return /[,;\n]/.test(text) || /\d+\./.test(text) || / e /i.test(text);
}

function validateAnswer(field: FitCulturalField, value: string) {
  const text = normalizeText(value);

  if (!text) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
  }

  if (field === "objetivo") {
    const token = cleanToken(text);
    if (!isAllowedShortAnswer(token)) {
      return "Não consegui entender sua resposta com segurança. Responda de forma clara, por exemplo: criar ou atualizar.";
    }
    return null;
  }

  const comprehensibleWords = countComprehensibleWords(text);

  if (comprehensibleWords === 0) {
    return "Não consegui entender sua resposta com segurança. Pode escrever novamente de forma mais clara?";
  }

  if (comprehensibleWords < 2 && !looksStructuredAnswer(text)) {
    return "Não consegui entender sua resposta com segurança. Pode escrever novamente de forma mais clara?";
  }

  return null;
}

export function initializeFitCulturalSession(): FitCulturalSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export function getNextFitCulturalQuestion(
  session: FitCulturalSession
): FlowQuestion | null {
  for (const item of FLOW) {
    const value = session[item.field];
    if (!value || !value.trim()) {
      return item;
    }
  }
  return null;
}

export function updateFitCulturalSession(
  session: FitCulturalSession,
  field: FitCulturalField,
  value: string
): FitCulturalSession {
  return {
    ...session,
    [field]: normalizeText(value),
  };
}

export function isFitCulturalReady(session: FitCulturalSession): boolean {
  return getNextFitCulturalQuestion(session) === null;
}

export function runFitCulturalStep(
  session: FitCulturalSession,
  answer?: string,
  currentField?: FitCulturalField | string
) {
  if (!currentField) {
    const next = getNextFitCulturalQuestion(session);
    return {
      session,
      completed: false,
      currentField: next?.field ?? null,
      nextField: next?.field ?? null,
      question: next?.question ?? null,
      reply: next?.question ?? null,
    };
  }

  const raw = normalizeText(answer ?? "");
  const error = validateAnswer(currentField as FitCulturalField, raw);

  if (error) {
    const current = FLOW.find((item) => item.field === currentField);
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: current?.question ?? null,
      reply: error,
    };
  }

  const updated = updateFitCulturalSession(
    session,
    currentField as FitCulturalField,
    raw
  );

  const next = getNextFitCulturalQuestion(updated);
  const completed = isFitCulturalReady(updated);

  return {
    session: {
      ...updated,
      status: completed ? "completed" : "in_progress",
      reportStatus: completed ? "generated" : "pending",
    },
    completed,
    currentField: next?.field ?? null,
    nextField: next?.field ?? null,
    question: next?.question ?? null,
    reply: completed ? null : next?.question ?? null,
  };
}
