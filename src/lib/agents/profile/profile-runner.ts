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

function safeProfile(value?: string | null, fallback = "Não informado"): string {
  const text = value?.trim();
  return text && text.length > 0 ? text : fallback;
}

function escapeProfileHtml(value?: string | null): string {
  return safeProfile(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function profileList(items?: string[] | null): string {
  const normalized = items && items.length > 0 ? items : ["Não informado"];
  return `<ul>${normalized
    .map((item) => `<li>${escapeProfileHtml(item)}</li>`)
    .join("")}</ul>`;
}

export function generateProfileReport(session: ProfileSession): string {
  return `
<section>
  <h1>Relatório de Perfil Comportamental</h1>

  <p>Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.</p>

  <h2>1. Identificação</h2>
  <p><strong>Participante:</strong> ${escapeProfileHtml(session.nome)}</p>
  <p><strong>Vaga de referência:</strong> ${escapeProfileHtml(session.vaga)}</p>

  <h2>2. Competências principais sugeridas para a vaga</h2>
  ${profileList(session.competenciasPrincipais)}

  <h2>3. Tendência comportamental observada</h2>
  <p><strong>Resposta DISC:</strong> ${escapeProfileHtml(session.discResposta)}</p>
  <p><strong>Fator de motivação predominante:</strong> ${escapeProfileHtml(session.motivacao)}</p>

  <h2>4. Evidências comportamentais coletadas</h2>
  <table>
    <thead>
      <tr>
        <th>Competência</th>
        <th>Evidência relatada</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${escapeProfileHtml(session.competenciasPrincipais?.[0] ?? "Competência 1")}</td>
        <td>${escapeProfileHtml(session.competenciaExemplo1)}</td>
      </tr>
      <tr>
        <td>${escapeProfileHtml(session.competenciasPrincipais?.[1] ?? "Competência 2")}</td>
        <td>${escapeProfileHtml(session.competenciaExemplo2)}</td>
      </tr>
      <tr>
        <td>${escapeProfileHtml(session.competenciasPrincipais?.[2] ?? "Competência 3")}</td>
        <td>${escapeProfileHtml(session.competenciaExemplo3)}</td>
      </tr>
    </tbody>
  </table>

  <h2>5. Síntese técnica</h2>
  <p>Com base nas respostas registradas, o participante apresentou evidências comportamentais alinhadas ao contexto da vaga informada, com base em motivação declarada, tendência de tomada de decisão e exemplos práticos de competência.</p>

  <h2>6. Encerramento</h2>
  <p>As respostas foram concluídas com sucesso e este relatório foi salvo para consulta do recrutador em Relatórios Stackers.</p>
</section>
`.trim();
}
