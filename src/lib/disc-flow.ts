export type DiscField =
  | "nome"
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6";

export type DiscSession = {
  assessmentId?: string;
  nome?: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
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
    field: "q1",
    question: `Pergunta 1

Quando você precisa lidar com um desafio importante no trabalho, qual dessas atitudes mais te representa?

A) Eu assumo o controle rapidamente e foco em resolver o problema o mais rápido possível.
B) Eu busco envolver outras pessoas e manter todos motivados durante o processo.
C) Eu procuro manter a calma, entender a situação e ajudar a equipe a se adaptar.
D) Eu analiso cuidadosamente o problema antes de agir, buscando a melhor solução possível.

👉 Responda com A, B, C ou D.`,
  },
  {
    field: "q2",
    question: `Pergunta 2

Em um ambiente de trabalho ideal, o que mais te motiva?

A) Ter autonomia para tomar decisões e alcançar metas desafiadoras.
B) Interagir com pessoas, trocar ideias e ser reconhecido pelo que faço.
C) Trabalhar em um ambiente estável, colaborativo e harmonioso.
D) Ter processos bem definidos e garantir qualidade em tudo que faço.

👉 Responda com A, B, C ou D.`,
  },
  {
    field: "q3",
    question: `Pergunta 3

Como você normalmente reage quando precisa tomar uma decisão com pouco tempo e poucas informações?

A) Decido rapidamente com base no que já sei e sigo em frente.
B) Converso com outras pessoas para ouvir opiniões antes de decidir.
C) Tento ganhar um pouco mais de tempo para entender melhor a situação.
D) Fico desconfortável e busco o máximo de dados possível antes de decidir.

👉 Responda com A, B, C ou D.`,
  },
  {
    field: "q4",
    question: `Pergunta 4

Como você se comporta ao trabalhar em equipe?

A) Assumo naturalmente a liderança e direciono as pessoas para alcançar o objetivo.
B) Gosto de engajar todos, manter o clima positivo e incentivar a participação.
C) Prefiro colaborar de forma consistente, apoiando os colegas no que for preciso.
D) Contribuo garantindo organização, qualidade e atenção aos detalhes.

👉 Responda com A, B, C ou D.`,
  },
  {
    field: "q5",
    question: `Pergunta 5

Quando há mudanças inesperadas no trabalho, como você costuma reagir?

A) Vejo como um desafio e ajo rapidamente para me adaptar e resolver.
B) Tento manter todos positivos e motivados durante a mudança.
C) Busco entender bem a mudança e me adaptar gradualmente, ajudando os outros.
D) Analiso o impacto da mudança e procuro seguir da forma mais correta possível.

👉 Responda com A, B, C ou D.`,
  },
  {
    field: "q6",
    question: `Pergunta 6

O que mais te incomoda no ambiente de trabalho?

A) Lentidão, falta de resultados e ineficiência.
B) Falta de comunicação, clima negativo ou pessoas desmotivadas.
C) Conflitos constantes e falta de harmonia na equipe.
D) Falta de organização, erros e baixa qualidade nas entregas.

👉 Responda com A, B, C ou D.`,
  },
];

function normalizeAnswer(value: string): string {
  return value.trim().toUpperCase();
}

function isValidChoice(value: string): boolean {
  return ["A", "B", "C", "D"].includes(normalizeAnswer(value));
}

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
  if (field === "nome") {
    return {
      ...session,
      [field]: value.trim(),
    };
  }

  return {
    ...session,
    [field]: normalizeAnswer(value),
  };
}

export function isDiscReady(session: DiscSession): boolean {
  return getNextDiscQuestion(session) === null;
}

export function initializeDiscSession(): DiscSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export function runDiscStep(
  session: DiscSession,
  answer?: string,
  currentField?: DiscField | string
) {
  if (!currentField) {
    const next = getNextDiscQuestion(session);
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
    const current = DISC_FLOW.find((item) => item.field === currentField);
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: current?.question ?? null,
      reply:
        currentField === "nome"
          ? "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode informar seu nome completo?"
          : "Resposta inválida. Responda apenas com A, B, C ou D.",
    };
  }

  if (currentField !== "nome" && !isValidChoice(raw)) {
    const current = DISC_FLOW.find((item) => item.field === currentField);
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: current?.question ?? null,
      reply: "Resposta inválida. Responda apenas com A, B, C ou D.",
    };
  }

  const updated = updateDiscSession(
    session,
    currentField as DiscField,
    raw
  );

  const next = getNextDiscQuestion(updated);
  const completed = isDiscReady(updated);

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
