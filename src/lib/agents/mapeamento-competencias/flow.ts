export type MapeamentoField =
  | "cargo"
  | "atividades"
  | "conhecimentos"
  | "habilidades"
  | "competenciasPorAtividade"
  | "gruposSimilaridade"
  | "competenciasOrganizacionais";

export type MapeamentoSession = {
  assessmentId?: string;
  cargo?: string;
  atividades?: string;
  conhecimentos?: string;
  habilidades?: string;
  competenciasPorAtividade?: string;
  gruposSimilaridade?: string;
  competenciasOrganizacionais?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type FlowQuestion = {
  field: MapeamentoField;
  question: string;
};

const FLOW_ORDER: MapeamentoField[] = [
  "cargo",
  "atividades",
  "conhecimentos",
  "habilidades",
  "competenciasPorAtividade",
  "gruposSimilaridade",
  "competenciasOrganizacionais",
];

function summarize(value?: string, max = 220) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "...";
}

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

function looksStructuredList(value: string) {
  return /[\n,;•\-]/.test(value) || /\d+\./.test(value) || /atividade\s*\d+\s*:/i.test(value);
}

function isValidationLike(value: string) {
  const text = String(value ?? "").trim().toLowerCase();
  return (
    text === "ok" ||
    text === "sim" ||
    text === "validado" ||
    text === "pode seguir" ||
    text.includes("atividade 1") ||
    text.includes("eficiência") ||
    text.includes("comunicação") ||
    text.includes("organiz")
  );
}

function normalizeItem(value: string) {
  let text = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function splitActivities(text?: string) {
  return String(text ?? "")
    .split(/\n+/)
    .map((item) => item.replace(/^\d+[\).\-\s]*/, "").trim())
    .filter(Boolean)
    .map(normalizeItem);
}

function splitList(text?: string) {
  return String(text ?? "")
    .split(/\n|;|,/)
    .map((item) => item.replace(/^\d+[\).\-\s]*/, "").trim())
    .filter(Boolean)
    .map(normalizeItem);
}

function unique(items: string[]) {
  return [...new Set(items)];
}

function detectCompetenciasFromActivity(activity: string, conhecimentos: string[], habilidades: string[], orgs: string[]) {
  const lower = activity.toLowerCase();
  const result: string[] = [];

  if (/atendimento|ligaç|ligac|e-mail|email|visitante|informação|informacao|comunica/.test(lower)) {
    result.push("Clareza", "Comunicação", "Escuta", "Responsabilidade");
  }

  if (/relat|planilha|document|contrato|correspond/.test(lower)) {
    result.push("Análise crítica", "Planejamento", "Clareza", "Organização");
  }

  if (/agenda|reuni|viagem|material|almox|compra|organiza/.test(lower)) {
    result.push("Organização", "Disciplina", "Foco em resultados", "Controle");
  }

  if (/arquivo|controle|cadastro|processo/.test(lower)) {
    result.push("Organização", "Atenção", "Disciplina", "Responsabilidade");
  }

  const baseText = [...conhecimentos, ...habilidades, ...orgs].join(" ").toLowerCase();

  if (/excel|planilha|office|word|document/.test(baseText)) {
    result.push("Organização", "Atenção");
  }

  if (/comunicação|comunicacao|redação|redacao|atendimento/.test(baseText)) {
    result.push("Clareza", "Comunicação");
  }

  if (/controle|financeiro|gestão|gestao|rotinas/.test(baseText)) {
    result.push("Responsabilidade", "Planejamento", "Foco em resultados");
  }

  if (result.length === 0) {
    result.push("Organização", "Responsabilidade", "Planejamento");
  }

  return unique(result);
}

