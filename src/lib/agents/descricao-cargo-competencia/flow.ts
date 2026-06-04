export type DescricaoCargoField = string;

export type ResponsibilityItem = {
  atividade: string;
  oQue?: string;
  como?: string;
  paraQue?: string;
  quando?: string;
};

export type DescricaoCargoSession = {
  assessmentId?: string;
  tituloCargo?: string;
  area?: string;
  nivelHierarquico?: string;
  reportaSeA?: string;
  interacoesPrincipais?: string;

  temAtividadesMapeadas?: string;
  atividadesCargo?: string;
  atividadesOrigem?: "usuario" | "sugestao";

  responsabilidades?: ResponsibilityItem[];

  competenciasOrganizacionais?: string;
  conhecimentosTecnicos?: string;
  habilidadesTecnicas?: string;
  competenciasComportamentais?: string;

  escolaridadeMinima?: string;
  formacaoDesejavel?: string;
  experienciaDesejavel?: string;
  conhecimentosDesejaveis?: string;

  observacoes?: string;

  historicoConversaDescricao?: { role: "user" | "assistant"; content: string }[];
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

function hasVowel(token: string) {
  return /[aeiouáàâãéêíóôõúü]/i.test(token);
}

function isComprehensible(value: string) {
  const text = String(value ?? "").trim();
  if (!text) return false;

  const tokens = text
    .split(/\s+/)
    .map((t) => t.replace(/[^a-zA-ZÀ-ÿ0-9-]/g, ""))
    .filter(Boolean);

  if (tokens.length === 0) return false;

  const validTokens = tokens.filter((token) => {
    if (token.length <= 2) return true;
    if (/\d/.test(token)) return true;
    return hasVowel(token);
  });

  return validTokens.length / tokens.length >= 0.6;
}

function looksStructuredList(value: string) {
  return /[\n,;•\-]/.test(value) || /\d+\./.test(value);
}

function normalizeLine(value: string) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function splitList(text?: string) {
  return String(text ?? "")
    .split(/\n|;|,/)
    .map((item) => item.replace(/^\d+[\).\-\s]*/, "").trim())
    .filter(Boolean)
    .map(normalizeLine);
}

function unique(items: string[]) {
  return [...new Set(items)];
}

function isYes(value: string) {
  const text = String(value ?? "").trim().toLowerCase();
  return ["sim", "s", "tenho", "já tenho", "ja tenho", "possuo"].includes(text);
}

function isNo(value: string) {
  const text = String(value ?? "").trim().toLowerCase();
  return ["não", "nao", "n", "não tenho", "nao tenho"].includes(text);
}

function isValidationLike(value: string) {
  const text = String(value ?? "").trim().toLowerCase();
  return ["ok", "sim", "validado", "pode seguir", "seguir", "pode continuar", "certo"].includes(text);
}

function suggestActivitiesByCargo(cargo?: string) {
  const lower = String(cargo ?? "").toLowerCase();

  if (/assistente administrativo|auxiliar administrativo|administrativ/.test(lower)) {
    return [
      "Controlar rotinas administrativas e financeiras básicas",
      "Organizar documentos, cadastros e informações do setor",
      "Elaborar e atualizar planilhas, controles e relatórios",
      "Apoiar atendimento administrativo a clientes, fornecedores e áreas internas",
      "Dar suporte às demandas operacionais e ao funcionamento da rotina administrativa"
    ];
  }

  if (/recepcion/.test(lower)) {
    return [
      "Recepcionar e direcionar clientes, visitantes e fornecedores",
      "Atender ligações, registrar e encaminhar recados",
      "Organizar agenda, compromissos e fluxo de atendimento",
      "Controlar informações de entrada, saída e apoio administrativo da recepção"
    ];
  }

  if (/rh|recursos humanos|dp|departamento pessoal/.test(lower)) {
    return [
      "Apoiar processos de recrutamento e seleção",
      "Organizar documentos admissionais, cadastrais e trabalhistas",
      "Atualizar controles, planilhas e indicadores de RH",
      "Prestar suporte administrativo a colaboradores e gestores"
    ];
  }

  return [
    `Executar as rotinas principais do cargo de ${cargo ?? "forma estruturada"}`,
    "Organizar documentos, informações e controles da função",
    "Acompanhar demandas, prazos e entregas relacionadas ao cargo",
    "Apoiar o funcionamento da rotina operacional e administrativa"
  ];
}

