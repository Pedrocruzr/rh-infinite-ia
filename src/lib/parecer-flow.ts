import type { ParecerNivel } from "./parecer-metrics";

export type ParecerField =
  | "empresa"
  | "vaga"
  | "candidato"
  | "dataEntrevista"
  | "entrevistadores"
  | "motivacao"
  | "formacao"
  | "trajetoria"
  | "competenciasTecnicas"
  | "competenciasComportamentais"
  | "testes"
  | "referencias"
  | "fitCultural"
  | "pontosFortes"
  | "pontosAtencao"
  | "recomendacaoFinal";

export type ParecerSession = {
  empresa?: string;
  vaga?: string;
  candidato?: string;
  dataEntrevista?: string;
  entrevistadores?: string;
  motivacao?: string;
  formacao?: string;
  trajetoria?: string;
  competenciasTecnicas?: string;
  competenciasComportamentais?: string;
  testes?: string;
  referencias?: string;
  fitCultural?: string;
  pontosFortes?: string;
  pontosAtencao?: string;
  recomendacaoFinal?: string;
  nivelVaga?: ParecerNivel;
  generatedParecer?: string;
};

type FlowQuestion = {
  field: ParecerField;
  question: string;
};

export const PARECER_FLOW: FlowQuestion[] = [
  { field: "empresa", question: "Qual é o nome da empresa?" },
  { field: "vaga", question: "Qual é o nome exato da vaga avaliada?" },
  { field: "candidato", question: "Qual é o nome completo do candidato?" },
  { field: "dataEntrevista", question: "Qual foi a data da entrevista?" },
  { field: "entrevistadores", question: "Quem participou como entrevistador(es)?" },
  { field: "motivacao", question: "Qual foi a motivação principal apresentada pelo candidato para a vaga?" },
  { field: "formacao", question: "Quais são os principais dados de formação acadêmica e certificações relevantes?" },
  { field: "trajetoria", question: "Resuma a trajetória profissional relevante para a vaga." },
  { field: "competenciasTecnicas", question: "Quais evidências foram observadas sobre competências técnicas?" },
  { field: "competenciasComportamentais", question: "Quais evidências foram observadas sobre competências comportamentais?" },
  { field: "testes", question: "Quais testes, ferramentas ou avaliações complementares foram aplicados e quais resultados apareceram?" },
  { field: "referencias", question: "Houve checagem de referências? Se sim, quais pontos relevantes foram confirmados?" },
  { field: "fitCultural", question: "Como foi percebida a aderência cultural do candidato à empresa?" },
  { field: "pontosFortes", question: "Quais são os principais pontos fortes observados?" },
  { field: "pontosAtencao", question: "Quais são os principais pontos de atenção, gaps ou riscos observados?" },
  { field: "recomendacaoFinal", question: "Qual é a recomendação final? Aprovado, Aprovado com Restrições ou Reprovado?" },
];

export function getNextParecerQuestion(session: ParecerSession): FlowQuestion | null {
  for (const item of PARECER_FLOW) {
    const value = session[item.field];
    if (!value || !value.trim()) {
      return item;
    }
  }
  return null;
}

export function updateParecerSession(
  session: ParecerSession,
  field: ParecerField,
  value: string
): ParecerSession {
  return {
    ...session,
    [field]: value.trim(),
  };
}

export function isParecerReady(session: ParecerSession): boolean {
  return getNextParecerQuestion(session) === null;
}
