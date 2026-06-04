export type FitCulturalField =
  | "objetivo"
  | "culturaAtual"
  | "valoresDecisoes"
  | "discrepancia"
  | "comportamentosRecompensados"
  | "evolucaoDesejada"
  | "diferenciaisCulturais"
  | "proposito"
  | "sucesso"
  | "comportamentosInaceitaveis"
  | "lideranca";

export type FitCulturalSession = {
  assessmentId?: string;
  objetivo?: string;
  culturaAtual?: string;
  valoresDecisoes?: string;
  discrepancia?: string;
  comportamentosRecompensados?: string;
  evolucaoDesejada?: string;
  diferenciaisCulturais?: string;
  proposito?: string;
  sucesso?: string;
  comportamentosInaceitaveis?: string;
  lideranca?: string;
  historicoConversaFit?: { role: "user" | "assistant"; content: string }[];
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type FlowQuestion = {
  field: FitCulturalField;
  question: string;
  context: string;
};

const FLOW: FlowQuestion[] = [
  {
    field: "objetivo",
    question: "Gostaria de criar do zero ou atualizar o fit cultural da sua empresa?",
    context: "Vou te guiar por uma análise completa de fit cultural. Antes de começar, preciso entender se você quer construir um fit cultural novo ou revisar o que já existe.",
  },
  {
    field: "culturaAtual",
    question: "Como você descreveria a cultura atual da sua organização?",
    context: "Cultura organizacional é o conjunto de valores, crenças e comportamentos que definem como as pessoas agem no dia a dia. Quero entender como isso se manifesta na sua empresa hoje — pode ser o ritmo de trabalho, a forma de tomar decisões, o relacionamento entre as pessoas etc.",
  },
  {
    field: "valoresDecisoes",
    question: "Quais são os três principais valores que guiam as decisões na empresa?",
    context: "Valores organizacionais são princípios que orientam como a empresa age quando precisa escolher entre caminhos diferentes. Por exemplo: integridade, foco no cliente, inovação.",
  },
  {
    field: "discrepancia",
    question: "Existe alguma discrepância entre a cultura declarada e a praticada? Se sim, qual?",
    context: "Muitas empresas têm valores escritos no site, mas na prática o dia a dia funciona de forma diferente. Quero saber se isso acontece na sua organização — e se sim, onde essa diferença aparece mais. Se não houver, pode responder 'não'.",
  },
  {
    field: "comportamentosRecompensados",
    question: "Quais comportamentos são recompensados na sua organização?",
    context: "O que uma empresa recompensa (promoções, reconhecimento, bônus) revela muito sobre sua cultura real. Pense em quais atitudes levam as pessoas a serem elogiadas ou promovidas na sua empresa.",
  },
  {
    field: "evolucaoDesejada",
    question: "Como você gostaria que a cultura evoluísse nos próximos anos?",
    context: "Toda cultura pode amadurecer. Quero entender para onde você quer levar a empresa: o que precisa mudar, o que precisa ser fortalecido ou o que ainda está faltando construir.",
  },
  {
    field: "diferenciaisCulturais",
    question: "O que diferencia sua empresa dos concorrentes em termos culturais?",
    context: "Além de produto ou preço, a cultura pode ser um diferencial competitivo real. Quero entender o que torna o ambiente e as pessoas da sua empresa únicos em relação ao mercado.",
  },
  {
    field: "proposito",
    question: "Qual é o propósito fundamental da sua organização?",
    context: "Propósito é o 'por que existimos' além de gerar lucro — o impacto que a empresa quer ter no mundo, nos clientes ou na sociedade. Pode ser uma frase curta ou uma ideia central.",
  },
  {
    field: "sucesso",
    question: "Como você definiria sucesso para sua empresa além dos resultados financeiros?",
    context: "Empresas com cultura forte definem sucesso de forma mais ampla: clima organizacional, retenção de talentos, impacto social, satisfação dos clientes. O que mais importa além dos números?",
  },
  {
    field: "comportamentosInaceitaveis",
    question: "Quais comportamentos são inaceitáveis na sua cultura?",
    context: "Os limites culturais dizem tanto quanto os valores positivos. O que uma empresa não tolera revela o que ela realmente preza — pode ser falta de respeito, falta de comprometimento, desonestidade etc.",
  },
  {
    field: "lideranca",
    question: "Como a liderança exemplifica os valores da empresa?",
    context: "A liderança é o principal espelho da cultura. Quero entender se os líderes vivem os valores na prática — nas decisões, no dia a dia e no relacionamento com as equipes.",
  },
];

function normalizeText(value: string) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeForComparison(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanToken(token: string) {
  return token.replace(/[^a-zA-ZÀ-ÿ0-9-]/g, "");
}

function hasVowel(token: string) {
  return /[aeiouáàâãéêíóôõúü]/i.test(token);
}

function isShortValidAnswer(text: string) {
  const n = normalizeForComparison(text.trim());
  return ["ok", "sim", "não", "nao", "criar", "atualizar", "revisar", "ajustar"].includes(n);
}

function detectObjetivoIntent(text: string): "criar" | "atualizar" | null {
  const n = normalizeForComparison(text);

  const criarKeywords = [
    "criar", "criar do zero", "do zero", "novo", "nova", "montar", "construir",
    "começar", "comecar", "estruturar", "desenvolver", "fazer do zero",
    "criar agora", "quero criar", "vamos criar", "preciso criar",
  ];
  const atualizarKeywords = [
    "atualizar", "revisar", "ajustar", "editar", "modificar", "melhorar",
    "refinar", "atualiza", "revisa", "quero atualizar", "preciso atualizar",
    "quero revisar", "preciso revisar",
  ];

  if (criarKeywords.some((k) => n.includes(k))) return "criar";
  if (atualizarKeywords.some((k) => n.includes(k))) return "atualizar";

  return null;
}

function isConfusedOrAsking(text: string): boolean {
  const trimmed = text.trim();
  const n = normalizeForComparison(trimmed);

  if (trimmed.endsWith("?") && trimmed.split(/\s+/).length <= 8) return true;

  const confusionPatterns = [
    "em qual sentido",
    "o que voce quer dizer",
    "nao entendi",
    "pode explicar",
    "como assim",
    "nao compreendi",
    "nao sei",
    "nao entendo",
    "o que isso significa",
    "pode detalhar",
    "o que e isso",
    "o que significa",
    "me explica",
    "pode me explicar",
    "explica melhor",
    "nao estou entendendo",
    "nao to entendendo",
    "qual sentido",
    "que sentido",
  ];

  return confusionPatterns.some((p) => n.includes(p));
}

function looksLikeNoise(token: string) {
  const clean = cleanToken(token).toLowerCase();
  if (!clean) return true;
  if (clean.length <= 2) return true;
  if (!hasVowel(clean)) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(clean)) return true;
  if (/^(.)\1{2,}$/.test(clean)) return true;
  return false;
}

function looksComprehensibleWord(token: string) {
  const clean = cleanToken(token);
  if (!clean) return false;
  if (isShortValidAnswer(clean)) return true;
  if (looksLikeNoise(clean)) return false;
  if (clean.length < 4) return false;
  if (!hasVowel(clean)) return false;
  return true;
}

function countComprehensibleWords(value: string) {
  const tokens = normalizeText(value)
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean);
  return tokens.filter(looksComprehensibleWord).length;
}