function inferComo(atividade: string) {
  const lower = atividade.toLowerCase();

  if (/conta|financeir|lança|receber|pagar|confer/.test(lower)) {
    return "Utilizando planilhas, sistemas, documentos físicos e digitais, seguindo padrões internos, conferências e prazos definidos pela empresa.";
  }

  if (/document|arquivo|cadastro|registro/.test(lower)) {
    return "Por meio de organização, atualização, arquivamento, conferência e padronização de documentos e informações em meio físico e digital.";
  }

  if (/planilha|controle|relatório|relatorio|indicador/.test(lower)) {
    return "Alimentando planilhas, controles, sistemas e relatórios com regularidade, precisão e atualização contínua.";
  }

  if (/atendimento|cliente|fornecedor|interna|interno|telefone|recado|recepc/.test(lower)) {
    return "Realizando atendimento, registro, encaminhamento e acompanhamento das demandas com clareza, cordialidade e organização.";
  }

  if (/suporte|apoio|rotina|operacion/.test(lower)) {
    return "Apoiando a execução da rotina por meio de acompanhamento de demandas, organização de informações e suporte às áreas envolvidas.";
  }

  return "Executando a atividade com organização, conferência, método e aderência aos processos e prazos da empresa.";
}

function inferParaQue(atividade: string) {
  const lower = atividade.toLowerCase();

  if (/conta|financeir|receber|pagar|confer/.test(lower)) {
    return "Garantir organização, rastreabilidade e confiabilidade das informações administrativas e financeiras.";
  }

  if (/document|arquivo|cadastro|registro/.test(lower)) {
    return "Assegurar acesso rápido, padronização, segurança e consistência das informações do setor.";
  }

  if (/planilha|controle|relatório|relatorio|indicador/.test(lower)) {
    return "Gerar visibilidade, apoio à gestão e acompanhamento consistente da rotina e das entregas.";
  }

  if (/atendimento|cliente|fornecedor|telefone|recado|recepc/.test(lower)) {
    return "Melhorar o fluxo de comunicação, o atendimento e a continuidade das demandas internas e externas.";
  }

  if (/suporte|apoio|rotina|operacion/.test(lower)) {
    return "Sustentar o funcionamento da operação com fluidez, organização e continuidade.";
  }

  return "Contribuir para a eficiência, organização e confiabilidade da execução do cargo.";
}

function inferQuando(atividade: string) {
  const lower = atividade.toLowerCase();

  if (/fechamento|mensal|relatório mensal|relatorio mensal/.test(lower)) {
    return "Diariamente, semanalmente e conforme calendário mensal, fechamentos e demandas do setor.";
  }

  if (/atendimento|telefone|cliente|fornecedor|recepc/.test(lower)) {
    return "Diariamente e sempre que houver demanda de atendimento, contato ou encaminhamento.";
  }

  if (/document|arquivo|cadastro|registro/.test(lower)) {
    return "Diariamente, semanalmente e sempre que houver atualização, movimentação ou necessidade de consulta.";
  }

  if (/planilha|controle|relatório|relatorio|indicador/.test(lower)) {
    return "Diariamente, semanalmente e conforme a necessidade de atualização, acompanhamento e prestação de informação.";
  }

  return "Diariamente, semanalmente e conforme a rotina, os prazos e as demandas da empresa.";
}

function inferResponsibilityFromActivity(atividade: string): ResponsibilityItem {
  const atividadeNormalizada = normalizeLine(atividade).replace(/[.]$/, "");

  return {
    atividade: atividadeNormalizada,
    oQue: atividadeNormalizada,
    como: inferComo(atividadeNormalizada),
    paraQue: inferParaQue(atividadeNormalizada),
    quando: inferQuando(atividadeNormalizada)
  };
}

