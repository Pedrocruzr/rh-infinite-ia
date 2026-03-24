export type CustoContratacaoField =
  | "periodo"
  | "setor"
  | "contratacoes"
  | "salariosRh"
  | "encargosRh"
  | "beneficiosRh"
  | "tempoRh"
  | "custoHoraGestores"
  | "horasGestores"
  | "infraestrutura"
  | "tempoInfra"
  | "onboardingDireto"
  | "custoHoraNovo"
  | "horasOnboarding"
  | "anuncios"
  | "agencias"
  | "ferramentas"
  | "testes"
  | "relocacao";

export type CustoContratacaoSession = {
  periodo?: string;
  setor?: string;
  contratacoes?: number;
  salariosRh?: number;
  encargosRh?: number;
  beneficiosRh?: number;
  tempoRh?: number;
  custoHoraGestores?: number;
  horasGestores?: number;
  infraestrutura?: number;
  tempoInfra?: number;
  onboardingDireto?: number;
  custoHoraNovo?: number;
  horasOnboarding?: number;
  anuncios?: number;
  agencias?: number;
  ferramentas?: number;
  testes?: number;
  relocacao?: number;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
  reportMarkdown?: string | null;
};

export function initializeCustoContratacaoSession(): CustoContratacaoSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
    reportMarkdown: null,
  };
}

function normalize(text: unknown) {
  return String(text ?? "").trim();
}

function parseNumber(input: string) {
  const cleaned = input
    .toLowerCase()
    .replace(/r\$/g, "")
    .replace(/horas?/g, "")
    .replace(/%/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  return Number(match[0]);
}

function nextField(current: CustoContratacaoField): CustoContratacaoField | null {
  const order: CustoContratacaoField[] = [
    "periodo",
    "setor",
    "contratacoes",
    "salariosRh",
    "encargosRh",
    "beneficiosRh",
    "tempoRh",
    "custoHoraGestores",
    "horasGestores",
    "infraestrutura",
    "tempoInfra",
    "onboardingDireto",
    "custoHoraNovo",
    "horasOnboarding",
    "anuncios",
    "agencias",
    "ferramentas",
    "testes",
    "relocacao",
  ];

  const idx = order.indexOf(current);
  if (idx === -1 || idx === order.length - 1) return null;
  return order[idx + 1];
}

export function questionFor(field: CustoContratacaoField) {
  switch (field) {
    case "periodo":
      return `📅 Etapa 1: Período de Análise

Qual período de análise vamos calcular?

Exemplos:
- Janeiro a Março de 2026
- Ano de 2024
- T3/2025`;
    case "setor":
      return `🏢 Etapa 2: Setor da Empresa

Qual é o setor principal da sua empresa?

Exemplos:
- Varejo
- Tecnologia
- Saúde
- Indústria
- Serviços`;
    case "contratacoes":
      return `👥 Etapa 3: Número de Contratações

Quantas contratações foram feitas dentro desse período?

Exemplos:
- 8
- 15
- 25`;
    case "salariosRh":
      return `💰 Etapa 4a: Custo da Equipe de Recrutamento — Salários

Qual foi o valor total dos salários brutos da equipe de recrutamento no período?`;
    case "encargosRh":
      return `📊 Etapa 4a: Encargos

Qual é o percentual médio de encargos sobre esses salários?`;
    case "beneficiosRh":
      return `🎁 Etapa 4a: Benefícios

Qual foi o valor total de benefícios pago à equipe de recrutamento no período?`;
    case "tempoRh":
      return `⏱️ Etapa 4a: Tempo dedicado ao recrutamento

Qual o percentual de tempo que essa equipe dedicou exclusivamente aos processos seletivos?`;
    case "custoHoraGestores":
      return `👔 Etapa 4b: Custo dos Gestores em Entrevistas

Qual é o custo/hora médio dos gestores que participaram das entrevistas?`;
    case "horasGestores":
      return `🕒 Etapa 4b: Total de horas dos gestores

Qual o número total de horas que todos os gestores gastaram em entrevistas no período?`;
    case "infraestrutura":
      return `🏢 Etapa 4c: Infraestrutura

Qual o custo proporcional de infraestrutura utilizado pela equipe de RH no período?`;
    case "tempoInfra":
      return `📊 Etapa 4c: Percentual alocado ao recrutamento

Qual o percentual desse custo de infraestrutura dedicado ao recrutamento?`;
    case "onboardingDireto":
      return `🎓 Etapa 4d: Onboarding — custo direto por contratado

Qual o custo direto de onboarding por novo contratado?`;
    case "custoHoraNovo":
      return `⏱️ Etapa 4d: Custo/hora do novo contratado

Qual é o custo/hora médio de um novo contratado?`;
    case "horasOnboarding":
      return `🕒 Etapa 4d: Duração do onboarding

Quantas horas dura o onboarding obrigatório por novo contratado?`;
    case "anuncios":
      return `📢 Etapa 5: Custos Externos — Anúncios

Qual foi o valor total gasto em anúncios de vagas no período?`;
    case "agencias":
      return `🧑‍💼 Etapa 5: Agências de Recrutamento

Qual foi o valor total pago em taxas de agências no período?`;
    case "ferramentas":
      return `🛠️ Etapa 5: Ferramentas e Softwares

Qual foi o custo total com ferramentas e softwares de recrutamento no período?`;
    case "testes":
      return `🧪 Etapa 5: Testes e Avaliações

Qual foi o gasto total com testes e avaliações no período?`;
    case "relocacao":
      return `🚚 Etapa 5: Relocação

Houve custos de relocação no período? Se sim, qual o valor total?`;
    default:
      return `Informe o dado solicitado.`;
  }
}

export function runCustoContratacaoStep(
  session: CustoContratacaoSession,
  answer?: string,
  currentField?: CustoContratacaoField | string | null
) {
  const current = (currentField ?? "periodo") as CustoContratacaoField;
  const text = normalize(answer);

  if (!answer && current === "periodo") {
    return {
      session,
      currentField: "periodo" as const,
      nextField: "periodo" as const,
      completed: false,
      finished: false,
      reply: questionFor("periodo"),
    };
  }

  const numericFields: CustoContratacaoField[] = [
    "contratacoes",
    "salariosRh",
    "encargosRh",
    "beneficiosRh",
    "tempoRh",
    "custoHoraGestores",
    "horasGestores",
    "infraestrutura",
    "tempoInfra",
    "onboardingDireto",
    "custoHoraNovo",
    "horasOnboarding",
    "anuncios",
    "agencias",
    "ferramentas",
    "testes",
    "relocacao",
  ];

  if (numericFields.includes(current)) {
    const value = parseNumber(text);
    if (value === null) {
      return {
        session,
        currentField: current,
        nextField: current,
        completed: false,
        finished: false,
        reply: `Não consegui entender o valor. ${questionFor(current)}`,
      };
    }

    const updated = { ...session, [current]: value };
    const next = nextField(current);
    if (!next) {
      return {
        session: {
          ...updated,
          status: "completed",
          reportStatus: "generated",
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
      reply: questionFor(next),
    };
  }

  const updated = { ...session, [current]: text };
  const next = nextField(current);
  if (!next) {
    return {
      session: {
        ...updated,
        status: "completed",
        reportStatus: "generated",
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
    reply: questionFor(next),
  };
}
