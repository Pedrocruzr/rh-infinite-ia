export type ProdutividadeColaboradorField =
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

export type ProdutividadeColaboradorSession = {
  nomeColaborador?: string;
  cargo?: string;
  setor?: string;
  periodo?: string;
  tipoIndicador?: string;
  unidadeIndicador?: string;
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

export function initializeProdutividadeColaboradorSession(): ProdutividadeColaboradorSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
    reportMarkdown: null,
  };
}

function normalize(text: unknown) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(text: string) {
  return text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

function inferUnit(indicador: string) {
  const i = normalize(indicador).toLowerCase();

  if (i.includes("atendimento")) return "atendimentos";
  if (i.includes("venda")) return "vendas";
  if (i.includes("process")) return "processos";
  if (i.includes("tarefa")) return "tarefas";
  if (i.includes("document")) return "documentos";
  if (i.includes("receita")) return "receita";
  if (i.includes("lead")) return "leads";
  return "entregas";
}

function nextField(current: ProdutividadeColaboradorField): ProdutividadeColaboradorField | null {
  const order: ProdutividadeColaboradorField[] = [
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

function ask(field: ProdutividadeColaboradorField, session: ProdutividadeColaboradorSession) {
  const unidade = session.unidadeIndicador ?? inferUnit(session.tipoIndicador ?? "");

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
Assistente administrativo
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
Janeiro a março de 2026`;
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

Etapa 7: volume realizado

Pergunta:
Quantas ${unidade} o colaborador realizou no período?

Exemplos:
300 ${unidade}
45 ${unidade}
80 ${unidade}`;
    case "receitaGerada":
      return `Perfeito.

Confirmação da resposta anterior:
Volume realizado: ${session.entregas ?? "Não informado"} ${unidade}

Etapa 8: receita gerada

Pergunta:
Houve receita diretamente atribuída ao colaborador? Se sim, qual foi o valor?

Exemplos:
0
não
45000
120000

Se não houver receita direta, responda "não" ou "0".`;
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
350 ${unidade}
40 vendas
70 processos

Se você informar apenas um número, vou considerar a mesma unidade do indicador principal: ${unidade}.`;
    case "observacoes":
      return `Perfeito.

Confirmação da resposta anterior:
Meta esperada: ${session.metaEsperada ?? "Não informado"} ${unidade}

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

export function runProdutividadeColaboradorStep(
  session: ProdutividadeColaboradorSession,
  answer?: string,
  currentField?: ProdutividadeColaboradorField | string | null
) {
  const current = (currentField ?? "nomeColaborador") as ProdutividadeColaboradorField;
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

  if (current === "tipoIndicador") {
    const updated = {
      ...session,
      tipoIndicador: text,
      unidadeIndicador: inferUnit(text),
    };
    return {
      session: updated,
      currentField: "horasTrabalhadas" as const,
      nextField: "horasTrabalhadas" as const,
      completed: false,
      finished: false,
      reply: ask("horasTrabalhadas", updated),
    };
  }

  if (current === "receitaGerada") {
    const low = text.toLowerCase();
    const value = low === "nao" || low === "não" ? 0 : parseNumber(text);
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

    const updated = { ...session, receitaGerada: value };
    return {
      session: updated,
      currentField: "custoColaborador" as const,
      nextField: "custoColaborador" as const,
      completed: false,
      finished: false,
      reply: ask("custoColaborador", updated),
    };
  }

  const numericFields: ProdutividadeColaboradorField[] = [
    "horasTrabalhadas",
    "entregas",
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

  const updated = {
    ...session,
    [current]:
      current === "nomeColaborador" || current === "cargo" || current === "setor"
        ? titleCase(text)
        : text,
  };

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