function looksStructuredAnswer(value: string) {
  const text = normalizeText(value);
  return /[,;\n]/.test(text) || /\d+\./.test(text) || / e /i.test(text);
}

function formatQuestion(item: FlowQuestion, includeContext = true): string {
  if (includeContext) {
    return `${item.context}\n\n${item.question}`;
  }
  return item.question;
}

function validateAnswer(field: FitCulturalField, value: string): string | null {
  const text = normalizeText(value);

  if (field === "objetivo") {
    return null;
  }

  if (!text) {
    return "Sua resposta ficou vazia. Pode digitar algo para continuar?";
  }

  if (isShortValidAnswer(text)) return null;

  const comprehensibleWords = countComprehensibleWords(text);

  if (comprehensibleWords === 0) {
    return "Não consegui entender sua resposta. Pode escrever de forma mais clara?";
  }

  if (comprehensibleWords < 2 && !looksStructuredAnswer(text)) {
    return "Sua resposta ficou muito curta. Pode detalhar um pouco mais?";
  }

  return null;
}

export function initializeFitCulturalSession(): FitCulturalSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export function getNextFitCulturalQuestion(
  session: FitCulturalSession
): FlowQuestion | null {
  for (const item of FLOW) {
    const value = session[item.field];
    if (!value || !value.trim()) {
      return item;
    }
  }
  return null;
}

