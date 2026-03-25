type ParsedItem = {
  area: string;
  bloco: string;
  item: string;
  nota: number;
  raw: string;
};

type BlockSummary = {
  bloco: string;
  media: number;
  classificacao: string;
  leitura: string;
};

function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalize(text: unknown) {
  return String(text ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/^[\-\•\*\|\;\:]+/, "")
    .replace(/[\|\;\:]+$/, "")
    .trim();
}

function toTitle(text: string) {
  return cleanText(text)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function classify(score: number) {
  if (score <= 3.9) return "CRÍTICO";
  if (score <= 5.9) return "ATENÇÃO";
  if (score <= 7.9) return "ADEQUADO";
  return "EXCELÊNCIA";
}

function average(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function canonicalBlock(value: string): string | null {
  const lower = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const rules: Array<[RegExp, string]> = [
    [/\bproposito|propósito|engajamento|pertencimento\b/, "Propósito"],
    [/\bestrutura|organizacao|organização|processos|papel|cargo\b/, "Estrutura"],
    [/\brelacionamento|comunicacao|comunicação|colaboracao|colaboração|conflito|equipe\b/, "Relacionamento"],
    [/\brecompensa|salario|salário|promocao|promoção|reconhecimento|valorizacao|valorização|justica salarial|justiça salarial\b/, "Recompensa"],
    [/\blideranca|liderança|gestor|supervisor|feedback|lider\b/, "Liderança"],
    [/\bmecanismo de apoio|apoio|ferramenta|sistema|infraestrutura|treinamento|desenvolvimento|condicoes de trabalho|condições de trabalho\b/, "Mecanismo de Apoio"],
    [/\bresponsabilidade|comprometimento|resultado|responsavel|responsável\b/, "Responsabilidade"],
  ];

  for (const [regex, target] of rules) {
    if (regex.test(lower)) return target;
  }

  return null;
}

function extractScore(line: string): number | null {
  const matches = [...line.matchAll(/(?:^|[^\d])(\d{1,2}(?:[.,]\d+)?)(?:[^\d]|$)/g)];
  if (!matches.length) return null;

  for (let i = matches.length - 1; i >= 0; i--) {
    const value = Number(matches[i][1].replace(",", "."));
    if (value >= 1 && value <= 10) return value;
  }

  return null;
}

function tryParseStructuredLine(line: string): ParsedItem | null {
  const raw = cleanText(line);
  if (raw.length < 8) return null;

  const score = extractScore(raw);
  if (score === null) return null;

  const parts = raw.split(/\t| \| | \- |;/).map(cleanText).filter(Boolean);

  let area = "Não informado";
  let bloco = "";
  let item = "";

  const blockPart = parts.find((p) => canonicalBlock(p));
  if (blockPart) {
    bloco = canonicalBlock(blockPart) || "";
  } else {
    bloco = canonicalBlock(raw) || "";
  }

  if (!bloco) return null;

  if (parts.length >= 3) {
    const maybeArea = parts[0];
    const maybeBlock = parts.find((p) => canonicalBlock(p));
    const scorePart = parts.find((p) => extractScore(p) !== null);

    if (maybeArea && maybeArea !== maybeBlock && extractScore(maybeArea) === null && !canonicalBlock(maybeArea)) {
      area = toTitle(maybeArea);
    }

    const filtered = parts.filter((p) => p !== maybeArea && p !== maybeBlock && p !== scorePart);
    item = cleanText(filtered.join(" "));
  }

  if (!item) {
    item = raw
      .replace(/\d{1,2}(?:[.,]\d+)?/g, "")
      .replace(new RegExp(bloco, "i"), "")
      .replace(/\s+/g, " ")
      .trim();
  }

  item = cleanText(item);

  if (item.length < 5) return null;

  return {
    area,
    bloco,
    item,
    nota: score,
    raw,
  };
}

function extractItems(material: string): ParsedItem[] {
  const lines = normalize(material)
    .split("\n")
    .map(cleanText)
    .filter(Boolean);

  const parsed: ParsedItem[] = [];

  for (const line of lines) {
    const item = tryParseStructuredLine(line);
    if (item) parsed.push(item);
  }

  const dedup = new Map<string, ParsedItem>();
  for (const item of parsed) {
    const key = `${item.area}||${item.bloco}||${item.item}||${item.nota}`;
    if (!dedup.has(key)) dedup.set(key, item);
  }

  return [...dedup.values()];
}

function buildBlockSummaries(items: ParsedItem[]): BlockSummary[] {
  const order = [
    "Propósito",
    "Estrutura",
    "Relacionamento",
    "Recompensa",
    "Liderança",
    "Mecanismo de Apoio",
    "Responsabilidade",
  ];

  return order
    .map((bloco) => {
      const list = items.filter((i) => i.bloco === bloco);
      if (!list.length) return null;

      const media = average(list.map((i) => i.nota));
      const pior = [...list].sort((a, b) => a.nota - b.nota)[0];
      const melhor = [...list].sort((a, b) => b.nota - a.nota)[0];
      const classificacao = classify(media);

      const leitura =
        classificacao === "CRÍTICO"
          ? `A dimensão apresenta criticidade elevada. O item mais sensível é "${pior.item}", o que exige intervenção imediata.`
          : classificacao === "ATENÇÃO"
          ? `A dimensão exige melhoria prioritária. O item mais frágil é "${pior.item}", enquanto "${melhor.item}" aparece como aspecto relativamente mais estável.`
          : classificacao === "ADEQUADO"
          ? `A dimensão está em nível adequado. O destaque positivo está em "${melhor.item}", mantendo espaço para evolução contínua.`
          : `A dimensão aparece como força organizacional. O principal destaque está em "${melhor.item}".`;

      return {
        bloco,
        media,
        classificacao,
        leitura,
      };
    })
    .filter(Boolean) as BlockSummary[];
}

function parseOpenSections(material: string) {
  const lines = normalize(material)
    .split("\n")
    .map(cleanText)
    .filter(Boolean);

  let current: "ambiente" | "melhorar" | "sugestoes" | "destaques" | null = null;

  const out = {
    ambiente: [] as string[],
    melhorar: [] as string[],
    sugestoes: [] as string[],
    destaques: [] as string[],
  };

  for (const line of lines) {
    const lower = line
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (/bom ambiente|contribui|ambiente positivo/.test(lower)) {
      current = "ambiente";
      continue;
    }
    if (/precisa melhorar|mais precisa melhorar|pontos a melhorar/.test(lower)) {
      current = "melhorar";
      continue;
    }
    if (/sugestoes|sugestoes de melhoria|melhorias/.test(lower)) {
      current = "sugestoes";
      continue;
    }
    if (/destaques adicionais|comentarios|comentários|observacoes|observações/.test(lower)) {
      current = "destaques";
      continue;
    }

    if (current && line.length >= 8 && extractScore(line) === null) {
      out[current].push(line);
    }
  }

  return out;
}

const actionBase: Record<string, { acao: string; etapas: string; grupo: string; resultado: string }> = {
  "Propósito": {
    acao: "Identidade Organizacional",
    etapas: "Revisar missão, visão e valores, alinhar a MCO e comunicar amplamente os direcionadores da organização.",
    grupo: "Diretoria, liderança e RH",
    resultado: "Maior clareza organizacional, alinhamento e fortalecimento do senso de direção.",
  },
  "Estrutura": {
    acao: "Redesenho de Processos ou Revisão de Descrições de Cargos",
    etapas: "Mapear atividades, revisar responsabilidades e redistribuir funções conforme a operação real.",
    grupo: "Gestão, RH e áreas envolvidas",
    resultado: "Maior clareza de papéis, redução de sobreposição e ganho de organização.",
  },
  "Relacionamento": {
    acao: "Programa de Desenvolvimento de Talentos",
    etapas: "Diagnosticar necessidades de relacionamento, promover mentoria interna e fortalecer integração entre equipes.",
    grupo: "RH, líderes e colaboradores",
    resultado: "Melhoria da colaboração, da convivência e da comunicação entre pessoas e áreas.",
  },
  "Recompensa": {
    acao: "Revisão da Política de Remuneração",
    etapas: "Realizar pesquisa salarial, revisar equidade interna e reavaliar critérios de recompensa e valorização.",
    grupo: "RH, diretoria e liderança",
    resultado: "Aumento da percepção de justiça, reconhecimento e retenção.",
  },
  "Liderança": {
    acao: "Programa de Desenvolvimento de Líderes",
    etapas: "Treinar lideranças em comunicação, feedback, acompanhamento de equipe e práticas de gestão.",
    grupo: "Lideranças e RH",
    resultado: "Fortalecimento da liderança, maior clareza de direção e melhor suporte à equipe.",
  },
  "Mecanismo de Apoio": {
    acao: "Sistema de Gestão de Desempenho",
    etapas: "Definir indicadores, revisar instrumentos de apoio e treinar avaliadores e gestores.",
    grupo: "RH, gestores e áreas de apoio",
    resultado: "Mais consistência na gestão, melhor acompanhamento e suporte à operação.",
  },
  "Responsabilidade": {
    acao: "Engajamento e Responsabilidade",
    etapas: "Promover workshops de propósito, reforçar combinados e reconhecer entregas e resultados.",
    grupo: "RH, liderança e colaboradores",
    resultado: "Maior comprometimento, responsabilização e foco em entrega.",
  },
};

function buildActionPlan(blocks: BlockSummary[]) {
  const criticals = blocks.filter((b) => b.media < 6);

  if (!criticals.length) {
    return [
      {
        fator: "Nenhuma dimensão abaixo de 6,0",
        ponto: "O material analisado não apresentou dimensão abaixo do ponto de corte definido.",
        acao: "Manutenção e monitoramento",
        etapas: "Manter acompanhamento periódico para garantir estabilidade dos resultados.",
        grupo: "RH e liderança",
        resultado: "Preservação dos pontos positivos e monitoramento preventivo.",
      },
    ];
  }

  return criticals.map((b) => {
    const base = actionBase[b.bloco];
    return {
      fator: b.bloco,
      ponto: `Média ${b.media.toFixed(1)} classificada como ${b.classificacao}.`,
      acao: base.acao,
      etapas: base.etapas,
      grupo: base.grupo,
      resultado: base.resultado,
    };
  });
}

export function buildAnalistaDiagnosticoSixBoxReport(rawAnswers: any) {
  const material = normalize(
    rawAnswers?.materialBruto ??
      rawAnswers?.arquivosRecebidos ??
      rawAnswers?.texto ??
      ""
  );

  const items = extractItems(material);

  if (items.length < 7) {
    return `
<section>
  <h1>Diagnóstico Organizacional Consolidado</h1>
  <p>Não há base suficiente nas respostas enviadas pelo usuário para gerar uma análise válida.</p>
  <p>Para continuar, envie um material compreensível com itens, dimensões e notas do questionário.</p>
</section>
`.trim();
  }

  const blockSummaries = buildBlockSummaries(items);
  const mediaGeral = average(blockSummaries.map((b) => b.media));
  const melhor = [...blockSummaries].sort((a, b) => b.media - a.media)[0];
  const pior = [...blockSummaries].sort((a, b) => a.media - b.media)[0];
  const abertas = parseOpenSections(material);
  const plano = buildActionPlan(blockSummaries);

  const matrix = blockSummaries.map((b) => {
    const list = items.filter((i) => i.bloco === b.bloco).slice(0, 4);
    const notas = [0, 1, 2, 3].map((idx) => list[idx]?.nota ?? 0);
    return { bloco: b.bloco, notas, media: average(list.map((i) => i.nota)) };
  });

  const validMatrixValues = matrix.flatMap((m) =>
    m.notas.map((v, idx) => ({ bloco: m.bloco, item: idx + 1, valor: v })).filter((x) => x.valor > 0)
  );

  const melhorPonto = [...validMatrixValues].sort((a, b) => b.valor - a.valor)[0];
  const piorPonto = [...validMatrixValues].sort((a, b) => a.valor - b.valor)[0];

  const generalRead = `O melhor desempenho aparece em ${melhor.bloco} (${melhor.media.toFixed(1)}), enquanto o maior ponto de atenção está em ${pior.bloco} (${pior.media.toFixed(1)}).`;

  const closing = `O material analisado indica que a prioridade estratégica está nas dimensões com menor média, especialmente ${[...blockSummaries].sort((a, b) => a.media - b.media).slice(0, 3).map((b) => b.bloco).join(", ")}. Os blocos mais fortes devem ser preservados como base de sustentação da organização.`;

  return `
<section>
  <h1>Diagnóstico Organizacional Consolidado</h1>

  <h2>1. Resumo Executivo</h2>
  <table>
    <tbody>
      <tr><td><strong>Base Processada</strong></td><td>${esc(rawAnswers?.baseProcessada ?? "Material enviado pelo usuário")}</td></tr>
      <tr><td><strong>Média Geral</strong></td><td>${esc(mediaGeral.toFixed(1))}</td></tr>
      <tr><td><strong>Leitura Geral</strong></td><td>${esc(generalRead)}</td></tr>
    </tbody>
  </table>

  <h2>2. Blocos e Itens</h2>
  <table>
    <thead>
      <tr>
        <th>Bloco</th>
        <th>Item</th>
        <th>Média</th>
        <th>Classificação</th>
        <th>Observação</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((i) => `
      <tr>
        <td>${esc(i.bloco)}</td>
        <td>${esc(i.item)}</td>
        <td>${esc(i.nota.toFixed(1))}</td>
        <td>${esc(classify(i.nota))}</td>
        <td>${esc(`Item classificado em ${classify(i.nota)} com base na nota enviada.`)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>3. Análise Qualitativa</h2>

  <h3>O que contribui para o bom ambiente</h3>
  <table>
    <thead><tr><th>Tema</th><th>Frequência</th><th>Leitura</th></tr></thead>
    <tbody>
      ${(abertas.ambiente.length ? abertas.ambiente : ["Não informado na coleta"]).map((t, idx) => `
      <tr>
        <td>${esc(t)}</td>
        <td>${esc(abertas.ambiente.length ? Math.max(1, abertas.ambiente.length - idx) : 0)}</td>
        <td>${esc(abertas.ambiente.length ? "Tema identificado nas respostas abertas." : "Sem base suficiente nas respostas abertas.")}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h3>O que mais precisa melhorar</h3>
  <table>
    <thead><tr><th>Tema</th><th>Frequência</th><th>Leitura</th></tr></thead>
    <tbody>
      ${(abertas.melhorar.length ? abertas.melhorar : ["Não informado na coleta"]).map((t, idx) => `
      <tr>
        <td>${esc(t)}</td>
        <td>${esc(abertas.melhorar.length ? Math.max(1, abertas.melhorar.length - idx) : 0)}</td>
        <td>${esc(abertas.melhorar.length ? "Tema identificado nas respostas abertas." : "Sem base suficiente nas respostas abertas.")}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h3>Sugestões de melhoria e destaques adicionais</h3>
  <table>
    <thead><tr><th>Tema</th><th>Frequência</th><th>Leitura</th></tr></thead>
    <tbody>
      ${(abertas.sugestoes.length ? abertas.sugestoes : ["Não informado na coleta"]).map((t, idx) => `
      <tr>
        <td>${esc(t)}</td>
        <td>${esc(abertas.sugestoes.length ? Math.max(1, abertas.sugestoes.length - idx) : 0)}</td>
        <td>${esc(abertas.sugestoes.length ? "Sugestão identificada nas respostas abertas." : "Sem base suficiente nas respostas abertas.")}</td>
      </tr>`).join("")}
      ${(abertas.destaques.length ? abertas.destaques : []).map((t) => `
      <tr>
        <td>${esc(t)}</td>
        <td>${esc(1)}</td>
        <td>${esc("Comentário literal do material enviado.")}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>4. Six Box Adaptado</h2>
  <table>
    <thead>
      <tr>
        <th>Dimensão</th>
        <th>Média Final</th>
        <th>Classificação</th>
      </tr>
    </thead>
    <tbody>
      ${blockSummaries.map((b) => `
      <tr>
        <td>${esc(b.bloco)}</td>
        <td>${esc(b.media.toFixed(1))}</td>
        <td>${esc(b.classificacao)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>5. Plano de Ação</h2>
  <table>
    <thead>
      <tr>
        <th>FATOR</th>
        <th>PONTO LEVANTADO</th>
        <th>AÇÃO PROPOSTA</th>
        <th>ETAPAS</th>
        <th>GRUPO FOCAL</th>
        <th>RESULTADO ESPERADO</th>
      </tr>
    </thead>
    <tbody>
      ${plano.map((p) => `
      <tr>
        <td>${esc(p.fator)}</td>
        <td>${esc(p.ponto)}</td>
        <td>${esc(p.acao)}</td>
        <td>${esc(p.etapas)}</td>
        <td>${esc(p.grupo)}</td>
        <td>${esc(p.resultado)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>6. Visualizações Textuais</h2>

  <h3>Médias por Bloco</h3>
  <table>
    <thead><tr><th>Bloco</th><th>Média</th></tr></thead>
    <tbody>
      ${blockSummaries.map((b) => `<tr><td>${esc(b.bloco)}</td><td>${esc(b.media.toFixed(1))}</td></tr>`).join("")}
    </tbody>
  </table>
  <p><strong>Maior valor:</strong> ${esc(melhor.bloco)} = ${esc(melhor.media.toFixed(1))}</p>
  <p><strong>Menor valor:</strong> ${esc(pior.bloco)} = ${esc(pior.media.toFixed(1))}</p>

  <h3>Mapa de Calor dos Itens</h3>
  <table>
    <thead><tr><th>Bloco</th><th>Item 1</th><th>Item 2</th><th>Item 3</th><th>Item 4</th><th>Média</th></tr></thead>
    <tbody>
      ${matrix.map((m) => `
      <tr>
        <td>${esc(m.bloco)}</td>
        <td>${esc(m.notas[0] ? m.notas[0].toFixed(1) : "—")}</td>
        <td>${esc(m.notas[1] ? m.notas[1].toFixed(1) : "—")}</td>
        <td>${esc(m.notas[2] ? m.notas[2].toFixed(1) : "—")}</td>
        <td>${esc(m.notas[3] ? m.notas[3].toFixed(1) : "—")}</td>
        <td>${esc(m.media.toFixed(1))}</td>
      </tr>`).join("")}
    </tbody>
  </table>
  <p><strong>Melhor ponto da matriz:</strong> ${esc(melhorPonto ? `${melhorPonto.bloco}, Item ${melhorPonto.item} = ${melhorPonto.valor.toFixed(1)}` : "Não identificado")}</p>
  <p><strong>Pior ponto da matriz:</strong> ${esc(piorPonto ? `${piorPonto.bloco}, Item ${piorPonto.item} = ${piorPonto.valor.toFixed(1)}` : "Não identificado")}</p>

  <p><strong>Interpretação Final</strong></p>
  <p>${esc(closing)}</p>
</section>
`.trim();
}
