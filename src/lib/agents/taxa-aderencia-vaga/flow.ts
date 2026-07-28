export type AderenciaVagaField =
  | "culturalMission"
  | "culturalVision"
  | "culturalValues"
  | "culturalContext"
  | "targetRole"
  | "recruiterName"
  | "validatorName"
  | "approverName"
  | "candidateName"
  | "candidateExperience"
  | "behavioralTestInput";

export type AderenciaVagaSession = {
  culturalMission?: string;
  culturalVision?: string;
  culturalValues?: string;
  culturalContext?: string;
  targetRole?: string;
  recruiterName?: string;
  validatorName?: string;
  approverName?: string;
  candidateName?: string;
  candidateExperience?: string;
  behavioralTestInput?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
  reportMarkdown?: string | null;
};

export const FIRST_FIELD: AderenciaVagaField = "culturalMission";

const ORDER: AderenciaVagaField[] = [
  "culturalMission",
  "culturalVision",
  "culturalValues",
  "culturalContext",
  "targetRole",
  "recruiterName",
  "validatorName",
  "approverName",
  "candidateName",
  "candidateExperience",
  "behavioralTestInput",
];

export function initializeAderenciaVagaSession(): AderenciaVagaSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
    reportMarkdown: null,
  };
}

function normalize(text: unknown) {
  return String(text ?? "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function titleCase(text: string) {
  return text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function nextField(current: AderenciaVagaField): AderenciaVagaField | null {
  const idx = ORDER.indexOf(current);
  if (idx === -1 || idx === ORDER.length - 1) return null;
  return ORDER[idx + 1];
}

function ask(field: AderenciaVagaField, session: AderenciaVagaSession) {
  switch (field) {
    case "culturalMission":
      return `Vamos começar.

Etapa 1: cultura da empresa — missão

Pergunta:
Qual é a missão da organização?

Exemplo:
Levar soluções simples de gestão para pequenas e médias empresas.`;
    case "culturalVision":
      return `Perfeito.

Confirmação da resposta anterior:
Missão: ${session.culturalMission ?? "Não informado"}

Etapa 2: cultura da empresa — visão

Pergunta:
Qual é a visão da empresa?

Exemplo:
Ser referência regional em atendimento até 2030.`;
    case "culturalValues":
      return `Perfeito.

Confirmação da resposta anterior:
Visão: ${session.culturalVision ?? "Não informado"}

Etapa 3: cultura da empresa — valores

Pergunta:
Quais são os valores da empresa? Separe por vírgula ou por linha.

Exemplo:
Organização, transparência, foco no cliente, responsabilidade`;
    case "culturalContext":
      return `Perfeito.

Confirmação da resposta anterior:
Valores: ${session.culturalValues ?? "Não informado"}

Etapa 4: contexto cultural

Pergunta:
Além da missão, visão e valores, há algo crucial sobre o fit cultural?

Exemplos:
Estilo de trabalho e ritmo do dia a dia
Ambiente da equipe e rituais
Comportamentos valorizados
Comportamentos não tolerados`;
    case "targetRole":
      return `Perfeito.

Confirmação da resposta anterior:
Contexto cultural: ${session.culturalContext ?? "Não informado"}

Etapa 5: a vaga

Pergunta:
Para qual cargo você está recrutando?

Exemplos:
Auxiliar Administrativo
Recepcionista
Vendedor`;
    case "recruiterName":
      return `Perfeito.

Confirmação da resposta anterior:
Cargo da vaga: ${session.targetRole ?? "Não informado"}

Etapa 6: responsável pela avaliação

Pergunta:
Qual é o nome do recrutador responsável pela avaliação?

Exemplo:
Pedro Neto`;
    case "validatorName":
      return `Perfeito.

Confirmação da resposta anterior:
Recrutador: ${session.recruiterName ?? "Não informado"}

Etapa 7: validação

Pergunta:
Quem é o responsável pela validação (gestor direto ou liderança)?

Exemplo:
Ana Paula Souza`;
    case "approverName":
      return `Perfeito.

Confirmação da resposta anterior:
Validação: ${session.validatorName ?? "Não informado"}

Etapa 8: aprovação final

Pergunta:
Quem é o responsável pela aprovação final (diretoria ou RH)?

Exemplo:
Carla Menezes`;
    case "candidateName":
      return `Perfeito.

Confirmação da resposta anterior:
Aprovação final: ${session.approverName ?? "Não informado"}

Etapa 9: candidato

Pergunta:
Qual é o nome completo do candidato avaliado?

Exemplo:
João Ricardo da Silva`;
    case "candidateExperience":
      return `Perfeito.

Confirmação da resposta anterior:
Candidato: ${session.candidateName ?? "Não informado"}

Etapa 10: experiências e evidências

Pergunta:
Resuma as experiências e principais evidências profissionais do candidato.
Você pode separar por vírgula ou por linha.

Exemplo:
Rotinas administrativas por 3 anos
Contas a pagar e a receber
Emissão de notas fiscais
Excel intermediário`;
    case "behavioralTestInput":
      return `Perfeito.

Confirmação da resposta anterior:
Experiências: ${session.candidateExperience ?? "Não informado"}

Etapa 11: perfil comportamental

Pergunta:
Cole aqui o teste de perfil comportamental (DISC, Eneagrama e Perfil de Competências).
Se não tiver o teste completo, descreva os principais traços observados.

Exemplo:
Perfil CS, Eneagrama tipo 6, organizado, responsável, atenção aos detalhes`;
    default:
      return `Informe o dado solicitado.`;
  }
}

export function runAderenciaVagaStep(
  session: AderenciaVagaSession,
  answer?: string,
  currentField?: AderenciaVagaField | string | null
) {
  const current = (currentField ?? FIRST_FIELD) as AderenciaVagaField;
  const text = normalize(answer);

  if (!text) {
    const field = ORDER.includes(current) ? current : FIRST_FIELD;
    return {
      session,
      currentField: field,
      nextField: field,
      completed: false,
      finished: false,
      reply: ask(field, session),
    };
  }

  const nameFields: AderenciaVagaField[] = [
    "recruiterName",
    "validatorName",
    "approverName",
    "candidateName",
  ];

  const updated: AderenciaVagaSession = {
    ...session,
    [current]: nameFields.includes(current) ? titleCase(text) : text,
  };

  const next = nextField(current);

  if (!next) {
    return {
      session: {
        ...updated,
        status: "completed" as const,
        reportStatus: "generated" as const,
      },
      currentField: null,
      nextField: null,
      completed: true,
      finished: true,
      reply: "",
    };
  }

  return {
    session: updated,
    currentField: next,
    nextField: next,
    completed: false,
    finished: false,
    reply: ask(next, updated),
  };
}
