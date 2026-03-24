export type PdiField =
  | "colaboradorNome"
  | "cargoAtual"
  | "competenciasFortes"
  | "competenciasDesenvolver"
  | "cargoDesejado"
  | "prazoEstimado";

export type PdiSession = {
  assessmentId?: string;
  colaboradorNome?: string;
  cargoAtual?: string;
  competenciasFortes?: string;
  competenciasDesenvolver?: string;
  cargoDesejado?: string;
  prazoEstimado?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

function hasVowel(token: string) {
  return /[aeiouáàâãéêíóôõúü]/i.test(token);
}

function isComprehensible(value: string) {
  const text = String(value ?? "").trim();
  if (!text) return false;

  const tokens = text
    .split(/\s+/)
    .map((t) => t.replace(/[^a-zA-ZÀ-ÿ0-9-]/g, ""))
    .filter(Boolean);

  if (tokens.length === 0) return false;

  const validTokens = tokens.filter((token) => {
    if (token.length <= 2) return true;
    if (/\d/.test(token)) return true;
    return hasVowel(token);
  });

  return validTokens.length / tokens.length >= 0.6;
}

function question(field: PdiField) {
  switch (field) {
    case "colaboradorNome":
      return "Qual é o nome do colaborador para quem estamos criando o PDI?";
    case "cargoAtual":
      return "Perfeito!\n\nPergunta 2:\nQual é o cargo atual deste colaborador?";
    case "competenciasFortes":
      return "Ótimo!\n\nPergunta 3:\nQuais são as 3 a 5 competências fortes identificadas neste colaborador?";
    case "competenciasDesenvolver":
      return "Perfeito, já temos boas competências mapeadas!\n\nPergunta 4:\nQuais são as 2 a 3 competências que precisam ser desenvolvidas?";
    case "cargoDesejado":
      return "Perfeito, estamos avançando bem!\n\nPergunta 5:\nQual é o cargo desejado/almejado por este colaborador?";
    case "prazoEstimado":
      return "Excelente, já temos um direcionamento claro de crescimento!\n\nPergunta 6:\nQual é o prazo estimado para este plano de desenvolvimento?";
    default:
      return "";
  }
}

function nextField(field: PdiField): PdiField | null {
  const order: PdiField[] = [
    "colaboradorNome",
    "cargoAtual",
    "competenciasFortes",
    "competenciasDesenvolver",
    "cargoDesejado",
    "prazoEstimado",
  ];
  const idx = order.indexOf(field);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}

function validate(field: PdiField, value: string) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
  }

  if (!isComprehensible(text)) {
    return "Não consegui entender sua resposta com segurança. Pode escrever novamente de forma mais clara?";
  }

  if ((field === "colaboradorNome" || field === "cargoAtual" || field === "cargoDesejado") && text.length < 3) {
    return "Preciso dessa resposta com um pouco mais de clareza. Pode escrever novamente?";
  }

  return null;
}

export function initializePdiSession(): PdiSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export function runPdiStep(
  session: PdiSession,
  answer?: string,
  currentField?: PdiField
) {
  if (!currentField) {
    const firstField: PdiField = "colaboradorNome";
    const q = question(firstField);
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
      question: question(currentField),
      reply: error,
    };
  }

  const updated: PdiSession = {
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

  const q = question(next);

  return {
    session: updated,
    completed: false,
    currentField: next,
    nextField: next,
    question: q,
    reply: q,
  };
}
