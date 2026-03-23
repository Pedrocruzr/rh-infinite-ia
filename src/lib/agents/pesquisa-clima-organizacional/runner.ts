import type { ClimaSession, ClimaPath } from "./flow";

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeSentence(value: string) {
  let text = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!/[.!?]$/.test(text)) text += ".";
  return text;
}

function normalizeLine(value: string) {
  return normalizeSentence(value).replace(/[.!?]$/, "");
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

function renderList(items: string[]) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderQuestionBlock(title: string, items: string[]) {
  return `
    <div style="margin:0 0 22px 0;">
      <p style="margin:0 0 8px 0;"><strong>${escapeHtml(title)}</strong></p>
      <ul style="margin:0 0 0 22px; padding:0;">
        ${items.map((item) => `<li style="margin:0 0 6px 0;">${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

const DIMENSION_LIBRARY = {
  liderança: {
    label: "Liderança",
    interpretation:
      "Esta dimensão ajuda a entender clareza de direção, apoio do gestor, qualidade do feedback e respeito no relacionamento com a equipe.",
    risks:
      "Scores baixos tendem a indicar desalinhamento, insegurança, baixa confiança no gestor e dificuldade de desenvolvimento.",
    actions:
      "Fortalecer rituais de feedback, alinhamento de expectativas, comunicação do gestor e capacitação de liderança.",
  },
  comunicação: {
    label: "Comunicação",
    interpretation:
      "Esta dimensão mostra como as informações circulam, se há clareza entre áreas e se o colaborador sente espaço para se expressar.",
    risks:
      "Resultados fracos sugerem ruído, falta de alinhamento, insegurança e aumento de interpretações conflitantes.",
    actions:
      "Melhorar cadência de comunicação, alinhamentos entre áreas, clareza de mensagens e canais de escuta.",
  },
  reconhecimento: {
    label: "Reconhecimento",
    interpretation:
      "Esta dimensão indica como a empresa valoriza esforço, entrega, mérito e devolutivas sobre desempenho.",
    risks:
      "Pontuações baixas costumam gerar desmotivação, injustiça percebida e perda de engajamento.",
    actions:
      "Estruturar critérios de reconhecimento, reforçar feedback de desempenho e tornar a valorização mais visível.",
  },
  motivação: {
    label: "Motivação",
    interpretation:
      "Esta dimensão aponta energia, vontade de contribuir, conexão com o trabalho e percepção de sentido.",
    risks:
      "Resultados fracos sugerem desengajamento, esforço mínimo e risco maior de queda de performance.",
    actions:
      "Trabalhar sentido do trabalho, autonomia, reconhecimento e conexão entre esforço e resultado.",
  },
  ambiente: {
    label: "Ambiente",
    interpretation:
      "Esta dimensão reflete percepção sobre clima relacional, condições de trabalho, colaboração e bem-estar.",
    risks:
      "Pontuações baixas podem indicar tensão, desgaste, desconforto operacional ou relações frágeis.",
    actions:
      "Ajustar condições de trabalho, fortalecer cooperação, reduzir ruídos e criar ambiente mais saudável.",
  },
  desenvolvimento: {
    label: "Desenvolvimento",
    interpretation:
      "Esta dimensão avalia oportunidades de crescimento, aprendizagem e incentivo ao aprimoramento.",
    risks:
      "Resultados baixos costumam apontar sensação de estagnação e perda de perspectiva de futuro.",
    actions:
      "Estruturar trilhas, conversas de desenvolvimento e estímulos claros de aprendizagem.",
  },
};

function extractDimensions(text?: string) {
  const raw = String(text ?? "").toLowerCase();
  const found: string[] = [];

  Object.keys(DIMENSION_LIBRARY).forEach((key) => {
    if (raw.includes(key)) found.push(key);
  });

  return unique(found);
}

function detectAdaptationMode(text: string): "default" | "simple" | "professional" | "short" | "dimensions" {
  const lower = String(text ?? "").toLowerCase();

  if (/mais simples|simples e direto|simples/.test(lower)) return "simple";
  if (/mais profissional|profissional/.test(lower)) return "professional";
  if (/mais curto|curto/.test(lower)) return "short";
  if (/por dimensões|por dimensoes|dimensões de clima|dimensoes de clima/.test(lower)) return "dimensions";

  return "default";
}

function standardQuestionnaireHtml(mode: "default" | "simple" | "professional" | "short" | "dimensions") {
  const baseBlocks = [
    renderQuestionBlock("1) Liderança", [
      "Meu líder me orienta com clareza sobre o que é esperado do meu trabalho.",
      "Recebo apoio do meu líder quando enfrento dificuldades.",
      "Meu líder trata a equipe com respeito.",
      "Meu líder dá feedbacks úteis para meu desenvolvimento.",
    ]),
    renderQuestionBlock("2) Comunicação", [
      "As informações importantes circulam de forma clara na empresa.",
      "Sei o que está acontecendo na minha área.",
      "A comunicação entre áreas funciona bem.",
      "Sinto que posso expressar minha opinião.",
    ]),
    renderQuestionBlock("3) Reconhecimento e valorização", [
      "Meu trabalho é reconhecido quando entrego bons resultados.",
      "Sinto que minha contribuição é valorizada pela empresa.",
      "Os critérios de reconhecimento são justos.",
      "Recebo retorno sobre meu desempenho com frequência adequada.",
    ]),
    renderQuestionBlock("4) Trabalho em equipe", [
      "Existe cooperação entre as pessoas da minha equipe.",
      "Posso contar com meus colegas quando preciso.",
      "O ambiente de trabalho favorece a colaboração.",
      "Há respeito nas relações entre as pessoas.",
    ]),
    renderQuestionBlock("5) Condições de trabalho", [
      "Tenho os recursos necessários para realizar bem meu trabalho.",
      "As ferramentas e sistemas disponíveis atendem às necessidades da função.",
      "O ambiente físico de trabalho é adequado.",
      "A carga de trabalho é compatível com minhas responsabilidades.",
    ]),
    renderQuestionBlock("6) Desenvolvimento e crescimento", [
      "Tenho oportunidades de aprender e me desenvolver.",
      "A empresa incentiva o crescimento profissional.",
      "Entendo quais caminhos de desenvolvimento existem para mim.",
      "Recebo estímulos para aprimorar minhas competências.",
    ]),
    renderQuestionBlock("7) Organização e processos", [
      "Os processos de trabalho são claros.",
      "As responsabilidades estão bem definidas.",
      "A empresa toma decisões de forma organizada.",
      "As mudanças são comunicadas e conduzidas adequadamente.",
    ]),
    renderQuestionBlock("8) Engajamento e pertencimento", [
      "Sinto orgulho de trabalhar nesta empresa.",
      "Eu recomendaria esta empresa como um bom lugar para trabalhar.",
      "Sinto-me motivado(a) para realizar meu trabalho.",
      "Percebo sentido no que faço aqui.",
    ]),
  ];

  const blocks =
    mode === "short"
      ? baseBlocks.slice(0, 5)
      : baseBlocks;

  const intro =
    mode === "simple"
      ? "Versão adaptada para ficar mais simples e direta."
      : mode === "professional"
      ? "Versão adaptada com linguagem mais profissional e estrutura executiva."
      : mode === "short"
      ? "Versão adaptada para ficar mais curta e ágil na aplicação."
      : mode === "dimensions"
      ? "Versão organizada por dimensões de clima para facilitar aplicação e análise."
      : "Modelo-base completo de pesquisa de clima organizacional.";

  return `
    <p style="margin:0 0 8px 0;"><strong>Objetivo:</strong> entender a percepção dos colaboradores sobre o ambiente de trabalho e identificar pontos fortes e oportunidades de melhoria.</p>
    <p style="margin:0 0 16px 0;">${escapeHtml(intro)}</p>

    <p style="margin:0 0 8px 0;"><strong>Escala de resposta</strong></p>
    <ul style="margin:0 0 24px 22px; padding:0;">
      <li>1 = Discordo totalmente</li>
      <li>2 = Discordo parcialmente</li>
      <li>3 = Nem concordo nem discordo</li>
      <li>4 = Concordo parcialmente</li>
      <li>5 = Concordo totalmente</li>
    </ul>

    ${blocks.join("")}

    <h3 style="font-size:20px; font-weight:700; margin:24px 0 10px 0;">Perguntas abertas</h3>
    <ul style="margin:0 0 24px 22px; padding:0;">
      <li>O que a empresa faz hoje que mais contribui para um bom ambiente de trabalho?</li>
      <li>O que mais precisa melhorar no ambiente de trabalho?</li>
      <li>Que sugestão você daria para tornar a empresa um lugar melhor para trabalhar?</li>
    </ul>

    <h3 style="font-size:20px; font-weight:700; margin:24px 0 10px 0;">Perguntas de perfil</h3>
    <ul style="margin:0 0 24px 22px; padding:0;">
      <li>Área/setor</li>
      <li>Tempo de empresa</li>
      <li>Cargo ou nível</li>
      <li>Unidade/filial, se houver</li>
    </ul>

    <h3 style="font-size:20px; font-weight:700; margin:24px 0 10px 0;">Orientações de aplicação</h3>
    <ul style="margin:0 0 24px 22px; padding:0;">
      <li>Garanta anonimato.</li>
      <li>Evite coletar dados que identifiquem pessoas em equipes muito pequenas.</li>
      <li>Explique o objetivo da pesquisa antes da aplicação.</li>
      <li>Divulgue depois os principais resultados e o plano de ação.</li>
    </ul>

    <h3 style="font-size:20px; font-weight:700; margin:24px 0 10px 0;">Como interpretar</h3>
    <ul style="margin:0 0 24px 22px; padding:0;">
      <li>4,1 a 5,0: ponto forte</li>
      <li>3,1 a 4,0: atenção moderada</li>
      <li>1,0 a 3,0: prioridade de melhoria</li>
    </ul>
  `;
}

function pathLabel(path?: ClimaPath) {
  switch (path) {
    case "montar_questionario":
      return "Montagem de questionário";
    case "adaptar_questionario":
      return "Adaptação de questionário";
    case "analisar_resultados":
      return "Análise de resultados";
    case "interpretar_dimensoes":
      return "Interpretação de dimensões";
    case "relatorio_executivo":
      return "Relatório executivo";
    case "plano_acao":
      return "Plano de ação";
    default:
      return "Pesquisa de Clima Organizacional";
  }
}

function buildMontarQuestionarioReport(session: ClimaSession) {
  const objetivo = normalizeSentence(session.objetivoMontagem ?? "Não informado");
  const publico = normalizeLine(session.publicoMontagem ?? "Não informado");
  const dimensoes = unique(splitList(session.dimensoesMontagem));
  const observacoes = normalizeSentence(session.observacoesMontagem ?? "Não informado");

  return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">QUESTIONÁRIO DE CLIMA ORGANIZACIONAL</h1>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">1. Contexto da montagem</h2>
  <p style="margin:0 0 8px 0;"><strong>Objetivo da pesquisa:</strong> ${escapeHtml(objetivo)}</p>
  <p style="margin:0 0 8px 0;"><strong>Público-alvo:</strong> ${escapeHtml(publico)}</p>
  <p style="margin:0 0 8px 0;"><strong>Dimensões priorizadas:</strong> ${escapeHtml(dimensoes.join(", ") || "Modelo completo")}</p>
  <p style="margin:0 0 24px 0;"><strong>Observações adicionais:</strong> ${escapeHtml(observacoes)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">2. Questionário pronto para uso</h2>
  ${standardQuestionnaireHtml("default")}
</section>
`;
}

function buildAdaptarQuestionarioReport(session: ClimaSession) {
  const material = String(session.questionarioUsuario ?? "").trim();
  const mode = detectAdaptationMode(material);

  const modeLabel =
    mode === "simple"
      ? "mais simples e direto"
      : mode === "professional"
      ? "mais profissional"
      : mode === "short"
      ? "mais curto"
      : mode === "dimensions"
      ? "organizado por dimensões de clima"
      : "aprimorado com base no modelo padrão";

  const improvements = [
    "reorganização do questionário para uma estrutura mais clara e consistente",
    "padronização da linguagem para facilitar compreensão e aplicação interna",
    "reforço das dimensões essenciais de clima organizacional",
    "inclusão de escala de resposta, perguntas abertas e orientações de aplicação",
  ];

  if (mode === "simple") {
    improvements.push("simplificação da linguagem das afirmações");
  }
  if (mode === "professional") {
    improvements.push("elevação do tom para um formato mais técnico e profissional");
  }
  if (mode === "short") {
    improvements.push("redução do volume de perguntas para aplicação mais ágil");
  }
  if (mode === "dimensions") {
    improvements.push("organização explícita por blocos dimensionais de clima");
  }

  return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">QUESTIONÁRIO DE CLIMA ADAPTADO</h1>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">1. Tipo de adaptação identificada</h2>
  <p style="margin:0 0 24px 0;"><strong>Formato aplicado:</strong> ${escapeHtml(modeLabel)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">2. Melhorias aplicadas com base na base de conhecimento</h2>
  <ul style="margin:0 0 24px 22px; padding:0;">
    ${renderList(improvements)}
  </ul>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">3. Novo questionário adaptado</h2>
  ${standardQuestionnaireHtml(mode)}

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">4. Recomendação final</h2>
  <p style="margin:0 0 0 0;">A versão acima já está organizada para uso interno. Antes da aplicação, ajuste apenas nomes específicos da empresa, áreas internas e qualquer referência que possa comprometer anonimato em equipes pequenas.</p>
</section>
`;
}

function buildAnaliseResultadosReport(session: ClimaSession) {
  const material = String(session.materialAnalise ?? "").trim();

  const knownDimensions = [
    "Liderança",
    "Comunicação",
    "Reconhecimento e Valorização",
    "Trabalho em Equipe",
    "Condições de Trabalho",
    "Desenvolvimento e Crescimento",
    "Organização e Processos",
    "Engajamento e Pertencimento",
  ];

  function escRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function toNumber(value: string) {
    return Number(String(value).replace(",", "."));
  }

  function fmt(value: number) {
    return value.toFixed(1).replace(".", ",");
  }

  function parseOverallAverage() {
    const patterns = [
      /m[eé]dia geral da empresa\s*[:\-]?\s*([0-9]+[.,][0-9]+)/i,
      /m[eé]dia geral\s*[:\-]?\s*([0-9]+[.,][0-9]+)/i,
    ];

    for (const pattern of patterns) {
      const match = material.match(pattern);
      if (match) return toNumber(match[1]);
    }
    return null;
  }

  function parseDimensionScores() {
    const found: Array<{ name: string; score: number }> = [];

    for (const name of knownDimensions) {
      const escaped = escRegExp(name);
      const patterns = [
        new RegExp(`${escaped}\\s*[–—\\-]\\s*M[eé]dia geral\\s*[:\\-]?\\s*([0-9]+[.,][0-9]+)`, "i"),
        new RegExp(`${escaped}[\\s\\S]{0,80}?M[eé]dia geral\\s*[:\\-]?\\s*([0-9]+[.,][0-9]+)`, "i"),
        new RegExp(`${escaped}\\s*\\(([0-9]+[.,][0-9]+)\\)`, "i"),
      ];

      for (const pattern of patterns) {
        const match = material.match(pattern);
        if (match) {
          found.push({
            name,
            score: toNumber(match[1]),
          });
          break;
        }
      }
    }

    return found;
  }

  function parseBlockAnalyses() {
    const regex = /An[aá]lise:\s*(.+)/gi;
    const results: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(material)) !== null) {
      const text = match[1].replace(/\s+/g, " ").trim();
      if (text) results.push(text);
    }

    return results.slice(0, 8);
  }

  function parseCriticalItems() {
    const items: Array<{ label: string; score: number }> = [];
    const rowRegex = /\n\s*\d+\.\d+\s+(.+?)\s+([0-9]+[.,][0-9]+)(?=\n|$)/g;
    let match: RegExpExecArray | null;

    while ((match = rowRegex.exec(material)) !== null) {
      const label = match[1].replace(/\s+/g, " ").trim();
      const score = toNumber(match[2]);
      if (score <= 3.1) {
        items.push({ label, score });
      }
    }

    return items.sort((a, b) => a.score - b.score).slice(0, 5);
  }

  function parseOpenResponses() {
    const lines = material
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const open: string[] = [];

    for (const line of lines) {
      if (line.length < 18) continue;
      if (/^An[aá]lise:/i.test(line)) continue;
      if (/^Perfil\b|^Área\b|^Tempo de empresa\b|^Nível\b/i.test(line)) continue;
      if (/^Resultados por Bloco/i.test(line)) continue;
      if (/^Empresa com\b/i.test(line)) continue;

      if (
        /relacionamento|apoio entre colegas|coopera[cç][aã]o|respeito|flexibilidade|orgulho|pertencimento|lideran[cç]a|comunica[cç][aã]o entre [aá]reas|promo[cç][aã]o|reconhecimento|sobrecarga|processos|ferramentas|feedback|carreira|crescimento/i.test(
          line
        )
      ) {
        open.push(line);
      }
    }

    return open.slice(0, 6);
  }

  const overallAverage = parseOverallAverage();
  const dimensionScores = parseDimensionScores();
  const blockAnalyses = parseBlockAnalyses();
  const criticalItems = parseCriticalItems();
  const openResponses = parseOpenResponses();

  const strengths = [...dimensionScores]
    .filter((item) => item.score >= 3.8)
    .sort((a, b) => b.score - a.score);

  const attentions = [...dimensionScores]
    .filter((item) => item.score <= 3.4)
    .sort((a, b) => a.score - b.score);

  const teamwork = dimensionScores.find((d) => d.name === "Trabalho em Equipe");
  const leadership = dimensionScores.find((d) => d.name === "Liderança");
  const belonging = dimensionScores.find((d) => d.name === "Engajamento e Pertencimento");

  const recognition = dimensionScores.find((d) => d.name === "Reconhecimento e Valorização");
  const communication = dimensionScores.find((d) => d.name === "Comunicação");
  const growth = dimensionScores.find((d) => d.name === "Desenvolvimento e Crescimento");
  const processes = dimensionScores.find((d) => d.name === "Organização e Processos");

  const bestDimension = strengths[0] ?? teamwork ?? leadership ?? belonging ?? null;
  const worstDimension = attentions[0] ?? recognition ?? communication ?? growth ?? processes ?? null;

  const relationalDimensions = dimensionScores.filter((item) =>
    ["Trabalho em Equipe", "Liderança", "Engajamento e Pertencimento"].includes(item.name)
  );

  const structuralDimensions = dimensionScores.filter((item) =>
    ["Comunicação", "Reconhecimento e Valorização", "Condições de Trabalho", "Desenvolvimento e Crescimento", "Organização e Processos"].includes(item.name)
  );

  const relationalAverage =
    relationalDimensions.length
      ? relationalDimensions.reduce((sum, item) => sum + item.score, 0) / relationalDimensions.length
      : null;

  const structuralAverage =
    structuralDimensions.length
      ? structuralDimensions.reduce((sum, item) => sum + item.score, 0) / structuralDimensions.length
      : null;

  let overview =
    "A pesquisa revela um clima que precisa ser lido em profundidade, porque os achados mostram convivência entre forças relacionais e fragilidades estruturais.";
  if (overallAverage !== null) {
    if (overallAverage >= 4.1) {
      overview = `A pesquisa aponta um clima organizacional positivo, com média geral de ${fmt(
        overallAverage
      )}, mas a leitura executiva ainda precisa identificar se esse resultado está sendo sustentado por maturidade de gestão, por vínculos humanos positivos ou pela combinação dos dois fatores.`;
    } else if (overallAverage >= 3.1) {
      overview = `A pesquisa aponta um clima razoavelmente positivo, com média geral de ${fmt(
        overallAverage
      )}, mas com sinais claros de fragilidade em temas estruturais. O cenário não é de crise aberta, porém também não é de estabilidade plena.`;
    } else {
      overview = `A pesquisa indica um clima fragilizado, com média geral de ${fmt(
        overallAverage
      )}, sugerindo necessidade de intervenção prioritária em fatores centrais da experiência do colaborador.`;
    }
  }

  let principalReading =
    "A leitura principal do clima é que a empresa precisa separar o que hoje funciona nas relações humanas daquilo que não está funcionando na estrutura da experiência interna.";
  if (bestDimension && worstDimension) {
    principalReading = `O dado mais importante do clima é este: ${bestDimension.name} aparece como força relativa, enquanto ${worstDimension.name} concentra a principal fragilidade. Isso sugere uma organização em que a experiência do colaborador está sendo sustentada mais por capital relacional do que por maturidade de gestão.`;
  }

  const strengthsHtml = strengths.length
    ? strengths
        .map((item) => {
          let text = "Esta dimensão aparece como ativo importante da experiência do colaborador.";
          if (item.name === "Trabalho em Equipe")
            text = "Este resultado revela cooperação, apoio entre colegas e qualidade relacional no cotidiano.";
          if (item.name === "Liderança")
            text = "Este resultado indica presença de apoio gerencial, respeito e alguma clareza de direção.";
          if (item.name === "Engajamento e Pertencimento")
            text = "Este bloco mostra vínculo emocional, orgulho de pertencer e sustentação de motivação.";
          return `<p style="margin:0 0 14px 0;"><strong>${escapeHtml(item.name)}</strong> (${fmt(
            item.score
          )}) — ${escapeHtml(text)}</p>`;
        })
        .join("")
    : `<p style="margin:0 0 24px 0;">O material não apresenta uma dimensão claramente robusta a ponto de ser tratada como força organizacional inequívoca.</p>`;

  const attentionsHtml = attentions.length
    ? attentions
        .map((item) => {
          let text =
            "Esta dimensão merece atenção prioritária porque afeta a consistência da experiência do colaborador.";
          if (item.name === "Reconhecimento e Valorização")
            text =
              "Quando esse bloco está frágil, tende a surgir percepção de injustiça, subjetividade e falta de transparência sobre mérito, promoção e valorização.";
          if (item.name === "Comunicação")
            text =
              "Resultados baixos aqui costumam revelar ruído entre áreas, desalinhamento e dificuldade de circulação clara de informações.";
          if (item.name === "Desenvolvimento e Crescimento")
            text =
              "Esta fragilidade mostra que o colaborador não enxerga com clareza um percurso de evolução dentro da empresa.";
          if (item.name === "Organização e Processos")
            text =
              "Este resultado costuma traduzir improviso, retrabalho, decisões pouco estruturadas e baixa previsibilidade.";
          if (item.name === "Condições de Trabalho")
            text =
              "Quando este bloco enfraquece, a rotina tende a perder sustentação operacional e aumentar desgaste.";
          return `<p style="margin:0 0 14px 0;"><strong>${escapeHtml(item.name)}</strong> (${fmt(
            item.score
          )}) — ${escapeHtml(text)}</p>`;
        })
        .join("")
    : `<p style="margin:0 0 24px 0;">Não há uma dimensão claramente crítica no material, mas isso não elimina a necessidade de leitura profunda por pergunta e por comentários abertos.</p>`;

  const openConfirmations = (() => {
    if (openResponses.length) {
      return `As respostas abertas e sinais qualitativos reforçam os achados quantitativos. Os temas mais recorrentes do material analisado foram: ${openResponses
        .map((x) => x.toLowerCase())
        .join("; ")}. Isso mostra que os comentários não contradizem os números; eles ajudam a explicar por que certas dimensões se sustentam e por que outras se deterioram.`;
    }

    if (blockAnalyses.length) {
      return `As análises textuais do próprio material apontam uma direção consistente: ${blockAnalyses
        .slice(0, 3)
        .join(" ")} Esse alinhamento entre bloco quantitativo e leitura descritiva aumenta a confiabilidade dos achados.`;
    }

    return "Mesmo quando o material qualitativo é limitado, a leitura executiva precisa considerar que médias não explicam sozinhas o clima; o sentido organizacional aparece quando números e narrativas são lidos em conjunto.";
  })();

  let organizationalInterpretation =
    "O retrato organizacional sugere uma empresa que precisa amadurecer coerência entre clima social, integração interna e estrutura de gestão.";
  if (relationalAverage !== null && structuralAverage !== null) {
    if (relationalAverage - structuralAverage >= 0.4) {
      organizationalInterpretation =
        "O retrato geral é de uma empresa que preserva um bom clima social, mas que começa a sentir o peso do crescimento ou da falta de formalização. Em outras palavras: o relacionamento humano está sustentando o clima mais do que os processos. Isso é positivo no curto prazo, mas arriscado no médio prazo.";
    } else if (structuralAverage > relationalAverage) {
      organizationalInterpretation =
        "O retrato organizacional sugere uma empresa com alguma base estrutural, mas que ainda precisa fortalecer vínculo, confiança e qualidade relacional para sustentar o clima de forma mais consistente.";
    } else {
      organizationalInterpretation =
        "O retrato organizacional sugere uma empresa em estágio intermediário de maturidade, com forças humanas relevantes, mas ainda com necessidade de maior previsibilidade, clareza e integração.";
    }
  }

  let riskText =
    "O maior risco é deixar tensões estruturais se acumularem até afetarem confiança, retenção e engajamento.";
  if (recognition || communication || growth || processes) {
    riskText =
      "O maior risco não parece ser conflito interpessoal, e sim frustração silenciosa. Hoje os colaboradores ainda podem demonstrar motivação e orgulho, mas já percebem incoerências em critérios de crescimento, integração e organização. Quando isso persiste, tende a afetar retenção, percepção de justiça e confiança na gestão.";
  }

  const priorities = [
    {
      title: "Transparência de reconhecimento e carreira",
      when:
        !!recognition ||
        criticalItems.some((item) =>
          /reconhecimento|promoção|promocao|critérios|criterios/i.test(item.label)
        ),
      text: "Prioridade máxima. Formalizar critérios de promoção, reconhecimento e progressão por nível. Esse tipo de fragilidade afeta diretamente justiça percebida, confiança e retenção.",
    },
    {
      title: "Integração entre áreas",
      when:
        !!communication ||
        /comunica[cç][aã]o entre [aá]reas|alinhamento inter[aá]reas|inter[aá]reas/i.test(material),
      text: "Criar rituais simples de alinhamento entre áreas, papéis mais claros e canais de comunicação mais previsíveis. O problema normalmente não é falta de boa vontade, mas falta de coordenação.",
    },
    {
      title: "Estrutura gerencial e operacional",
      when:
        !!growth ||
        !!processes ||
        /sobrecarga|ferramentas|feedback|processos|mudan[cç]as|decis[oõ]es/i.test(material),
      text: "Atuar em feedback estruturado, revisão de carga de trabalho, melhoria de ferramentas e maior organização das decisões e mudanças.",
    },
  ].filter((item) => item.when);

  const prioritiesHtml = (priorities.length
    ? priorities
    : [
        {
          title: "Consolidar prioridades do clima",
          text: "Transformar os principais achados em frentes práticas, com responsáveis, prazos e acompanhamento.",
        },
      ])
    .map(
      (item, index) =>
        `<p style="margin:0 0 14px 0;"><strong>${index + 1}. ${escapeHtml(
          item.title
        )}</strong><br />${escapeHtml(item.text)}</p>`
    )
    .join("");

  const criticalText = criticalItems.length
    ? `Os itens mais sensíveis do material reforçam essa leitura, com destaque para ${criticalItems
        .map((item) => `"${item.label}" = ${fmt(item.score)}`)
        .join(", ")}.`
    : "Mesmo quando a média geral parece aceitável, perguntas individuais muito baixas merecem atenção porque revelam os pontos de maior frustração do colaborador.";

  return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">ANÁLISE EXECUTIVA DOS RESULTADOS DA PESQUISA DE CLIMA</h1>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">1. Visão geral</h2>
  <p style="margin:0 0 24px 0;">${escapeHtml(overview)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">2. Leitura principal do clima</h2>
  <p style="margin:0 0 24px 0;">${escapeHtml(principalReading)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">3. Pontos fortes</h2>
  ${strengthsHtml}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">4. Pontos de atenção prioritários</h2>
  ${attentionsHtml}
  <p style="margin:0 0 24px 0;">${escapeHtml(criticalText)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">5. O que as respostas abertas confirmam</h2>
  <p style="margin:0 0 24px 0;">${escapeHtml(openConfirmations)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">6. Interpretação organizacional</h2>
  <p style="margin:0 0 24px 0;">${escapeHtml(organizationalInterpretation)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">7. Risco principal</h2>
  <p style="margin:0 0 24px 0;">${escapeHtml(riskText)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">8. Prioridades recomendadas</h2>
  <p style="margin:0 0 12px 0;"><strong>Eu colocaria as ações em 3 frentes:</strong></p>
  ${prioritiesHtml}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">9. Conclusão</h2>
  <p style="margin:0 0 0 0;">A empresa pode até preservar boas relações, respeito e senso de pertencimento, mas a pesquisa mostra que o próximo salto de maturidade depende menos de “melhorar o clima” de forma genérica e mais de dar previsibilidade, justiça e estrutura à experiência do colaborador. O clima não está necessariamente ruim; em muitos casos ele está sendo sustentado por vínculos humanos positivos, enquanto a gestão ainda pede amadurecimento.</p>
</section>
`;
}


function buildInterpretarDimensoesReport(session: ClimaSession) {
  const dimensoesTexto = String(session.dimensoesInterpretacao ?? "");
  const material = String(session.materialInterpretacao ?? "");
  const dims = unique([...extractDimensions(dimensoesTexto), ...extractDimensions(material)]);

  const blocks = dims.length
    ? dims.map((dim) => {
        const info = DIMENSION_LIBRARY[dim as keyof typeof DIMENSION_LIBRARY];
        return `
          <div style="margin:0 0 20px 0;">
            <p style="margin:0 0 8px 0;"><strong>${escapeHtml(info.label)}</strong></p>
            <p style="margin:0 0 4px 0;"><strong>O que essa dimensão mostra:</strong> ${escapeHtml(info.interpretation)}</p>
            <p style="margin:0 0 4px 0;"><strong>Riscos quando o resultado é baixo:</strong> ${escapeHtml(info.risks)}</p>
            <p style="margin:0 0 0 0;"><strong>Sugestão de foco analítico:</strong> ${escapeHtml(info.actions)}</p>
          </div>
        `;
      }).join("")
    : `<p style="margin:0 0 24px 0;">Não foi possível identificar dimensões específicas no material enviado, então a leitura foi mantida em nível geral.</p>`;

  return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">INTERPRETAÇÃO DE DIMENSÕES DO CLIMA</h1>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">1. Dimensões solicitadas</h2>
  <p style="margin:0 0 24px 0;">${escapeHtml(normalizeSentence(dimensoesTexto || "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">2. Material recebido</h2>
  <div style="margin:0 0 24px 0; padding:16px; border:1px solid #e5e7eb; border-radius:12px; white-space:pre-wrap;">${escapeHtml(material)}</div>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">3. Interpretação analítica por dimensão</h2>
  ${blocks}
</section>
`;
}

function buildRelatorioExecutivoReport(session: ClimaSession) {
  const material = String(session.materialRelatorioExecutivo ?? "").trim();

  const knownDimensions = [
    "Liderança",
    "Comunicação",
    "Reconhecimento e Valorização",
    "Trabalho em Equipe",
    "Condições de Trabalho",
    "Desenvolvimento e Crescimento",
    "Organização e Processos",
    "Engajamento e Pertencimento",
  ];

  function escRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function toNumber(value: string) {
    return Number(String(value).replace(",", "."));
  }

  function fmt(value: number) {
    return value.toFixed(1).replace(".", ",");
  }

  function parseCompanySize() {
    const match = material.match(/empresa com\s+(\d+)\s+colaboradores/i);
    return match ? Number(match[1]) : null;
  }

  function parseAreas() {
    const match = material.match(/Área\s+([^\n]+)/i);
    if (!match) return [];
    return match[1]
      .split(/\t| {2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function parseTenure() {
    const match = material.match(/Tempo de empresa\s+([^\n]+)/i);
    if (!match) return [];
    return match[1]
      .split(/\t| {2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function parseLevels() {
    const match = material.match(/Nível\s+([^\n]+)/i);
    if (!match) return [];
    return match[1]
      .split(/\t| {2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function parseOverallAverage() {
    const patterns = [
      /m[eé]dia geral da empresa\s*[:\-]?\s*([0-9]+[.,][0-9]+)/i,
      /m[eé]dia geral\s*[:\-]?\s*([0-9]+[.,][0-9]+)/i,
    ];
    for (const pattern of patterns) {
      const match = material.match(pattern);
      if (match) return toNumber(match[1]);
    }
    return null;
  }

  function parseDimensionScores() {
    const found = [];
    for (const name of knownDimensions) {
      const escaped = escRegExp(name);
      const patterns = [
        new RegExp(`${escaped}\\s*[–—\\-]\\s*M[eé]dia geral\\s*[:\\-]?\\s*([0-9]+[.,][0-9]+)`, "i"),
        new RegExp(`${escaped}[\\s\\S]{0,80}?M[eé]dia geral\\s*[:\\-]?\\s*([0-9]+[.,][0-9]+)`, "i"),
        new RegExp(`${escaped}\\s*\\(([0-9]+[.,][0-9]+)\\)`, "i"),
      ];

      for (const pattern of patterns) {
        const match = material.match(pattern);
        if (match) {
          found.push({ name, score: toNumber(match[1]) });
          break;
        }
      }
    }
    return found;
  }

  function parseCriticalItems() {
    const items = [];
    const rowRegex = /\n\s*\d+\.\d+\s+(.+?)\s+([0-9]+[.,][0-9]+)(?=\n|$)/g;
    let match;
    while ((match = rowRegex.exec(material)) !== null) {
      const label = match[1].replace(/\s+/g, " ").trim();
      const score = toNumber(match[2]);
      if (score <= 3.1) {
        items.push({ label, score });
      }
    }
    return items.sort((a, b) => a.score - b.score).slice(0, 6);
  }

  function parseBlockAnalyses() {
    const regex = /An[aá]lise:\s*(.+)/gi;
    const results = [];
    let match;
    while ((match = regex.exec(material)) !== null) {
      const text = match[1].replace(/\s+/g, " ").trim();
      if (text) results.push(text);
    }
    return results.slice(0, 10);
  }

  function findThemeLines() {
    const lines = material
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const positive = [];
    const negative = [];
    const suggestions = [];

    for (const line of lines) {
      if (line.length < 10) continue;

      if (/relacionamento|apoio entre colegas|coopera[cç][aã]o|respeito|flexibilidade|ambiente f[ií]sico|orgulho|pertencimento|lideran[cç]a/i.test(line)) {
        positive.push(line);
      }

      if (/comunica[cç][aã]o entre [aá]reas|promo[cç][aã]o|reconhecimento|sobrecarga|processos desorganizados|desorganiza[cç][aã]o|ferramentas|feedback|carreira|crescimento|mudan[cç]as|decis[oõ]es/i.test(line)) {
        negative.push(line);
      }

      if (/plano de carreira|alinhamentos inter[aá]reas|ferramentas|feedbacks estruturados|melhoria|sugest[aã]o|trilhas/i.test(line)) {
        suggestions.push(line);
      }
    }

    return {
      positive: positive.slice(0, 5),
      negative: negative.slice(0, 5),
      suggestions: suggestions.slice(0, 5),
    };
  }

  const companySize = parseCompanySize();
  const areas = parseAreas();
  const tenure = parseTenure();
  const levels = parseLevels();
  const overallAverage = parseOverallAverage();
  const dimensionScores = parseDimensionScores();
  const criticalItems = parseCriticalItems();
  const blockAnalyses = parseBlockAnalyses();
  const themes = findThemeLines();

  const strengths = [...dimensionScores].filter((item) => item.score >= 3.8).sort((a, b) => b.score - a.score);
  const weaknesses = [...dimensionScores].filter((item) => item.score <= 3.4).sort((a, b) => a.score - b.score);

  const teamwork = dimensionScores.find((d) => d.name === "Trabalho em Equipe");
  const leadership = dimensionScores.find((d) => d.name === "Liderança");
  const belonging = dimensionScores.find((d) => d.name === "Engajamento e Pertencimento");
  const recognition = dimensionScores.find((d) => d.name === "Reconhecimento e Valorização");
  const communication = dimensionScores.find((d) => d.name === "Comunicação");
  const growth = dimensionScores.find((d) => d.name === "Desenvolvimento e Crescimento");
  const processes = dimensionScores.find((d) => d.name === "Organização e Processos");

  const relationalDimensions = dimensionScores.filter((item) =>
    ["Trabalho em Equipe", "Liderança", "Engajamento e Pertencimento"].includes(item.name)
  );
  const structuralDimensions = dimensionScores.filter((item) =>
    ["Comunicação", "Reconhecimento e Valorização", "Condições de Trabalho", "Desenvolvimento e Crescimento", "Organização e Processos"].includes(item.name)
  );

  const relationalAverage =
    relationalDimensions.length
      ? relationalDimensions.reduce((sum, item) => sum + item.score, 0) / relationalDimensions.length
      : null;

  const structuralAverage =
    structuralDimensions.length
      ? structuralDimensions.reduce((sum, item) => sum + item.score, 0) / structuralDimensions.length
      : null;

  const strongestDimension = strengths[0] ?? teamwork ?? leadership ?? belonging ?? null;

  let summary = "A pesquisa indica um clima moderadamente positivo, com forças importantes na convivência e fragilidades mais concentradas na estrutura de gestão.";
  if (overallAverage !== null) {
    if (overallAverage >= 4.1) {
      summary = `A pesquisa indica um clima positivo, com média geral de ${fmt(overallAverage)}. Ainda assim, a leitura executiva mostra que o desafio da empresa não é apenas preservar boas relações, mas consolidar maturidade de gestão, previsibilidade e justiça organizacional.`;
    } else if (overallAverage >= 3.1) {
      summary = `A pesquisa indica um clima moderadamente positivo, com média geral de ${fmt(overallAverage)}. O ambiente não está deteriorado, mas a empresa já apresenta sinais claros de tensão em fatores de reconhecimento, estrutura, integração e crescimento.`;
    } else {
      summary = `A pesquisa indica um clima fragilizado, com média geral de ${fmt(overallAverage)}, exigindo atenção prioritária da liderança para fatores centrais da experiência do colaborador.`;
    }
  }

  let integratedReading = "A leitura integrada sugere que o clima está sendo sustentado mais pela qualidade das relações humanas do que pela maturidade dos processos organizacionais.";
  if (relationalAverage !== null && structuralAverage !== null) {
    if (relationalAverage - structuralAverage >= 0.4) {
      integratedReading = "A leitura integrada dos resultados mostra que o clima é sustentado mais pela qualidade das relações humanas do que pela maturidade dos processos organizacionais. Em outras palavras, existe boa convivência, respeito e pertencimento, mas ainda faltam maior clareza, previsibilidade e justiça em temas como promoção, reconhecimento, integração entre áreas e desenvolvimento de carreira.";
    } else if (structuralAverage > relationalAverage) {
      integratedReading = "A leitura integrada sugere uma base estrutural mais presente do que a relacional, o que indica a necessidade de fortalecer confiança, vínculo e qualidade da experiência humana no dia a dia.";
    }
  }

  const quantitativeHtml = dimensionScores.length
    ? `<ul style="margin:0 0 24px 22px; padding:0;">
        ${dimensionScores
          .sort((a, b) => b.score - a.score)
          .map((item) => `<li><strong>${escapeHtml(item.name)}</strong>: ${fmt(item.score)}</li>`)
          .join("")}
      </ul>`
    : `<p style="margin:0 0 24px 0;">Os resultados quantitativos não estavam estruturados o suficiente para consolidação por dimensão.</p>`;

  const strengthsHtml = strengths.length
    ? `<ul style="margin:0 0 24px 22px; padding:0;">
        ${strengths.map((item) => {
          let explanation = "Ativo relevante da experiência do colaborador.";
          if (item.name === "Trabalho em Equipe") explanation = "Indica cooperação, apoio entre colegas e respeito mútuo.";
          if (item.name === "Liderança") explanation = "Sinaliza liderança relativamente funcional, com apoio e clareza mais consistentes.";
          if (item.name === "Engajamento e Pertencimento") explanation = "Mostra orgulho, vínculo e motivação preservada.";
          return `<li><strong>${escapeHtml(item.name)}</strong> (${fmt(item.score)}) — ${escapeHtml(explanation)}</li>`;
        }).join("")}
      </ul>`
    : `<p style="margin:0 0 24px 0;">O material não mostra uma força claramente dominante, o que exige leitura cuidadosa do equilíbrio entre dimensões.</p>`;

  const weaknessesHtml = weaknesses.length
    ? weaknesses.map((item) => {
        let explanation = "Fragilidade relevante para a consistência da experiência do colaborador.";
        if (item.name === "Reconhecimento e Valorização") explanation = "Sugere insegurança sobre critérios de mérito, promoção e valorização.";
        if (item.name === "Comunicação") explanation = "Aponta ruído entre áreas, circulação frágil de informação e desalinhamento.";
        if (item.name === "Desenvolvimento e Crescimento") explanation = "Mostra falta de clareza sobre trilhas de carreira e evolução profissional.";
        if (item.name === "Organização e Processos") explanation = "Indica percepção de improviso, baixa previsibilidade e mudanças mal conduzidas.";
        return `<p style="margin:0 0 14px 0;"><strong>${escapeHtml(item.name)}</strong> (${fmt(item.score)}) — ${escapeHtml(explanation)}</p>`;
      }).join("")
    : `<p style="margin:0 0 24px 0;">As fragilidades não aparecem concentradas em uma única dimensão, mas ainda assim exigem leitura integrada.</p>`;

  const qualitativeSummary = (() => {
    const parts = [];
    if (themes.positive.length) {
      parts.push(`Os aspectos mais valorizados foram ${themes.positive.map((x) => x.toLowerCase()).join(", ")}.`);
    }
    if (themes.negative.length) {
      parts.push(`Os principais pedidos de melhoria se concentraram em ${themes.negative.map((x) => x.toLowerCase()).join(", ")}.`);
    }
    if (themes.suggestions.length) {
      parts.push(`As sugestões mais recorrentes incluíram ${themes.suggestions.map((x) => x.toLowerCase()).join(", ")}.`);
    }
    if (blockAnalyses.length) {
      parts.push(`As análises descritivas por bloco reforçam essa leitura, destacando que ${blockAnalyses.slice(0, 3).join(" ")}`);
    }
    return parts.length
      ? parts.join(" ")
      : "As respostas qualitativas reforçam o diagnóstico quantitativo e ajudam a explicar por que certas dimensões se sustentam e outras se fragilizam.";
  })();

  let executiveInterpretation = "O diagnóstico aponta uma organização com bom clima social e maturidade organizacional em desenvolvimento.";
  if (relationalAverage !== null && structuralAverage !== null && relationalAverage - structuralAverage >= 0.4) {
    executiveInterpretation = "O diagnóstico aponta uma organização com bom clima social e maturidade organizacional em desenvolvimento. O vínculo humano é forte, o que protege o engajamento e sustenta a cooperação. Por outro lado, processos, critérios e fluxos ainda não oferecem a mesma sensação de clareza e segurança.";
  }

  let riskText = "Os dados não sugerem um ambiente tóxico. O risco principal parece ser o desgaste silencioso.";
  if (recognition || communication || growth || processes) {
    riskText = "Os dados não sugerem um ambiente tóxico. O risco principal parece ser o desgaste silencioso. Quando colaboradores mantêm cooperação e orgulho, mas não percebem clareza sobre reconhecimento, carreira, decisões e integração entre áreas, a tendência é que o clima continue aparentemente estável enquanto cresce internamente a sensação de injustiça, sobrecarga ou desorganização.";
  }

  const priorities = [
    {
      title: "Tornar o reconhecimento mais claro e justo",
      when: !!recognition || criticalItems.some((item) => /promoção|promocao|reconhecimento|critérios|criterios/i.test(item.label)),
      text: "Formalizar critérios de promoção, progressão e reconhecimento, com comunicação transparente e matriz de competências por nível.",
    },
    {
      title: "Melhorar a integração entre áreas",
      when: !!communication || /comunica[cç][aã]o entre [aá]reas|alinhamento inter[aá]reas/i.test(material),
      text: "Criar rituais simples de alinhamento, revisar fluxos de comunicação e definir responsabilidades compartilhadas entre departamentos.",
    },
    {
      title: "Estruturar desenvolvimento e carreira",
      when: !!growth || /plano de carreira|crescimento|desenvolvimento/i.test(material),
      text: "Divulgar trilhas de crescimento, fortalecer PDIs e ampliar a percepção de oportunidade interna.",
    },
    {
      title: "Organizar processos e decisões",
      when: !!processes || /processos|mudan[cç]as|decis[oõ]es/i.test(material),
      text: "Mapear fluxos críticos, esclarecer papéis, melhorar a gestão de mudanças e reduzir a percepção de improviso.",
    },
    {
      title: "Atuar em carga de trabalho e ferramentas",
      when: /sobrecarga|ferramentas|sistemas/i.test(material),
      text: "Revisar distribuição de demandas e diagnosticar gargalos tecnológicos que afetam produtividade e experiência do colaborador.",
    },
  ].filter((item) => item.when);

  const prioritiesHtml = (priorities.length ? priorities : [
    {
      title: "Converter os achados em plano estruturado",
      text: "Definir prioridades, responsáveis, prazo e indicadores para que o diagnóstico gere ação concreta.",
    }
  ]).map((item, index) => `
    <p style="margin:0 0 14px 0;"><strong>${index + 1}. ${escapeHtml(item.title)}</strong><br />${escapeHtml(item.text)}</p>
  `).join("");

  const criticalItemsHtml = criticalItems.length
    ? `<p style="margin:0 0 24px 0;">Os itens mais sensíveis da pesquisa foram: ${criticalItems.map((item) => `${escapeHtml(item.label)}: ${fmt(item.score)}`).join("; ")}.</p>`
    : `<p style="margin:0 0 24px 0;">Os itens críticos mais baixos devem ser identificados e acompanhados, porque costumam revelar o ponto de maior frustração do colaborador.</p>`;

  return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">RELATÓRIO EXECUTIVO — PESQUISA DE CLIMA ORGANIZACIONAL</h1>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">1. Objetivo</h2>
  <p style="margin:0 0 24px 0;">Avaliar a percepção dos colaboradores sobre o ambiente de trabalho, identificar pontos fortes e fragilidades do clima organizacional e orientar prioridades de ação para a liderança.${companySize ? ` O levantamento considerou ${companySize} colaboradores.` : ""}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">2. Resumo executivo</h2>
  <p style="margin:0 0 8px 0;">${escapeHtml(summary)}</p>
  <p style="margin:0 0 24px 0;">${escapeHtml(integratedReading)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">3. Perfil da amostra</h2>
  <p style="margin:0 0 8px 0;">Participaram ${companySize ?? "os"} colaboradores analisados no material enviado.</p>
  ${areas.length ? `<p style="margin:0 0 8px 0;"><strong>Áreas:</strong> ${escapeHtml(areas.join(" | "))}</p>` : ""}
  ${tenure.length ? `<p style="margin:0 0 8px 0;"><strong>Tempo de empresa:</strong> ${escapeHtml(tenure.join(" | "))}</p>` : ""}
  ${levels.length ? `<p style="margin:0 0 24px 0;"><strong>Níveis:</strong> ${escapeHtml(levels.join(" | "))}</p>` : `<p style="margin:0 0 24px 0;">A distribuição da amostra mostra presença de diferentes grupos organizacionais, o que amplia a utilidade do diagnóstico para leitura mais abrangente.</p>`}

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">4. Principais resultados quantitativos</h2>
  ${quantitativeHtml}
  ${criticalItemsHtml}

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">5. Principais pontos fortes</h2>
  ${strengthsHtml}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">6. Principais fragilidades</h2>
  ${weaknessesHtml}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">7. Síntese das respostas qualitativas</h2>
  <p style="margin:0 0 24px 0;">${escapeHtml(qualitativeSummary)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">8. Interpretação executiva</h2>
  <p style="margin:0 0 24px 0;">${escapeHtml(executiveInterpretation)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">9. Riscos organizacionais</h2>
  <p style="margin:0 0 24px 0;">${escapeHtml(riskText)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">10. Prioridades estratégicas recomendadas</h2>
  ${prioritiesHtml}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">11. Conclusão</h2>
  <p style="margin:0 0 24px 0;">A empresa possui um ativo valioso: ${escapeHtml(strongestDimension ? strongestDimension.name.toLowerCase() : "relações saudáveis, cooperação interna e senso de pertencimento")}. Isso cria uma base favorável para evolução. O próximo passo não é apenas preservar esse clima positivo, mas transformá-lo em uma experiência mais estruturada, justa e previsível. O diagnóstico mostra que o clima não está fragilizado nas relações humanas; ele está pedindo amadurecimento de gestão.</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">12. Encaminhamento sugerido</h2>
  <p style="margin:0 0 0 0;">Como desdobramento deste relatório, recomenda-se apresentar à liderança um plano de ação com responsáveis, prazo e indicadores de acompanhamento, priorizando as frentes mais críticas identificadas neste diagnóstico. O valor do relatório está justamente em transformar leitura executiva em decisão prática.</p>
</section>
`;
}


function buildPlanoAcaoReport(session: ClimaSession) {
  const material = String(session.materialPlanoAcao ?? "").trim();

  function normalizeLine(value: string) {
    const text = String(value ?? "").trim().replace(/\s+/g, " ");
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function detectFronts() {
    const lower = material.toLowerCase();
    const fronts: Array<{
      title: string;
      why: string;
      actions: string[];
      owners: string;
      deadline: string;
      indicators: string[];
      preserve?: boolean;
    }> = [];

    if (/reconhecimento|promoção|promocao|carreira|crescimento|progress[aã]o|crit[eé]rios/i.test(lower)) {
      fronts.push({
        title: "Tornar reconhecimento e crescimento mais claros",
        why:
          "Esse tema merece prioridade porque afeta diretamente percepção de justiça, confiança na gestão, motivação e retenção. Quando critérios de crescimento, reconhecimento e promoção não são percebidos como claros, a tendência é surgir frustração silenciosa, mesmo em empresas com bom clima relacional.",
        actions: [
          "Definir critérios objetivos para promoção e progressão.",
          "Criar uma matriz simples de competências por nível ou cargo.",
          "Padronizar conversas de feedback e desenvolvimento.",
          "Comunicar de forma clara como funcionam reconhecimento, crescimento e próximos passos."
        ],
        owners: "RH + diretoria + gestores",
        deadline: "30 a 60 dias",
        indicators: [
          "% de cargos com critérios de progressão definidos",
          "% de colaboradores com conversa formal de desenvolvimento realizada",
          "Evolução da percepção sobre critérios de reconhecimento e promoção"
        ]
      });
    }

    if (/comunica[cç][aã]o entre [aá]reas|inter[aá]reas|alinhamento|silos|integra[cç][aã]o/i.test(lower)) {
      fronts.push({
        title: "Melhorar a comunicação entre áreas",
        why:
          "Esse ponto merece prioridade porque problemas entre áreas geram ruído, retrabalho, lentidão e desgaste. Normalmente, o problema não está dentro das equipes, mas na interface entre elas.",
        actions: [
          "Criar um rito periódico de alinhamento entre áreas-chave.",
          "Definir responsáveis por interface entre setores.",
          "Revisar canais e frequência de comunicação entre áreas.",
          "Documentar fluxos simples de passagem de demanda entre times."
        ],
        owners: "Lideranças das áreas + RH/Operações como facilitador",
        deadline: "Início em até 15 dias",
        indicators: [
          "Número de alinhamentos interáreas realizados",
          "Redução de retrabalho e conflitos de interface",
          "Evolução da percepção sobre comunicação entre áreas"
        ]
      });
    }

    if (/desenvolvimento|pdi|trilha|carreira|evolu[cç][aã]o|crescimento/i.test(lower)) {
      fronts.push({
        title: "Estruturar desenvolvimento e carreira",
        why:
          "Esse tema merece prioridade porque a percepção de futuro dentro da empresa impacta diretamente motivação, permanência e energia de contribuição. Sem clareza de crescimento, o engajamento tende a perder força no médio prazo.",
        actions: [
          "Implantar PDI simples para os colaboradores.",
          "Definir trilhas de desenvolvimento por família de cargo.",
          "Alinhar uma competência prioritária de desenvolvimento por pessoa.",
          "Conectar feedback, capacitação e possibilidade real de evolução."
        ],
        owners: "RH + gestores diretos",
        deadline: "45 a 90 dias",
        indicators: [
          "% de colaboradores com PDI ativo",
          "% de líderes treinados para conduzir PDI",
          "Evolução da percepção sobre caminhos de desenvolvimento"
        ]
      });
    }

    if (/processos|decis[oõ]es|mudan[cç]as|desorganiza[cç][aã]o|burocracia|improviso/i.test(lower)) {
      fronts.push({
        title: "Dar mais previsibilidade aos processos e decisões",
        why:
          "Esse ponto merece prioridade porque falta de organização, processos confusos e mudanças mal conduzidas enfraquecem segurança, clareza e confiança no funcionamento da empresa.",
        actions: [
          "Mapear os processos mais críticos da operação.",
          "Definir papéis, aprovações e prazos desses fluxos.",
          "Criar um padrão mínimo para comunicação de mudanças.",
          "Divulgar decisões relevantes com contexto, motivo e impacto esperado."
        ],
        owners: "Diretoria + gestores + áreas de apoio",
        deadline: "30 a 90 dias",
        indicators: [
          "Número de processos críticos revisados",
          "Tempo médio de decisão e aprovação",
          "Evolução da percepção sobre organização e condução de mudanças"
        ]
      });
    }

    if (/sobrecarga|carga de trabalho|ferramentas|sistemas|manual|retrabalho/i.test(lower)) {
      fronts.push({
        title: "Atuar em sobrecarga e ferramentas",
        why:
          "Esse tema merece prioridade porque desgaste operacional, gargalos de ferramenta e excesso de demanda corroem a experiência do colaborador mesmo quando o clima relacional ainda é positivo.",
        actions: [
          "Revisar distribuição de demandas por equipe.",
          "Levantar gargalos de sistema e ferramentas.",
          "Separar problemas de capacidade, prioridade e processo.",
          "Definir melhorias rápidas de produtividade."
        ],
        owners: "Gestores de área + TI/Operações",
        deadline: "30 a 60 dias",
        indicators: [
          "Evolução da percepção sobre carga de trabalho",
          "Número de gargalos eliminados",
          "Redução de retrabalho e manualidades"
        ]
      });
    }

    if (!fronts.length) {
      fronts.push(
        {
          title: "Estruturar prioridades de reconhecimento e justiça interna",
          why:
            "Mesmo quando o material não explicita todos os pontos, temas de reconhecimento, justiça e clareza de crescimento costumam ter forte impacto no clima e na retenção.",
          actions: [
            "Definir critérios mínimos de reconhecimento e progressão.",
            "Padronizar feedback e devolutivas.",
            "Comunicar melhor critérios e expectativas."
          ],
          owners: "RH + gestores",
          deadline: "30 a 60 dias",
          indicators: [
            "Percepção de justiça nos critérios",
            "Frequência de feedback formal",
            "Clareza de reconhecimento"
          ]
        },
        {
          title: "Fortalecer integração e comunicação entre áreas",
          why:
            "A interface entre áreas costuma ser uma das maiores fontes de desgaste quando o clima é lido em profundidade.",
          actions: [
            "Definir responsáveis por interface entre áreas.",
            "Criar alinhamentos curtos e frequentes.",
            "Revisar fluxo de repasse de demandas."
          ],
          owners: "Lideranças + RH",
          deadline: "15 a 45 dias",
          indicators: [
            "Redução de ruídos entre áreas",
            "Mais clareza no repasse de demandas",
            "Evolução da percepção sobre comunicação"
          ]
        },
        {
          title: "Dar mais previsibilidade à experiência interna",
          why:
            "O clima melhora de forma sustentada quando o colaborador percebe mais estrutura, previsibilidade e coerência entre discurso e prática.",
          actions: [
            "Mapear processos críticos.",
            "Formalizar decisões recorrentes.",
            "Estabelecer padrão de comunicação de mudanças."
          ],
          owners: "Diretoria + gestores",
          deadline: "30 a 90 dias",
          indicators: [
            "Percepção sobre organização",
            "Tempo de decisão",
            "Redução de improvisos"
          ]
        }
      );
    }

    return fronts.slice(0, 5);
  }

  function detectPreservePoints() {
    const lower = material.toLowerCase();
    const preserve = [];

    if (/trabalho em equipe|coopera[cç][aã]o|apoio entre colegas|respeito/i.test(lower)) {
      preserve.push("o bom trabalho em equipe, a cooperação e o respeito entre as pessoas");
    }
    if (/orgulho|pertencimento|engajamento/i.test(lower)) {
      preserve.push("o orgulho de pertencer e o vínculo emocional com a empresa");
    }
    if (/lideran[cç]a|apoio do gestor/i.test(lower)) {
      preserve.push("os sinais positivos de apoio e respeito da liderança");
    }
    if (/flexibilidade|ambiente f[ií]sico/i.test(lower)) {
      preserve.push("os aspectos positivos do ambiente e da flexibilidade");
    }

    return preserve.length
      ? preserve
      : ["os elementos relacionais que hoje sustentam o clima, como respeito, cooperação e senso de pertencimento"];
  }

  const fronts = detectFronts();
  const preservePoints = detectPreservePoints();

  const frontsHtml = fronts.map((front, index) => `
    <h3 style="font-size:20px; font-weight:700; margin:24px 0 10px 0;">${index + 1}) ${escapeHtml(front.title)}</h3>

    <p style="margin:0 0 8px 0;"><strong>Por que priorizar:</strong> ${escapeHtml(front.why)}</p>

    <p style="margin:0 0 8px 0;"><strong>Ações:</strong></p>
    <ul style="margin:0 0 12px 22px; padding:0;">
      ${front.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}
    </ul>

    <p style="margin:0 0 6px 0;"><strong>Responsáveis:</strong> ${escapeHtml(front.owners)}</p>
    <p style="margin:0 0 6px 0;"><strong>Prazo sugerido:</strong> ${escapeHtml(front.deadline)}</p>

    <p style="margin:0 0 8px 0;"><strong>Indicadores de acompanhamento:</strong></p>
    <ul style="margin:0 0 12px 22px; padding:0;">
      ${front.indicators.map((indicator) => `<li>${escapeHtml(indicator)}</li>`).join("")}
    </ul>
  `).join("");

  const first30 = [
    "Comunicar resultados e prioridades.",
    "Escolher responsáveis por cada frente.",
    "Iniciar rituais de alinhamento entre áreas.",
    "Mapear processos e gargalos mais críticos.",
    "Definir as primeiras ações rápidas de correção."
  ];

  const next30 = [
    "Iniciar feedbacks estruturados.",
    "Publicar critérios iniciais de reconhecimento, crescimento ou interface entre áreas.",
    "Implantar ações-piloto nas frentes priorizadas.",
    "Acompanhar execução com líderes e responsáveis."
  ];

  const last30 = [
    "Consolidar aprendizados do primeiro ciclo.",
    "Medir evolução inicial dos indicadores.",
    "Aplicar pulso curto de acompanhamento.",
    "Ajustar o plano conforme a reação dos colaboradores e da liderança."
  ];

  const summary = (() => {
    const order = fronts.map((f) => f.title).join("; ");
    return `Minha priorização seria: ${order}. Essa ordem faz sentido porque ataca primeiro os temas que mais ameaçam percepção de justiça, clareza, previsibilidade e sustentação do clima — sem perder os ativos relacionais que hoje protegem a experiência do colaborador.`;
  })();

  return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">PLANO DE AÇÃO SUGERIDO</h1>

  <p style="margin:0 0 24px 0;">Com base nos achados enviados, eu sugeriria um plano de ação em frentes prioritárias, com execução em até 90 dias. A lógica é simples: atacar primeiro os temas que mais fragilizam percepção de justiça, clareza, integração e previsibilidade, sem perder o que hoje sustenta o clima.</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">Plano de ação sugerido</h2>
  ${frontsHtml}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">O que preservar</h2>
  <p style="margin:0 0 24px 0;">O plano não deve focar só nas dores. Também é importante preservar ${escapeHtml(preservePoints.join("; "))}, porque esses elementos funcionam como ativos relevantes do clima. Melhorar a estrutura não pode destruir o que já funciona bem na experiência humana.</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">Sequência prática de 90 dias</h2>

  <h3 style="font-size:20px; font-weight:700; margin:18px 0 8px 0;">Primeiros 30 dias</h3>
  <ul style="margin:0 0 16px 22px; padding:0;">
    ${first30.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <h3 style="font-size:20px; font-weight:700; margin:18px 0 8px 0;">De 31 a 60 dias</h3>
  <ul style="margin:0 0 16px 22px; padding:0;">
    ${next30.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <h3 style="font-size:20px; font-weight:700; margin:18px 0 8px 0;">De 61 a 90 dias</h3>
  <ul style="margin:0 0 24px 22px; padding:0;">
    ${last30.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">Síntese executiva</h2>
  <p style="margin:0 0 0 0;">${escapeHtml(summary)}</p>
</section>
`;
}


export function buildClimaReport(session: ClimaSession) {
  switch (session.caminho) {
    case "montar_questionario":
      return buildMontarQuestionarioReport(session);
    case "adaptar_questionario":
      return buildAdaptarQuestionarioReport(session);
    case "analisar_resultados":
      return buildAnaliseResultadosReport(session);
    case "interpretar_dimensoes":
      return buildInterpretarDimensoesReport(session);
    case "relatorio_executivo":
      return buildRelatorioExecutivoReport(session);
    case "plano_acao":
      return buildPlanoAcaoReport(session);
    default:
      return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">PESQUISA DE CLIMA ORGANIZACIONAL</h1>
  <p style="margin:0 0 0 0;">Não foi possível identificar o caminho do agente para montar o relatório final.</p>
</section>
`;
  }
}

export function getClimaTargetRole(session: ClimaSession) {
  return pathLabel(session.caminho);
}