function detectGroup(competencia: string, conhecimentos: string[], habilidades: string[], orgs: string[]) {
  const lower = competencia.toLowerCase();
  const baseText = [...conhecimentos, ...habilidades, ...orgs].join(" ").toLowerCase();

  if (
    /agilidade|atenção|atencao|responsabilidade|disciplina|foco|planejamento|execução|execucao|produtividade|eficiência|eficiencia|controle/.test(lower)
  ) {
    return "Eficiência";
  }

  if (
    /comunicação|comunicacao|clareza|escuta|negociação|negociacao|relacionamento|interação|interacao/.test(lower)
  ) {
    return "Comunicação";
  }

  if (
    /análise|analise|crítica|critica|organização|organizacao|método|metodo|padronização|padronizacao/.test(lower)
  ) {
    return "Organização";
  }

  if (/comunicação|comunicacao|redação|redacao|atendimento/.test(baseText)) {
    return "Comunicação";
  }

  if (/excel|planilha|controle|rotinas|processo|gestão|gestao/.test(baseText)) {
    return "Eficiência";
  }

  return "Organização";
}

function buildSuggestedCompetencias(session: MapeamentoSession) {
  const atividades = splitActivities(session.atividades);
  const conhecimentos = splitList(session.conhecimentos);
  const habilidades = splitList(session.habilidades);
  const orgs = splitList(session.competenciasOrganizacionais);

  if (atividades.length === 0) return "";

  return atividades
    .map((atividade, index) => {
      const comps = detectCompetenciasFromActivity(
        atividade,
        conhecimentos,
        habilidades,
        orgs
      );
      return `Atividade ${index + 1}\nCompetências sugeridas: ${comps.join(", ")}`;
    })
    .join("\n\n");
}

function buildSuggestedGroups(session: MapeamentoSession) {
  const atividades = splitActivities(session.atividades);
  const conhecimentos = splitList(session.conhecimentos);
  const habilidades = splitList(session.habilidades);
  const orgs = splitList(session.competenciasOrganizacionais);

  const grouped: Record<string, string[]> = {};

  for (const atividade of atividades) {
    const comps = detectCompetenciasFromActivity(
      atividade,
      conhecimentos,
      habilidades,
      orgs
    );

    for (const comp of comps) {
      const group = detectGroup(comp, conhecimentos, habilidades, orgs);
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(comp);
    }
  }

  const entries = Object.entries(grouped).map(([grupo, comps]) => ({
    grupo,
    competencias: unique(comps),
  }));

  if (entries.length === 0) return "";

  return entries
    .map((entry) => `${entry.grupo}: ${entry.competencias.join(", ")}`)
    .join("\n");
}

function validateField(field: MapeamentoField, value: string) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
  }

  if (!isComprehensible(text)) {
    return "Não consegui entender sua resposta com segurança. Pode escrever novamente de forma um pouco mais clara?";
  }

  if (field === "cargo" && text.length < 4) {
    return "Preciso do nome do cargo com um pouco mais de clareza. Pode informar novamente?";
  }

  if (field === "atividades" && !looksStructuredList(text)) {
    return "Para preencher corretamente o relatório, preciso das atividades em lista. Pode informar uma por linha ou separadas por vírgula?";
  }

  if (
    (field === "conhecimentos" ||
      field === "habilidades" ||
      field === "competenciasOrganizacionais") &&
    !looksStructuredList(text)
  ) {
    return "Para registrar corretamente, preciso que você informe em formato de lista. Pode separar por vírgula, ponto e vírgula ou uma por linha?";
  }

  if (
    (field === "competenciasPorAtividade" || field === "gruposSimilaridade") &&
    !isValidationLike(text)
  ) {
    return "Nesta etapa, preciso que você valide a sugestão com 'ok' ou me envie o ajuste final de forma clara.";
  }

  return null;
}

