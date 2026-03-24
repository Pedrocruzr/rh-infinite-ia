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

function brMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
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

function confirmation(current: CustoContratacaoField, session: CustoContratacaoSession) {
  switch (current) {
    case "periodo":
      return `Perfeito. 

Período de análise definido: ${session.periodo}

Esse recorte é importante porque garante que todos os custos e contratações estejam alinhados no mesmo intervalo, evitando distorções no cálculo do CpH.`;
    case "setor":
      return `Perfeito. 

Setor da empresa: ${session.setor}

Esse setor influencia diretamente o benchmark de custo por contratação e a interpretação final do resultado.`;
    case "contratacoes":
      return `Perfeito. 

Número de contratações no período: ${session.contratacoes}

Esse número será o divisor do cálculo final, então é essencial para entendermos o custo médio por contratação.`;
    case "horasOnboarding":
      if (
        typeof session.custoHoraNovo === "number" &&
        typeof session.horasOnboarding === "number"
      ) {
        const custoPessoa = session.custoHoraNovo * session.horasOnboarding;
        const total = custoPessoa * Number(session.contratacoes ?? 0);
        return `Perfeito, você confirmou o dado base. 

Duração do onboarding por pessoa: ${session.horasOnboarding} horas

Com custo/hora de ${brMoney(session.custoHoraNovo)}, isso representa:
${brMoney(custoPessoa)} por pessoa

E com ${session.contratacoes ?? 0} contratações:
${brMoney(custoPessoa)} × ${session.contratacoes ?? 0} = ${brMoney(total)}`;
      }
      return `Perfeito. `;
    default:
      const value = (session as any)[current];
      return `Perfeito. 

Valor considerado: ${typeof value === "number" ? value : String(value ?? "")}`;
  }
}

