export type ProdutividadeField =
  | "nomeColaborador"
  | "cargo"
  | "setor"
  | "periodo"
  | "tipoIndicador"
  | "horasTrabalhadas"
  | "entregas"
  | "receitaGerada"
  | "custoColaborador"
  | "metaEsperada"
  | "observacoes";

export type ProdutividadeSession = {
  nomeColaborador?: string;
  cargo?: string;
  setor?: string;
  periodo?: string;
  tipoIndicador?: string;
  horasTrabalhadas?: number;
  entregas?: number;
  receitaGerada?: number;
  custoColaborador?: number;
  metaEsperada?: number;
  observacoes?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
  reportMarkdown?: string | null;
};

export function initializeProdutividadeSession(): ProdutividadeSession {
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
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  return Number(match[0]);
}

function nextField(current: ProdutividadeField): ProdutividadeField | null {
  const order: ProdutividadeField[] = [
    "nomeColaborador",
    "cargo",
    "setor",
    "periodo",
    "tipoIndicador",
    "horasTrabalhadas",
    "entregas",
    "receitaGerada",
    "custoColaborador",
    "metaEsperada",
    "observacoes",
  ];

  const idx = order.indexOf(current);
  if (idx === -1 || idx === order.length - 1) return null;
  return order[idx + 1];
}

function ask(field: ProdutividadeField, session: ProdutividadeSession) {
  switch (field) {
    case "nomeColaborador":
      return `Vamos começar.

Etapa 1: identificação do colaborador

Pergunta:
Qual é o nome do colaborador que será analisado?

Exemplo:
Pedro Neto`;
    case "cargo":
      return `Perfeito.

Confirmação da resposta anterior:
Nome do colaborador: ${session.nomeColaborador ?? "Não informado"}

Etapa 2: cargo

Pergunta:
Qual é o cargo desse colaborador?

Exemplos:
Recepcionista
Vendedor
Assistente Administrativo
Analista de RH`;
    case "setor":
      return `Perfeito.

Confirmação da resposta anterior:
Cargo: ${session.cargo ?? "Não informado"}

Etapa 3: setor

Pergunta:
Em qual setor esse colaborador atua?

Exemplos:
Comercial
Administrativo
RH
Atendimento
Operações`;
    case "periodo":
      return `Perfeito.

Confirmação da resposta anterior:
Setor: ${session.setor ?? "Não informado"}

Etapa 4: período de análise

Pergunta:
Qual período vamos analisar?

Exemplos:
Janeiro de 2026
1ª quinzena de março
Janeiro a Março de 2026`;
    case "tipoIndicador":
      return `Perfeito.

Confirmação da resposta anterior:
Período: ${session.periodo ?? "Não informado"}

Etapa 5: tipo de indicador

Pergunta:
Qual indicador principal será usado para medir a produtividade?

Exemplos:
Quantidade de atendimentos
Quantidade de vendas
Quantidade de processos finalizados
Receita gerada`;
    case "horasTrabalhadas":
      return `Perfeito.

Confirmação da resposta anterior:
Indicador principal: ${session.tipoIndicador ?? "Não informado"}

Etapa 6: horas trabalhadas

Pergunta:
Quantas horas trabalhadas vamos considerar no período?

Exemplo detalhado:
Se o colaborador trabalhou 8 horas por dia durante 20 dias:
8 × 20 = 160 horas

Quantas horas vamos considerar?`;
    case "entregas":
      return `Perfeito.

Confirmação da resposta anterior:
Horas trabalhadas: ${session.horasTrabalhadas ?? "Não informado"}

Etapa 7: entregas realizadas

Pergunta:
Quantas entregas o colaborador realizou no período?

Exemplos:
320 atendimentos
45 vendas
80 processos concluídos`;
    case "receitaGerada":
      return `Perfeito.

Confirmação da resposta anterior:
Entregas realizadas: ${session.entregas ?? "Não informado"}

Etapa 8: receita gerada

Pergunta:
Houve receita diretamente atribuída ao colaborador? Se sim, qual foi o valor?

Exemplos:
0
45000
120000`;
    case "custoColaborador":
      return `Perfeito.

Confirmação da resposta anterior:
Receita gerada: ${session.receitaGerada ?? "Não informado"}

Etapa 9: custo do colaborador

Pergunta:
Qual foi o custo total do colaborador no período?

Exemplo detalhado:
Salário + encargos + benefícios

Exemplo:
3500
5200
7800`;
    case "metaEsperada":
      return `Perfeito.

Confirmação da resposta anterior:
Custo do colaborador: ${session.custoColaborador ?? "Não informado"}

Etapa 10: meta esperada

Pergunta:
Qual era a meta de produtividade esperada para esse colaborador no período?

Exemplos:
300 atendimentos
40 vendas
70 processos`;
    case "observacoes":
      return `Perfeito.

Confirmação da resposta anterior:
Meta esperada: ${session.metaEsperada ?? "Não informado"}

Etapa 11: contexto e observações

Pergunta:
Existe algum contexto importante que pode impactar a produtividade?

Exemplos:
Novo na função
Falta de sistema
Sobrecarga da equipe
Treinamento em andamento
Sem observações`;
    default:
      return `Informe o dado solicitado.`;
  }
}

export function runProdutividadeStep(
  session: ProdutividadeSession,
  answer?: string,
  currentField?: ProdutividadeField | string | null
) {
  const current = (currentField ?? "nomeColaborador") as ProdutividadeField;
  const text = normalize(answer);

  if (!answer && current === "nomeColaborador") {
    return {
      session,
      currentField: "nomeColaborador" as const,
      nextField: "nomeColaborador" as const,
      completed: false,
      finished: false,
      reply: ask("nomeColaborador", session),
    };
  }

  const numericFields: ProdutividadeField[] = [
    "horasTrabalhadas",
    "entregas",
    "receitaGerada",
    "custoColaborador",
    "metaEsperada",
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

${ask(current, session)}`,
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
      reply: ask(next, updated),
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
    reply: ask(next, updated),
  };
}