export function updateFitCulturalSession(
  session: FitCulturalSession,
  field: FitCulturalField,
  value: string
): FitCulturalSession {
  return {
    ...session,
    [field]: normalizeText(value),
  };
}

export function isFitCulturalReady(session: FitCulturalSession): boolean {
  return getNextFitCulturalQuestion(session) === null;
}

async function conversarComOpenAIFit(
  perguntaUsuario: string,
  campoAtual: FitCulturalField,
  historico: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const current = FLOW.find((item) => item.field === campoAtual);
  const contextoPergunta = current
    ? `A pergunta atual que o usuário está respondendo é: "${current.question}" (Contexto: "${current.context}").`
    : "";

  if (!apiKey) {
    return `Entendi sua dúvida sobre fit cultural! No entanto, a integração com a inteligência artificial não está configurada no momento. Para te ajudar com essa pergunta: ${current?.context ?? ""}\n\nConsegui ajudar? Quando estiver pronto, pode digitar sua resposta para a pergunta: "${current?.question ?? ""}"`;
  }

  try {
    const messages = [
      {
        role: "system",
        content: `Você é o Analista de Fit Cultural. Seu objetivo é ajudar o usuário a tirar dúvidas sobre fit cultural organizacional, conceitos de cultura, e como montar ou aplicar o fit cultural na empresa.
Seja conciso, direto, cordial e não use formatação em negrito (**).
${contextoPergunta}
Sempre encerre a sua resposta de forma simpática, lembrando-o de que, quando se sentir confortável e sem dúvidas, ele pode responder à pergunta principal do passo atual: "${current?.question ?? ""}".`
      },
      ...historico,
      { role: "user", content: perguntaUsuario }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error("Erro na resposta da OpenAI");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    return content.replaceAll("**", "").trim();
  } catch (error) {
    console.error("Erro ao chamar OpenAI (Fit Cultural):", error);
    return `Entendi sua dúvida! No entanto, tive uma falha ao me conectar com o serviço. Para te ajudar com essa pergunta: ${current?.context ?? ""}\n\nConsegui ajudar? Quando estiver pronto, pode digitar sua resposta para a pergunta: "${current?.question ?? ""}"`;
  }
}

async function analisarMensagemUsuarioFit(
  perguntaUsuario: string,
  campoAtual: FitCulturalField,
  historico: { role: "user" | "assistant"; content: string }[]
): Promise<{ isDoubt: boolean; reply: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const current = FLOW.find((item) => item.field === campoAtual);
  if (!current) {
    return { isDoubt: false, reply: "" };
  }

  if (!apiKey) {
    const confused = isConfusedOrAsking(perguntaUsuario);
    if (confused) {
      return {
        isDoubt: true,
        reply: `Sem problema, deixa eu explicar melhor!\n\n${current.context}\n\n${current.question}`
      };
    }
    return { isDoubt: false, reply: "" };
  }

  try {
    const messages = [
      {
        role: "system",
        content: `Você é o Analista de Fit Cultural. O usuário está na etapa da pergunta: "${current.question}" (Contexto: "${current.context}").
Analise a mensagem enviada pelo usuário.

Se o usuário estiver:
- Fazendo uma pergunta ou tirando dúvidas sobre fit cultural organizacional, conceitos de cultura, ou como montar e aplicar.
- Demonstrando dúvida, confusão ou dizendo que não entendeu a pergunta atual (ex: "como assim?", "não entendi", "o que é isso?").
- Reclamando ou indicando que algo deu errado na conversa ou que o bot se equivocou (ex: "não foi isso", "voltar", "está errado", "não era isso").
- Dizendo que já tem um relatório, material ou questionário pronto (ex: "já tenho aqui", "já tenho o relatório") e quer saber o que fazer.
- Digitando algo irrelevante ou tentando puxar assunto que não responda à pergunta.

Então, responda de forma cordial, inteligente e concisa para ajudá-lo, tirando suas dúvidas. Nunca use formatação em negrito (**). Sempre encerre lembrando-o simpaticamente de que, assim que estiver pronto e sem dúvidas, ele pode responder à pergunta: "${current.question}".

Se o usuário estiver respondendo de fato à pergunta com dados reais e válidos para a pergunta "${current.question}" (mesmo que seja uma resposta curta como "não temos" ou descrevendo sua cultura/valores), responda estritamente apenas com a palavra: PASS`
      },
      ...historico,
      { role: "user", content: perguntaUsuario }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      throw new Error("Erro na chamada da OpenAI");
    }

    const data = await response.json();
    const content = (data.choices?.[0]?.message?.content ?? "").trim();
    
    if (content.toUpperCase() === "PASS" || content.toUpperCase().startsWith("PASS")) {
      return { isDoubt: false, reply: "" };
    }

    return { isDoubt: true, reply: content.replaceAll("**", "") };
  } catch (error) {
    console.error("Erro na análise da OpenAI:", error);
    return { isDoubt: false, reply: "" };
  }
}

export async function runFitCulturalStep(
  session: FitCulturalSession,
  answer?: string,
  currentField?: FitCulturalField | string
) {
  if (!currentField) {
    const next = getNextFitCulturalQuestion(session);
    return {
      session,
      completed: false,
      currentField: next?.field ?? null,
      nextField: next?.field ?? null,
      question: next?.question ?? null,
      reply: next ? formatQuestion(next) : null,
    };
  }

  const raw = normalizeText(answer ?? "");
  const wordCount = raw.split(/\s+/).filter(Boolean).length;
  const detectedIntent = detectObjetivoIntent(raw);

  // Dynamic path switching for short inputs
  if (detectedIntent && wordCount < 8 && currentField !== "objetivo") {
    const updated: FitCulturalSession = {
      ...session,
      objetivo: detectedIntent === "criar" ? "Criar do zero" : "Atualizar o existente",
      culturaAtual: undefined,
      valoresDecisoes: undefined,
      discrepancia: undefined,
      comportamentosRecompensados: undefined,
      evolucaoDesejada: undefined,
      diferenciaisCulturais: undefined,
      proposito: undefined,
      sucesso: undefined,
      comportamentosInaceitaveis: undefined,
      lideranca: undefined,
      historicoConversaFit: undefined,
    };

    const next = FLOW[1];
    const q = formatQuestion(next);
    return {
      session: updated,
      completed: false,
      currentField: next.field,
      nextField: next.field,
      question: next.question,
      reply: q,
    };
  }

  const current = FLOW.find((item) => item.field === currentField);

  // Intelligent conversational doubts and complaints analysis using OpenAI
  const analise = await analisarMensagemUsuarioFit(raw, currentField as FitCulturalField, session.historicoConversaFit ?? []);

  if (analise.isDoubt) {
    const novoHistorico = [
      ...(session.historicoConversaFit ?? []),
      { role: "user" as const, content: raw },
      { role: "assistant" as const, content: analise.reply }
    ];

    return {
      session: {
        ...session,
        historicoConversaFit: novoHistorico,
      },
      completed: false,
      currentField,
      nextField: currentField,
      question: current?.question ?? null,
      reply: analise.reply,
    };
  }

  if (currentField === "objetivo") {
    const intent = detectObjetivoIntent(raw);

    if (!intent) {
      const historicoAtual = session.historicoConversaFit ?? [];
      const respostaIA = await conversarComOpenAIFit(raw, "objetivo", historicoAtual);
      const novoHistorico = [
        ...historicoAtual,
        { role: "user" as const, content: raw },
        { role: "assistant" as const, content: respostaIA }
      ];

      return {
        session: {
          ...session,
          historicoConversaFit: novoHistorico,
        },
        completed: false,
        currentField: "objetivo" as FitCulturalField,
        nextField: "objetivo" as FitCulturalField,
        question: FLOW[0].question,
        reply: respostaIA,
      };
    }
  }

  const error = validateAnswer(currentField as FitCulturalField, raw);

  if (error) {
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: current?.question ?? null,
      reply: error,
    };
  }

  const updated = updateFitCulturalSession(
    session,
    currentField as FitCulturalField,
    raw
  );

  const next = getNextFitCulturalQuestion(updated);
  const completed = isFitCulturalReady(updated);

  return {
    session: {
      ...updated,
      status: completed ? "completed" : "in_progress",
      reportStatus: completed ? "generated" : "pending",
    },
    completed,
    currentField: next?.field ?? null,
    nextField: next?.field ?? null,
    question: next?.question ?? null,
    reply: completed ? null : next ? formatQuestion(next) : null,
  };
}
