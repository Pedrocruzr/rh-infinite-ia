export type OnboardingField =
  | "quantidadeColaboradores"
  | "nivelHierarquico"
  | "departamentos"
  | "missaoEmpresa"
  | "visaoEmpresa"
  | "valoresEmpresa"
  | "temasDepartamentos"
  | "facilitadoresDisponiveis"
  | "sistemasApresentados"
  | "tempoIntegracao"
  | "documentosBase";

export type OnboardingSession = {
  assessmentId?: string;
  quantidadeColaboradores?: string;
  nivelHierarquico?: string;
  departamentos?: string;
  missaoEmpresa?: string;
  visaoEmpresa?: string;
  valoresEmpresa?: string;
  temasDepartamentos?: string;
  facilitadoresDisponiveis?: string;
  sistemasApresentados?: string;
  tempoIntegracao?: string;
  documentosBase?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

function hasVowel(token: string) {
  return /[aeiouáàâãéêíóôõúü]/i.test(token);
}

function isComprehensible(value: string) {
  const text = String(value ?? "").trim();
  if (!text) return false;

  // Split by whitespace, comma, semicolon, slash or newline
  const tokens = text
    .split(/[\s,;\n\/\-]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) return false;

  const validTokens = tokens.filter((token) => {
    if (token.length <= 2) return true;
    if (/\d/.test(token)) return true;
    return hasVowel(token) || /[\p{L}]/u.test(token);
  });

  return validTokens.length / tokens.length >= 0.5;
}

function normalizeText(value: string) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function isSystemLike(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return false;

  const items = raw
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) return false;

  const knownShort = [
    "crm", "erp", "sap", "totvs", "rm", "tss", "wms", "tms", "bi",
    "bpm", "hrm", "cms", "oms", "pms", "protheus", "nenhum", "nao", "não"
  ];

  return items.every((item) => {
    const lower = item.toLowerCase();
    if (knownShort.includes(lower)) return true;
    if (/^[a-z0-9]{2,12}$/i.test(item)) return true;
    if (item.length >= 2) return true;
    return false;
  });
}

function getQuestion(field: OnboardingField, session?: OnboardingSession): string {
  switch (field) {
    case "quantidadeColaboradores":
      return "Quantos novos colaboradores participarão da integração?";
    case "nivelHierarquico":
      return "Qual é o nível hierárquico desses colaboradores? (Operacional, Técnico ou Gestão)";
    case "departamentos":
      return "Quais departamentos estarão envolvidos nessa integração?";
    case "missaoEmpresa":
      return "Qual é a missão da empresa?";
    case "visaoEmpresa":
      return "Qual é a visão da empresa?";
    case "valoresEmpresa":
      return "Quais são os valores da empresa?";
    case "temasDepartamentos": {
      const deps = session?.departamentos?.trim();
      return deps
        ? `Quais temas específicos você quer abordar em ${deps}?`
        : "Quais temas específicos devem ser abordados em cada departamento?";
    }
    case "facilitadoresDisponiveis":
      return "Quais facilitadores estarão disponíveis para conduzir a integração?";
    case "sistemasApresentados":
      return "Quais sistemas devem ser apresentados nessa integração?";
    case "tempoIntegracao":
      return "Quanto tempo você tem disponível para essa integração? Informe sempre o tempo + período. Exemplos:\n\n3 horas de manhã\n2 horas à tarde\n3 horas de manhã e 2 horas à tarde\n6 horas (3h de manhã e 3h à tarde)";
    case "documentosBase":
      return "Quais documentos você quer utilizar nessa integração? Você pode escolher, por exemplo:\n\nCódigo de Conduta\nManual de Atendimento\nManual de Vendas\nGuia Rápido de Sistemas\nFluxogramas de Processos\n\nOu qualquer outro material. Coloque abaixo o nome do documento.";
    default:
      return "";
  }
}

function validate(field: OnboardingField, value: string) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
  }

  if (field === "quantidadeColaboradores") {
    const textClean = text.toLowerCase();
    const hasDigit = /\d+/.test(textClean);
    const numberWords = [
      "um", "uma", "dois", "duas", "tres", "três", "quatro", "cinco",
      "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze",
      "quatorze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito",
      "dezenove", "vinte", "trinta", "quarenta", "cinquenta", "cem"
    ];
    const hasWordNumber = numberWords.some((w) => new RegExp(`\\b${w}\\b`, "i").test(textClean));

    if (hasDigit || hasWordNumber || textClean.length >= 1) {
      return null;
    }
    return "Informe a quantidade de colaboradores (exemplo: 10, dez, 10 colaboradores).";
  }

  if (field === "tempoIntegracao") {
    const lower = text.toLowerCase();
    const hasNumber = /\d+/.test(lower);
    const hasMorning = /manhã|manha/.test(lower);
    const hasAfternoon = /tarde/.test(lower);
    const hasHours = /hora|h\b/.test(lower);

    if (!hasNumber && !hasHours) {
      return "Informe sempre o tempo + período. Exemplos: 3 horas de manhã, 2 horas à tarde, 3 horas de manhã e 2 horas à tarde.";
    }

    return null;
  }

  if (field === "sistemasApresentados") {
    if (!isSystemLike(text)) {
      return "Informe o nome dos sistemas que devem ser apresentados (ou 'Nenhum'). Exemplo: CRM, TOTVS, ERP, SAP.";
    }
    return null;
  }

  if (!isComprehensible(text)) {
    return "Não consegui entender sua resposta com segurança. Pode escrever novamente de forma mais clara?";
  }

  return null;
}

function nextField(field: OnboardingField): OnboardingField | null {
  const order: OnboardingField[] = [
    "quantidadeColaboradores",
    "nivelHierarquico",
    "departamentos",
    "missaoEmpresa",
    "visaoEmpresa",
    "valoresEmpresa",
    "temasDepartamentos",
    "facilitadoresDisponiveis",
    "sistemasApresentados",
    "tempoIntegracao",
    "documentosBase",
  ];
  const idx = order.indexOf(field);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}

export function initializeOnboardingSession(): OnboardingSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export function runOnboardingStep(
  session: OnboardingSession,
  answer?: string,
  currentField?: OnboardingField
) {
  if (!currentField) {
    const firstField: OnboardingField = "quantidadeColaboradores";
    const q = getQuestion(firstField, session);
    return {
      session,
      completed: false,
      currentField: firstField,
      nextField: firstField,
      question: q,
      reply: q,
    };
  }

  const raw = String(answer ?? "").trim();
  const error = validate(currentField, raw);

  if (error) {
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: getQuestion(currentField, session),
      reply: error,
    };
  }

  const updated: OnboardingSession = {
    ...session,
    [currentField]: raw,
  };

  const next = nextField(currentField);

  if (!next) {
    updated.status = "completed";
    updated.reportStatus = "generated";

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null,
    };
  }

  const q = getQuestion(next, updated);

  return {
    session: updated,
    completed: false,
    currentField: next,
    nextField: next,
    question: q,
    reply: q,
  };
}
