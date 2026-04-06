export type ClosedOption = {
  id: string;
  label: string;
  value: string;
};

export type QuestionKind = "text" | "single_choice";

export type ProfileField =
  | "nome"
  | "vaga"
  | "competenciasPrincipais"
  | "discResposta"
  | "motivacao"
  | "competenciaExemplo1"
  | "competenciaExemplo2"
  | "competenciaExemplo3";

export type ProfileSession = {
  assessmentId?: string;
  nome?: string;
  vaga?: string;
  competenciasPrincipais?: string[];
  discResposta?: string;
  motivacao?: string;
  competenciaExemplo1?: string;
  competenciaExemplo2?: string;
  competenciaExemplo3?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

export type FlowQuestion = {
  field: ProfileField;
  kind: QuestionKind;
  question: string;
  options?: ClosedOption[];
};

export const DISC_OPTIONS: ClosedOption[] = [
  {
    id: "a",
    label: "Assumo a frente rapidamente e tomo decisões com agilidade.",
    value: "dominancia",
  },
  {
    id: "b",
    label: "Procuro conversar, engajar pessoas e manter o clima positivo.",
    value: "influencia",
  },
  {
    id: "c",
    label: "Mantenho a calma, apoio o grupo e busco estabilidade.",
    value: "estabilidade",
  },
  {
    id: "d",
    label: "Analiso detalhes, comparo cenários e evito erros antes de agir.",
    value: "conformidade",
  },
];

export const MOTIVATION_OPTIONS: ClosedOption[] = [
  {
    id: "a",
    label: "Segurança e boas relações no ambiente de trabalho.",
    value: "seguranca",
  },
  {
    id: "b",
    label: "Reconhecimento pelo que entrego.",
    value: "reconhecimento",
  },
  {
    id: "c",
    label: "Crescimento e evolução profissional.",
    value: "crescimento",
  },
  {
    id: "d",
    label: "Autonomia para executar e decidir.",
    value: "autonomia",
  },
];

export function suggestCompetenciasByRole(role: string): string[] {
  const normalized = role.toLowerCase();

  if (normalized.includes("recepcion")) {
    return ["Comunicação", "Organização", "Empatia"];
  }

  if (normalized.includes("vendas")) {
    return ["Comunicação", "Persuasão", "Resiliência"];
  }

  if (normalized.includes("atendimento")) {
    return ["Empatia", "Comunicação", "Resolução de Problemas"];
  }

  if (normalized.includes("administr")) {
    return ["Organização", "Atenção aos Detalhes", "Responsabilidade"];
  }

  return ["Comunicação", "Organização", "Proatividade"];
}

export function buildProfileFlow(session: ProfileSession): FlowQuestion[] {
  const competencias =
    session.competenciasPrincipais && session.competenciasPrincipais.length === 3
      ? session.competenciasPrincipais
      : ["competência 1", "competência 2", "competência 3"];

  return [
    {
      field: "nome",
      kind: "text",
      question: "Qual é o seu nome completo?",
    },
    {
      field: "vaga",
      kind: "text",
      question: "Para qual vaga ou cargo você está aplicando?",
    },
    {
      field: "discResposta",
      kind: "single_choice",
      question:
        "Pensando no seu comportamento no trabalho, qual alternativa mais combina com você?",
      options: DISC_OPTIONS,
    },
    {
      field: "motivacao",
      kind: "single_choice",
      question: "O que mais tende a te motivar no trabalho hoje?",
      options: MOTIVATION_OPTIONS,
    },
    {
      field: "competenciaExemplo1",
      kind: "text",
      question: `Conte uma situação real em que você demonstrou ${competencias[0]}.`,
    },
    {
      field: "competenciaExemplo2",
      kind: "text",
      question: `Agora conte uma situação real em que você demonstrou ${competencias[1]}.`,
    },
    {
      field: "competenciaExemplo3",
      kind: "text",
      question: `Por fim, conte uma situação real em que você demonstrou ${competencias[2]}.`,
    },
  ];
}

export function updateProfileSession(
  session: ProfileSession,
  field: ProfileField,
  answer: string
): ProfileSession {
  let resolved = answer;
  if (field === "motivacao") {
    resolved = resolveChoice(answer, MOTIVATION_OPTIONS) ?? answer;
  } else if (field === "discResposta") {
    resolved = resolveChoice(answer, DISC_OPTIONS) ?? answer;
  }

  const next: ProfileSession = {
    ...session,
    [field]: resolved,
  };

  if (field === "vaga" && resolved.trim()) {
    next.competenciasPrincipais = suggestCompetenciasByRole(resolved.trim());
  }

  return next;
}

function resolveChoice(answer: string, options: ClosedOption[]): string | null {
  const raw = answer.trim().toLowerCase();
  if (!raw) return null;

  const num = parseInt(raw, 10);
  if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
    return options[num - 1].value;
  }

  const byId = options.find((o) => o.id === raw);
  if (byId) return byId.value;

  const byValue = options.find((o) => o.value === raw);
  if (byValue) return byValue.value;

  const byKeyword = options.find((o) =>
    o.label.toLowerCase().split(/[\s.,]+/).includes(raw)
  );
  if (byKeyword) return byKeyword.value;

  return null;
}

export function getNextProfileQuestion(session: ProfileSession): FlowQuestion | null {
  const flow = buildProfileFlow(session);

  for (const item of flow) {
    const value = session[item.field];

    if (typeof value === "undefined") {
      return item;
    }

    if (typeof value === "string" && !value.trim()) {
      return item;
    }
  }

  return null;
}

export function isProfileReady(session: ProfileSession): boolean {
  return getNextProfileQuestion(session) === null;
}