function buildResponsibilitiesFromActivities(atividadesTexto?: string): ResponsibilityItem[] {
  return unique(splitList(atividadesTexto)).map(inferResponsibilityFromActivity);
}

function formatResponsibilityPreview(items: ResponsibilityItem[]) {
  return items
    .map((item, index) => {
      return [
        `${index + 1}. ${item.atividade}`,
        `O que: ${item.oQue ?? ""}`,
        `Como: ${item.como ?? ""}`,
        `Para que: ${item.paraQue ?? ""}`,
        `Quando: ${item.quando ?? ""}`
      ].join("\n");
    })
    .join("\n\n");
}

type ParsedAdjustment = {
  index?: number;
  atividade?: string;
  oQue?: string;
  como?: string;
  paraQue?: string;
  quando?: string;
};

function parseAdjustmentBlocks(text: string): ParsedAdjustment[] {
  const blocks = String(text ?? "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const parsed: ParsedAdjustment[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) continue;

    const item: ParsedAdjustment = {};
    const first = lines[0];

    const indexMatch =
      first.match(/^(\d+)[\).\-\s]+(.+)$/i) ||
      first.match(/^responsabilidade\s*(\d+)\s*[:\-]?\s*(.*)$/i);

    if (indexMatch) {
      item.index = Number(indexMatch[1]) - 1;
      if (indexMatch[2]) item.atividade = normalizeLine(indexMatch[2]);
    } else if (
      !/^o que:/i.test(first) &&
      !/^como:/i.test(first) &&
      !/^para que:/i.test(first) &&
      !/^quando:/i.test(first)
    ) {
      item.atividade = normalizeLine(first);
    }

    for (const line of lines) {
      if (/^o que:/i.test(line)) item.oQue = normalizeLine(line.replace(/^o que:/i, ""));
      if (/^como:/i.test(line)) item.como = normalizeLine(line.replace(/^como:/i, ""));
      if (/^para que:/i.test(line)) item.paraQue = normalizeLine(line.replace(/^para que:/i, ""));
      if (/^quando:/i.test(line)) item.quando = normalizeLine(line.replace(/^quando:/i, ""));
    }

    if (item.index !== undefined || item.atividade || item.oQue || item.como || item.paraQue || item.quando) {
      parsed.push(item);
    }
  }

  return parsed;
}

function mergeResponsibilities(base: ResponsibilityItem[], text: string): ResponsibilityItem[] {
  const adjustments = parseAdjustmentBlocks(text);
  if (adjustments.length === 0) return base;

  const merged = [...base];

  adjustments.forEach((adj, position) => {
    const targetIndex =
      adj.index !== undefined
        ? adj.index
        : position < merged.length
        ? position
        : -1;

    if (targetIndex < 0 || targetIndex >= merged.length) return;

    merged[targetIndex] = {
      atividade: adj.atividade ?? merged[targetIndex].atividade,
      oQue: adj.oQue ?? merged[targetIndex].oQue,
      como: adj.como ?? merged[targetIndex].como,
      paraQue: adj.paraQue ?? merged[targetIndex].paraQue,
      quando: adj.quando ?? merged[targetIndex].quando
    };
  });

  return merged;
}

