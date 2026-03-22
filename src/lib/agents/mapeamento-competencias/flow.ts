export type MapeamentoField =
  | "cargo"
  | "atividades"
  | "competencias";

export type MapeamentoSession = {
  assessmentId?: string;
  cargo?: string;
  atividades?: string;
  competencias?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type FlowQuestion = {
  field: MapeamentoField;
  question: string;
};

export const MAPEAMENTO_FLOW: FlowQuestion[] = [
  {
    field: "cargo",
    question:
      "Qual é o cargo ou função que será analisado no mapeamento de competências?",
  },
  {
    field: "atividades",
    question:
      "Liste as principais atividades, responsabilidades e entregas esperadas desse cargo.",
  },
  {
    field: "competencias",
    question:
      "Informe as competências técnicas, comportamentais e organizacionais que você considera mais importantes para esse cargo.",
  },
];

export function getNextMapeamentoQuestion(
  session: MapeamentoSession
): FlowQuestion | null {
  for (const item of MAPEAMENTO_FLOW) {
    const value = session[item.field];
    if (!value || !value.trim()) {
      return item;
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

  if (!raw) {
    const current = MAPEAMENTO_FLOW.find((item) => item.field === currentField);
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: current?.question ?? null,
      reply:
        "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?",
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
