import {
  getNextProfileQuestion,
  isProfileReady,
  updateProfileSession,
  type FlowQuestion,
  type ProfileField,
  type ProfileSession,
} from "./profile-flow";

type RunProfileStepInput = {
  session: ProfileSession;
  answer?: string;
  currentField?: ProfileField;
};

type RunProfileStepResult = {
  session: ProfileSession;
  done: boolean;
  reply: string;
  nextQuestion: FlowQuestion | null;
};

function formatQuestion(question: FlowQuestion): string {
  if (question.kind === "single_choice" && question.options?.length) {
    const options = question.options
      .map((option, index) => `${index + 1}. ${option.label}`)
      .join("\n");

    return `${question.question}\n\n${options}`;
  }

  return question.question;
}

export function initializeProfileSession(): ProfileSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export async function runProfileStep({
  session,
  answer,
  currentField,
}: RunProfileStepInput): Promise<RunProfileStepResult> {
  let currentSession = { ...session };

  if (currentField && typeof answer === "string") {
    currentSession = updateProfileSession(currentSession, currentField, answer);
  }

  if (isProfileReady(currentSession)) {
    currentSession.status = "completed";
    currentSession.reportStatus = "pending";

    return {
      session: currentSession,
      done: true,
      nextQuestion: null,
      reply:
        "Obrigado por concluir sua avaliação. Suas respostas foram registradas com sucesso e ficarão disponíveis para análise do recrutador.",
    };
  }

  const nextQuestion = getNextProfileQuestion(currentSession);

  if (!nextQuestion) {
    return {
      session: currentSession,
      done: true,
      nextQuestion: null,
      reply:
        "Obrigado por concluir sua avaliação. Suas respostas foram registradas com sucesso e ficarão disponíveis para análise do recrutador.",
    };
  }

  return {
    session: currentSession,
    done: false,
    nextQuestion,
    reply: formatQuestion(nextQuestion),
  };
}
