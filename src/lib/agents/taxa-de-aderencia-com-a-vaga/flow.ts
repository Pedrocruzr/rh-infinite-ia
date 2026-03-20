export type TaxaAderenciaField =
  | "candidateName"
  | "targetRole"
  | "recruiterName"
  | "validatorName"
  | "approverName"
  | "culturalMission"
  | "culturalVision"
  | "culturalValues"
  | "culturalContext"
  | "behavioralTestInput";

export const steps: Array<{ field: TaxaAderenciaField; question: string }> = [
  {
    field: "candidateName",
    question: "Para começarmos, qual é o nome completo do candidato?",
  },
  {
    field: "targetRole",
    question: "Qual é a vaga analisada?",
  },
  {
    field: "recruiterName",
    question: "Informe o nome do recrutador responsável pela avaliação.",
  },
  {
    field: "validatorName",
    question: "Informe o nome do responsável pela validação (gestor direto/liderança).",
  },
  {
    field: "approverName",
    question: "Informe o nome do responsável pela aprovação final (diretoria/RH).",
  },
  {
    field: "culturalMission",
    question: "Qual é a missão da empresa?",
  },
  {
    field: "culturalVision",
    question: "Qual é a visão da empresa?",
  },
  {
    field: "culturalValues",
    question: "Quais são os valores da empresa? Separe por vírgula ou por linha.",
  },
  {
    field: "culturalContext",
    question:
      "Descreva o contexto cultural da empresa: estilo de trabalho, ambiente da equipe, rituais, comportamentos valorizados e comportamentos não tolerados.",
  },
  {
    field: "behavioralTestInput",
    question:
      "Cole aqui o teste de perfil comportamental (DISC, Eneagrama e Perfil de Competências).",
  },
];