export function questionFor(field: CustoContratacaoField, session: CustoContratacaoSession) {
  switch (field) {
    case "periodo":
      return `Vamos iniciar a análise de forma estruturada.

Etapa 1: Período de Análise

Para começarmos, preciso definir o recorte temporal da análise, pois todos os custos e contratações serão considerados dentro desse período.

Pergunta:
Qual período de análise vamos calcular?

Exemplos:

"Janeiro a Março de 2026" (análise trimestral)
"Ano de 2024" (análise anual)
"T3/2025" (terceiro trimestre de 2025)

Por favor, me informe o período.`;
    case "setor":
      return `${confirmation("periodo", session)}

Etapa 2: Setor da Empresa

Agora preciso entender o contexto do seu negócio, pois o setor influencia diretamente o benchmark de custo por contratação.

Pergunta:
Qual é o setor principal da sua empresa?

Exemplos:

Tecnologia (ex: empresa de software, startup SaaS)
Varejo (ex: lojas físicas ou e-commerce)
Saúde (ex: hospitais, clínicas)
Indústria (ex: manufatura, produção)
Serviços (ex: consultorias, marketing)

Qual é o setor da sua empresa?`;
    case "contratacoes":
      return `${confirmation("setor", session)}

Etapa 3: Número de Contratações

Agora precisamos do divisor da nossa fórmula, que é fundamental para calcular o CpH:

Fórmula:
(Custos Internos + Custos Externos) ÷ Número de Contratações

Pergunta:
Quantas contratações foram feitas dentro desse período (${session.periodo})?

Exemplos:

"10 contratações"
"25 contratações"
"5 contratações"

Quantas pessoas foram contratadas nesse período?`;
    case "salariosRh":
      return `${confirmation("contratacoes", session)}

Etapa 4a: Custo da Equipe de Recrutamento (RH/TA) — Salários

Agora começamos a parte mais importante: Custos Internos.

Primeiro, vamos calcular o custo base da equipe de recrutamento.

Pergunta:
Qual foi o valor total dos salários brutos da sua equipe de recrutamento (RH/TA) pagos dentro do período?

Exemplo detalhado:
Se você tem 2 recrutadores ganhando R$ 5.000 por mês e o período analisado tem 3 meses:

R$ 5.000 × 2 × 3 = R$ 30.000

Qual valor vamos considerar?`;
    case "encargosRh":
      return `${confirmation("salariosRh", session)}

Etapa 4a (continuação): Encargos

Agora preciso dos encargos para sabermos o custo real da equipe de recrutamento.

Pergunta:
Qual é o percentual médio de encargos sobre esses salários?

Exemplo detalhado:
Se sua operação usa 35% de encargos:

R$ ${session.salariosRh ?? 0} × 35% = custo adicional proporcional de encargos

Qual percentual vamos usar?`;
    case "beneficiosRh":
      return `${confirmation("encargosRh", session)}

Etapa 4a (continuação): Benefícios

Agora preciso do valor total de benefícios da equipe de recrutamento no período.

Pergunta:
Qual foi o valor total de benefícios (VR, VA, plano de saúde, etc.) pago a essa equipe no período?

Exemplo detalhado:
Se cada pessoa recebe R$ 1.500 por mês, são 2 pessoas e o período tem 3 meses:

R$ 1.500 × 2 × 3 = R$ 9.000

Qual valor vamos considerar?`;
    case "tempoRh":
      return `${confirmation("beneficiosRh", session)}

Etapa 4a (continuação): Tempo dedicado ao recrutamento

Agora preciso saber quanto do tempo dessa equipe foi realmente dedicado aos processos seletivos.

Pergunta:
Qual o percentual de tempo que essa equipe dedicou exclusivamente ao recrutamento?

Exemplo detalhado:
Se a equipe gastou metade do tempo com seleção e metade com outras rotinas de RH:

50%

Qual percentual vamos considerar?`;
    case "custoHoraGestores":
      return `${confirmation("tempoRh", session)}

Etapa 4b: Custo dos Gestores em Entrevistas

Agora vamos calcular o custo dos gestores das áreas que participaram das entrevistas.

Pergunta:
Qual é o custo/hora médio dos gestores que entrevistaram?

Exemplo detalhado:
Se o salário mensal é R$ 8.000, com 35% de encargos, e o gestor trabalha 160h no mês:

(R$ 8.000 × 1,35) ÷ 160h ≈ R$ 67,50/h

Qual valor/hora vamos usar?`;
    case "horasGestores":
      return `${confirmation("custoHoraGestores", session)}

Etapa 4b (continuação): Total de horas dos gestores

Agora preciso do total de horas gastas por todos os gestores em entrevistas no período.

Pergunta:
Qual o número total de horas que todos esses gestores gastaram em entrevistas?

Exemplo detalhado:
Se 10 gestores participaram e cada um gastou 5 horas:

10 × 5h = 50 horas

Quantas horas totais vamos considerar?`;
    case "infraestrutura":
      return `${confirmation("horasGestores", session)}

Etapa 4c: Infraestrutura

Agora vamos considerar a parte proporcional de infraestrutura utilizada pelo RH durante o recrutamento.

Pergunta:
Qual o custo proporcional de infraestrutura (aluguel, TI, licenças, etc.) utilizado pela equipe de RH no período?

Exemplo:
R$ 2.000

Qual valor vamos considerar?`;
    case "tempoInfra":
      return `${confirmation("infraestrutura", session)}

Etapa 4c (continuação): Percentual alocado ao recrutamento

Pergunta:
Desse custo de infraestrutura, qual o percentual alocado ao recrutamento?

Exemplo detalhado:
Se a equipe de RH usa metade da estrutura para seleção:

50%

Qual percentual vamos usar?`;
    case "onboardingDireto":
      return `${confirmation("tempoInfra", session)}

Etapa 4d: Onboarding — custo direto

Agora vamos levantar os custos diretos de onboarding por novo contratado.

Pergunta:
Qual o custo direto do onboarding por novo contratado?

Exemplo detalhado:
Se o custo com materiais, instrutor e plataforma for R$ 300 por pessoa:

R$ 300 por novo contratado

Qual valor vamos considerar?`;
    case "custoHoraNovo":
      return `${confirmation("onboardingDireto", session)}

Etapa 4d (continuação): custo/hora do novo contratado

Pergunta:
Qual é o custo/hora médio de um novo contratado?

Exemplo detalhado:
Se o salário mensal é R$ 2.400 e a jornada mensal é 160h:

R$ 2.400 ÷ 160h = R$ 15/h

Qual valor/hora vamos usar?`;
    case "horasOnboarding":
      return `${confirmation("custoHoraNovo", session)}

Etapa 4d (continuação): duração do onboarding

Agora preciso da quantidade de horas de onboarding obrigatório por novo contratado.

Pergunta:
Quantas horas dura o onboarding obrigatório de cada novo contratado?

Exemplo detalhado:
Se cada pessoa passa por 8 horas de integração:

R$ ${session.custoHoraNovo ?? 15}/h × 8h = ${brMoney((session.custoHoraNovo ?? 15) * 8)} por pessoa

Com ${session.contratacoes ?? 8} contratações, isso daria:
${brMoney((session.custoHoraNovo ?? 15) * 8)} × ${session.contratacoes ?? 8} = ${brMoney(((session.custoHoraNovo ?? 15) * 8) * (session.contratacoes ?? 8))}

Quantas horas de onboarding vamos considerar por pessoa?`;
    case "anuncios":
      return `${confirmation("horasOnboarding", session)}

Etapa 5: Custos Externos — Anúncios

Agora terminamos os custos internos. Vamos para os custos externos, item por item.

Pergunta:
Qual o valor total gasto em anúncios de vagas no período?

Exemplos:
LinkedIn Ads, Gupy, impulsionamento de vagas, etc.

Se não houve gasto, responda: 0`;
    case "agencias":
      return `${confirmation("anuncios", session)}

Etapa 5 (continuação): Agências

Pergunta:
Qual o valor total pago em taxas de agências de recrutamento no período?

Exemplo detalhado:
20% do salário anual de 3 vagas = R$ 18.000

Qual valor vamos considerar?`;
    case "ferramentas":
      return `${confirmation("agencias", session)}

Etapa 5 (continuação): Ferramentas e Softwares

Pergunta:
Qual o custo total com ferramentas e softwares de recrutamento no período?

Exemplo detalhado:
Mensalidade de R$ 500 × 3 meses = R$ 1.500

Qual valor vamos considerar?`;
    case "testes":
      return `${confirmation("ferramentas", session)}

Etapa 5 (continuação): Testes e Avaliações

Pergunta:
Qual o gasto total com testes técnicos e avaliações comportamentais no período?

Exemplo detalhado:
Custo por teste × 100 candidatos = R$ 2.000

Qual valor vamos considerar?`;
    case "relocacao":
      return `${confirmation("testes", session)}

Etapa 5 (continuação): Relocação

Pergunta:
Houve custos de relocação (passagens, ajuda de custo)? Se sim, qual o valor total?

Exemplo:
0 se não houve
R$ 4.000 se houve ajuda de custo e deslocamento

Qual valor vamos considerar?`;
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
      reply: questionFor("periodo", session),
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
        reply: `Não consegui entender o valor informado.

${questionFor(current, session)}`,
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
      reply: questionFor(next, updated),
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
    reply: questionFor(next, updated),
  };
}
