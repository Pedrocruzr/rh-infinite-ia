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

const SIX_BOX_COLORS: Record<string, string> = {
  "Propósito": "#8e44ad",
  "Estrutura": "#2980b9",
  "Relacionamento": "#27ae60",
  "Recompensa": "#e67e22",
  "Liderança": "#c0392b",
  "Mecanismo de Apoio": "#16a085",
  "Responsabilidade": "#f39c12",
};

function getClassificationColor(score: number) {
  if (score <= 3.9) return "#c0392b"; // CRÍTICO
  if (score <= 5.9) return "#e67e22"; // ATENÇÃO
  if (score <= 7.9) return "#27ae60"; // ADEQUADO
  return "#2980b9"; // EXCELÊNCIA
}

function generateGaugeSvg(
  value: number,
  zones: Array<{ from: number; to: number; color: string; label: string }>
): string {
  const W = 380, H = 64;
  const bx = 8, bw = 364, bh = 24, by = 14;

  const zoneParts = zones.map((z) => {
    const x = (bx + (z.from / 100) * bw).toFixed(1);
    const w = (((z.to - z.from) / 100) * bw).toFixed(1);
    const tx = (bx + ((z.from + z.to) / 2 / 100) * bw).toFixed(1);
    return (
      `<rect x="${x}" y="${by}" width="${w}" height="${bh}" fill="${z.color}"/>` +
      `<text x="${tx}" y="${by + bh / 2 + 4}" font-size="10" fill="#1e293b" text-anchor="middle" font-weight="600">${z.label}</text>`
    );
  }).join("");

  const ix = Math.min(bx + bw - 12, Math.max(bx + 12, bx + (value / 100) * bw));
  const iy = by + bh / 2;
  const indicator =
    `<circle cx="${ix.toFixed(1)}" cy="${iy}" r="13" fill="#1a1a2e" stroke="#fff" stroke-width="2"/>` +
    `<text x="${ix.toFixed(1)}" y="${iy + 4}" font-size="9" fill="#fff" text-anchor="middle" font-weight="bold">${(value / 10).toFixed(1)}</text>`;

  const border = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="#ccc" stroke-width="1" rx="3"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:400px;" xmlns="http://www.w3.org/2000/svg">${zoneParts}${border}${indicator}</svg>`;
}

