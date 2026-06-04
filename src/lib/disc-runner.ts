import {
  initializeDiscSession,
  runDiscStep,
  type DiscField,
  type DiscSession,
} from "@/lib/disc-flow";
import { PROFILE_TEXTS, MOTIVATION_LABELS } from "@/lib/agents/profile/profile-texts";

export type { DiscField, DiscSession } from "@/lib/disc-flow";
export { initializeDiscSession, runDiscStep } from "@/lib/disc-flow";

// ─── tipos ────────────────────────────────────────────────────────────────────

type DiscScoreKey = "D" | "I" | "S" | "C";
type PctMap = { D: number; I: number; S: number; C: number };

// ─── mapeamentos ──────────────────────────────────────────────────────────────

const LETTER_TO_PROFILE: Record<string, DiscScoreKey> = {
  A: "D",
  B: "I",
  C: "S",
  D: "C",
};

const PROFILE_NAMES: Record<DiscScoreKey, string> = {
  D: "Dominância (D)",
  I: "Influência (I)",
  S: "eStabilidade (S)",
  C: "Conformidade (C)",
};

const DIM_COLORS: Record<string, string> = {
  D: "#c0392b",
  I: "#e67e22",
  S: "#27ae60",
  C: "#2980b9",
};

// ─── scores ───────────────────────────────────────────────────────────────────

type DiscReportSession = DiscSession & Record<string, unknown>;

function buildScores(session: DiscReportSession): Record<DiscScoreKey, number> {
  const answers = ["q1", "q2", "q3", "q4", "q5", "q6"].map((k) =>
    String(session[k] ?? "").trim().toUpperCase()
  );
  const scores: Record<DiscScoreKey, number> = { D: 0, I: 0, S: 0, C: 0 };
  for (const a of answers) {
    const p = LETTER_TO_PROFILE[a];
    if (p) scores[p] += 1;
  }
  return scores;
}

function getPct(scores: Record<DiscScoreKey, number>): PctMap {
  return {
    D: Math.round((scores.D / 6) * 100),
    I: Math.round((scores.I / 6) * 100),
    S: Math.round((scores.S / 6) * 100),
    C: Math.round((scores.C / 6) * 100),
  };
}

function getDominant(scores: Record<DiscScoreKey, number>): DiscScoreKey {
  return (Object.entries(scores) as Array<[DiscScoreKey, number]>).sort((a, b) => b[1] - a[1])[0][0];
}

function getSecondary(scores: Record<DiscScoreKey, number>): DiscScoreKey {
  return (Object.entries(scores) as Array<[DiscScoreKey, number]>).sort((a, b) => b[1] - a[1])[1][0];
}

// ─── helpers HTML ─────────────────────────────────────────────────────────────

