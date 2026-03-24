import type { ParecerNivel } from "./parecer-metrics";

export type ParecerField =
  | "vaga"
  | "contextoContratacao"
  | "empresa"
  | "candidato"
  | "dataEntrevista"
  | "entrevistadores"
  | "validacaoGestor"
  | "aprovacaoFinalRh"
  | "experienciaTotalENivel"
  | "residenciaDisponibilidade"
  | "mobilidadeGeografica"
  | "motivacao"
  | "formacao"
  | "certificacoes"
  | "idiomas"
  | "trajetoria"
  | "progressaoCarreira"
  | "movimentacoes"
  | "conhecimentoNegocioSetor"
  | "gestaoProcessos"
  | "analiseKpis"
  | "planejamentoPriorizacao"
  | "gestaoOrcamento"
  | "estiloLideranca"
  | "evidenciasLideranca"
  | "gestaoConflitos"
  | "comunicacao"
  | "tomadaDecisao"
  | "focoResultados"
  | "desenvolvimentoPessoas"
  | "adaptabilidade"
  | "testes"
  | "referencias"
  | "aderenciaCultural"
  | "pontosDesenvolvimento"
  | "recomendacaoFinal";

export type ParecerSession = {
  assessmentId?: string;
  vaga?: string;
  contextoContratacao?: string;
  empresa?: string;
  candidato?: string;
  dataEntrevista?: string;
  entrevistadores?: string;
  validacaoGestor?: string;
  aprovacaoFinalRh?: string;
  experienciaTotalENivel?: string;
  residenciaDisponibilidade?: string;
  mobilidadeGeografica?: string;
  motivacao?: string;
  formacao?: string;
  certificacoes?: string;
  idiomas?: string;
  trajetoria?: string;
  progressaoCarreira?: string;
  movimentacoes?: string;
  conhecimentoNegocioSetor?: string;
  gestaoProcessos?: string;
  analiseKpis?: string;
  planejamentoPriorizacao?: string;
  gestaoOrcamento?: string;
  estiloLideranca?: string;
  evidenciasLideranca?: string;
  gestaoConflitos?: string;
  comunicacao?: string;
  tomadaDecisao?: string;
  focoResultados?: string;
  desenvolvimentoPessoas?: string;
  adaptabilidade?: string;
  testes?: string;
  referencias?: string;
  aderenciaCultural?: string;
  pontosDesenvolvimento?: string;
  recomendacaoFinal?: string;
  nivelVaga?: ParecerNivel;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
  reportMarkdown?: string | null;
};

type FlowQuestion = {
  field: ParecerField;
  question: string;
};

const COMMON_PREFIX: FlowQuestion[] = [
  {
    field: "vaga",
    question: "Qual é a vaga avaliada?",
  },
  {
    field: "contextoContratacao",
    question: "Qual é o contexto da contratação? Ex.: substituição, expansão, nova estrutura, promoção interna ou outro cenário relevante.",
  },
  {
    field: "empresa",
    question: "Qual é o nome da empresa?",
  },
  {
    field: "candidato",
    question: "Qual é o nome completo do candidato?",
  },
  {
    field: "dataEntrevista",
    question: "Qual foi a data da entrevista?",
  },
  {
    field: "entrevistadores",
    question: "Quem conduziu a entrevista?",
  },
  {
    field: "validacaoGestor",
    question: "Qual é o nome do responsável pela Validação (Gestor Direto/Liderança)?",
  },
  {
    field: "aprovacaoFinalRh",
    question: "Qual é o nome do responsável pela Aprovação Final (Diretoria/RH)?",
  },
];

const OPERATIONAL_FLOW: FlowQuestion[] = [
  {
    field: "experienciaTotalENivel",
    question: "Qual é a experiência total do candidato e quais funções mais relevantes ele já exerceu?",
  },
  {
    field: "residenciaDisponibilidade",
    question: "Onde o candidato reside e qual é a disponibilidade para início?",
  },
  {
    field: "motivacao",
    question: "Qual foi a principal motivação apresentada para a vaga?",
  },
  {
    field: "formacao",
    question: "Qual é a formação acadêmica principal do candidato?",
  },
  {
    field: "certificacoes",
    question: "Há cursos, certificações ou formações complementares relevantes?",
  },
  {
    field: "idiomas",
    question: "Há idiomas declarados? Se sim, quais e em qual nível?",
  },
  {
    field: "trajetoria",
    question: "Resuma a trajetória profissional mais relevante para a função.",
  },
  {
    field: "conhecimentoNegocioSetor",
    question: "Como o candidato demonstrou conhecimento sobre a função, a rotina e o setor?",
  },
  {
    field: "competenciasTecnicas",
    question: "Quais competências técnicas ficaram evidentes na entrevista? Traga evidências observáveis.",
  },
  {
    field: "competenciasComportamentais",
    question: "Quais competências comportamentais ficaram evidentes na entrevista? Traga evidências observáveis.",
  },
  {
    field: "comunicacao",
    question: "Como foi percebida a comunicação do candidato durante a entrevista?",
  },
  {
    field: "focoResultados",
    question: "O candidato demonstrou foco em resultado, qualidade ou produtividade? Quais evidências apareceram?",
  },
  {
    field: "testes",
    question: "Foi aplicada alguma ferramenta complementar de avaliação? Se sim, qual e qual foi o resultado?",
  },
  {
    field: "referencias",
    question: "Houve referências profissionais? Quais sinais relevantes apareceram?",
  },
  {
    field: "aderenciaCultural",
    question: "Como foi percebida a aderência do candidato à cultura e ao contexto da vaga?",
  },
  {
    field: "pontosDesenvolvimento",
    question: "Quais pontos de desenvolvimento, riscos ou necessidades de acompanhamento apareceram?",
  },
  {
    field: "recomendacaoFinal",
    question: "Qual é a recomendação final? Responda com: Aprovado, Aprovado com Restrições ou Reprovado, e explique tecnicamente em uma frase.",
  },
];

