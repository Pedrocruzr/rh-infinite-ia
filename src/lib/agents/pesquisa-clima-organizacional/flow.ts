export type ClimaPath =
  | "montar_questionario"
  | "adaptar_questionario"
  | "analisar_resultados"
  | "interpretar_dimensoes"
  | "relatorio_executivo"
  | "plano_acao";

export type ClimaField =
  | "intencao"
  | "objetivoMontagem"
  | "publicoMontagem"
  | "dimensoesMontagem"
  | "observacoesMontagem"
  | "sabeAplicarClima"
  | "confirmacaoDuvidasClima"
  | "questionarioUsuario"
  | "materialAnalise"
  | "dimensoesInterpretacao"
  | "materialInterpretacao"
  | "materialRelatorioExecutivo"
  | "materialPlanoAcao";

export type ClimaSession = {
  assessmentId?: string;
  caminho?: ClimaPath;
  intencao?: string;

  objetivoMontagem?: string;
  publicoMontagem?: string;
  dimensoesMontagem?: string;
  observacoesMontagem?: string;

  // Conversational fields
  sabeAplicarClima?: string;
  confirmacaoDuvidasClima?: string;
  aguardandoClarificacaoDuvidaClima?: boolean;
  historicoConversaClima?: { role: "user" | "assistant"; content: string }[];
  pediuInstrucoesClima?: boolean;

  questionarioUsuario?: string;

  materialAnalise?: string;

  dimensoesInterpretacao?: string;
  materialInterpretacao?: string;

  materialRelatorioExecutivo?: string;

  materialPlanoAcao?: string;

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
    .map((t) => t.replace(/[^a-zA-ZÀ-ÿ0-9\-\/]/g, ""))
    .filter(Boolean);

  if (tokens.length === 0) return false;

  const validTokens = tokens.filter((token) => {
    if (token.length <= 2) return true;
    if (/\d/.test(token)) return true;
    return hasVowel(token);
  });

  return validTokens.length / tokens.length >= 0.6;
}

function detectPath(value: string): ClimaPath | null {
  const text = String(value ?? "").trim().toLowerCase();

  // adaptar questionario (two-word check first to avoid ambiguity)
  if (/adapt/.test(text) && /question[aá]rio|questionario/.test(text)) {
    return "adaptar_questionario";
  }

  // montar / criar questionario (two-word)
  if (/montar|criar|elaborar|fazer/.test(text) && /question[aá]rio|questionario/.test(text)) {
    return "montar_questionario";
  }

  // analisar resultados (two-word)
  if (/analis/.test(text) && /resultado|pesquisa|dados|respostas/.test(text)) {
    return "analisar_resultados";
  }

  // interpretar dimensoes (two-word)
  if (/interpret/.test(text) && /lideran|comunica|reconhec|motiva|ambiente|dimens/.test(text)) {
    return "interpretar_dimensoes";
  }

  // relatorio executivo / executivo
  if (/relat[oó]rio executivo|relatorio executivo|executivo/.test(text)) {
    return "relatorio_executivo";
  }

  // plano de acao
  if (/plano de a[cç][aã]o|plano de acao|a[cç][aã]o a partir dos achados|acao a partir dos achados/.test(text)) {
    return "plano_acao";
  }

  // --- single-keyword fallbacks ---
  if (/\badapt/.test(text)) return "adaptar_questionario";
  if (/\b(montar|criar|elaborar)\b/.test(text)) return "montar_questionario";
  if (/\b(analis|analisar)\b/.test(text)) return "analisar_resultados";
  if (/\b(interpret|interpretar)\b/.test(text)) return "interpretar_dimensoes";
  if (/\b(relat[oó]rio|relatorio|executivo)\b/.test(text)) return "relatorio_executivo";
  if (/\b(plano|a[cç][aã]o)\b/.test(text)) return "plano_acao";
  if (/\b(question[aá]rio|questionario)\b/.test(text)) return "montar_questionario";
  if (/\b(resultado|dados|respostas)\b/.test(text)) return "analisar_resultados";
  if (/\b(dimens[aã]o|dimensoes|lideran|comunica|motiva|ambiente)\b/.test(text)) return "interpretar_dimensoes";

  return null;
}