function esc(value?: string | null, fallback = "Não informado"): string {
  const text = value?.trim();
  const safe = text && text.length > 0 ? text : fallback;
  return safe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function listItems(items: string[]): string {
  return items.map((i) => `<li>${esc(i)}</li>`).join("");
}

// ─── SVG charts ───────────────────────────────────────────────────────────────

function generateLineChartSvg(pct: PctMap): string {
  const W = 300, H = 210;
  const dims = ["D", "I", "S", "C"] as const;
  const xs = [55, 115, 185, 245];
  const top = 15, bot = 155, ph = bot - top;
  function y(p: number) { return bot - (p / 100) * ph; }
  const band = `<rect x="35" y="${y(60)}" width="${W - 60}" height="${y(40) - y(60)}" fill="#dce8f5" opacity="0.6"/>`;
  const grid = [0, 25, 50, 75, 100].map(p =>
    `<line x1="35" y1="${y(p)}" x2="${W - 25}" y2="${y(p)}" stroke="#ececec" stroke-width="0.8"/>`
  ).join("");
  const pts = dims.map((d, i) => ({ x: xs[i], y: y(pct[d]), c: DIM_COLORS[d], v: pct[d] }));
  const poly = `<polyline points="${pts.map(p => `${p.x},${p.y}`).join(" ")}" fill="none" stroke="#27ae60" stroke-width="2.2" stroke-linejoin="round"/>`;
  const dots = pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="6" fill="${p.c}" stroke="#fff" stroke-width="1.5"/>`).join("");
  const lbls = dims.map((d, i) => [
    `<text x="${xs[i]}" y="${bot + 18}" font-size="14" font-weight="bold" fill="${DIM_COLORS[d]}" text-anchor="middle">${d}</text>`,
    `<text x="${xs[i]}" y="${bot + 32}" font-size="10" fill="#666" text-anchor="middle">${pct[d]}%</text>`,
  ].join("")).join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:300px;" xmlns="http://www.w3.org/2000/svg">${band}${grid}${poly}${dots}${lbls}</svg>`;
}

function generateVertBarChartSvg(pct: PctMap): string {
  const W = 300, H = 210;
  const dims = ["D", "I", "S", "C"] as const;
  const xs = [55, 115, 185, 245];
  const bw = 36, top = 15, bot = 155, ph = bot - top;
  function y(p: number) { return bot - (p / 100) * ph; }
  const band = `<rect x="35" y="${y(60)}" width="${W - 60}" height="${y(40) - y(60)}" fill="#dce8f5" opacity="0.6"/>`;
  const grid = [0, 25, 50, 75, 100].map(p =>
    `<line x1="35" y1="${y(p)}" x2="${W - 25}" y2="${y(p)}" stroke="#ececec" stroke-width="0.8"/>`
  ).join("");
  const bars = dims.map((d, i) => {
    const yy = y(pct[d]);
    return `<rect x="${xs[i] - bw / 2}" y="${yy}" width="${bw}" height="${bot - yy}" rx="4" fill="${DIM_COLORS[d]}" opacity="0.85"/>`;
  }).join("");
  const lbls = dims.map((d, i) => [
    `<text x="${xs[i]}" y="${bot + 18}" font-size="14" font-weight="bold" fill="${DIM_COLORS[d]}" text-anchor="middle">${d}</text>`,
    `<text x="${xs[i]}" y="${bot + 32}" font-size="10" fill="#666" text-anchor="middle">${pct[d]}%</text>`,
  ].join("")).join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:300px;" xmlns="http://www.w3.org/2000/svg">${band}${grid}${bars}${lbls}</svg>`;
}

function generateGaugeSvg(
  value: number,
  zones: Array<{ from: number; to: number; color: string; label: string }>
): string {
  const W = 380, H = 64, bx = 8, bw = 364, bh = 24, by = 14;
  const zoneParts = zones.map((z) => {
    const x = (bx + (z.from / 100) * bw).toFixed(1);
    const w = (((z.to - z.from) / 100) * bw).toFixed(1);
    const tx = (bx + ((z.from + z.to) / 2 / 100) * bw).toFixed(1);
    return (
      `<rect x="${x}" y="${by}" width="${w}" height="${bh}" fill="${z.color}"/>` +
      `<text x="${tx}" y="${by + bh / 2 + 4}" font-size="10" fill="#333" text-anchor="middle" font-weight="600">${z.label}</text>`
    );
  }).join("");
  const ix = Math.min(bx + bw - 12, Math.max(bx + 12, bx + (value / 100) * bw));
  const iy = by + bh / 2;
  const indicator =
    `<circle cx="${ix.toFixed(1)}" cy="${iy}" r="13" fill="#1a1a2e" stroke="#fff" stroke-width="2"/>` +
    `<text x="${ix.toFixed(1)}" y="${iy + 4}" font-size="9" fill="#fff" text-anchor="middle" font-weight="bold">${value}</text>`;
  const border = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="#ccc" stroke-width="1" rx="3"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:400px;" xmlns="http://www.w3.org/2000/svg">${zoneParts}${border}${indicator}</svg>`;
}

function generateRadar12Svg(items: Array<{ name: string; value: number; color: string }>): string {
  const cx = 360, cy = 340, r = 190, n = 12;
  function ang(i: number) { return -Math.PI / 2 + (i * 2 * Math.PI) / n; }
  function pt(i: number, frac: number) {
    return { x: cx + r * frac * Math.cos(ang(i)), y: cy + r * frac * Math.sin(ang(i)) };
  }
  const grid = [20, 40, 60, 80, 100].map((p) => {
    const gr = (r * p) / 100;
    return `<circle cx="${cx}" cy="${cy}" r="${gr.toFixed(1)}" fill="none" stroke="#ebebeb" stroke-width="1"/>`;
  }).join("");
  const axes = items.map((_, i) => {
    const p = pt(i, 1);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#e0e0e0" stroke-width="1"/>`;
  }).join("");
  const polyPts = items.map((item, i) => {
    const p = pt(i, item.value / 100);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");
  const polygon = `<polygon points="${polyPts}" fill="rgba(39,174,96,0.18)" stroke="#27ae60" stroke-width="2" stroke-linejoin="round"/>`;
  const dots = items.map((item, i) => {
    const p = pt(i, item.value / 100);
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${item.color}" stroke="#fff" stroke-width="1.5"/>`;
  }).join("");
  const labelParts = items.map((item, i) => {
    const a = ang(i);
    const dist = r + 36;
    const lx = cx + dist * Math.cos(a);
    const ly = cy + dist * Math.sin(a);
    const anchor = lx > cx + 8 ? "start" : lx < cx - 8 ? "end" : "middle";
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="11" fill="${item.color}" text-anchor="${anchor}" dominant-baseline="middle">${item.name}</text>`;
  }).join("");
  const scaleLbls = [20, 40, 60, 80, 100].map((p) => {
    const yy = (cy - (r * p) / 100 - 3).toFixed(1);
    return `<text x="${(cx + 3).toFixed(1)}" y="${yy}" font-size="8" fill="#bbb">${p}%</text>`;
  }).join("");
  return `<svg viewBox="0 0 720 680" width="100%" style="display:block;margin:0 auto;max-width:580px;height:auto;" xmlns="http://www.w3.org/2000/svg">${grid}${axes}${polygon}${dots}${labelParts}${scaleLbls}</svg>`;
}

function generateMiniRadarSvg(pct: PctMap): string {
  const cx = 120, cy = 120, r = 85;
  const dims: Array<{ key: DiscScoreKey; angle: number }> = [
    { key: "D", angle: -Math.PI / 2 },
    { key: "I", angle: 0 },
    { key: "S", angle: Math.PI / 2 },
    { key: "C", angle: Math.PI },
  ];
  const grid = [25, 50, 75, 100].map((p) => {
    const gr = (r * p) / 100;
    return `<circle cx="${cx}" cy="${cy}" r="${gr}" fill="none" stroke="#ebebeb" stroke-width="1"/>`;
  }).join("");
  const axes = dims.map((d) => {
    const ex = (cx + r * Math.cos(d.angle)).toFixed(1);
    const ey = (cy + r * Math.sin(d.angle)).toFixed(1);
    return `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="#ddd" stroke-width="1"/>`;
  }).join("");
  const polyPts = dims.map((d) => {
    const frac = (pct[d.key] ?? 0) / 100;
    return `${(cx + r * frac * Math.cos(d.angle)).toFixed(1)},${(cy + r * frac * Math.sin(d.angle)).toFixed(1)}`;
  }).join(" ");
  const polygon = `<polygon points="${polyPts}" fill="rgba(52,152,219,0.15)" stroke="#2980b9" stroke-width="2" stroke-linejoin="round"/>`;
  const dots = dims.map((d) => {
    const frac = (pct[d.key] ?? 0) / 100;
    const dx = (cx + r * frac * Math.cos(d.angle)).toFixed(1);
    const dy = (cy + r * frac * Math.sin(d.angle)).toFixed(1);
    return `<circle cx="${dx}" cy="${dy}" r="5" fill="${DIM_COLORS[d.key]}" stroke="#fff" stroke-width="1.5"/>`;
  }).join("");
  const lbls = dims.map((d) => {
    const dist = r + 18;
    const lx = (cx + dist * Math.cos(d.angle)).toFixed(1);
    const ly = (cy + dist * Math.sin(d.angle)).toFixed(1);
    return `<text x="${lx}" y="${ly}" font-size="13" font-weight="bold" fill="${DIM_COLORS[d.key]}" text-anchor="middle" dominant-baseline="middle">${d.key}</text>`;
  }).join("");
  return `<svg viewBox="0 0 240 240" width="200" height="200" xmlns="http://www.w3.org/2000/svg">${grid}${axes}${polygon}${dots}${lbls}</svg>`;
}

function generateSubfactorBarsSvg(
  items: Array<{ name: string; value: number }>,
  color: string
): string {
  const bh = 26, gap = 14, lw = 155, maxBw = 190, W = 380;
  const H = items.length * (bh + gap) + gap;
  const parts = items.map((item, i) => {
    const y = gap + i * (bh + gap);
    const bw = Math.max(4, Math.round((item.value / 100) * maxBw));
    return (
      `<text x="0" y="${y + bh / 2 + 4}" font-size="12" fill="#444">${item.name}</text>` +
      `<rect x="${lw}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${color}" opacity="0.85"/>` +
      `<text x="${lw + bw + 8}" y="${y + bh / 2 + 4}" font-size="11" font-weight="bold" fill="${color}">${item.value}%</text>`
    );
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:380px;" xmlns="http://www.w3.org/2000/svg">${parts}</svg>`;
}

// ─── relatório principal ──────────────────────────────────────────────────────

export function generateDiscReport(session: DiscReportSession): string {
  const scores = buildScores(session);
  const pct = getPct(scores);
  const dominant = getDominant(scores);
  const secondary = getSecondary(scores);
  const texts = PROFILE_TEXTS[dominant];
  const secTexts = PROFILE_TEXTS[secondary];
  const nome = String(session.nome ?? "Não informado");

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  // competências derivadas dos scores
  const competencyItems = [
    { name: "Competitividade",   value: Math.min(100, Math.round(pct.D * 0.90)), color: DIM_COLORS.D },
    { name: "Determinação",      value: Math.min(100, Math.round(pct.D * 1.00)), color: DIM_COLORS.D },
    { name: "Objetividade",      value: Math.min(100, Math.round(pct.D * 0.85)), color: DIM_COLORS.D },
    { name: "Sociabilidade",     value: Math.min(100, Math.round(pct.I * 0.95)), color: DIM_COLORS.I },
    { name: "Auto Confiança",    value: Math.min(100, Math.round(pct.I * 1.00)), color: DIM_COLORS.I },
    { name: "Entusiasmo",        value: Math.min(100, Math.round(pct.I * 0.90)), color: DIM_COLORS.I },
    { name: "Paciência",         value: Math.min(100, Math.round(pct.S * 1.00)), color: DIM_COLORS.S },
    { name: "Persistência",      value: Math.min(100, Math.round(pct.S * 0.90)), color: DIM_COLORS.S },
    { name: "Consideração",      value: Math.min(100, Math.round(pct.S * 0.95)), color: DIM_COLORS.S },
    { name: "Orient. Regras",    value: Math.min(100, Math.round(pct.C * 0.95)), color: DIM_COLORS.C },
    { name: "Preciso",           value: Math.min(100, Math.round(pct.C * 0.85)), color: DIM_COLORS.C },
    { name: "Cuidadoso",         value: Math.min(100, Math.round(pct.C * 0.90)), color: DIM_COLORS.C },
  ];

  const dSub = [
    { name: "Competitividade", value: Math.min(100, Math.round(pct.D * 0.90)) },
    { name: "Determinação",    value: Math.min(100, Math.round(pct.D * 1.00)) },
    { name: "Objetividade",    value: Math.min(100, Math.round(pct.D * 0.85)) },
  ];
  const iSub = [
    { name: "Sociabilidade",  value: Math.min(100, Math.round(pct.I * 0.95)) },
    { name: "Auto Confiança", value: Math.min(100, Math.round(pct.I * 1.00)) },
    { name: "Entusiasmo",     value: Math.min(100, Math.round(pct.I * 0.90)) },
  ];
  const sSub = [
    { name: "Paciência",    value: Math.min(100, Math.round(pct.S * 1.00)) },
    { name: "Persistência", value: Math.min(100, Math.round(pct.S * 0.90)) },
    { name: "Consideração", value: Math.min(100, Math.round(pct.S * 0.95)) },
  ];
  const cSub = [
    { name: "Orient. Regras", value: Math.min(100, Math.round(pct.C * 0.95)) },
    { name: "Preciso",        value: Math.min(100, Math.round(pct.C * 0.85)) },
    { name: "Cuidadoso",      value: Math.min(100, Math.round(pct.C * 0.90)) },
  ];

  const decisaoScore = pct.D;
  const intensidadeScore = pct[dominant];
  const dominantRaw = scores[dominant] ?? 0;
  const othersSum = 6 - dominantRaw;
  const adaptScore = dominantRaw > 0 ? Math.min(100, Math.round((othersSum / (3 * dominantRaw)) * 100)) : 100;

  const decisaoText = decisaoScore < 40
    ? "Esta pessoa tende a ser mais cautelosa nas tomadas de decisão, preferindo analisar antes de agir."
    : decisaoScore < 60
    ? "Esta pessoa pode apresentar oscilações na tomada de decisão conforme o contexto."
    : "Esta pessoa tende a ser assertiva e objetiva nas tomadas de decisão.";

  const intensidadeText = intensidadeScore >= 87
    ? "Esta pessoa demonstra força comportamental muito alta. Pode ter dificuldades em processos de adaptação."
    : "Esta pessoa apresenta intensidade comportamental dentro do intervalo normal.";

  const adaptText = adaptScore < 20
    ? "Esta pessoa apresenta baixa adaptabilidade — perfil muito concentrado em uma dimensão."
    : adaptScore < 80
    ? "Esta pessoa apresenta adaptabilidade moderada, transitando com flexibilidade entre contextos."
    : "Esta pessoa apresenta alta adaptabilidade, com facilidade para transitar entre contextos diferentes.";

  const lineChart  = generateLineChartSvg(pct);
  const vertBar    = generateVertBarChartSvg(pct);
  const miniRadar  = generateMiniRadarSvg(pct);
  const radar12    = generateRadar12Svg(competencyItems);
  const gaugeD     = generateGaugeSvg(decisaoScore, [
    { from: 0,  to: 40,  color: "#aed6f1", label: "Cautela" },
    { from: 40, to: 60,  color: "#a9dfbf", label: "Em desenvolvimento" },
    { from: 60, to: 100, color: "#f1948a", label: "Objetivo" },
  ]);
  const gaugeI     = generateGaugeSvg(intensidadeScore, [
    { from: 0,  to: 87,  color: "#f9e79f", label: "Normal" },
    { from: 87, to: 100, color: "#f1948a", label: "Intenso" },
  ]);
  const gaugeA     = generateGaugeSvg(adaptScore, [
    { from: 0,  to: 20,  color: "#f1948a", label: "Baixa" },
    { from: 20, to: 80,  color: "#a9dfbf", label: "Normal" },
    { from: 80, to: 100, color: "#aed6f1", label: "Alta" },
  ]);
  const dBars = generateSubfactorBarsSvg(dSub, DIM_COLORS.D);
  const iBars = generateSubfactorBarsSvg(iSub, DIM_COLORS.I);
  const sBars = generateSubfactorBarsSvg(sSub, DIM_COLORS.S);
  const cBars = generateSubfactorBarsSvg(cSub, DIM_COLORS.C);

  const gridBg: Record<string, string> = {
    D: "#fdecea", I: "#fef9e7", S: "#eafaf1", C: "#ebf5fb",
  };
  const gridHtml = (["D", "I", "S", "C"] as const).map((dim) => {
    const bg = gridBg[dim];
    const col = DIM_COLORS[dim];
    const motivs = PROFILE_TEXTS[dim].motivators.slice(0, 3);
    return (
      `<div style="background:${bg};padding:14px;border-left:4px solid ${col};">` +
      `<p style="font-weight:700;color:${col};margin:0 0 8px;font-size:13px;">${PROFILE_NAMES[dim]}</p>` +
      `<ul style="margin:0;padding-left:16px;font-size:12px;color:#444;">` +
      motivs.map((m) => `<li>${esc(m)}</li>`).join("") +
      `</ul></div>`
    );
  }).join("");

  const s = session as DiscSession & Record<string, unknown>;
  const td = (s.termsData ?? null) as Record<string, string> | null;
  const pNome        = td ? (String(td.nome ?? "")).trim()               : String(s.nome ?? "");
  const pSobrenome   = td ? (String(td.sobrenome ?? "")).trim()          : String(s.sobrenome ?? "");
  const pSexo        = td ? (String(td.sexo ?? "")).trim()               : String(s.sexo ?? "");
  const pTelefone    = td ? (String(td.telefone ?? "")).trim()           : String(s.telefone ?? "");
  const pEmail       = td ? (String(td.email ?? "")).trim()              : String(s.email ?? "");
  const pEstado      = td ? (String(td.estado ?? "")).trim()             : String(s.estado ?? "");
  const pCidade      = td ? (String(td.cidade ?? "")).trim()             : String(s.cidade ?? "");
  const pEmpresa     = td ? (String(td.empresa ?? "")).trim()            : String(s.empresa ?? "");
  const pStatus      = td ? (String(td.statusProfissional ?? "")).trim() : String(s.statusProfissional ?? "");
  const pArea        = td ? (String(td.area ?? "")).trim()               : String(s.area ?? "");
  const pCargo       = td ? (String(td.cargo ?? "")).trim()              : String(s.cargo ?? "");

  const fullName = [pNome, pSobrenome].filter(Boolean).join(" ") || nome;

  function card(label: string, value: string): string {
    const display = value && value !== "undefined" ? esc(value) : "—";
    return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 16px;min-width:140px;flex:1;">
      <p style="font-size:10px;color:#64748b;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">${label}</p>
      <p style="font-size:13px;font-weight:600;color:#0f172a;margin:0;">${display}</p>
    </div>`;
  }

  const headerCards = `
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:24px;">
    ${card("Nome", fullName)}
    ${card("Sexo", pSexo)}
    ${card("Telefone", pTelefone)}
    ${card("E-mail", pEmail)}
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;">
    ${card("Estado", pEstado)}
    ${card("Cidade", pCidade)}
    ${card("Empresa", pEmpresa)}
    ${card("Status", pStatus)}
    ${card("Área", pArea)}
    ${card("Cargo", pCargo)}
  </div>`;

  const sumarioItems: Array<[string, number]> = [
    ["Introdução à Metodologia DISC", 3],
    ["Motivadores Naturais DISC", 3],
    ["Descrição Comportamental", 4],
    ["Liderança e Gestão de Pessoas", 5],
    ["Atuação Profissional", 5],
    ["Motivadores Principais", 5],
    ["Resumo do Perfil", 5],
    ["Seu Perfil em Gráficos", 6],
    ["Indicadores Comportamentais", 7],
    ["Gráfico Radar Comportamental", 8],
    ["Sub-fatores Dominância e Influência", 8],
    ["Sub-fatores eStabilidade e Conformidade", 8],
  ];

  const sumarioHtml = sumarioItems.map(([title, pg], i) =>
    `<li style="display:flex;align-items:baseline;gap:4px;padding:6px 0;border-bottom:1px solid #f1f5f9;list-style:none;">
      <span style="font-weight:600;color:#475569;min-width:22px;font-size:13px;">${i + 1}.</span>
      <span style="flex:1;font-size:13px;color:#1e293b;">${title}</span>
      <span style="font-size:12px;color:#94a3b8;border-top:1px dotted #cbd5e1;flex:0 0 auto;padding-top:2px;min-width:24px;text-align:right;">p. ${pg}</span>
    </li>`
  ).join("");

  return `
<style>
  @media print {
    .page-break { page-break-after: always; break-after: page; }
    .no-break { page-break-inside: avoid; break-inside: avoid; }
    section { page-break-inside: avoid; break-inside: avoid; }
  }
</style>

<section style="background:#ffffff;border-radius:12px;padding:32px;color:#374151;margin-bottom:24px;">

  <!-- CAPA -->
  <div style="text-align:center;padding:32px 0 24px;border-bottom:3px solid #1a1a2e;">
    <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Relatório de Identidade Comportamental DISC</p>
    <h1 style="font-size:26px;margin:0 0 8px;">${esc(fullName)}</h1>
    <p style="font-size:12px;color:#888;">Gerado em ${dateStr}</p>
    <div style="margin-top:18px;display:inline-block;background:#1a1a2e;color:#fff;padding:8px 28px;border-radius:20px;font-size:14px;font-weight:600;">
      Perfil Dominante: ${PROFILE_NAMES[dominant]}
    </div>
  </div>

  ${headerCards}

  <p style="font-size:11px;color:#999;border-left:3px solid #ddd;padding-left:10px;margin:20px 0 0;">
    Esta avaliação ficará disponível por 3 dias para consulta do recrutador.
  </p>

</section>

<div class="page-break"></div>

<section style="background:#ffffff;border-radius:12px;padding:32px;color:#374151;margin-bottom:24px;">

  <!-- SUMÁRIO -->
  <h2>Sumário</h2>
  <ul style="padding:0;margin:16px 0;">
    ${sumarioHtml}
  </ul>

</section>

<div class="page-break"></div>

<section style="background:#ffffff;border-radius:12px;padding:32px;color:#374151;margin-bottom:24px;">

  <!-- 1. INTRODUÇÃO -->
  <h2>1. Introdução à Metodologia DISC</h2>
  <p>O modelo DISC é uma ferramenta de avaliação comportamental amplamente utilizada no mundo corporativo para compreender padrões de comportamento, comunicação e motivação das pessoas. Desenvolvido com base nos estudos de William Moulton Marston, o DISC organiza os comportamentos humanos em quatro dimensões principais:</p>
  <ul>
    <li><strong style="color:#c0392b;">D — Dominância:</strong> Orientação a resultados, assertividade e tomada de decisão rápida.</li>
    <li><strong style="color:#e67e22;">I — Influência:</strong> Comunicação, relacionamento interpessoal e entusiasmo.</li>
    <li><strong style="color:#27ae60;">S — eStabilidade:</strong> Paciência, lealdade, consistência e trabalho em equipe.</li>
    <li><strong style="color:#2980b9;">C — Conformidade:</strong> Precisão, análise, qualidade e cumprimento de normas.</li>
  </ul>
  <p>O perfil gerado representa como esta pessoa tende a se comportar no contexto profissional — não um julgamento de valor, mas um instrumento de autoconhecimento e desenvolvimento.</p>

  <!-- 2. MOTIVADORES NATURAIS -->
  <h2>2. Motivadores Naturais DISC</h2>
  <p>Os quadrantes abaixo descrevem o que naturalmente motiva cada perfil comportamental. Os perfis com maior score refletem as tendências mais presentes nesta pessoa.</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;border:1px solid #ddd;border-radius:8px;overflow:hidden;margin:16px 0;">
    ${gridHtml}
  </div>

  <div style="margin-top:12px;margin-bottom:20px;padding:10px 20px;background:#1a1a2e;color:#fff;border-radius:6px;text-align:center;font-size:14px;font-weight:600;">
    Você é uma pessoa ${PROFILE_NAMES[dominant].split(" ")[0]}
  </div>

  <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;margin:16px 0;">
    <div style="flex:0 0 auto;">${miniRadar}</div>
    <div style="flex:1;min-width:220px;">
      <p style="font-weight:700;color:${DIM_COLORS[dominant]};font-size:15px;margin-bottom:8px;">${PROFILE_NAMES[dominant]}</p>
      <p style="font-size:13px;color:#444;line-height:1.6;">${esc(texts.youAre)}</p>
      <p style="font-size:13px;color:#444;line-height:1.6;margin-top:8px;">${esc(texts.summary)}</p>
    </div>
  </div>

  <!-- 3. DESCRIÇÃO COMPORTAMENTAL -->
  <h2>3. Descrição Comportamental</h2>
  <h3 style="color:${DIM_COLORS[dominant]};margin-bottom:6px;">${PROFILE_NAMES[dominant]} — Perfil Dominante</h3>
  <p>${esc(texts.description)}</p>

  <h3 style="color:${DIM_COLORS[secondary]};margin-top:24px;margin-bottom:6px;">${PROFILE_NAMES[secondary]} — Perfil Secundário</h3>
  <p>${esc(secTexts.youAre)}</p>
  <p>${esc(secTexts.description)}</p>
  <p>A combinação dos perfis <strong>${PROFILE_NAMES[dominant]}</strong> e <strong>${PROFILE_NAMES[secondary]}</strong> revela uma pessoa que une ${esc(texts.summaryWords.slice(0, 2).join(" e ").toLowerCase())} com ${esc(secTexts.summaryWords.slice(0, 2).join(" e ").toLowerCase())} — o que a torna versátil em ambientes que exigem tanto resultado quanto relacionamento.</p>

  <!-- 4. LIDERANÇA -->
  <h2>4. Liderança e Gestão de Pessoas</h2>
  <p>${esc(texts.leadership)}</p>

  <!-- 5. ATUAÇÃO PROFISSIONAL -->
  <h2>5. Atuação Profissional</h2>
  <p>${esc(texts.professional)}</p>

  <!-- 6. MOTIVADORES -->
  <h2>6. Motivadores Principais</h2>
  <p>Com base no perfil comportamental identificado, os principais fatores de motivação são:</p>
  <table>
    <thead><tr><th>#</th><th>Motivador</th></tr></thead>
    <tbody>${texts.motivators.map((m, i) => `<tr><td>${i + 1}</td><td>${esc(m)}</td></tr>`).join("")}</tbody>
  </table>

  <!-- 7. RESUMO -->
  <h2>7. Resumo do Perfil</h2>
  <p>${esc(texts.summary)}</p>
  <p><strong>Palavras que descrevem este perfil:</strong></p>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
    ${texts.summaryWords.map((w) => `<span style="background:${DIM_COLORS[dominant]};color:#fff;padding:4px 12px;border-radius:16px;font-size:13px;">${esc(w)}</span>`).join("")}
  </div>

  <!-- 8. GRÁFICOS -->
  <h2>8. Seu Perfil em Gráficos</h2>
  <p>Os gráficos abaixo representam a intensidade de cada dimensão DISC com base nas respostas fornecidas. A faixa azul de referência indica a zona mediana (40–60%).</p>
  <div style="display:flex;flex-wrap:wrap;gap:32px;justify-content:center;margin:20px 0;">
    <div style="text-align:center;">
      <p style="font-weight:600;font-size:13px;color:#555;margin-bottom:8px;">Gráfico de Linha</p>
      ${lineChart}
    </div>
    <div style="text-align:center;">
      <p style="font-weight:600;font-size:13px;color:#555;margin-bottom:8px;">Gráfico de Barras</p>
      ${vertBar}
    </div>
  </div>
  <table>
    <thead><tr><th>Dimensão</th><th>Score</th><th>Percentual</th></tr></thead>
    <tbody>
      <tr><td><strong style="color:#c0392b;">D — Dominância</strong></td><td>${scores.D} / 6</td><td>${pct.D}%</td></tr>
      <tr><td><strong style="color:#e67e22;">I — Influência</strong></td><td>${scores.I} / 6</td><td>${pct.I}%</td></tr>
      <tr><td><strong style="color:#27ae60;">S — eStabilidade</strong></td><td>${scores.S} / 6</td><td>${pct.S}%</td></tr>
      <tr><td><strong style="color:#2980b9;">C — Conformidade</strong></td><td>${scores.C} / 6</td><td>${pct.C}%</td></tr>
    </tbody>
  </table>

  <!-- 9. INDICADORES -->
  <h2>9. Indicadores Comportamentais</h2>
  <div style="margin-bottom:24px;">
    <p style="font-weight:700;margin-bottom:4px;">Tomada de Decisão</p>
    ${gaugeD}
    <p style="font-size:12px;color:#555;margin-top:6px;">${decisaoText}</p>
  </div>
  <div style="margin-bottom:24px;">
    <p style="font-weight:700;margin-bottom:4px;">Intensidade Total</p>
    ${gaugeI}
    <p style="font-size:12px;color:#555;margin-top:6px;">${intensidadeText}</p>
  </div>
  <div style="margin-bottom:24px;">
    <p style="font-weight:700;margin-bottom:4px;">Adaptabilidade</p>
    ${gaugeA}
    <p style="font-size:12px;color:#555;margin-top:6px;">${adaptText}</p>
  </div>

  <!-- 10. RADAR 12 -->
  <h2>10. Gráfico Radar Comportamental</h2>
  <p>O radar abaixo apresenta a intensidade das 12 competências comportamentais derivadas do perfil DISC.</p>
  <div style="text-align:center;margin:16px 0;">${radar12}</div>

  <!-- 11. SUBFATORES D e I -->
  <h2>11. Sub-fatores Dominância e Influência</h2>
  <div style="display:flex;flex-wrap:wrap;gap:32px;margin:16px 0;">
    <div style="flex:1;min-width:260px;">
      <p style="font-weight:700;color:#c0392b;margin-bottom:10px;">Sub-fatores Dominância (D)</p>
      ${dBars}
    </div>
    <div style="flex:1;min-width:260px;">
      <p style="font-weight:700;color:#e67e22;margin-bottom:10px;">Sub-fatores Influência (I)</p>
      ${iBars}
    </div>
  </div>

  <!-- 12. SUBFATORES S e C -->
  <h2>12. Sub-fatores eStabilidade e Conformidade</h2>
  <div style="display:flex;flex-wrap:wrap;gap:32px;margin:16px 0;">
    <div style="flex:1;min-width:260px;">
      <p style="font-weight:700;color:#27ae60;margin-bottom:10px;">Sub-fatores eStabilidade (S)</p>
      ${sBars}
    </div>
    <div style="flex:1;min-width:260px;">
      <p style="font-weight:700;color:#2980b9;margin-bottom:10px;">Sub-fatores Conformidade (C)</p>
      ${cBars}
    </div>
  </div>

  <!-- RODAPÉ -->
  <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
  <p style="font-size:11px;color:#aaa;text-align:center;">
    Relatório gerado automaticamente pela plataforma Stacks Infinity · ${dateStr}<br/>
    As respostas foram registradas e estão disponíveis em Relatórios Stackers.
  </p>

</section>
`.trim();
}

export { generateDiscReport as buildDiscReport };
export { generateDiscReport as buildDiscRunnerReport };
export default generateDiscReport;
export { isPersonalDiscField } from "@/lib/disc-flow";