function buildQuestion(session: MapeamentoSession, field: MapeamentoField): string {
  switch (field) {
    case "cargo":
      return "Qual é o cargo que você deseja mapear?";

    case "atividades":
      return `Perfeito. Registrei o cargo: ${session.cargo ?? "Não informado"}.

Agora liste as principais atividades desse cargo, de preferência uma por linha.`;

    case "conhecimentos":
      return `Ótimo. Registrei as atividades principais do cargo: ${summarize(session.atividades)}

Agora informe os conhecimentos técnicos do cargo, na lógica Saber. Pode separar por vírgula, ponto e vírgula ou uma por linha.`;

    case "habilidades":
      return `Perfeito. Registrei os conhecimentos técnicos: ${summarize(session.conhecimentos)}

Agora informe as habilidades técnicas do cargo, na lógica Saber fazer. Pode separar por vírgula, ponto e vírgula ou uma por linha.`;

    case "competenciasPorAtividade":
      return `Ótimo. Registrei as habilidades técnicas: ${summarize(session.habilidades)}

Agora o agente vai usar tudo o que já foi respondido até aqui para sugerir as competências comportamentais por atividade com base na lógica da base de conhecimento.

Atividades registradas:
${session.atividades ?? "Não informado"}

Sugestão do agente:
${buildSuggestedCompetencias(session)}

Nesta etapa, competências comportamentais são associadas às atividades do cargo para mostrar quais atitudes sustentam a execução prática de cada entrega.

Sua função nesta etapa é:
- responder "ok" se concordar com a sugestão do agente
- ou enviar sua versão final, caso queira alterar a associação

Se o seu ajuste divergir da lógica esperada pela base de conhecimento, o agente deve sinalizar isso, mas a decisão final continua sendo sua.`;

    case "gruposSimilaridade":
      return `Perfeito. Registrei a validação das competências comportamentais por atividade: ${summarize(session.competenciasPorAtividade, 260)}

Agora o agente vai usar tudo o que já foi respondido até aqui para sugerir os grupos de similaridade com base na lógica da base de conhecimento.

Grupos de similaridade são conjuntos de competências com significados próximos, consolidados para facilitar a leitura estratégica do mapeamento e reduzir duplicidades semânticas.

Sugestão do agente:
${buildSuggestedGroups(session)}

Sua função nesta etapa é:
- responder "ok" se concordar com a sugestão do agente
- ou enviar sua versão final dos grupos, caso queira alterar

Se o seu ajuste divergir da lógica esperada pela base de conhecimento, o agente deve sinalizar isso, mas a decisão final continua sendo sua.`;

    case "competenciasOrganizacionais":
      return `Ótimo. Registrei a validação dos grupos de similaridade: ${summarize(session.gruposSimilaridade, 260)}

Agora informe as competências organizacionais esperadas para esse cargo no contexto da empresa.

Competências organizacionais representam expectativas gerais da empresa em relação à postura e à forma de atuação dos colaboradores, independentemente da função.

Pode separar por vírgula, ponto e vírgula ou uma por linha.`;

    default:
      return "";
  }
}

export function getNextMapeamentoQuestion(
  session: MapeamentoSession
): FlowQuestion | null {
  for (const field of FLOW_ORDER) {
    const value = session[field];
    if (!value || !value.trim()) {
      return {
        field,
        question: buildQuestion(session, field),
      };
    }
  }

  return null;
}

export function updateMapeamentoSession(
  session: MapeamentoSession,
  field: MapeamentoField,
  value: string
): MapeamentoSession {
  return {
    ...session,
    [field]: value.trim(),
  };
}

export function isMapeamentoReady(session: MapeamentoSession): boolean {
  return getNextMapeamentoQuestion(session) === null;
}

export function initializeMapeamentoSession(): MapeamentoSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export function runMapeamentoStep(
  session: MapeamentoSession,
  answer?: string,
  currentField?: MapeamentoField | string
) {
  if (!currentField) {
    const next = getNextMapeamentoQuestion(session);
    return {
      session,
      completed: false,
      currentField: next?.field ?? null,
      nextField: next?.field ?? null,
      question: next?.question ?? null,
      reply: next?.question ?? null,
    };
  }

  const raw = String(answer ?? "").trim();
  const error = validateField(currentField as MapeamentoField, raw);

  if (error) {
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: buildQuestion(session, currentField as MapeamentoField),
      reply: error,
    };
  }

  const updated = updateMapeamentoSession(
    session,
    currentField as MapeamentoField,
    raw
  );

  const next = getNextMapeamentoQuestion(updated);
  const completed = isMapeamentoReady(updated);

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