function getQuestion(
  session: DescricaoCargoSession,
  field: DescricaoCargoField
): string {
  switch (field) {
    case "tituloCargo":
      return "Qual é o título do cargo?";
    case "area":
      return `Qual é a área desse cargo${session.tituloCargo ? ` (${session.tituloCargo})` : ""}? Ex.: Administrativo / Apoio à Gestão.`;
    case "nivelHierarquico":
      return "Qual é o nível hierárquico do cargo? Ex.: Operacional, Técnico-administrativo, Tático, Estratégico.";
    case "reportaSeA":
      return "Para quem esse cargo se reporta diretamente?";
    case "interacoesPrincipais":
      return "Quais são as interações principais desse cargo? Ex.: clientes, fornecedores, financeiro, áreas internas, prestadores de serviço.";
    case "temAtividadesMapeadas":
      return "Você já tem mapeadas as atividades principais desse cargo? Se sim, responda 'sim'. Se ainda não tiver, responda 'não' que eu vou sugerir com base no cargo.";
    case "atividadesCargo":
      return `Perfeito. Agora liste as atividades principais do cargo${session.tituloCargo ? ` (${session.tituloCargo})` : ""}. Pode escrever uma por linha ou separadas por vírgula.`;
    case "validacaoAtividadesSugeridas":
      return "Se as atividades sugeridas estiverem corretas, responda 'ok'. Se quiser ajustar, escreva as atividades corrigidas.";
    case "validacaoResponsabilidadesGeradas":
      return [
        "Analisei as atividades e montei automaticamente o quadro O QUE / COMO / PARA QUE / QUANDO.",
        "Se estiver de acordo, responda 'ok'.",
        "Se quiser ajustar, envie somente os blocos que precisam mudar neste modelo:",
        "",
        "1. Nome da atividade",
        "O que: ...",
        "Como: ...",
        "Para que: ...",
        "Quando: ..."
      ].join("\n");
    case "competenciasOrganizacionais":
      return "Agora liste as competências organizacionais esperadas para esse cargo, considerando a cultura da empresa. Pode escrever uma por linha ou separadas por vírgula.";
    case "conhecimentosTecnicos":
      return "Liste os conhecimentos técnicos necessários para esse cargo. Pode escrever uma por linha ou separadas por vírgula.";
    case "habilidadesTecnicas":
      return "Agora liste as habilidades técnicas necessárias para executar esse cargo na prática. Pode escrever uma por linha ou separadas por vírgula.";
    case "competenciasComportamentais":
      return "Agora liste as competências comportamentais mais importantes para esse cargo. Pode escrever uma por linha ou separadas por vírgula.";
    case "escolaridadeMinima":
      return "Qual é a escolaridade mínima exigida para esse cargo?";
    case "formacaoDesejavel":
      return "Qual é a formação desejável para esse cargo?";
    case "experienciaDesejavel":
      return "Qual é a experiência desejável para esse cargo?";
    case "conhecimentosDesejaveis":
      return "Quais conhecimentos desejáveis devem constar na seção de requisitos? Pode escrever uma por linha ou separadas por vírgula.";
    case "observacoes":
      return "Se houver alguma observação complementar importante para enquadramento do cargo, informe agora. Se não houver, responda: não.";
    default:
      return "";
  }
}

function validateField(field: DescricaoCargoField, value: string) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?";
  }

  if (field === "temAtividadesMapeadas") {
    if (!isYes(text) && !isNo(text)) {
      return "Responda apenas com 'sim' se já tiver as atividades mapeadas ou 'não' se quiser que eu sugira.";
    }
    return null;
  }

  if (field === "validacaoAtividadesSugeridas") {
    if (!isValidationLike(text) && !looksStructuredList(text)) {
      return "Se quiser aprovar, responda 'ok'. Se quiser ajustar, escreva as atividades em lista.";
    }
    return null;
  }

  if (field === "validacaoResponsabilidadesGeradas") {
    if (isValidationLike(text)) return null;

    const hasAnyTag =
      /o que:/i.test(text) ||
      /como:/i.test(text) ||
      /para que:/i.test(text) ||
      /quando:/i.test(text);

    if (!hasAnyTag) {
      return [
        "Se estiver de acordo, responda 'ok'.",
        "Se quiser ajustar, envie no modelo:",
        "",
        "1. Nome da atividade",
        "O que: ...",
        "Como: ...",
        "Para que: ...",
        "Quando: ..."
      ].join("\n");
    }

    return null;
  }

  if (!isComprehensible(text)) {
    return "Não consegui entender sua resposta com segurança. Pode escrever novamente de forma mais clara?";
  }

  if (
    [
      "atividadesCargo",
      "competenciasOrganizacionais",
      "conhecimentosTecnicos",
      "habilidadesTecnicas",
      "competenciasComportamentais",
      "conhecimentosDesejaveis"
    ].includes(field) &&
    !looksStructuredList(text)
  ) {
    return "Para estruturar corretamente o relatório, preciso dessa resposta em lista. Pode escrever uma por linha ou separadas por vírgula?";
  }

  return null;
}