function generateSixBoxBarChartSvg(summaries: BlockSummary[]): string {
  const bh = 28, gap = 10, lw = 150, maxBw = 200, W = 430;
  const H = summaries.length * (bh + gap) + gap;
  const parts = summaries.map((b, i) => {
    const val = b.media;
    const pctVal = Math.round(val * 10);
    const bw = Math.max(4, Math.round((pctVal / 100) * maxBw));
    const color = SIX_BOX_COLORS[b.bloco] || "#94a3b8";
    const y = gap + i * (bh + gap);
    return (
      `<text x="0" y="${y + bh/2 + 4}" font-size="11" fill="${color}" font-weight="bold">${b.bloco}</text>` +
      `<rect x="${lw}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${color}" opacity="0.85"/>` +
      `<text x="${lw+bw+6}" y="${y + bh/2 + 4}" font-size="11" font-weight="bold" fill="${color}">${val.toFixed(1)}</text>`
    );
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:430px;" xmlns="http://www.w3.org/2000/svg">${parts}</svg>`;
}

function generateSixBoxRadarSvg(summaries: BlockSummary[]): string {
  const cx = 200, cy = 200, r = 145, n = summaries.length;
  if (n === 0) return "";
  
  function ang(i: number) { return -Math.PI / 2 + (i * 2 * Math.PI) / n; }
  function pt(i: number, frac: number) {
    return { x: cx + r * frac * Math.cos(ang(i)), y: cy + r * frac * Math.sin(ang(i)) };
  }
  
  const grid = [20, 40, 60, 80, 100].map(p => 
    `<circle cx="${cx}" cy="${cy}" r="${(r * p / 100).toFixed(1)}" fill="none" stroke="#ebebeb" stroke-width="1"/>`
  ).join("");
  
  const axes = Array.from({ length: n }, (_, i) => {
    const p = pt(i, 1);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#e0e0e0" stroke-width="1"/>`;
  }).join("");
  
  const polyPts = summaries.map((b, i) => {
    const frac = b.media / 10;
    const p = pt(i, frac);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");
  
  const polygon = `<polygon points="${polyPts}" fill="rgba(41,128,185,0.15)" stroke="#2980b9" stroke-width="1.8" stroke-linejoin="round"/>`;
  
  const dots = summaries.map((b, i) => {
    const frac = b.media / 10;
    const p = pt(i, frac);
    const color = SIX_BOX_COLORS[b.bloco] || "#94a3b8";
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${color}" stroke="#fff" stroke-width="1.5"/>`;
  }).join("");
  
  const labels = summaries.map((b, i) => {
    const a = ang(i);
    const lx = cx + (r + 24) * Math.cos(a);
    const ly = cy + (r + 24) * Math.sin(a);
    const anchor = lx > cx + 8 ? "start" : lx < cx - 8 ? "end" : "middle";
    const color = SIX_BOX_COLORS[b.bloco] || "#94a3b8";
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="10" font-weight="bold" fill="${color}" text-anchor="${anchor}" dominant-baseline="middle">${b.bloco}</text>`;
  }).join("");
  
  return `<svg viewBox="0 0 400 400" width="100%" style="max-width:360px;" xmlns="http://www.w3.org/2000/svg">${grid}${axes}${polygon}${dots}${labels}</svg>`;
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

function detectBlockHeader(line: string): string | null {
  const lower = line.toLowerCase();
  
  if (
    lower.startsWith("cargo") || 
    lower.startsWith("nome") || 
    lower.startsWith("area") || 
    lower.startsWith("setor") || 
    lower.startsWith("tempo") ||
    lower.startsWith("escala") ||
    lower.startsWith("significado")
  ) {
    return null;
  }
  
  if (/propósito|proposito/i.test(lower)) return "Propósito";
  if (/estrutura/i.test(lower)) return "Estrutura";
  if (/relacionamento/i.test(lower)) return "Relacionamento";
  if (/recompensa/i.test(lower)) return "Recompensa";
  if (/liderança|lideranca/i.test(lower)) return "Liderança";
  if (/mecanismo.*apoio|apoio/i.test(lower)) return "Mecanismo de Apoio";
  if (/responsabilidade/i.test(lower)) return "Responsabilidade";
  
  return null;
}

function extractItems(material: string): ParsedItem[] {
  const lines = normalize(material)
    .split("\n")
    .map(cleanText)
    .filter(Boolean);

  const parsed: ParsedItem[] = [];
  let currentBlock: string | null = null;

  for (const line of lines) {
    const blockMatch = detectBlockHeader(line);
    const scoreOnLine = extractScore(line);
    
    if (blockMatch && (scoreOnLine === null || line.toLowerCase().includes("###") || line.toLowerCase().includes("section") || line.toLowerCase().includes("fator:"))) {
      currentBlock = blockMatch;
    }

    const score = scoreOnLine;
    if (score !== null) {
      const raw = cleanText(line);
      const parts = raw.split(/\t| \| | \- |;/).map(cleanText).filter(Boolean);

      const lowerRaw = raw.toLowerCase();
      if (lowerRaw.includes("media") || lowerRaw.includes("média") || lowerRaw.includes("total") || lowerRaw.includes("consolidado")) {
        continue;
      }
      if (lowerRaw.includes("pergunta") || lowerRaw.includes("resposta") || lowerRaw.includes("significado") || lowerRaw.includes("escala")) {
        continue;
      }

      const bloco = currentBlock || canonicalBlock(raw) || "";
      if (!bloco) {
        continue;
      }

      let item = "";
      const area = "Não informado";
      if (parts.length >= 2) {
        const scorePart = parts.find((p) => extractScore(p) !== null);
        const blockPart = parts.find((p) => canonicalBlock(p) === bloco);
        const filtered = parts.filter((p) => p !== scorePart && p !== blockPart);
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
      item = item.replace(/^[\s|:\-*#]+|[\s|:\-*#]+$/g, "").trim();

      if (item.length >= 5) {
        parsed.push({
          area,
          bloco,
          item,
          nota: score,
          raw,
        });
      }
    }
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
<section style="background:#ffffff;border-radius:12px;padding:32px;color:#374151;text-align:center;">
  <h1 style="font-size:24px;color:#1e293b;margin-bottom:16px;">Diagnóstico Organizacional Consolidado</h1>
  <p style="font-size:14px;color:#64748b;">Não há base suficiente nas respostas enviadas pelo usuário para gerar uma análise válida.</p>
  <p style="font-size:13px;color:#94a3b8;margin-top:8px;">Para continuar, envie um material compreensível com itens, dimensões e notas do questionário.</p>
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
<style>
  @media print {
    .page-break { page-break-after: always; break-after: page; }
    .no-break   { page-break-inside: avoid; break-inside: avoid; }
    section     { page-break-inside: avoid; break-inside: avoid; }
  }
</style>
<section style="background:#ffffff;border-radius:12px;padding:32px;color:#374151;font-family:Inter, sans-serif;box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">

  <!-- ══ CAPA ══════════════════════════════════════════════════════════════ -->
  <div style="text-align:center;padding:32px 0 24px;border-bottom:3px solid #1a1a2e;margin-bottom:32px;">
    <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;font-weight:600;">Diagnóstico Organizacional Six Box</p>
    <h1 style="font-size:26px;margin:0 0 8px;color:#1e293b;font-weight:800;">Diagnóstico Organizacional Consolidado</h1>
    <p style="font-size:15px;color:#475569;margin:0 0 4px;">Organização: <strong>${esc(rawAnswers?.empresaNome ?? "Minha Empresa")}</strong></p>
    <p style="font-size:12px;color:#6b7280;">Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
    
    <div style="margin-top:20px;display:inline-block;background:#1a1a2e;color:#fff;padding:10px 32px;border-radius:24px;font-size:14px;font-weight:700;">
      Média Geral: ${mediaGeral.toFixed(1)} / 10
    </div>
  </div>

  <p style="font-size:11px;color:#6b7280;border-left:3px solid #cbd5e1;padding-left:10px;margin:20px 0 32px;">
    Este relatório consolidado apresenta as percepções organizacionais baseadas nas dimensões do modelo Six Box adaptado.
  </p>

  <!-- ══ 1. RESUMO EXECUTIVO ════════════════════════════════════════════════ -->
  <h2 style="font-size:18px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;font-weight:700;">1. Resumo Executivo</h2>
  
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <tbody>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;font-weight:700;color:#334155;border-bottom:1px solid #e2e8f0;width:30%;">Base Processada</td>
        <td style="padding:12px 16px;color:#475569;border-bottom:1px solid #e2e8f0;">${esc(rawAnswers?.baseProcessada ?? "Material enviado pelo usuário")}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;font-weight:700;color:#334155;border-bottom:1px solid #e2e8f0;">Média Geral</td>
        <td style="padding:12px 16px;color:#1e293b;font-weight:bold;font-size:15px;border-bottom:1px solid #e2e8f0;">
          <span style="color:${getClassificationColor(mediaGeral)};">${esc(mediaGeral.toFixed(1))} / 10</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;font-weight:700;color:#334155;">Leitura Geral</td>
        <td style="padding:12px 16px;color:#475569;line-height:1.5;">${esc(generalRead)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Gauge SVG do Score Geral -->
  <div style="margin:24px 0;text-align:center;background:#f8fafc;padding:20px;border-radius:8px;border:1px solid #e2e8f0;">
    <p style="font-weight:700;margin-bottom:12px;font-size:14px;color:#1e293b;">Termômetro da Média Geral</p>
    ${generateGaugeSvg(Math.round(mediaGeral * 10), [
      { from: 0,  to: 39,  color: "#f1948a", label: "Crítico" },
      { from: 39, to: 59,  color: "#f9e79f", label: "Atenção" },
      { from: 59, to: 79,  color: "#a9dfbf", label: "Adequado" },
      { from: 79, to: 100, color: "#aed6f1", label: "Excelência" },
    ])}
  </div>

  <div class="page-break"></div>

  <!-- ══ 2. BLOCOS E ITENS ═════════════════════════════════════════════════ -->
  <h2 style="font-size:18px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;font-weight:700;">2. Blocos e Itens</h2>
  
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:25%;">Bloco</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:35%;">Item</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:12%;">Média</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:15%;">Classificação</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:13%;">Observação</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((i) => {
        const color = getClassificationColor(i.nota);
        return `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 16px;color:#334155;font-weight:600;">${esc(i.bloco)}</td>
          <td style="padding:12px 16px;color:#475569;line-height:1.4;">${esc(i.item)}</td>
          <td style="padding:12px 16px;font-weight:700;color:${color};">${esc(i.nota.toFixed(1))}</td>
          <td style="padding:12px 16px;font-weight:700;color:${color};"><span style="background:${color}15;padding:4px 8px;border-radius:4px;font-size:11px;">${esc(classify(i.nota))}</span></td>
          <td style="padding:12px 16px;color:#64748b;font-size:11px;">Baseado na nota do item.</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>

  <!-- ══ 3. ANÁLISE QUALITATIVA ═════════════════════════════════════════════ -->
  <h2 style="font-size:18px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;font-weight:700;">3. Análise Qualitativa</h2>

  <h3 style="font-size:14px;color:#1e293b;margin:24px 0 8px;font-weight:700;">O que contribui para o bom ambiente</h3>
  <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:50%;">Tema</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:15%;">Frequência</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:35%;">Leitura</th>
      </tr>
    </thead>
    <tbody>
      ${(abertas.ambiente.length ? abertas.ambiente : ["Não informado na coleta"]).map((t, idx) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;color:#475569;line-height:1.4;">${esc(t)}</td>
        <td style="padding:12px 16px;color:#334155;font-weight:600;">${esc(abertas.ambiente.length ? Math.max(1, abertas.ambiente.length - idx) : 0)}</td>
        <td style="padding:12px 16px;color:#64748b;">${esc(abertas.ambiente.length ? "Tema recorrente identificado." : "Sem menções diretas.")}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h3 style="font-size:14px;color:#1e293b;margin:24px 0 8px;font-weight:700;">O que mais precisa melhorar</h3>
  <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:50%;">Tema</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:15%;">Frequência</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:35%;">Leitura</th>
      </tr>
    </thead>
    <tbody>
      ${(abertas.melhorar.length ? abertas.melhorar : ["Não informado na coleta"]).map((t, idx) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;color:#475569;line-height:1.4;">${esc(t)}</td>
        <td style="padding:12px 16px;color:#334155;font-weight:600;">${esc(abertas.melhorar.length ? Math.max(1, abertas.melhorar.length - idx) : 0)}</td>
        <td style="padding:12px 16px;color:#64748b;">${esc(abertas.melhorar.length ? "Ponto crítico citado nas respostas." : "Sem menções diretas.")}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h3 style="font-size:14px;color:#1e293b;margin:24px 0 8px;font-weight:700;">Sugestões de melhoria e destaques adicionais</h3>
  <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:50%;">Tema / Comentário</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:15%;">Frequência</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:35%;">Leitura</th>
      </tr>
    </thead>
    <tbody>
      ${(abertas.sugestoes.length ? abertas.sugestoes : ["Não informado na coleta"]).map((t, idx) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;color:#475569;line-height:1.4;">${esc(t)}</td>
        <td style="padding:12px 16px;color:#334155;font-weight:600;">${esc(abertas.sugestoes.length ? Math.max(1, abertas.sugestoes.length - idx) : 0)}</td>
        <td style="padding:12px 16px;color:#64748b;">${esc(abertas.sugestoes.length ? "Sugestão prática de melhoria." : "Sem menções diretas.")}</td>
      </tr>`).join("")}
      ${(abertas.destaques.length ? abertas.destaques : []).map((t) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;color:#475569;line-height:1.4;">${esc(t)}</td>
        <td style="padding:12px 16px;color:#334155;font-weight:600;">1</td>
        <td style="padding:12px 16px;color:#64748b;">Comentário adicional literal.</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ══ 4. SIX BOX ADAPTADO (COM GRÁFICOS) ══════════════════════════════════ -->
  <h2 style="font-size:18px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;font-weight:700;">4. Six Box Adaptado</h2>
  
  <p style="font-size:13px;color:#475569;margin-bottom:20px;">
    O modelo Six Box categoriza o diagnóstico em dimensões organizacionais específicas. Abaixo, você confere a pontuação final de cada dimensão representada na tabela, no radar e no comparativo gráfico.
  </p>

  <!-- Gráficos de Radar e de Barras Comparativo -->
  <div style="display:flex;flex-wrap:wrap;gap:24px;justify-content:center;align-items:center;margin:32px 0;background:#f8fafc;padding:24px;border-radius:12px;border:1px solid #e2e8f0;">
    <div style="text-align:center;flex:1;min-width:280px;max-width:340px;">
      <p style="font-weight:700;font-size:12px;color:#1e293b;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px;">Radar das Dimensões</p>
      ${generateSixBoxRadarSvg(blockSummaries)}
    </div>
    <div style="text-align:center;flex:1;min-width:300px;max-width:400px;">
      <p style="font-weight:700;font-size:12px;color:#1e293b;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px;">Comparativo de Médias</p>
      ${generateSixBoxBarChartSvg(blockSummaries)}
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:40%;">Dimensão</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:30%;">Média Final</th>
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:30%;">Classificação</th>
      </tr>
    </thead>
    <tbody>
      ${blockSummaries.map((b) => {
        const color = getClassificationColor(b.media);
        return `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 16px;color:#1e293b;font-weight:600;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${SIX_BOX_COLORS[b.bloco] || "#ccc"};margin-right:8px;"></span>
            ${esc(b.bloco)}
          </td>
          <td style="padding:12px 16px;font-weight:700;color:${color};">${esc(b.media.toFixed(1))}</td>
          <td style="padding:12px 16px;font-weight:700;color:${color};"><span style="background:${color}15;padding:4px 8px;border-radius:4px;font-size:11px;">${esc(b.classificacao)}</span></td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>

  <!-- ══ 5. PLANO DE AÇÃO ═══════════════════════════════════════════════════ -->
  <h2 style="font-size:18px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;font-weight:700;">5. Plano de Ação Estratégico</h2>
  
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
        <th style="color:#1e293b;text-align:left;padding:10px 12px;font-weight:700;width:15%;">Fator</th>
        <th style="color:#1e293b;text-align:left;padding:10px 12px;font-weight:700;width:18%;">Nota Diagnóstica</th>
        <th style="color:#1e293b;text-align:left;padding:10px 12px;font-weight:700;width:20%;">Ação Proposta</th>
        <th style="color:#1e293b;text-align:left;padding:10px 12px;font-weight:700;width:22%;">Etapas de Execução</th>
        <th style="color:#1e293b;text-align:left;padding:10px 12px;font-weight:700;width:13%;">Grupo Focal</th>
        <th style="color:#1e293b;text-align:left;padding:10px 12px;font-weight:700;width:12%;">Resultado Esperado</th>
      </tr>
    </thead>
    <tbody>
      ${plano.map((p) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 12px;color:#1e293b;font-weight:700;">${esc(p.fator)}</td>
        <td style="padding:10px 12px;color:#64748b;font-style:italic;">${esc(p.ponto)}</td>
        <td style="padding:10px 12px;color:#334155;font-weight:600;">${esc(p.acao)}</td>
        <td style="padding:10px 12px;color:#475569;line-height:1.4;">${esc(p.etapas)}</td>
        <td style="padding:10px 12px;color:#334155;">${esc(p.grupo)}</td>
        <td style="padding:10px 12px;color:#475569;line-height:1.4;">${esc(p.resultado)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <!-- ══ 6. MAPAS E CALOR DOS ITENS ═════════════════════════════════════════ -->
  <h2 style="font-size:18px;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;font-weight:700;">6. Visualizações Detalhadas e Mapa de Calor</h2>

  <h3 style="font-size:14px;color:#1e293b;margin:24px 0 8px;font-weight:700;">Mapa de Calor dos Itens (Notas 1 a 10)</h3>
  <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
        <th style="color:#1e293b;text-align:left;padding:12px 16px;font-weight:700;width:30%;">Bloco</th>
        <th style="color:#1e293b;text-align:center;padding:12px 16px;font-weight:700;width:13%;">Item 1</th>
        <th style="color:#1e293b;text-align:center;padding:12px 16px;font-weight:700;width:13%;">Item 2</th>
        <th style="color:#1e293b;text-align:center;padding:12px 16px;font-weight:700;width:13%;">Item 3</th>
        <th style="color:#1e293b;text-align:center;padding:12px 16px;font-weight:700;width:13%;">Item 4</th>
        <th style="color:#1e293b;text-align:center;padding:12px 16px;font-weight:700;width:18%;">Média Geral</th>
      </tr>
    </thead>
    <tbody>
      ${matrix.map((m) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;color:#1e293b;font-weight:600;">${esc(m.bloco)}</td>
        ${m.notas.map((n) => {
          if (!n) return `<td style="padding:12px 16px;text-align:center;color:#cbd5e1;">—</td>`;
          const color = getClassificationColor(n);
          return `<td style="padding:12px 16px;text-align:center;font-weight:700;color:${color};background:${color}08;">${esc(n.toFixed(1))}</td>`;
        }).join("")}
        <td style="padding:12px 16px;text-align:center;font-weight:700;color:${getClassificationColor(m.media)};background:#f8fafc;border-left:1px solid #e2e8f0;">${esc(m.media.toFixed(1))}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
    <div>
      <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">Melhor ponto da matriz</p>
      <p style="font-size:13px;color:#334155;font-weight:700;margin:0;">
        ${esc(melhorPonto ? `${melhorPonto.bloco}, Item ${melhorPonto.item} = ` : "Não identificado")}
        ${melhorPonto ? `<span style="color:${getClassificationColor(melhorPonto.valor)};">${melhorPonto.valor.toFixed(1)}</span>` : ""}
      </p>
    </div>
    <div>
      <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">Pior ponto da matriz</p>
      <p style="font-size:13px;color:#334155;font-weight:700;margin:0;">
        ${esc(piorPonto ? `${piorPonto.bloco}, Item ${piorPonto.item} = ` : "Não identificado")}
        ${piorPonto ? `<span style="color:${getClassificationColor(piorPonto.valor)};">${piorPonto.valor.toFixed(1)}</span>` : ""}
      </p>
    </div>
  </div>

  <h3 style="font-size:14px;color:#1e293b;margin:24px 0 6px;font-weight:700;">Interpretação Final</h3>
  <p style="font-size:13px;color:#475569;line-height:1.6;margin-bottom:0;">${esc(closing)}</p>

</section>
`.trim();
}