const GERENCIAL_FLOW: FlowQuestion[] = [
  {
    field: "experienciaTotalENivel",
    question: "Qual é a experiência total do candidato e qual foi o nível mais alto já alcançado?",
  },
  {
    field: "residenciaDisponibilidade",
    question: "Onde o candidato reside e qual é a disponibilidade para início?",
  },
  {
    field: "mobilidadeGeografica",
    question: "Há disponibilidade para mobilidade geográfica? Se sim, em quais condições?",
  },
  {
    field: "motivacao",
    question: "Qual foi a principal motivação apresentada para a vaga?",
  },
  {
    field: "formacao",
    question: "Qual é a formação acadêmica do candidato?",
  },
  {
    field: "certificacoes",
    question: "O candidato possui certificações, cursos ou formação complementar relevante?",
  },
  {
    field: "idiomas",
    question: "Quais idiomas o candidato declara e em qual nível?",
  },
  {
    field: "trajetoria",
    question: "Resuma a trajetória profissional mais recente do candidato, incluindo cargos e contexto de liderança.",
  },
  {
    field: "progressaoCarreira",
    question: "Como o candidato explicou sua progressão de carreira?",
  },
  {
    field: "movimentacoes",
    question: "Quais foram os principais motivos de movimentação profissional apresentados?",
  },
  {
    field: "conhecimentoNegocioSetor",
    question: "Qual é o nível de conhecimento demonstrado sobre o negócio e o setor?",
  },
  {
    field: "gestaoProcessos",
    question: "Como o candidato descreveu sua experiência com gestão de processos? Cite evidências concretas.",
  },
  {
    field: "analiseKpis",
    question: "Como foi percebida a capacidade analítica e o uso de KPIs, indicadores ou dados?",
  },
  {
    field: "planejamentoPriorizacao",
    question: "Há evidências de planejamento, priorização, organização de rotina ou gestão de rituais?",
  },
  {
    field: "gestaoOrcamento",
    question: "Há experiência com orçamento, custos, horas extras, controladoria ou gestão financeira da área?",
  },
  {
    field: "estiloLideranca",
    question: "Como o candidato descreve seu estilo de liderança?",
  },
  {
    field: "evidenciasLideranca",
    question: "Que evidências concretas ele trouxe sobre liderança de pessoas e desenvolvimento do time?",
  },
  {
    field: "gestaoConflitos",
    question: "Como o candidato relatou sua forma de lidar com conflitos? Traga exemplos, se houver.",
  },
  {
    field: "comunicacao",
    question: "Como foi percebida a comunicação do candidato durante a entrevista?",
  },
  {
    field: "tomadaDecisao",
    question: "Que evidências foram observadas sobre tomada de decisão?",
  },
  {
    field: "focoResultados",
    question: "O candidato demonstrou foco em resultados? Quais evidências apareceram?",
  },
  {
    field: "desenvolvimentoPessoas",
    question: "Houve indícios de desenvolvimento de pessoas, sucessão, feedback ou acompanhamento de performance?",
  },
  {
    field: "adaptabilidade",
    question: "Como foi percebida a adaptabilidade do candidato diante de mudanças, pressão ou reestruturação?",
  },
  {
    field: "testes",
    question: "Foi aplicada alguma ferramenta complementar de avaliação? Se sim, qual e qual foi o resultado?",
  },
  {
    field: "referencias",
    question: "Houve referências profissionais? Quais sinais relevantes apareceram?",
  },
  {
    field: "aderenciaCultural",
    question: "O candidato parece aderente à cultura, ao contexto e ao tipo de equipe da vaga?",
  },
  {
    field: "pontosDesenvolvimento",
    question: "Quais pontos de desenvolvimento, gaps ou riscos ficaram evidentes?",
  },
  {
    field: "recomendacaoFinal",
    question: "Qual é a recomendação final? Responda com: Aprovado, Aprovado com Restrições ou Reprovado, e explique tecnicamente em uma frase.",
  },
];

