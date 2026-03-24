export type ClimaPath =
  | "montar_questionario"
  | "adaptar_questionario"
  | "analisar_resultados"
  | "interpretar_dimensoes"
  | "relatorio_executivo"
  | "plano_acao";

export type ClimaField =
  | "intencao"
  | "objetivoMontagem"
  | "publicoMontagem"
  | "dimensoesMontagem"
  | "observacoesMontagem"
  | "questionarioUsuario"
  | "materialAnalise"
  | "dimensoesInterpretacao"
  | "materialInterpretacao"
  | "materialRelatorioExecutivo"
  | "materialPlanoAcao";

export type ClimaSession = {
  assessmentId?: string;
  caminho?: ClimaPath;
  intencao?: string;

  objetivoMontagem?: string;
  publicoMontagem?: string;
  dimensoesMontagem?: string;
  observacoesMontagem?: string;

  questionarioUsuario?: string;

  materialAnalise?: string;

  dimensoesInterpretacao?: string;
  materialInterpretacao?: string;

  materialRelatorioExecutivo?: string;

  materialPlanoAcao?: string;

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
    .map((t) => t.replace(/[^a-zA-ZÀ-ÿ0-9\-\/]/g, ""))
    .filter(Boolean);

  if (tokens.length === 0) return false;

  const validTokens = tokens.filter((token) => {
    if (token.length <= 2) return true;
    if (/\d/.test(token)) return true;
    return hasVowel(token);
  });

  return validTokens.length / tokens.length >= 0.6;
}

function detectPath(value: string): ClimaPath | null {
  const text = String(value ?? "").trim().toLowerCase();

  if (/adapt/.test(text) && /question[aá]rio|questionario/.test(text)) {
    return "adaptar_questionario";
  }

  if (/montar|criar|elaborar|fazer/.test(text) && /question[aá]rio|questionario/.test(text)) {
    return "montar_questionario";
  }

  if (/analis/.test(text) && /resultado|pesquisa|dados|respostas/.test(text)) {
    return "analisar_resultados";
  }

  if (/interpret/.test(text) && /lideran|comunica|reconhec|motiva|ambiente|dimens/.test(text)) {
    return "interpretar_dimensoes";
  }

  if (/relat[oó]rio executivo|relatorio executivo|executivo/.test(text)) {
    return "relatorio_executivo";
  }

  if (/plano de a[cç][aã]o|plano de acao|a[cç][aã]o a partir dos achados|acao a partir dos achados/.test(text)) {
    return "plano_acao";
  }

  return null;
}

function question(field: ClimaField) {
  switch (field) {
    case "intencao":
      return `Qual é o principal objetivo desta pesquisa de clima organizacional?

Posso te ajudar com um destes caminhos:

- montar ou adaptar um questionário de clima organizacional;
- analisar resultados de uma pesquisa;
- interpretar dimensões como liderança, comunicação, reconhecimento, motivação e ambiente;
- estruturar um relatório executivo com recomendações;
- sugerir plano de ação a partir dos achados.

Me diga o que você quer fazer agora.`;

    case "objetivoMontagem":
      return "Qual é o objetivo principal da pesquisa de clima que você quer montar?";
    case "publicoMontagem":
      return "Quem responderá a pesquisa? Ex.: todos os colaboradores, uma área específica, liderança, operação.";
    case "dimensoesMontagem":
      return "Quais dimensões você quer priorizar no questionário? Ex.: liderança, comunicação, reconhecimento, motivação, ambiente, trabalho em equipe, desenvolvimento.";
    case "observacoesMontagem":
      return "Existe alguma observação adicional importante para personalizar o questionário? Se não houver, responda: não.";

    case "questionarioUsuario":
      return `Perfeito. Envie o questionário atual aqui, ou cole as perguntas, que eu adapto para você.

Se preferir, posso adaptar em qualquer um destes formatos:

- mais simples e direto
- mais profissional
- mais curto
- por dimensões de clima

Cole o questionário e, se quiser, já indique o formato desejado no mesmo texto.`;

    case "materialAnalise":
      return "Perfeito. Envie o que você tiver dos resultados da pesquisa de clima: médias, percentuais, respostas, prints, planilha, resumo ou qualquer material disponível. Vou analisar com base no que você enviar.";

    case "dimensoesInterpretacao":
      return "Quais dimensões você quer interpretar? Ex.: liderança, comunicação, reconhecimento, motivação e ambiente.";
    case "materialInterpretacao":
      return "Agora envie o que você tiver dos resultados da pesquisa relacionados a essas dimensões. Vou interpretar com base no material enviado.";

    case "materialRelatorioExecutivo":
      return "Perfeito. Envie o que você tiver dos resultados da pesquisa de clima e eu vou estruturar um relatório executivo com recomendações.";

    case "materialPlanoAcao":
      return "Perfeito. Envie os resultados e materiais dos caminhos anteriores para eu montar um plano de ação a partir dos achados.";

    default:
      return "";
  }
}

