export type DiscField =
  | "nome"
  | "vaga"
  | "resposta1"
  | "resposta2"
  | "resposta3"
  | "resposta4";

export type DiscSession = {
  assessmentId?: string;
  nome?: string;
  vaga?: string;
  resposta1?: string;
  resposta2?: string;
  resposta3?: string;
  resposta4?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type FlowQuestion = {
  field: DiscField;
  question: string;
};

export const DISC_FLOW: FlowQuestion[] = [
  {
    field: "nome",
    question: "Para começarmos, qual é o seu nome completo?",
  },
  {
    field: "vaga",
    question: "Agora me diga: para qual vaga ou cargo você está se candidatando?",
  },
  {
    field: "resposta1",
    question:
      "Descreva uma situação em que você teve que assumir o controle de um projeto, tarefa ou problema importante. Como você agiu?",
  },
  {
    field: "resposta2",
    question:
      "Conte uma situação em que você precisou convencer, engajar ou alinhar outras pessoas em torno de uma ideia sua.",
  },
  {
    field: "resposta3",
    question:
      "Descreva uma situação em que houve mudança, pressão ou instabilidade no ambiente de trabalho. Como você reagiu?",
  },
  {
    field: "resposta4",
    question:
      "Conte uma situação em que a qualidade, a organização, as regras ou os detalhes fizeram diferença no resultado final.",
  },
];

export function getNextDiscQuestion(session: DiscSession): FlowQuestion | null {
  for (const item of DISC_FLOW) {
    const value = session[item.field];
    if (!value || !value.trim()) {
      return item;
    }
  }
  return null;
}

export function updateDiscSession(
  session: DiscSession,
  field: DiscField,
  value: string
): DiscSession {
  return {
    ...session,
    [field]: value.trim(),
  };
}

export function isDiscReady(session: DiscSession): boolean {
  return getNextDiscQuestion(session) === null;
}