function question(field: ClimaField) {
  switch (field) {
    case "intencao":
      return `Qual é o principal objetivo desta pesquisa de clima organizacional?

Posso te ajudar com um destes caminhos:

- montar ou adaptar um questionário de clima organizacional;
- analisar resultados de uma pesquisa;
- interpretar dimensões como liderança, comunicação, reconhecimento, motivação e ambiente;
- estruturar um relatório executivo com recomendações;
- sugerir plano de ação a partir dos achados.

Me diga o que você quer fazer agora.`;

    case "objetivoMontagem":
      return "Qual é o objetivo principal da pesquisa de clima que você quer montar?";
    case "publicoMontagem":
      return "Quem responderá a pesquisa? Ex.: todos os colaboradores, uma área específica, liderança, operação.";
    case "dimensoesMontagem":
      return "Quais dimensões você quer priorizar no questionário? Ex.: liderança, comunicação, reconhecimento, motivação, ambiente, trabalho em equipe, desenvolvimento.";
    case "observacoesMontagem":
      return "Existe alguma observação adicional importante para personalizar o questionário? Se não houver, responda: não.";

    case "questionarioUsuario":
      return `Perfeito. Envie o questionário atual aqui, ou cole as perguntas, que eu adapto para você.

Se preferir, posso adaptar em qualquer um destes formatos:

- mais simples e direto
- mais profissional
- mais curto
- por dimensões de clima

Cole o questionário e, se quiser, já indique o formato desejado no mesmo texto.`;

    case "materialAnalise":
      return "Perfeito. Envie o que você tiver dos resultados da pesquisa de clima: médias, percentuais, respostas, prints, planilha, resumo ou qualquer material disponível. Vou analisar com base no que você enviar.";

    case "dimensoesInterpretacao":
      return "Quais dimensões você quer interpretar? Ex.: liderança, comunicação, reconhecimento, motivação e ambiente.";
    case "materialInterpretacao":
      return "Agora envie o que você tiver dos resultados da pesquisa relacionados a essas dimensões. Vou interpretar com base no material enviado.";

    case "materialRelatorioExecutivo":
      return "Perfeito. Envie o que você tiver dos resultados da pesquisa de clima e eu vou estruturar um relatório executivo com recomendações.";

    case "materialPlanoAcao":
      return "Perfeito. Envie os resultados e materiais dos caminhos anteriores para eu montar um plano de ação a partir dos achados.";

    default:
      return "";
  }
}

function validate(field: ClimaField, value: string) {
  const text = String(value ?? "").trim();

  if (field === "sabeAplicarClima" || field === "confirmacaoDuvidasClima" || field === "intencao") {
    return null;
  }

  if (!text) {
    return "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode escrever de forma mais clara?";
  }

  if (
    field === "questionarioUsuario" ||
    field === "materialAnalise" ||
    field === "materialInterpretacao" ||
    field === "materialRelatorioExecutivo" ||
    field === "materialPlanoAcao"
  ) {
    if (text.split(/\s+/).length < 8) {
      return "Envie mais conteúdo para eu trabalhar com segurança. Pode colar perguntas, resultados, resumos ou o material que você tiver.";
    }
    return null;
  }

  if (!isComprehensible(text)) {
    return "Não consegui entender sua resposta com segurança. Pode escrever novamente de forma mais clara?";
  }

  return null;
}

function nextFieldForMontagem(field: ClimaField): ClimaField | null {
  const order: ClimaField[] = [
    "objetivoMontagem",
    "publicoMontagem",
    "dimensoesMontagem",
    "observacoesMontagem",
  ];
  const idx = order.indexOf(field);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}

export function initializeClimaSession(): ClimaSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

