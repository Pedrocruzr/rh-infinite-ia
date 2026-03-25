export type AnalistaDiagnosticoSixBoxField = "uploadArquivos";

export type AnalistaDiagnosticoSixBoxSession = {
  materialBruto?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
  reportMarkdown?: string | null;
};

export function initializeAnalistaDiagnosticoSixBoxSession(): AnalistaDiagnosticoSixBoxSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
    reportMarkdown: null,
  };
}

function normalize(text: unknown) {
  return String(text ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isMeaningfulQuestionnaireMaterial(value: string): boolean {
  const text = normalize(value);
  if (!text) return false;

  const lower = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const blockedExact = [
    "oreag", "ers", "ds", "asd", "asdf", "qwe", "wef", "zzz", "kkk", "lll",
    "erer", "sdf", "dfg", "hjk", "xaa", "abc", "ihe", "ewrg", "regtg"
  ];
  if (blockedExact.includes(lower)) return false;

  if (text.length < 40) return false;

  const words = text.match(/[a-zA-ZÀ-ÿ]{3,}/g) ?? [];
  if (words.length < 8) return false;

  const lines = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const meaningfulLines = lines.filter((s) => s.length >= 8);
  if (meaningfulLines.length < 3) return false;

  const hasNumbers = /\d/.test(text);
  const hasStructuredHint =
    /\b(propósito|proposito|estrutura|relacionamento|recompensa|liderança|lideranca|mecanismo|apoio|responsabilidade|bloco|item|média|media|nota|área|area|pergunta|resultado|questionário|questionario)\b/i.test(text) ||
    /[:;%|\t]/.test(text);

  if (!hasNumbers && !hasStructuredHint) return false;

  return true;
}

export function getAnalistaDiagnosticoSixBoxInitialMessage() {
  return `Por favor, compartilhe as planilhas Excel/PDF/DOC preenchidas para análise.

Assim que você enviar, eu vou:

Processar automaticamente os dados;
Consolidar as informações;
Identificar os pontos críticos (abaixo de 6,0);

Fico no aguardo das informações.`;
}

export function runAnalistaDiagnosticoSixBoxStep(
  session: AnalistaDiagnosticoSixBoxSession,
  answer?: string,
  currentField?: AnalistaDiagnosticoSixBoxField | string | null
) {
  const current = currentField ?? "start";
  const text = normalize(answer);

  if (current === "start") {
    return {
      session,
      currentField: "uploadArquivos" as const,
      nextField: "uploadArquivos" as const,
      completed: false,
      finished: false,
      reply: getAnalistaDiagnosticoSixBoxInitialMessage(),
    };
  }

  if (current === "uploadArquivos") {
    if (!text) {
      return {
        session,
        currentField: "uploadArquivos" as const,
        nextField: "uploadArquivos" as const,
        completed: false,
        finished: false,
        reply: getAnalistaDiagnosticoSixBoxInitialMessage(),
      };
    }

    if (!isMeaningfulQuestionnaireMaterial(text)) {
      return {
        session,
        currentField: "uploadArquivos" as const,
        nextField: "uploadArquivos" as const,
        completed: false,
        finished: false,
        reply: "Não consegui compreender esse conteúdo como material válido (planilha, doc ou pdf) com as informações das respostas do questionário. Pode revisar e enviar novamente as informações completas, com frases ou dados legíveis?",
      };
    }

    const finalSession: AnalistaDiagnosticoSixBoxSession = {
      ...session,
      materialBruto: text,
      status: "completed",
      reportStatus: "generated",
    };

    return {
      session: finalSession,
      currentField: null,
      nextField: null,
      completed: true,
      finished: true,
      reply: "",
    };
  }

  return {
    session,
    currentField: "uploadArquivos" as const,
    nextField: "uploadArquivos" as const,
    completed: false,
    finished: false,
    reply: getAnalistaDiagnosticoSixBoxInitialMessage(),
  };
}
