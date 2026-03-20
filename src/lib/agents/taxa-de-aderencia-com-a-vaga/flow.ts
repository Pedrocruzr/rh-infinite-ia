export type TaxaAderenciaField =
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

export const steps: Array<{ field: TaxaAderenciaField; question: string }> = [
  {
    field: "culturalMission",
    question:
      "Para começarmos da forma correta, preciso entender o DNA da sua empresa. Qual é a missão da organização?",
  },
  {
    field: "culturalVision",
    question: "Agora, informe a visão da empresa.",
  },
  {
    field: "culturalValues",
    question: "Quais são os valores da empresa? Separe por vírgula ou por linha.",
  },
  {
    field: "culturalContext",
    question:
      "Além da missão, visão e valores, há alguma outra informação sobre o fit cultural que seja crucial para a avaliação? Por exemplo: estilo de trabalho, ambiente da equipe, rituais, comportamentos valorizados e comportamentos não tolerados.",
  },
  {
    field: "targetRole",
    question:
      "Entendido. Com a cultura da empresa mapeada, vamos focar na vaga. Para qual cargo você está recrutando hoje?",
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
    field: "candidateName",
    question: "Qual é o nome completo do candidato?",
  },
  {
    field: "candidateExperience",
    question: "Resumo das experiências e principais evidências profissionais do candidato.",
  },
  {
    field: "behavioralTestInput",
    question:
      "Cole aqui o teste de perfil comportamental (DISC, Eneagrama e Perfil de Competências). Se não tiver o teste completo, descreva os principais traços observados.",
  },
];