function validate(field: ClimaField, value: string) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode escrever de forma mais clara?";
  }

  if (field === "intencao") {
    if (!detectPath(text)) {
      return "Não consegui identificar o caminho desejado. Responda informando se você quer montar questionário, adaptar questionário, analisar resultados, interpretar dimensões, estruturar relatório executivo ou sugerir plano de ação.";
    }
    return null;
  }

  if (
    field === "questionarioUsuario" ||
    field === "materialAnalise" ||
    field === "materialInterpretacao" ||
    field === "materialRelatorioExecutivo" ||
    field === "materialPlanoAcao"
  ) {
    if (text.split(/\s+/).length < 8) {
      return "Envie mais conteúdo para eu trabalhar com segurança. Pode colar perguntas, resultados, resumos ou o material que você tiver.";
    }
    return null;
  }

  if (!isComprehensible(text)) {
    return "Não consegui entender sua resposta com segurança. Pode escrever novamente de forma mais clara?";
  }

  return null;
}

function nextFieldForMontagem(field: ClimaField): ClimaField | null {
  const order: ClimaField[] = [
    "objetivoMontagem",
    "publicoMontagem",
    "dimensoesMontagem",
    "observacoesMontagem",
  ];
  const idx = order.indexOf(field);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}

export function initializeClimaSession(): ClimaSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export function runClimaStep(
  session: ClimaSession,
  answer?: string,
  currentField?: ClimaField
) {
  if (!currentField) {
    const firstField: ClimaField = "intencao";
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

  if (currentField === "intencao") {
    const caminho = detectPath(raw);

    if (!caminho) {
      return {
        session,
        completed: false,
        currentField,
        nextField: currentField,
        question: question(currentField),
        reply: "Não consegui identificar o caminho desejado.",
      };
    }

    const updated: ClimaSession = {
      ...session,
      intencao: raw,
      caminho,
    };

    let next: ClimaField;

    switch (caminho) {
      case "montar_questionario":
        next = "objetivoMontagem";
        break;
      case "adaptar_questionario":
        next = "questionarioUsuario";
        break;
      case "analisar_resultados":
        next = "materialAnalise";
        break;
      case "interpretar_dimensoes":
        next = "dimensoesInterpretacao";
        break;
      case "relatorio_executivo":
        next = "materialRelatorioExecutivo";
        break;
      case "plano_acao":
        next = "materialPlanoAcao";
        break;
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

  if (session.caminho === "montar_questionario") {
    const updated: ClimaSession = {
      ...session,
      [currentField]: raw,
    };

    const next = nextFieldForMontagem(currentField);

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

  if (session.caminho === "adaptar_questionario" && currentField === "questionarioUsuario") {
    const updated: ClimaSession = {
      ...session,
      questionarioUsuario: raw,
      status: "completed",
      reportStatus: "generated",
    };

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null,
    };
  }

  if (session.caminho === "analisar_resultados" && currentField === "materialAnalise") {
    const updated: ClimaSession = {
      ...session,
      materialAnalise: raw,
      status: "completed",
      reportStatus: "generated",
    };

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null,
    };
  }

  if (session.caminho === "interpretar_dimensoes") {
    if (currentField === "dimensoesInterpretacao") {
      const updated: ClimaSession = {
        ...session,
        dimensoesInterpretacao: raw,
      };

      const next: ClimaField = "materialInterpretacao";
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

    if (currentField === "materialInterpretacao") {
      const updated: ClimaSession = {
        ...session,
        materialInterpretacao: raw,
        status: "completed",
        reportStatus: "generated",
      };

      return {
        session: updated,
        completed: true,
        currentField: null,
        nextField: null,
        question: null,
        reply: null,
      };
    }
  }

  if (session.caminho === "relatorio_executivo" && currentField === "materialRelatorioExecutivo") {
    const updated: ClimaSession = {
      ...session,
      materialRelatorioExecutivo: raw,
      status: "completed",
      reportStatus: "generated",
    };

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null,
    };
  }

  if (session.caminho === "plano_acao" && currentField === "materialPlanoAcao") {
    const updated: ClimaSession = {
      ...session,
      materialPlanoAcao: raw,
      status: "completed",
      reportStatus: "generated",
    };

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null,
    };
  }

  const updated: ClimaSession = {
    ...session,
    [currentField]: raw,
    status: "completed",
    reportStatus: "generated",
  };

  return {
    session: updated,
    completed: true,
    currentField: null,
    nextField: null,
    question: null,
    reply: null,
  };
}
