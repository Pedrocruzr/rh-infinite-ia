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

export function getAnalistaDiagnosticoSixBoxInitialMessage() {
  return `Agora vamos para a primeira pergunta. Quero que seja assim:

Por favor, compartilhe as planilhas Excel/PDF/DOC preenchidas para análise.

Assim que você enviar, eu vou:

Processar automaticamente os dados;

Consolidar as informações;

Identificar os pontos críticos (abaixo de 6,0);

Gerar um relatório completo com gráficos e mapa de calor;

Entregar tudo pronto para download imediato.

Fico no aguardo das informações. 📊`;
}

export function runAnalistaDiagnosticoSixBoxStep(
  session: AnalistaDiagnosticoSixBoxSession,
  answer?: string,
  currentField?: AnalistaDiagnosticoSixBoxField | string | null
) {
  const current = currentField ?? "start";
  const text = String(answer ?? "").trim();

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