function isShortLocalBypass(field: string, text: string): boolean {
  const n = text.trim().toLowerCase();
  if (field === "temAtividadesMapeadas") {
    return isYes(n) || isNo(n);
  }
  if (field === "validacaoAtividadesSugeridas" || field === "validacaoResponsabilidadesGeradas") {
    return isValidationLike(n);
  }
  if (field === "observacoes") {
    return isNo(n) || n === "não" || n === "nao";
  }
  return false;
}

function normalizeForComparison(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

async function conversarComOpenAIDescricao(
  perguntaUsuario: string,
  campoAtual: DescricaoCargoField,
  session: DescricaoCargoSession
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const questionText = getQuestion(session, campoAtual);
  const contextoPergunta = `A pergunta atual que o usuário está respondendo é: "${questionText}".`;
  const historico = session.historicoConversaDescricao ?? [];

  if (!apiKey) {
    return `Entendi sua dúvida! No entanto, a integração com a inteligência artificial não está configurada no momento. Para te ajudar com essa pergunta: ${questionText}\n\nConsegui ajudar? Quando estiver pronto, pode digitar sua resposta.`;
  }

  try {
    const messages = [
      {
        role: "system",
        content: `Você é o Agente Criador de Descrição de Cargo por Competências. Seu objetivo é ajudar o usuário a tirar dúvidas sobre descrição de cargos, mapeamento de competências organizacionais, técnicas e comportamentais, e como montar e enquadrar os requisitos de um cargo.
Seja conciso, direto, cordial e não use formatação em negrito (**).
${contextoPergunta}
Sempre encerre a sua resposta de forma simpática, lembrando-o de que, quando se sentir confortável e sem dúvidas, ele pode responder à pergunta principal do passo atual: "${questionText}".`
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
    console.error("Erro ao chamar OpenAI (Descrição Cargo):", error);
    return `Entendi sua dúvida! No entanto, tive uma falha ao me conectar com o serviço. Para te ajudar com essa pergunta: ${questionText}\n\nConsegui ajudar? Quando estiver pronto, pode digitar sua resposta.`;
  }
}

async function analisarMensagemUsuarioDescricao(
  perguntaUsuario: string,
  campoAtual: DescricaoCargoField,
  session: DescricaoCargoSession
): Promise<{ isDoubt: boolean; reply: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const questionText = getQuestion(session, campoAtual);
  const historico = session.historicoConversaDescricao ?? [];

  if (!apiKey) {
    const confused = isConfusedOrAsking(perguntaUsuario);
    if (confused) {
      return {
        isDoubt: true,
        reply: `Sem problema, deixa eu explicar melhor!\n\n${questionText}`
      };
    }
    return { isDoubt: false, reply: "" };
  }

  try {
    const messages = [
      {
        role: "system",
        content: `Você é o Agente Criador de Descrição de Cargo por Competências. O usuário está na etapa da pergunta: "${questionText}".
Analise a mensagem enviada pelo usuário.

Você deve responder com PASS caso o usuário esteja simplesmente fornecendo uma resposta direta à pergunta (por exemplo, digitando o título do cargo como "rh", "auxiliar", "auxiliar de rh", a área, uma resposta de sim/não/ok, uma lista de competências ou qualquer descrição textual), mesmo que seja uma resposta curta, incompleta ou com abreviações/erros de digitação.

Você deve gerar uma resposta explicativa e de apoio (NÃO responda PASS) APENAS se o usuário estiver explicitamente:
- Fazendo uma pergunta sobre conceitos de descrição de cargo, competências, ou sobre o significado dos termos.
- Expressando dúvida direta ou confusão sobre a pergunta atual (ex: "como assim?", "não entendi", "o que é para fazer aqui?").
- Reclamando de um erro do bot ou querendo voltar/corrigir algo do fluxo.
- Digitando algo totalmente irrelevante que seja claramente uma tentativa de iniciar uma conversa aleatória (ex: "olá, tudo bem?", "quem é você?").

Se você gerar uma resposta explicativa, seja cordial, curto, direto e não use formatação em negrito (**). Sempre encerre lembrando-o simpaticamente de que ele pode responder à pergunta do passo atual quando se sentir confortável: "${questionText}".`
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
    console.error("Erro na análise da OpenAI (Descrição Cargo):", error);
    return { isDoubt: false, reply: "" };
  }
}

export function initializeDescricaoCargoSession(): DescricaoCargoSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
    responsabilidades: []
  };
}

function goToResponsibilityValidation(session: DescricaoCargoSession) {
  const preview = formatResponsibilityPreview(session.responsabilidades ?? []);
  const nextField: DescricaoCargoField = "validacaoResponsabilidadesGeradas";

  return {
    session,
    completed: false,
    currentField: nextField,
    nextField,
    question: getQuestion(session, nextField),
    reply: [
      "Com base nas atividades informadas, estruturei assim as responsabilidades principais:",
      "",
      preview,
      "",
      getQuestion(session, nextField)
    ].join("\n")
  };
}

export async function runDescricaoCargoStep(
  session: DescricaoCargoSession,
  answer?: string,
  currentField?: DescricaoCargoField
) {
  if (!currentField) {
    const firstField: DescricaoCargoField = "tituloCargo";
    const question = getQuestion(session, firstField);

    return {
      session,
      completed: false,
      currentField: firstField,
      nextField: firstField,
      question,
      reply: question
    };
  }

  const raw = String(answer ?? "").trim();

  // Check for local shortcuts/bypass first to avoid false positives by the LLM
  const bypass = isShortLocalBypass(currentField, raw);

  if (!bypass) {
    // Check if the user is expressing a doubt or asking questions
    const analise = await analisarMensagemUsuarioDescricao(raw, currentField, session);

    if (analise.isDoubt) {
      const novoHistorico = [
        ...(session.historicoConversaDescricao ?? []),
        { role: "user" as const, content: raw },
        { role: "assistant" as const, content: analise.reply }
      ];

      return {
        session: {
          ...session,
          historicoConversaDescricao: novoHistorico,
        },
        completed: false,
        currentField,
        nextField: currentField,
        question: getQuestion(session, currentField),
        reply: analise.reply,
      };
    }
  }

  const validationError = validateField(currentField, raw);

  if (validationError) {
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: getQuestion(session, currentField),
      reply: validationError
    };
  }

  if (currentField === "tituloCargo") {
    const updated = { ...session, tituloCargo: raw };
    const nextField: DescricaoCargoField = "area";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "area") {
    const updated = { ...session, area: raw };
    const nextField: DescricaoCargoField = "nivelHierarquico";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "nivelHierarquico") {
    const updated = { ...session, nivelHierarquico: raw };
    const nextField: DescricaoCargoField = "reportaSeA";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "reportaSeA") {
    const updated = { ...session, reportaSeA: raw };
    const nextField: DescricaoCargoField = "interacoesPrincipais";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "interacoesPrincipais") {
    const updated = { ...session, interacoesPrincipais: raw };
    const nextField: DescricaoCargoField = "temAtividadesMapeadas";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "temAtividadesMapeadas") {
    const updated = { ...session, temAtividadesMapeadas: raw };

    if (isYes(raw)) {
      const nextField: DescricaoCargoField = "atividadesCargo";
      const question = getQuestion(updated, nextField);

      return {
        session: updated,
        completed: false,
        currentField: nextField,
        nextField,
        question,
        reply: question
      };
    }

    const sugestoes = suggestActivitiesByCargo(updated.tituloCargo);
    const atividadesSugeridas = sugestoes.join("\n");

    const nextSession: DescricaoCargoSession = {
      ...updated,
      atividadesCargo: atividadesSugeridas,
      atividadesOrigem: "sugestao"
    };

    const nextField: DescricaoCargoField = "validacaoAtividadesSugeridas";

    const reply = [
      "Com base no cargo informado, estas são as atividades sugeridas:",
      "",
      ...sugestoes.map((item, index) => `${index + 1}. ${item}`),
      "",
      "Se estiver bom, responda 'ok'. Se quiser ajustar, escreva as atividades corrigidas."
    ].join("\n");

    return {
      session: nextSession,
      completed: false,
      currentField: nextField,
      nextField,
      question: getQuestion(nextSession, nextField),
      reply
    };
  }

  if (currentField === "atividadesCargo") {
    const responsabilidades = buildResponsibilitiesFromActivities(raw);

    const updated: DescricaoCargoSession = {
      ...session,
      atividadesCargo: raw,
      atividadesOrigem: "usuario",
      responsabilidades
    };

    return goToResponsibilityValidation(updated);
  }

  if (currentField === "validacaoAtividadesSugeridas") {
    const atividadesFinal = isValidationLike(raw) ? session.atividadesCargo ?? "" : raw;
    const responsabilidades = buildResponsibilitiesFromActivities(atividadesFinal);

    const updated: DescricaoCargoSession = {
      ...session,
      atividadesCargo: atividadesFinal,
      atividadesOrigem: isValidationLike(raw) ? "sugestao" : "usuario",
      responsabilidades
    };

    return goToResponsibilityValidation(updated);
  }

  if (currentField === "validacaoResponsabilidadesGeradas") {
    const updated: DescricaoCargoSession = {
      ...session,
      responsabilidades: isValidationLike(raw)
        ? session.responsabilidades ?? []
        : mergeResponsibilities(session.responsabilidades ?? [], raw)
    };

    const nextField: DescricaoCargoField = "competenciasOrganizacionais";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "competenciasOrganizacionais") {
    const updated = { ...session, competenciasOrganizacionais: raw };
    const nextField: DescricaoCargoField = "conhecimentosTecnicos";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "conhecimentosTecnicos") {
    const updated = { ...session, conhecimentosTecnicos: raw };
    const nextField: DescricaoCargoField = "habilidadesTecnicas";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "habilidadesTecnicas") {
    const updated = { ...session, habilidadesTecnicas: raw };
    const nextField: DescricaoCargoField = "competenciasComportamentais";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "competenciasComportamentais") {
    const updated = { ...session, competenciasComportamentais: raw };
    const nextField: DescricaoCargoField = "escolaridadeMinima";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "escolaridadeMinima") {
    const updated = { ...session, escolaridadeMinima: raw };
    const nextField: DescricaoCargoField = "formacaoDesejavel";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "formacaoDesejavel") {
    const updated = { ...session, formacaoDesejavel: raw };
    const nextField: DescricaoCargoField = "experienciaDesejavel";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "experienciaDesejavel") {
    const updated = { ...session, experienciaDesejavel: raw };
    const nextField: DescricaoCargoField = "conhecimentosDesejaveis";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "conhecimentosDesejaveis") {
    const updated = { ...session, conhecimentosDesejaveis: raw };
    const nextField: DescricaoCargoField = "observacoes";
    const question = getQuestion(updated, nextField);

    return {
      session: updated,
      completed: false,
      currentField: nextField,
      nextField,
      question,
      reply: question
    };
  }

  if (currentField === "observacoes") {
    const updated: DescricaoCargoSession = {
      ...session,
      observacoes: raw,
      status: "completed",
      reportStatus: "generated"
    };

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null
    };
  }

  return {
    session,
    completed: false,
    currentField,
    nextField: currentField,
    question: getQuestion(session, currentField),
    reply: getQuestion(session, currentField)
  };
}

export function splitSessionList(text?: string) {
  return unique(splitList(text));
}