function userSaysYes(texto: string): boolean {
  const t = texto.toLowerCase().trim();
  if (
    t === "sim" ||
    t === "s" ||
    t === "sei" ||
    t === "sim, sei" ||
    t.includes("conheço") ||
    t.includes("conheco") ||
    t.includes("entendo") ||
    t.includes("claro")
  ) {
    if (
      t.includes("não sei") ||
      t.includes("nao sei") ||
      t.includes("não conheço") ||
      t.includes("nao conheco")
    ) {
      return false;
    }
    return true;
  }
  return false;
}

function userWantsToGenerate(texto: string): boolean {
  const t = texto.toLowerCase().trim();
  
  if (
    t.includes("não entendi") ||
    t.includes("nao entendi") ||
    t.includes("não ficou") ||
    t.includes("nao ficou") ||
    t.includes("ainda não") ||
    t.includes("ainda nao") ||
    t.includes("?") ||
    t.includes("como") ||
    t.includes("duvida") ||
    t.includes("dúvida") ||
    t.includes("ajuda")
  ) {
    return false;
  }
  
  if (
    t.includes("pode gerar") ||
    t.includes("pode criar") ||
    t.includes("gerar") ||
    t.includes("gerar questionario") ||
    t.includes("gerar questionário") ||
    t.includes("pronto") ||
    t.includes("criar") ||
    t.includes("vamos") ||
    t.includes("ficou claro") ||
    t.includes("ficou claro agora") ||
    t.includes("entendi") ||
    t.includes("compreendi") ||
    t.includes("tudo certo") ||
    t.includes("tudo claro") ||
    t.includes("sem duvida") ||
    t.includes("sem dúvida") ||
    t.includes("nenhuma") ||
    t.includes("não tenho") ||
    t.includes("nao tenho") ||
    t === "não" ||
    t === "nao" ||
    t === "n" ||
    t === "ok" ||
    t === "fechou" ||
    t === "claro"
  ) {
    return true;
  }
  
  if (t.includes("sim, pode") || t.includes("sim pode") || t.includes("pode sim")) {
    return true;
  }

  return false;
}