const ESTRATEGICO_FLOW: FlowQuestion[] = [
  {
    field: "experienciaTotalENivel",
    question: "Qual é a experiência total do candidato e qual foi o nível executivo mais alto já alcançado?",
  },
  {
    field: "residenciaDisponibilidade",
    question: "Onde o candidato reside e qual é a disponibilidade para início?",
  },
  {
    field: "mobilidadeGeografica",
    question: "Há disponibilidade para mobilidade geográfica ou agenda executiva ampliada?",
  },
  {
    field: "motivacao",
    question: "Qual foi a principal motivação apresentada para assumir esta posição estratégica?",
  },
  {
    field: "formacao",
    question: "Qual é a formação acadêmica principal do candidato?",
  },
  {
    field: "certificacoes",
    question: "Há pós-graduação, MBA, certificações ou formações executivas relevantes?",
  },
  {
    field: "idiomas",
    question: "Quais idiomas o candidato declara e em qual nível?",
  },
  {
    field: "trajetoria",
    question: "Resuma a trajetória executiva mais relevante do candidato.",
  },
  {
    field: "progressaoCarreira",
    question: "Como o candidato explicou sua progressão de carreira e ampliação de escopo?",
  },
  {
    field: "movimentacoes",
    question: "Quais foram os principais motivos de movimentação profissional apresentados?",
  },
  {
    field: "conhecimentoNegocioSetor",
    question: "Qual é o nível de domínio demonstrado sobre o negócio, mercado, setor e cenário competitivo?",
  },
  {
    field: "gestaoProcessos",
    question: "Quais evidências de estruturação, transformação, governança ou revisão de processos o candidato apresentou?",
  },
  {
    field: "analiseKpis",
    question: "Como foi percebida a leitura de indicadores, resultado, margem, performance e tomada de decisão baseada em dados?",
  },
  {
    field: "planejamentoPriorizacao",
    question: "Quais evidências apareceram sobre visão estratégica, priorização e desdobramento de planos?",
  },
  {
    field: "gestaoOrcamento",
    question: "Qual é a experiência do candidato com orçamento, P&L, CAPEX, OPEX ou gestão financeira ampliada?",
  },
  {
    field: "estiloLideranca",
    question: "Como o candidato descreve seu estilo de liderança executiva?",
  },
  {
    field: "evidenciasLideranca",
    question: "Quais evidências concretas foram apresentadas sobre liderança de gestores, formação de sucessores e influência organizacional?",
  },
  {
    field: "gestaoConflitos",
    question: "Como o candidato lida com conflitos críticos, stakeholders e decisões de alto impacto?",
  },
  {
    field: "comunicacao",
    question: "Como foi percebida a comunicação executiva do candidato?",
  },
  {
    field: "tomadaDecisao",
    question: "Que evidências foram observadas sobre tomada de decisão em contextos ambíguos e estratégicos?",
  },
  {
    field: "focoResultados",
    question: "O candidato demonstrou foco em resultado organizacional, expansão, eficiência ou rentabilidade? Quais evidências apareceram?",
  },
  {
    field: "desenvolvimentoPessoas",
    question: "Quais evidências apareceram sobre desenvolvimento de lideranças, sucessão e fortalecimento cultural?",
  },
  {
    field: "adaptabilidade",
    question: "Como foi percebida a adaptabilidade do candidato diante de crise, mudança ou reestruturação organizacional?",
  },
  {
    field: "testes",
    question: "Foi aplicada alguma ferramenta complementar de avaliação? Se sim, qual e qual foi o resultado?",
  },
  {
    field: "referencias",
    question: "Houve referências executivas ou profissionais? Quais sinais relevantes apareceram?",
  },
  {
    field: "aderenciaCultural",
    question: "Qual é a percepção sobre aderência cultural, valores e fit com o momento estratégico da empresa?",
  },
  {
    field: "pontosDesenvolvimento",
    question: "Quais gaps, riscos ou pontos de desenvolvimento estratégicos ficaram evidentes?",
  },
  {
    field: "recomendacaoFinal",
    question: "Qual é a recomendação final? Responda com: Aprovado, Aprovado com Restrições ou Reprovado, e explique tecnicamente em uma frase.",
  },
];

export function getParecerFlow(session: ParecerSession): FlowQuestion[] {
  const level = session.nivelVaga;

  if (level === "gerencial") {
    return [...COMMON_PREFIX, ...GERENCIAL_FLOW];
  }

  if (level === "estrategico") {
    return [...COMMON_PREFIX, ...ESTRATEGICO_FLOW];
  }

  return [...COMMON_PREFIX, ...OPERATIONAL_FLOW];
}

export function getNextParecerQuestion(session: ParecerSession): FlowQuestion | null {
  const flow = getParecerFlow(session);

  for (const item of flow) {
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