async function conversarComOpenAIClima(perguntaUsuario: string, historico: any[]) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return "Entendi! Para te ajudar, aqui estão alguns pontos importantes sobre a aplicação da pesquisa de clima:\n\n" +
      "- Anonimato: É altamente recomendado que a pesquisa seja 100% anônima para que os colaboradores respondam com sinceridade;\n" +
      "- Escala de resposta: Recomendamos utilizar uma escala de 1 a 10 (onde 1 significa discordo totalmente e 10 significa concordo totalmente);\n" +
      "- Próximos passos: Depois que você coletar as respostas, você usará a funcionalidade de Análise de Resultados deste mesmo agente para analisar os dados coletados e gerar o relatório executivo e plano de ação.\n\n" +
      "Consegui esclarecer sua dúvida? Já podemos gerar o seu questionário de clima?";
  }

  try {
    const messages = [
      {
        role: "system",
        content: "Você é o Agente de Pesquisa de Clima Organizacional. Seu objetivo é ajudar o usuário a tirar dúvidas sobre pesquisa de clima organizacional e como montá-la e aplicá-la na empresa (usando ferramentas como Google Forms ou Respondi). Seja conciso, direto, cordial e não use formatação em negrito (**). Caso o usuário pergunte o que fazer após aplicar o questionário ou coletar as respostas, oriente-o a utilizar o nosso agente de Pesquisa de Clima Organizacional na funcionalidade de análise de resultados, que fará a leitura dos dados coletados para gerar o relatório executivo e o plano de ação. Sempre encerre a sua resposta com uma pergunta clara e objetiva sobre se ele gostaria de tirar mais dúvidas ou se já podemos gerar o questionário de clima."
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
      const errPayload = await response.json().catch(() => ({}));
      console.error("Erro na resposta da OpenAI:", errPayload);
      throw new Error("Erro na chamada da OpenAI");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    return content.replaceAll("**", "").trim();
  } catch (error) {
    console.error("Erro ao chamar OpenAI:", error);
    return "Entendi! Para te ajudar, aqui estão alguns pontos importantes sobre a aplicação da pesquisa de clima:\n\n" +
      "- Anonimato: É altamente recomendado que a pesquisa seja 100% anônima para que os colaboradores respondam com sinceridade;\n" +
      "- Escala de resposta: Recomendamos utilizar uma escala de 1 a 10 (onde 1 significa discordo totalmente e 10 significa concordo totalmente);\n" +
      "- Próximos passos: Depois que você coletar as respostas, você usará a funcionalidade de Análise de Resultados deste mesmo agente para analisar os dados coletados e gerar o relatório executivo e plano de ação.\n\n" +
      "Consegui esclarecer sua dúvida? Já podemos gerar o seu questionário de clima?";
  }
}

export async function runClimaStep(
  session: ClimaSession,
  answer?: string,
  currentField?: ClimaField
) {
  if (!currentField) {
    const firstField: ClimaField = "intencao";
    const q = question(firstField);
    return {
      session,
      completed: false,
      currentField: firstField,
      nextField: firstField,
      question: q,
      reply: q,
    };
  }

  const raw = String(answer ?? "").trim();
  const wordCount = raw.split(/\s+/).filter(Boolean).length;
  const detectedCaminho = detectPath(raw);

  // Dynamic path switching for short inputs
  if (
    detectedCaminho &&
    detectedCaminho !== session.caminho &&
    wordCount < 8 &&
    currentField !== "intencao" &&
    currentField !== "confirmacaoDuvidasClima"
  ) {
    const updated: ClimaSession = {
      ...session,
      intencao: raw,
      caminho: detectedCaminho,
      objetivoMontagem: undefined,
      publicoMontagem: undefined,
      dimensoesMontagem: undefined,
      observacoesMontagem: undefined,
      questionarioUsuario: undefined,
      materialAnalise: undefined,
      dimensoesInterpretacao: undefined,
      materialInterpretacao: undefined,
      materialRelatorioExecutivo: undefined,
      materialPlanoAcao: undefined,
      sabeAplicarClima: undefined,
      confirmacaoDuvidasClima: undefined,
      aguardandoClarificacaoDuvidaClima: undefined,
      historicoConversaClima: undefined,
      pediuInstrucoesClima: undefined,
    };

    let next: ClimaField;
    switch (detectedCaminho) {
      case "montar_questionario":
        next = "objetivoMontagem";
        break;
      case "adaptar_questionario":
        next = "questionarioUsuario";
        break;
      case "analisar_resultados":
        next = "materialAnalise";
        break;
      case "interpretar_dimensoes":
        next = "dimensoesInterpretacao";
        break;
      case "relatorio_executivo":
        next = "materialRelatorioExecutivo";
        break;
      case "plano_acao":
        next = "materialPlanoAcao";
        break;
    }

    const q = question(next);
    return {
      session: updated,
      completed: false,
      currentField: next,
      nextField: next,
      question: q,
      reply: q,
    };
  }

  const error = validate(currentField, raw);

  if (error) {
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: question(currentField),
      reply: error,
    };
  }

  if (currentField === "intencao") {
    const caminho = detectPath(raw);

    if (!caminho) {
      const historicoAtual = session.historicoConversaClima ?? [];
      const respostaIA = await conversarComOpenAIClima(raw, historicoAtual);
      const novoHistorico = [
        ...historicoAtual,
        { role: "user" as const, content: raw },
        { role: "assistant" as const, content: respostaIA }
      ];

      return {
        session: {
          ...session,
          historicoConversaClima: novoHistorico,
        },
        completed: false,
        currentField: "intencao",
        nextField: "intencao",
        question: question("intencao"),
        reply: respostaIA,
      };
    }

    const updated: ClimaSession = {
      ...session,
      intencao: raw,
      caminho,
    };

    let next: ClimaField;

    switch (caminho) {
      case "montar_questionario":
        next = "objetivoMontagem";
        break;
      case "adaptar_questionario":
        next = "questionarioUsuario";
        break;
      case "analisar_resultados":
        next = "materialAnalise";
        break;
      case "interpretar_dimensoes":
        next = "dimensoesInterpretacao";
        break;
      case "relatorio_executivo":
        next = "materialRelatorioExecutivo";
        break;
      case "plano_acao":
        next = "materialPlanoAcao";
        break;
    }

    const q = question(next);
    return {
      session: updated,
      completed: false,
      currentField: next,
      nextField: next,
      question: q,
      reply: q,
    };
  }

  if (session.caminho === "montar_questionario") {
    const updated: ClimaSession = {
      ...session,
      [currentField]: raw,
    };

    if (currentField === "observacoesMontagem") {
      const nextField: ClimaField = "sabeAplicarClima";
      const q = "Vou te gerar um questionário para você aplicar e colher os dados na sua empresa. Você sabe utilizar o Google Forms ou o respondi.app?";
      return {
        session: {
          ...updated,
          sabeAplicarClima: undefined,
        },
        completed: false,
        currentField: nextField,
        nextField: nextField,
        question: q,
        reply: q,
      };
    }

    if (currentField === "sabeAplicarClima") {
      if (userSaysYes(raw)) {
        const replyText = "Excelente! Você tem alguma dúvida sobre a aplicação ou já podemos gerar o seu questionário de clima?";
        return {
          session: updated,
          completed: false,
          currentField: "confirmacaoDuvidasClima" as ClimaField,
          nextField: "confirmacaoDuvidasClima" as ClimaField,
          question: replyText,
          reply: replyText,
        };
      } else {
        const replyText = "Sem problemas! Vou te explicar o passo a passo para criar e aplicar o seu formulário:\n\n" +
          "1. Acesse o Google Forms ou o respondi.app e crie um novo formulário;\n" +
          "2. Insira as perguntas do questionário base que irei gerar para você no final desta conversa;\n" +
          "3. Configure as respostas utilizando uma escala de 1 a 10 (onde 1 significa discordo totalmente/muito ruim e 10 significa concordo totalmente/excelente);\n" +
          "4. Envie o link para seus colaboradores responderem de forma anônima, garantindo a sinceridade dos feedbacks;\n" +
          "5. Assista ao vídeo explicativo detalhado na aba Tutoriais da nossa plataforma para ver um guia visual de como montar e aplicar.\n\n" +
          "Ficou claro agora? Você tem mais alguma dúvida ou já podemos gerar o questionário de clima?";
        return {
          session: {
            ...updated,
            pediuInstrucoesClima: true,
          },
          completed: false,
          currentField: "confirmacaoDuvidasClima" as ClimaField,
          nextField: "confirmacaoDuvidasClima" as ClimaField,
          question: replyText,
          reply: replyText,
        };
      }
    }

    if (currentField === "confirmacaoDuvidasClima") {
      const t = raw.toLowerCase().trim();
      const isAmbiguous = (t === "sim" || t === "s");

      if (session.aguardandoClarificacaoDuvidaClima) {
        if (t.includes("duvida") || t.includes("dúvida") || t === "sim" || t === "s" || t.includes("tenho")) {
          const historicoAtual = session.historicoConversaClima ?? [];
          const respostaIA = await conversarComOpenAIClima(raw, historicoAtual);
          const novoHistorico = [
            ...historicoAtual,
            { role: "user" as const, content: raw },
            { role: "assistant" as const, content: respostaIA }
          ];

          return {
            reply: respostaIA,
            question: respostaIA,
            session: {
              ...session,
              historicoConversaClima: novoHistorico,
              aguardandoClarificacaoDuvidaClima: false
            },
            currentField: "confirmacaoDuvidasClima" as ClimaField,
            nextField: "confirmacaoDuvidasClima" as ClimaField,
            completed: false,
          };
        } else {
          const finalSession = {
            ...session,
            status: "completed" as const,
            reportStatus: "generated" as const,
            aguardandoClarificacaoDuvidaClima: false
          };

          return {
            session: finalSession,
            completed: true,
            currentField: null,
            nextField: null,
            question: null,
            reply: null,
          };
        }
      }

      if (isAmbiguous) {
        const replyText = "Você gostaria de tirar alguma dúvida específica ou já podemos gerar o questionário de clima?";
        return {
          reply: replyText,
          question: replyText,
          session: {
            ...session,
            aguardandoClarificacaoDuvidaClima: true
          },
          currentField: "confirmacaoDuvidasClima" as ClimaField,
          nextField: "confirmacaoDuvidasClima" as ClimaField,
          completed: false,
        };
      }

      if (userWantsToGenerate(raw)) {
        const finalSession = {
          ...session,
          status: "completed" as const,
          reportStatus: "generated" as const,
        };

        return {
          session: finalSession,
          completed: true,
          currentField: null,
          nextField: null,
          question: null,
          reply: null,
        };
      } else {
        const historicoAtual = session.historicoConversaClima ?? [];
        const respostaIA = await conversarComOpenAIClima(raw, historicoAtual);
        const novoHistorico = [
          ...historicoAtual,
          { role: "user" as const, content: raw },
          { role: "assistant" as const, content: respostaIA }
        ];

        return {
          reply: respostaIA,
          question: respostaIA,
          session: {
            ...session,
            historicoConversaClima: novoHistorico
          },
          currentField: "confirmacaoDuvidasClima" as ClimaField,
          nextField: "confirmacaoDuvidasClima" as ClimaField,
          completed: false,
        };
      }
    }

    const next = nextFieldForMontagem(currentField);

    if (!next) {
      updated.status = "completed";
      updated.reportStatus = "generated";

      return {
        session: updated,
        completed: true,
        currentField: null,
        nextField: null,
        question: null,
        reply: null,
      };
    }

    const q = question(next);
    return {
      session: updated,
      completed: false,
      currentField: next,
      nextField: next,
      question: q,
      reply: q,
    };
  }

  if (session.caminho === "adaptar_questionario" && currentField === "questionarioUsuario") {
    const updated: ClimaSession = {
      ...session,
      questionarioUsuario: raw,
      status: "completed",
      reportStatus: "generated",
    };

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null,
    };
  }

  if (session.caminho === "analisar_resultados" && currentField === "materialAnalise") {
    const updated: ClimaSession = {
      ...session,
      materialAnalise: raw,
      status: "completed",
      reportStatus: "generated",
    };

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null,
    };
  }

  if (session.caminho === "interpretar_dimensoes") {
    if (currentField === "dimensoesInterpretacao") {
      const updated: ClimaSession = {
        ...session,
        dimensoesInterpretacao: raw,
      };

      const next: ClimaField = "materialInterpretacao";
      const q = question(next);

      return {
        session: updated,
        completed: false,
        currentField: next,
        nextField: next,
        question: q,
        reply: q,
      };
    }

    if (currentField === "materialInterpretacao") {
      const updated: ClimaSession = {
        ...session,
        materialInterpretacao: raw,
        status: "completed",
        reportStatus: "generated",
      };

      return {
        session: updated,
        completed: true,
        currentField: null,
        nextField: null,
        question: null,
        reply: null,
      };
    }
  }

  if (session.caminho === "relatorio_executivo" && currentField === "materialRelatorioExecutivo") {
    const updated: ClimaSession = {
      ...session,
      materialRelatorioExecutivo: raw,
      status: "completed",
      reportStatus: "generated",
    };

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null,
    };
  }

  if (session.caminho === "plano_acao" && currentField === "materialPlanoAcao") {
    const updated: ClimaSession = {
      ...session,
      materialPlanoAcao: raw,
      status: "completed",
      reportStatus: "generated",
    };

    return {
      session: updated,
      completed: true,
      currentField: null,
      nextField: null,
      question: null,
      reply: null,
    };
  }

  const updated: ClimaSession = {
    ...session,
    [currentField]: raw,
    status: "completed",
    reportStatus: "generated",
  };

  return {
    session: updated,
    completed: true,
    currentField: null,
    nextField: null,
    question: null,
    reply: null,
  };
}
