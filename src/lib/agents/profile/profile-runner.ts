import {
  getNextProfileQuestion,
  isProfileReady,
  updateProfileSession,
  calculateDiscScores,
  getDominantProfile,
  getSecondaryProfile,
  getDiscPercentages,
  PROFILE_NAMES,
  type FlowQuestion,
  type ProfileField,
  type ProfileSession,
} from "./profile-flow";
import { PROFILE_TEXTS, MOTIVATION_LABELS } from "./profile-texts";

type RunProfileStepInput = {
  session: ProfileSession;
  answer?: string;
  currentField?: ProfileField;
};

type RunProfileStepResult = {
  session: ProfileSession;
  done: boolean;
  reply: string;
  nextQuestion: FlowQuestion | null;
};

const TEXT_HINT = "\n\n💡 Mesmo não sendo uma etapa eliminatória, responda com mais detalhes para mapearmos seu perfil.";

// Campos que NÃO devem ter o hint (dados pessoais, escala likert, escolha forçada)
const NO_HINT_FIELDS = new Set([
  // dados pessoais
  "nome","sobrenome","sexo","telefone","email","estado","cidade","empresa","statusProfissional","area","cargo","vaga",
  // eneagrama — escala likert 1-5 (não são perguntas abertas)
  "el1","el2","el3","el4","el5","el6","el7","el8","el9","el10",
  // eneagrama — escolha forçada A/B
  "ea","eb","ec","ed","ee",
]);

function formatQuestion(question: FlowQuestion): string {
  if (question.kind === "single_choice" && question.options?.length) {
    const options = question.options
      .map((option, index) => `${index + 1}. ${option.label}`)
      .join("\n");
    return `${question.question}\n\n${options}`;
  }
  // Hint apenas em perguntas abertas que não sejam dados pessoais nem escalas
  if (question.kind === "text" && !NO_HINT_FIELDS.has(question.field)) {
    return `${question.question}${TEXT_HINT}`;
  }
  return question.question;
}

export function initializeProfileSession(): ProfileSession {
  return { status: "in_progress", reportStatus: "pending" };
}

export async function runProfileStep({
  session,
  answer,
  currentField,
}: RunProfileStepInput): Promise<RunProfileStepResult> {
  let currentSession = { ...session };
  if (currentField && typeof answer === "string") {
    currentSession = updateProfileSession(currentSession, currentField, answer);
  }
  if (isProfileReady(currentSession)) {
    currentSession.status = "completed";
    currentSession.reportStatus = "pending";
    return {
      session: currentSession,
      done: true,
      nextQuestion: null,
      reply: "Obrigado por concluir sua avaliação. Suas respostas foram registradas com sucesso e ficarão disponíveis para análise do recrutador.",
    };
  }
  const nextQuestion = getNextProfileQuestion(currentSession);
  if (!nextQuestion) {
    return {
      session: currentSession,
      done: true,
      nextQuestion: null,
      reply: "Obrigado por concluir sua avaliação. Suas respostas foram registradas com sucesso e ficarão disponíveis para análise do recrutador.",
    };
  }
  return { session: currentSession, done: false, nextQuestion, reply: formatQuestion(nextQuestion) };
}

// ─── helpers ─────────────────────────────────────────────────────────────────

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

// ─── SVG ─────────────────────────────────────────────────────────────────────

type PctMap = { D: number; I: number; S: number; C: number };

const DIM_COLORS: Record<string, string> = {
  D: "#c0392b",
  I: "#e67e22",
  S: "#27ae60",
  C: "#2980b9",
};

/** Gráfico de linha DISC (4 pontos) */
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
  const yLbls = [0, 50, 100].map(p =>
    `<text x="30" y="${y(p) + 4}" font-size="9" fill="#bbb" text-anchor="end">${p}%</text>`
  ).join("");

  const pts = dims.map((d, i) => ({ x: xs[i], y: y(pct[d]), c: DIM_COLORS[d], v: pct[d] }));
  const poly = `<polyline points="${pts.map(p => `${p.x},${p.y}`).join(" ")}" fill="none" stroke="#27ae60" stroke-width="2.2" stroke-linejoin="round"/>`;
  const dots = pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="6" fill="${p.c}" stroke="#fff" stroke-width="1.5"/>`).join("");
  const lbls = dims.map((d, i) => [
    `<text x="${xs[i]}" y="${bot + 18}" font-size="14" font-weight="bold" fill="${DIM_COLORS[d]}" text-anchor="middle">${d}</text>`,
    `<text x="${xs[i]}" y="${bot + 32}" font-size="10" fill="#9ca3af" text-anchor="middle">${pct[d]}%</text>`,
  ].join("")).join("");

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:300px;" xmlns="http://www.w3.org/2000/svg">${band}${grid}${yLbls}${poly}${dots}${lbls}</svg>`;
}

/** Gráfico de barras vertical DISC */
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
    `<text x="${xs[i]}" y="${bot + 32}" font-size="10" fill="#9ca3af" text-anchor="middle">${pct[d]}%</text>`,
  ].join("")).join("");

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:300px;" xmlns="http://www.w3.org/2000/svg">${band}${grid}${bars}${lbls}</svg>`;
}

/** Gauge horizontal */
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
    `<text x="${ix.toFixed(1)}" y="${iy + 4}" font-size="9" fill="#fff" text-anchor="middle" font-weight="bold">${value}</text>`;

  const border = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="#ccc" stroke-width="1" rx="3"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:400px;" xmlns="http://www.w3.org/2000/svg">${zoneParts}${border}${indicator}</svg>`;
}

/** Radar 12 competências */
function generateRadar12Svg(items: Array<{ name: string; value: number; color: string }>): string {
  const cx = 360, cy = 340, r = 190, n = 12;
  const W = 720, H = 680;

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

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;margin:0 auto;max-width:580px;height:auto;" xmlns="http://www.w3.org/2000/svg">${grid}${axes}${polygon}${dots}${labelParts}${scaleLbls}</svg>`;
}

/** Radar 4 pontos (mini – motivadores) */
function generateMiniRadarSvg(pct: PctMap): string {
  const cx = 120, cy = 120, r = 85;
  const dims: Array<{ key: keyof PctMap; label: string; angle: number }> = [
    { key: "D", label: "D", angle: -Math.PI / 2 },
    { key: "I", label: "I", angle: 0 },
    { key: "S", label: "S", angle: Math.PI / 2 },
    { key: "C", label: "C", angle: Math.PI },
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
    return `<text x="${lx}" y="${ly}" font-size="13" font-weight="bold" fill="${DIM_COLORS[d.key]}" text-anchor="middle" dominant-baseline="middle">${d.label}</text>`;
  }).join("");

  return `<svg viewBox="0 0 240 240" width="200" height="200" xmlns="http://www.w3.org/2000/svg">${grid}${axes}${polygon}${dots}${lbls}</svg>`;
}

/** Barras horizontais subfatores */
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
      `<text x="0" y="${y + bh / 2 + 4}" font-size="12" fill="#9ca3af">${item.name}</text>` +
      `<rect x="${lw}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${color}" opacity="0.85"/>` +
      `<text x="${lw + bw + 8}" y="${y + bh / 2 + 4}" font-size="11" font-weight="bold" fill="${color}">${item.value}%</text>`
    );
  }).join("");

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:380px;" xmlns="http://www.w3.org/2000/svg">${parts}</svg>`;
}

// ─── Eneagrama ────────────────────────────────────────────────────────────────

const ENNEA_COLORS: Record<number, string> = {
  1: "#8e44ad", 2: "#e74c3c", 3: "#e67e22", 4: "#9b59b6",
  5: "#2980b9", 6: "#16a085", 7: "#f39c12", 8: "#c0392b", 9: "#27ae60",
};

const ENNEA_DATA: Record<number, { name: string; centerLabel: string; core_fear: string; core_desire: string; work_strengths: string[]; work_risks: string[]; stress_desc: string; comm_style: string }> = {
  1: { name: "Reformador", centerLabel: "Instintivo (Corpo)", core_fear: "Estar errado ou imperfeito", core_desire: "Ser bom, íntegro e correto", work_strengths: ["Busca constante por padrões altos de qualidade", "Forte sentido de responsabilidade e ética", "Atenção a detalhes, processos e precisão"], work_risks: ["Crítica excessiva a si mesmo e aos outros", "Dificuldade em delegar quando os padrões não são claros", "Rigidez em relação a regras e métodos"], stress_desc: "Sob estresse, tende a se tornar mais crítico e perfeccionista, exigindo demais de si e dos outros.", comm_style: "Comunicação precisa e diretiva. Prefere clareza e padrões bem definidos." },
  2: { name: "Prestativo", centerLabel: "Emocional (Coração)", core_fear: "Ser indesejado ou inútil", core_desire: "Sentir-se amado e necessário", work_strengths: ["Empatia genuína e foco em relacionamento", "Disponibilidade para apoiar colegas", "Capacidade de perceber necessidades não ditas"], work_risks: ["Dizer 'sim' em excesso e sobrecarga emocional", "Dificuldade em reconhecer as próprias necessidades", "Sensibilidade a sinais de rejeição ou ingratidão"], stress_desc: "Sob estresse, pode se tornar invasivo ou tentar manter o afeto dos outros de forma indireta.", comm_style: "Comunicação calorosa, empática e pessoal. Valoriza reciprocidade e reconhecimento." },
  3: { name: "Realizador", centerLabel: "Emocional (Coração)", core_fear: "Fracasso e insignificância", core_desire: "Sentir-se valioso por meio de resultados", work_strengths: ["Foco afiado em metas e resultados tangíveis", "Alta energia para executar e entregar projetos", "Adaptação rápida a diferentes contextos"], work_risks: ["Tendência a priorizar imagem em vez de autenticidade", "Dificuldade em lidar com fracasso e feedback negativo", "Risco de workaholism e desconexão emocional"], stress_desc: "Sob estresse, pode se tornar excessivamente competitivo e perder contato com seus valores genuínos.", comm_style: "Comunicação objetiva, focada em resultados e eficiência. Valoriza credibilidade e competência." },
  4: { name: "Individualista", centerLabel: "Emocional (Coração)", core_fear: "Não ter identidade ou ser comum demais", core_desire: "Ser autêntico, especial e significativo", work_strengths: ["Profundidade emocional e sensibilidade estética singular", "Criatividade e olhar original para problemas complexos", "Capacidade de dar linguagem a experiências difíceis"], work_risks: ["Oscilação de humor e intensidade emocional", "Tendência a se comparar negativamente com outros", "Dificuldade com rotinas muito estruturadas"], stress_desc: "Sob estresse, pode retrair-se, tornar-se melancólico ou dramatizar situações.", comm_style: "Comunicação expressiva, metafórica e carregada de significado. Valoriza autenticidade e profundidade." },
  5: { name: "Investigador", centerLabel: "Mental (Cabeça)", core_fear: "Incompetência, invasão e esgotamento de recursos", core_desire: "Entender o mundo e preservar autonomia", work_strengths: ["Pensamento analítico profundo e capacidade de síntese", "Foco prolongado em problemas complexos", "Independência intelectual e objetividade"], work_risks: ["Distanciamento emocional do grupo", "Tendência a adiar a ação em busca de mais dados", "Economia excessiva de energia e recursos emocionais"], stress_desc: "Sob estresse, pode isolar-se completamente e perder a conexão com as pessoas ao redor.", comm_style: "Comunicação concisa, baseada em fatos e análise. Pode parecer distante, mas é profundamente reflexivo." },
  6: { name: "Leal", centerLabel: "Mental (Cabeça)", core_fear: "Falta de apoio, orientação e segurança", core_desire: "Ter base confiável e pertencer a algo seguro", work_strengths: ["Percepção aguçada de riscos e pontos frágeis", "Comprometimento forte com o time e a causa", "Capacidade de planejar cenários e se preparar para imprevistos"], work_risks: ["Dúvida excessiva, procrastinação e indecisão", "Dependência de validação externa antes de agir", "Reatividade intensa a ameaças percebidas"], stress_desc: "Sob estresse, pode ficar paralisado por ansiedade ou oscilar entre obediência e rebeldia.", comm_style: "Comunicação questionadora e analítica. Valoriza transparência e coerência dos líderes." },
  7: { name: "Entusiasta", centerLabel: "Mental (Cabeça)", core_fear: "Ficar preso em dor, tédio ou limitação", core_desire: "Manter liberdade, prazer e possibilidades abertas", work_strengths: ["Geração criativa de ideias e visão de oportunidades", "Capacidade de inspirar e engajar pessoas com entusiasmo", "Flexibilidade e adaptabilidade diante de mudanças"], work_risks: ["Dificuldade em concluir projetos e manter o foco", "Tendência a evitar conversas e situações difíceis", "Dispersão de energia em muitas iniciativas simultâneas"], stress_desc: "Sob estresse, pode se tornar impulsivo e usar otimismo para evitar lidar com problemas reais.", comm_style: "Comunicação animada, carismática e orientada a possibilidades. Conecta-se facilmente." },
  8: { name: "Desafiador", centerLabel: "Instintivo (Corpo)", core_fear: "Ser controlado, ferido ou traído", core_desire: "Ser forte, autônomo e proteger os seus", work_strengths: ["Coragem para enfrentar conflitos e decisões difíceis", "Clareza de posicionamento e tomada de decisão rápida", "Defesa ativa do time e das pessoas mais vulneráveis"], work_risks: ["Agressividade percebida e confrontos desnecessários", "Dificuldade em mostrar vulnerabilidade e receber ajuda", "Impaciência com lentidão, ambiguidade e burocracia"], stress_desc: "Sob estresse, pode se tornar intimidador, impulsivo ou intensificar conflitos ao invés de recuar.", comm_style: "Comunicação direta, assertiva e desafiadora. Diz o que pensa sem rodeios." },
  9: { name: "Pacificador", centerLabel: "Instintivo (Corpo)", core_fear: "Conflito, ruptura e perda de conexão", core_desire: "Manter paz interior e harmonia com o ambiente", work_strengths: ["Capacidade de ouvir e integrar diferentes perspectivas", "Promove clima de calma, estabilidade e segurança", "Grande abertura para colaboração e trabalho em equipe"], work_risks: ["Procrastinação em decisões importantes e conflituosas", "Dificuldade em se posicionar e defender ponto de vista", "Tendência a minimizar conflitos reais em vez de resolvê-los"], stress_desc: "Sob estresse, pode dissociar-se ou tornar-se passivo-agressivo.", comm_style: "Comunicação suave, mediadora e inclusiva. Prefere consenso e harmonia." },
};

function buildEnneagramScores(session: Record<string, unknown>): Record<number, number> {
  const s: Record<number, number> = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
  const fc: Record<string, [number, number]> = { ea:[1,7], eb:[2,5], ec:[8,9], ed:[3,6], ee:[8,2] };
  for (const [field, [ta, tb]] of Object.entries(fc)) {
    const v = String(session[field] ?? "").toUpperCase();
    if (v === "A") s[ta] += 2; else if (v === "B") s[tb] += 2;
  }
  const lm: Record<string, number> = { el1:1, el2:3, el3:9, el4:7, el5:6, el6:5, el7:8, el8:3, el9:3, el10:4 };
  for (const [field, type] of Object.entries(lm)) {
    const v = parseInt(String(session[field] ?? "0"), 10);
    if (v >= 1 && v <= 5) s[type] += v;
  }
  return s;
}

function getEnneaDominant(scores: Record<number, number>): number {
  return parseInt(Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0], 10);
}

function getEnneaWing(scores: Record<number, number>, primary: number): number {
  const prev = primary === 1 ? 9 : primary - 1;
  const next = primary === 9 ? 1 : primary + 1;
  return (scores[prev] ?? 0) >= (scores[next] ?? 0) ? prev : next;
}

function generateEnneagramBarSvg(scores: Record<number, number>, dominant: number): string {
  const typeNames = ["Reformador","Prestativo","Realizador","Individualista","Investigador","Leal","Entusiasta","Desafiador","Pacificador"];
  const bh = 28, gap = 10, lw = 130, maxBw = 200, W = 430;
  const H = 9 * (bh + gap) + gap;
  const maxScore = Math.max(...Object.values(scores), 1);
  const parts = Array.from({ length: 9 }, (_, i) => {
    const type = i + 1, score = scores[type] ?? 0;
    const bw = Math.max(4, Math.round((score / maxScore) * maxBw));
    const color = ENNEA_COLORS[type], y = gap + i * (bh + gap), isDom = type === dominant;
    return (
      `<text x="0" y="${y + bh/2 + 4}" font-size="11" fill="${isDom ? color : "#9ca3af"}" font-weight="${isDom ? "bold" : "normal"}">${type}. ${typeNames[i]}</text>` +
      `<rect x="${lw}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${color}" opacity="${isDom ? "1" : "0.55"}"/>` +
      `<text x="${lw+bw+6}" y="${y + bh/2 + 4}" font-size="11" font-weight="bold" fill="${color}">${score} pts</text>` +
      (isDom ? `<text x="${W-2}" y="${y + bh/2 + 4}" font-size="11" fill="${color}" text-anchor="end">★</text>` : "")
    );
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:430px;" xmlns="http://www.w3.org/2000/svg">${parts}</svg>`;
}

function generateEnneagramWheelSvg(scores: Record<number, number>, dominant: number): string {
  const cx = 200, cy = 200, r = 145, n = 9;
  function ang(i: number) { return -Math.PI/2 + (i * 2 * Math.PI)/n; }
  function pt(i: number, frac: number) { return { x: cx + r*frac*Math.cos(ang(i)), y: cy + r*frac*Math.sin(ang(i)) }; }
  const grid = [20,40,60,80,100].map(p => `<circle cx="${cx}" cy="${cy}" r="${(r*p/100).toFixed(1)}" fill="none" stroke="#ebebeb" stroke-width="1"/>`).join("");
  const axes = Array.from({ length: n }, (_, i) => { const p = pt(i,1); return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#e0e0e0" stroke-width="1"/>`; }).join("");
  const maxScore = Math.max(...Object.values(scores), 1);
  const polyPts = Array.from({ length: n }, (_, i) => { const frac = (scores[i+1] ?? 0)/maxScore; const p = pt(i,frac); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");
  const polygon = `<polygon points="${polyPts}" fill="rgba(41,128,185,0.15)" stroke="#2980b9" stroke-width="1.8" stroke-linejoin="round"/>`;
  const dots = Array.from({ length: n }, (_, i) => { const frac = (scores[i+1] ?? 0)/maxScore; const p = pt(i,frac); const isDom = (i+1)===dominant; return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${isDom ? 8 : 5}" fill="${ENNEA_COLORS[i+1]}" stroke="#fff" stroke-width="${isDom ? 2.5 : 1.5}"/>`; }).join("");
  const labels = Array.from({ length: n }, (_, i) => { const a = ang(i); const lx = cx+(r+24)*Math.cos(a); const ly = cy+(r+24)*Math.sin(a); const anchor = lx > cx+8 ? "start" : lx < cx-8 ? "end" : "middle"; const isDom = (i+1)===dominant; return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="${isDom ? 13 : 11}" font-weight="${isDom ? "bold" : "normal"}" fill="${ENNEA_COLORS[i+1]}" text-anchor="${anchor}" dominant-baseline="middle">${i+1}</text>`; }).join("");
  return `<svg viewBox="0 0 400 400" width="100%" style="max-width:360px;" xmlns="http://www.w3.org/2000/svg">${grid}${axes}${polygon}${dots}${labels}</svg>`;
}

// ─── report ──────────────────────────────────────────────────────────────────

export function generateProfileReport(session: ProfileSession & Record<string, unknown>): string {
  const scores = session.discScores ?? calculateDiscScores(session);
  const pct = getDiscPercentages(scores);
  const dominant = getDominantProfile(scores);
  const secondary = getSecondaryProfile(scores);
  const texts = PROFILE_TEXTS[dominant];
  const secTexts = PROFILE_TEXTS[secondary];

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const motivacaoLabel = MOTIVATION_LABELS[session.motivacao ?? ""] ?? esc(session.motivacao);
  const competencias =
    session.competenciasPrincipais && session.competenciasPrincipais.length === 3
      ? session.competenciasPrincipais
      : ["Competência 1", "Competência 2", "Competência 3"];

  // ── 12 competências derivadas dos scores ────────────────────────────────
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

  // ── subfatores ───────────────────────────────────────────────────────────
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
    { name: "Paciência",     value: Math.min(100, Math.round(pct.S * 1.00)) },
    { name: "Persistência",  value: Math.min(100, Math.round(pct.S * 0.90)) },
    { name: "Consideração",  value: Math.min(100, Math.round(pct.S * 0.95)) },
  ];
  const cSub = [
    { name: "Orient. Regras", value: Math.min(100, Math.round(pct.C * 0.95)) },
    { name: "Preciso",        value: Math.min(100, Math.round(pct.C * 0.85)) },
    { name: "Cuidadoso",      value: Math.min(100, Math.round(pct.C * 0.90)) },
  ];

  // ── indicadores comportamentais ──────────────────────────────────────────
  const decisaoScore = pct.D;
  const intensidadeScore = pct[dominant];
  const dominantRaw = scores[dominant] ?? 0;
  const othersSum = 6 - dominantRaw;
  const adaptScore = dominantRaw > 0 ? Math.min(100, Math.round((othersSum / (3 * dominantRaw)) * 100)) : 100;

  const decisaoText =
    decisaoScore < 40
      ? "Esta pessoa tende a ser mais cautelosa nas tomadas de decisão, preferindo analisar antes de agir."
      : decisaoScore < 60
      ? "Esta pessoa pode apresentar oscilações na tomada de decisão conforme o contexto."
      : "Esta pessoa tende a ser assertiva e objetiva nas tomadas de decisão.";

  const intensidadeText =
    intensidadeScore >= 87
      ? "Esta pessoa demonstra força comportamental muito alta. Pode ter dificuldades em processos de adaptação."
      : "Esta pessoa apresenta intensidade comportamental dentro do intervalo normal.";

  const adaptText =
    adaptScore < 20
      ? "Esta pessoa apresenta baixa adaptabilidade — perfil muito concentrado em uma dimensão."
      : adaptScore < 80
      ? "Esta pessoa apresenta adaptabilidade moderada, transitando com flexibilidade entre contextos."
      : "Esta pessoa apresenta alta adaptabilidade, com facilidade para transitar entre contextos diferentes.";

  // ── Eneagrama ────────────────────────────────────────────────────────────
  const enneaScores   = buildEnneagramScores(session as Record<string, unknown>);
  const hasEnnea =
    ["ea","eb","ec","ed","ee"].every(k => !!(session as Record<string, unknown>)[k]) &&
    ["el1","el2","el3","el4","el5","el6","el7","el8","el9","el10"].every(k => {
      const v = parseInt(String((session as Record<string, unknown>)[k] ?? "0"), 10);
      return v >= 1 && v <= 5;
    });
  const enneaDominant = getEnneaDominant(enneaScores);
  const enneaWing     = getEnneaWing(enneaScores, enneaDominant);
  const enneaData     = ENNEA_DATA[enneaDominant];
  const enneaColor    = ENNEA_COLORS[enneaDominant];
  const enneaBarChart = generateEnneagramBarSvg(enneaScores, enneaDominant);
  const enneaWheel    = generateEnneagramWheelSvg(enneaScores, enneaDominant);

  let enneaAI: Record<string, unknown> = {};
  try {
    const raw = String((session as Record<string, unknown>).enneaAnalysis ?? "{}");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") enneaAI = parsed as Record<string, unknown>;
  } catch { /* sem análise IA */ }

  const hasEnneaAI = Object.keys(enneaAI).length > 0;

  // ── SVGs ────────────────────────────────────────────────────────────────
  const lineChart   = generateLineChartSvg(pct);
  const vertBar     = generateVertBarChartSvg(pct);
  const miniRadar   = generateMiniRadarSvg(pct);
  const radar12     = generateRadar12Svg(competencyItems);
  const gaugeD      = generateGaugeSvg(decisaoScore, [
    { from: 0,  to: 40,  color: "#aed6f1", label: "Cautela" },
    { from: 40, to: 60,  color: "#a9dfbf", label: "Em desenvolvimento" },
    { from: 60, to: 100, color: "#f1948a", label: "Objetivo" },
  ]);
  const gaugeI      = generateGaugeSvg(intensidadeScore, [
    { from: 0,  to: 87,  color: "#f9e79f", label: "Normal" },
    { from: 87, to: 100, color: "#f1948a", label: "Intenso" },
  ]);
  const gaugeA      = generateGaugeSvg(adaptScore, [
    { from: 0,  to: 20,  color: "#f1948a", label: "Baixa" },
    { from: 20, to: 80,  color: "#a9dfbf", label: "Normal" },
    { from: 80, to: 100, color: "#aed6f1", label: "Alta" },
  ]);
  const dBars = generateSubfactorBarsSvg(dSub, DIM_COLORS.D);
  const iBars = generateSubfactorBarsSvg(iSub, DIM_COLORS.I);
  const sBars = generateSubfactorBarsSvg(sSub, DIM_COLORS.S);
  const cBars = generateSubfactorBarsSvg(cSub, DIM_COLORS.C);

  // ── grid 2×2 motivadores ─────────────────────────────────────────────────
  const gridBg: Record<string, string> = {
    D: "#fdecea", I: "#fef9e7", S: "#eafaf1", C: "#ebf5fb",
  };
  const gridHtml = (["D", "I", "S", "C"] as const)
    .map((dim) => {
      const bg = gridBg[dim];
      const col = DIM_COLORS[dim];
      const motivs = PROFILE_TEXTS[dim].motivators.slice(0, 3);
      return (
        `<div style="background:${bg};padding:14px;border-left:4px solid ${col};">` +
        `<p style="font-weight:700;color:${col};margin:0 0 8px;font-size:13px;">${PROFILE_NAMES[dim]}</p>` +
        `<ul style="margin:0;padding-left:16px;font-size:12px;color:#374151;background:transparent;">` +
        motivs.map((m) => `<li>${esc(m)}</li>`).join("") +
        `</ul></div>`
      );
    })
    .join("");

  return `
<style>
  @media print {
    .page-break { page-break-after: always; break-after: page; }
    .no-break   { page-break-inside: avoid; break-inside: avoid; }
    section     { page-break-inside: avoid; break-inside: avoid; }
  }
</style>
<section style="background:#ffffff;border-radius:12px;padding:32px;color:#374151;">

  <!-- ══ CAPA ══════════════════════════════════════════════════════════════ -->
  ${(() => {
    // Suporte tanto ao fluxo interno (campos diretos) quanto ao externo (termsData)
    const td = (session as Record<string, unknown>).termsData as Record<string, string> | undefined;
    const nomeCompleto = td
      ? `${td.nome ?? ""} ${td.sobrenome ?? ""}`.trim()
      : `${session.nome ?? ""} ${(session as Record<string, unknown>).sobrenome as string ?? ""}`.trim();
    const sexo            = td?.sexo            ?? (session as Record<string, unknown>).sexo as string ?? "";
    const telefone        = td?.telefone        ?? (session as Record<string, unknown>).telefone as string ?? "";
    const email           = td?.email           ?? (session as Record<string, unknown>).email as string ?? "";
    const estado          = td?.estado          ?? (session as Record<string, unknown>).estado as string ?? "";
    const cidade          = td?.cidade          ?? (session as Record<string, unknown>).cidade as string ?? "";
    const empresa         = td?.empresa         ?? (session as Record<string, unknown>).empresa as string ?? "";
    const statusProf      = td?.statusProfissional ?? (session as Record<string, unknown>).statusProfissional as string ?? "";
    const area            = td?.area            ?? (session as Record<string, unknown>).area as string ?? "";
    const cargoVal        = td?.cargo           ?? (session as Record<string, unknown>).cargo as string ?? "";
    const localidade      = [cidade, estado].filter(Boolean).join(" — ");
    const rows: [string, string][] = [
      ["Sexo", sexo],
      ["Telefone", telefone],
      ["E-mail", email],
      ["Localidade", localidade],
      ["Empresa", empresa],
      ["Status", statusProf],
      ["Área", area],
      ["Cargo", cargoVal],
    ].filter(([, v]) => v) as [string, string][];
    return `
  <div style="text-align:center;padding:32px 0 24px;border-bottom:3px solid #1a1a2e;">
    <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Relatório de Identidade Comportamental</p>
    <h1 style="font-size:26px;margin:0 0 8px;">${esc(nomeCompleto || session.nome)}</h1>
    <p style="font-size:15px;color:#374151;margin:0 0 4px;">Vaga: <strong>${esc(session.vaga)}</strong></p>
    <p style="font-size:12px;color:#6b7280;">Gerado em ${dateStr}</p>
    <div style="margin-top:18px;display:inline-block;background:#1a1a2e;color:#fff;padding:8px 28px;border-radius:20px;font-size:14px;font-weight:600;">
      Perfil Dominante: ${PROFILE_NAMES[dominant]}
    </div>
    ${rows.length > 0 ? `
    <div style="margin-top:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;text-align:left;">
      ${rows.map(([label, value]) => `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;">
        <p style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;">${esc(label)}</p>
        <p style="font-size:13px;color:#1e293b;font-weight:600;margin:0;">${esc(value)}</p>
      </div>`).join("")}
    </div>` : ""}
  </div>`;
  })()}

  <p style="font-size:11px;color:#6b7280;border-left:3px solid #ddd;padding-left:10px;margin:20px 0 0;">
    Esta avaliação ficará disponível em "Relatórios Stackers" para consulta do recrutador.
  </p>

  <!-- PAGE BREAK: capa → sumário -->
  <div class="page-break"></div>

  <!-- ══ SUMÁRIO ═══════════════════════════════════════════════════════════ -->
  <h2>Sumário</h2>
  <ol style="list-style:none;padding:0;margin:0;">
    ${[
      ["Introdução à Metodologia DISC", 3],
      ["Motivadores Naturais DISC", 3],
      ["Descrição Comportamental", 4],
      ["Liderança e Gestão de Pessoas", 4],
      ["Atuação Profissional", 5],
      ["Motivadores e Auto Descrição", 5],
      ["Resumo do Perfil", 5],
      ["Seu Perfil em Gráficos", 6],
      ["Indicadores Comportamentais", 7],
      ["Gráfico Radar Comportamental", 8],
      ["Sub-fatores Dominância e Influência", 9],
      ["Sub-fatores eStabilidade e Conformidade", 9],
      ["Evidências Comportamentais", 10],
      ["Introdução ao Eneagrama", 11],
      ["Resumo do Perfil Eneagrama", 11],
      ["Eneagrama em Gráficos", 12],
      ["Motivadores e Medos Centrais", 12],
      ["Pontos Fortes no Contexto Profissional", 12],
      ["Desafios e Pontos de Atenção", 13],
      ["Comunicação e Tomada de Decisão", 13],
      ["Reação ao Estresse", 13],
      ["Sugestões de Desenvolvimento", 13],
      ["Limites e Uso Responsável", 13],
    ].map(([label, pg], idx) => `
    <li style="display:flex;align-items:baseline;gap:4px;padding:5px 0;border-bottom:1px dotted #e2e8f0;">
      <span style="min-width:22px;font-size:13px;color:#94a3b8;font-weight:600;">${idx + 1}.</span>
      <span style="flex:1;font-size:15px;color:#1e293b;">${label}</span>
      <span style="min-width:32px;text-align:right;font-size:13px;font-weight:700;color:#64748b;">${pg}</span>
    </li>`).join("")}
  </ol>

  <!-- PAGE BREAK: sumário → DISC -->
  <div class="page-break"></div>

  <!-- ══ 1. INTRODUÇÃO ══════════════════════════════════════════════════════ -->
  <h2>1. Introdução à Metodologia DISC</h2>
  <p>O modelo DISC é uma ferramenta de avaliação comportamental amplamente utilizada no mundo corporativo para compreender padrões de comportamento, comunicação e motivação das pessoas. Desenvolvido com base nos estudos de William Moulton Marston, o DISC organiza os comportamentos humanos em quatro dimensões principais:</p>
  <ul>
    <li><strong style="color:#c0392b;">D — Dominância:</strong> Orientação a resultados, assertividade e tomada de decisão rápida.</li>
    <li><strong style="color:#e67e22;">I — Influência:</strong> Comunicação, relacionamento interpessoal e entusiasmo.</li>
    <li><strong style="color:#27ae60;">S — eStabilidade:</strong> Paciência, lealdade, consistência e trabalho em equipe.</li>
    <li><strong style="color:#2980b9;">C — Conformidade:</strong> Precisão, análise, qualidade e cumprimento de normas.</li>
  </ul>
  <p>O perfil gerado representa como esta pessoa tende a se comportar no contexto profissional — não um julgamento de valor, mas um instrumento de autoconhecimento e desenvolvimento.</p>

  <!-- ══ 2. MOTIVADORES NATURAIS ═════════════════════════════════════════════ -->
  <h2>2. Motivadores Naturais DISC</h2>
  <p>Os quadrantes abaixo descrevem o que naturalmente motiva cada perfil comportamental. Os perfis com maior score refletem as tendências mais presentes nesta pessoa.</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;border:1px solid #ddd;border-radius:8px;overflow:hidden;margin:16px 0;">
    ${gridHtml}
  </div>

  <div style="margin-top:12px;margin-bottom:20px;padding:10px 20px;background:#1a1a2e;color:#fff;border-radius:6px;text-align:center;font-size:14px;font-weight:600;">
    Você é uma pessoa ${PROFILE_NAMES[dominant]}
  </div>

  <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;margin:16px 0;">
    <div style="flex:0 0 auto;">
      ${miniRadar}
    </div>
    <div style="flex:1;min-width:220px;">
      <p style="font-weight:700;color:${DIM_COLORS[dominant]};font-size:15px;margin-bottom:8px;">${PROFILE_NAMES[dominant]}</p>
      <p style="font-size:13px;color:#374151;line-height:1.6;">${esc(texts.youAre)}</p>
      <p style="font-size:13px;color:#374151;line-height:1.6;margin-top:8px;">${esc(texts.summary)}</p>
    </div>
  </div>

  <!-- ══ 3. DESCRIÇÃO COMPORTAMENTAL ═══════════════════════════════════════ -->
  <h2>3. Descrição Comportamental</h2>

  <h3 style="color:${DIM_COLORS[dominant]};margin-bottom:6px;">${PROFILE_NAMES[dominant]} — Perfil Dominante</h3>
  <p>${esc(texts.description)}</p>
  <h3 style="color:${DIM_COLORS[secondary]};margin-top:24px;margin-bottom:6px;">${PROFILE_NAMES[secondary]} — Perfil Secundário</h3>
  <p>${esc(secTexts.youAre)}</p>
  <p>${esc(secTexts.description)}</p>
  <p>A combinação dos perfis <strong>${PROFILE_NAMES[dominant]}</strong> e <strong>${PROFILE_NAMES[secondary]}</strong> revela uma pessoa que une ${esc(texts.summaryWords.slice(0, 2).join(" e ").toLowerCase())} com ${esc(secTexts.summaryWords.slice(0, 2).join(" e ").toLowerCase())} — o que a torna versátil em ambientes que exigem tanto resultado quanto relacionamento.</p>

  <!-- ══ 4. LIDERANÇA ════════════════════════════════════════════════════════ -->
  <h2>4. Liderança e Gestão de Pessoas</h2>
  <p>${esc(texts.leadership)}</p>

  <!-- ══ 5. ATUAÇÃO PROFISSIONAL ════════════════════════════════════════════ -->
  <h2>5. Atuação Profissional</h2>
  <p>${esc(texts.professional)}</p>

  <!-- ══ 6. MOTIVADORES E AUTO DESCRIÇÃO ════════════════════════════════════ -->
  <h2>6. Motivadores e Auto Descrição</h2>
  <p>Com base no perfil comportamental identificado, os principais fatores de motivação são:</p>
  <table>
    <thead>
      <tr><th>#</th><th>Motivador</th></tr>
    </thead>
    <tbody>
      ${texts.motivators.map((m, i) => `<tr><td>${i + 1}</td><td>${esc(m)}</td></tr>`).join("")}
    </tbody>
  </table>
  <p style="margin-top:12px;"><strong>Motivação declarada pelo participante:</strong> ${esc(motivacaoLabel)}</p>

  <!-- ══ 7. RESUMO DO PERFIL ════════════════════════════════════════════════ -->
  <h2>7. Resumo do Perfil</h2>
  <p>${esc(texts.summary)}</p>
  <p><strong>Palavras que descrevem este perfil:</strong></p>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
    ${texts.summaryWords
      .map((w) => `<span style="background:${DIM_COLORS[dominant]};color:#fff;padding:4px 12px;border-radius:16px;font-size:13px;">${esc(w)}</span>`)
      .join("")}
  </div>

  <!-- ══ 8. SEU PERFIL EM GRÁFICOS ══════════════════════════════════════════ -->
  <h2>8. Seu Perfil em Gráficos</h2>
  <p>Os gráficos abaixo representam a intensidade de cada dimensão DISC com base nas respostas fornecidas. O gráfico de linha destaca o pico comportamental, enquanto o gráfico de barras facilita a comparação visual entre dimensões. A faixa azul de referência indica a zona mediana (40–60%).</p>

  <div style="display:flex;flex-wrap:wrap;gap:32px;justify-content:center;margin:20px 0;">
    <div style="text-align:center;">
      <p style="font-weight:600;font-size:13px;color:#374151;margin-bottom:8px;">Gráfico de Linha — Perfil Natural</p>
      ${lineChart}
    </div>
    <div style="text-align:center;">
      <p style="font-weight:600;font-size:13px;color:#374151;margin-bottom:8px;">Gráfico de Barras — Perfil Natural</p>
      ${vertBar}
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Dimensão</th><th>Score</th><th>Percentual</th></tr>
    </thead>
    <tbody>
      <tr><td><strong style="color:#c0392b;">D — Dominância</strong></td><td>${scores.D} / 6</td><td>${pct.D}%</td></tr>
      <tr><td><strong style="color:#e67e22;">I — Influência</strong></td><td>${scores.I} / 6</td><td>${pct.I}%</td></tr>
      <tr><td><strong style="color:#27ae60;">S — eStabilidade</strong></td><td>${scores.S} / 6</td><td>${pct.S}%</td></tr>
      <tr><td><strong style="color:#2980b9;">C — Conformidade</strong></td><td>${scores.C} / 6</td><td>${pct.C}%</td></tr>
    </tbody>
  </table>

  <!-- ══ 9. INDICADORES COMPORTAMENTAIS ════════════════════════════════════ -->
  <h2>9. Indicadores Comportamentais</h2>

  <div style="margin-bottom:24px;">
    <p style="font-weight:700;margin-bottom:4px;">Tomada de Decisão</p>
    ${gaugeD}
    <p style="font-size:12px;color:#374151;margin-top:6px;">${decisaoText}</p>
  </div>

  <div style="margin-bottom:24px;">
    <p style="font-weight:700;margin-bottom:4px;">Intensidade Total</p>
    ${gaugeI}
    <p style="font-size:12px;color:#374151;margin-top:6px;">${intensidadeText}</p>
  </div>

  <div style="margin-bottom:24px;">
    <p style="font-weight:700;margin-bottom:4px;">Adaptabilidade</p>
    ${gaugeA}
    <p style="font-size:12px;color:#374151;margin-top:6px;">${adaptText}</p>
  </div>

  <!-- ══ 10. RADAR 12 COMPETÊNCIAS ══════════════════════════════════════════ -->
  <h2>10. Gráfico Radar Comportamental</h2>
  <p>O radar abaixo apresenta a intensidade das 12 competências comportamentais derivadas do perfil DISC, distribuídas pelas quatro dimensões. Quanto maior a área preenchida, mais expressiva é a competência.</p>
  <div style="text-align:center;margin:16px 0;">
    ${radar12}
  </div>

  <!-- ══ 11. SUB-FATORES D e I ══════════════════════════════════════════════ -->
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

  <!-- ══ 12. SUB-FATORES S e C ══════════════════════════════════════════════ -->
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

  <!-- ══ 13. EVIDÊNCIAS COMPORTAMENTAIS ════════════════════════════════════ -->
  <h2>13. Evidências Comportamentais</h2>
  <p>Avaliação das competências mapeadas para a vaga de <strong>${esc(session.vaga)}</strong>, com base nas respostas do participante analisadas pelo método STAR (Situação, Ação, Resultado) e nos critérios do Dicionário de Competências.</p>

  ${(() => {
    const respostas = [
      session.competenciaExemplo1,
      session.competenciaExemplo2,
      session.competenciaExemplo3,
    ];

    type CompEntry = { competencia: string; nivel: string; justificativa: string };
    let aiItems: CompEntry[] = [];
    try {
      const raw = String((session as unknown as Record<string, unknown>).competenciaAnalysis ?? "[]");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) aiItems = parsed as CompEntry[];
    } catch { /* ignore */ }

    function nivelColor(nivel: string): string {
      const n = nivel?.toLowerCase() ?? "";
      if (n === "alto") return "#27ae60";
      if (n === "médio" || n === "medio") return "#e67e22";
      if (n === "baixo") return "#e74c3c";
      return "#888";
    }
    function nivelBg(nivel: string): string {
      const n = nivel?.toLowerCase() ?? "";
      if (n === "alto") return "#eafaf1";
      if (n === "médio" || n === "medio") return "#fef5e7";
      if (n === "baixo") return "#fdedec";
      return "#f5f5f5";
    }

    return [0, 1, 2].map((i) => {
      const ai = aiItems[i];
      // Use AI-returned name first (more reliable), then competencias array, then fallback
      const nomeComp = ai?.competencia || competencias[i] || `Competência ${i + 1}`;
      const nivel = ai?.nivel ?? "";
      const justificativa = ai?.justificativa ?? "";
      const resposta = respostas[i];
      const color = nivelColor(nivel);
      const bg = nivelBg(nivel);

      return `
  <div style="border:1px solid #e0e0e0;border-radius:10px;margin-bottom:24px;overflow:hidden;">
    <div style="background:#1a1a2e;padding:14px 20px;">
      <span style="color:#fff;font-weight:700;font-size:15px;">Competência: ${esc(nomeComp)}</span>
    </div>
    <div style="padding:18px 20px;background:#fff;">
      ${nivel ? `<p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#374151;">Nível de Evidência: <span style="color:${color};font-weight:700;">${esc(nivel)}</span></p>` : ""}
      ${resposta ? `<p style="margin:8px 0 12px;font-size:12px;color:#374151;font-style:italic;line-height:1.65;border-left:3px solid #ddd;padding-left:12px;">"${esc(resposta)}"</p>` : ""}
      ${justificativa ? `
      <div style="background:${bg};border-left:4px solid ${color};border-radius:4px;padding:12px 16px;margin-top:4px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#374151;">Justificativa com Base na Resposta:</p>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">${esc(justificativa)}</p>
      </div>` : ""}
    </div>
  </div>`;
    }).join("");
  })()}

  <!-- PAGE BREAK: DISC → Eneagrama -->
  <div class="page-break"></div>

  <!-- ══ CAPA ENEAGRAMA ════════════════════════════════════════════════════ -->
  <div style="text-align:center;padding:32px 0 24px;border-top:4px solid #1a1a2e;margin-top:0;">
    <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Relatório de Eneagrama</p>
    <h1 style="font-size:22px;margin:0 0 8px;">${esc((() => { const td = (session as Record<string, unknown>).termsData as Record<string,string>|undefined; return td ? `${td.nome ?? ""} ${td.sobrenome ?? ""}`.trim() : `${session.nome ?? ""} ${(session as Record<string,unknown>).sobrenome as string ?? ""}`.trim() || session.nome; })())}</h1>
    <p style="font-size:12px;color:#6b7280;">Gerado em ${dateStr}</p>
  </div>

  <!-- ══ 14. INTRODUÇÃO AO ENEAGRAMA ═══════════════════════════════════════ -->
  <h2>14. Introdução ao Eneagrama</h2>
  <p>O Eneagrama é um modelo de tipologia de personalidade que descreve padrões de pensamento, emoção e comportamento a partir de <strong>9 tipos fundamentais</strong>, cada um com motivações, medos e estratégias de vida distintas. Ao contrário de classificações baseadas em comportamentos observáveis, o Eneagrama trabalha com as <em>motivações internas</em> que impulsionam as ações.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:16px 0;">
    <div style="background:#fdf2f8;padding:12px;border-left:4px solid #8e44ad;border-radius:4px;">
      <p style="font-weight:700;color:#8e44ad;margin:0 0 6px;font-size:12px;">Centro Instintivo (Corpo)</p>
      <p style="font-size:11px;color:#374151;margin:0;">Tipos <strong>8, 9, 1</strong> — raiva, controle, ação direta.</p>
    </div>
    <div style="background:#fef5e7;padding:12px;border-left:4px solid #e67e22;border-radius:4px;">
      <p style="font-weight:700;color:#e67e22;margin:0 0 6px;font-size:12px;">Centro Emocional (Coração)</p>
      <p style="font-size:11px;color:#374151;margin:0;">Tipos <strong>2, 3, 4</strong> — imagem, valor pessoal, relações.</p>
    </div>
    <div style="background:#eaf4fb;padding:12px;border-left:4px solid #2980b9;border-radius:4px;">
      <p style="font-weight:700;color:#2980b9;margin:0 0 6px;font-size:12px;">Centro Mental (Cabeça)</p>
      <p style="font-size:11px;color:#374151;margin:0;">Tipos <strong>5, 6, 7</strong> — medo, planejamento, ideias.</p>
    </div>
  </div>

  <!-- ══ 15. RESUMO DO PERFIL ENEAGRAMA ════════════════════════════════════ -->
  <h2>15. Resumo do Perfil Eneagrama</h2>
  <div style="background:${enneaColor}12;border-left:5px solid ${enneaColor};padding:20px;border-radius:6px;margin:16px 0;">
    <p style="font-size:20px;font-weight:700;color:${enneaColor};margin:0 0 4px;">Tipo ${enneaDominant}w${enneaWing} — ${esc(enneaData.name)}</p>
    <p style="font-size:13px;color:#666;margin:0 0 16px;">Centro: ${esc(enneaData.centerLabel)}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div>
        <p style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;margin:0 0 4px;">Medo Central</p>
        <p style="font-size:13px;color:#374151;margin:0;">${esc(enneaData.core_fear)}</p>
      </div>
      <div>
        <p style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;margin:0 0 4px;">Desejo Central</p>
        <p style="font-size:13px;color:#374151;margin:0;">${esc(enneaData.core_desire)}</p>
      </div>
    </div>
    ${hasEnneaAI && enneaAI.resumo_perfil ? `<p style="font-size:13px;color:#374151;line-height:1.7;margin:0;">${esc(String(enneaAI.resumo_perfil))}</p>` : ""}
  </div>

  <!-- ══ 16. ENEAGRAMA EM GRÁFICOS ══════════════════════════════════════════ -->
  <h2>16. Eneagrama em Gráficos</h2>
  <p>O gráfico de barras mostra a pontuação de cada tipo. A roda exibe o perfil circular com o tipo dominante destacado.</p>
  <div style="display:flex;flex-wrap:wrap;gap:32px;justify-content:center;align-items:flex-start;margin:20px 0;">
    <div>
      <p style="font-weight:600;font-size:13px;color:#374151;margin-bottom:8px;">Pontuação por Tipo</p>
      ${enneaBarChart}
    </div>
    <div style="text-align:center;">
      <p style="font-weight:600;font-size:13px;color:#374151;margin-bottom:8px;">Roda Eneagrama</p>
      ${enneaWheel}
    </div>
  </div>
  <table>
    <thead><tr><th>Tipo</th><th>Nome</th><th>Centro</th><th>Pontos</th></tr></thead>
    <tbody>
      ${Array.from({ length: 9 }, (_, i) => {
        const t = i + 1;
        const d = ENNEA_DATA[t];
        const sv = enneaScores[t] ?? 0;
        const isDom = t === enneaDominant;
        return `<tr style="${isDom ? `background:${ENNEA_COLORS[t]}15;font-weight:700;` : ""}">
          <td style="color:${ENNEA_COLORS[t]};font-weight:700;">${t}${isDom ? " ★" : ""}</td>
          <td>${esc(d.name)}</td>
          <td style="font-size:11px;">${esc(d.centerLabel)}</td>
          <td>${sv} pts</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>

  <!-- ══ 17. MOTIVADORES E MEDOS CENTRAIS ══════════════════════════════════ -->
  <h2>17. Motivadores e Medos Centrais</h2>
  ${hasEnneaAI && enneaAI.motivadores_medos
    ? `<p>${esc(String(enneaAI.motivadores_medos))}</p>`
    : `<p>O <strong>desejo básico</strong> do Tipo ${enneaDominant} é ${esc(enneaData.core_desire.toLowerCase())}. O <strong>medo central</strong> é ${esc(enneaData.core_fear.toLowerCase())}.</p>`}

  <!-- ══ 18. PONTOS FORTES ══════════════════════════════════════════════════ -->
  <h2>18. Pontos Fortes no Contexto Profissional</h2>
  <ul>
    ${hasEnneaAI && Array.isArray(enneaAI.pontos_fortes)
      ? (enneaAI.pontos_fortes as string[]).map(s => `<li>${esc(s)}</li>`).join("")
      : enneaData.work_strengths.map(s => `<li>${esc(s)}</li>`).join("")}
  </ul>

  <!-- ══ 19. DESAFIOS ═══════════════════════════════════════════════════════ -->
  <h2>19. Desafios e Pontos de Atenção</h2>
  <ul>
    ${hasEnneaAI && Array.isArray(enneaAI.desafios)
      ? (enneaAI.desafios as string[]).map(r => `<li>${esc(r)}</li>`).join("")
      : enneaData.work_risks.map(r => `<li>${esc(r)}</li>`).join("")}
  </ul>

  <!-- ══ 20. COMUNICAÇÃO E DECISÃO ══════════════════════════════════════════ -->
  <h2>20. Comunicação e Tomada de Decisão</h2>
  ${hasEnneaAI && enneaAI.comunicacao_decisao
    ? `<p>${esc(String(enneaAI.comunicacao_decisao))}</p>`
    : `<p>${esc(enneaData.comm_style)}</p>`}
  <div style="background:#f8f9fa;padding:12px 16px;border-radius:6px;margin-top:10px;">
    <p style="font-size:12px;font-weight:700;color:#374151;margin:0 0 4px;">Centro de Inteligência: ${esc(enneaData.centerLabel)}</p>
    <p style="font-size:12px;color:#666;margin:0;">Indica de onde a pessoa processa a realidade — corpo (instinto), coração (emoção) ou cabeça (pensamento).</p>
  </div>

  <!-- ══ 21. REAÇÃO AO ESTRESSE ═════════════════════════════════════════════ -->
  <h2>21. Reação ao Estresse</h2>
  ${hasEnneaAI && enneaAI.estresse
    ? `<p>${esc(String(enneaAI.estresse))}</p>`
    : `<p>${esc(enneaData.stress_desc)}</p>`}

  <!-- ══ 22. SUGESTÕES DE DESENVOLVIMENTO ══════════════════════════════════ -->
  <h2>22. Sugestões de Desenvolvimento</h2>
  <ol>
    ${hasEnneaAI && Array.isArray(enneaAI.desenvolvimento)
      ? (enneaAI.desenvolvimento as string[]).map(d => `<li>${esc(d)}</li>`).join("")
      : `<li>Observe quando suas reações automáticas estão guiando o comportamento.</li>
         <li>Desenvolva consciência sobre o impacto do medo central nas suas decisões.</li>
         <li>Explore os recursos complementares do Tipo ${enneaWing} (sua asa).</li>`}
  </ol>

  <!-- ══ 23. LIMITES E USO RESPONSÁVEL ═════════════════════════════════════ -->
  <h2>23. Limites e Uso Responsável</h2>
  <ul style="font-size:12px;color:#666;">
    <li>Este relatório é baseado em questionário simplificado de Eneagrama, voltado para <strong>autoconhecimento</strong> — não equivale a instrumentos validados como RHETI ou iEQ9.</li>
    <li>As hipóteses de tipo devem ser usadas como <strong>ponto de partida para reflexão</strong>, não como rótulo fixo ou diagnóstico de personalidade.</li>
    <li>Este conteúdo não deve ser utilizado isoladamente para decisões de contratação, promoção ou demissão.</li>
  </ul>

  <!-- ══ RODAPÉ ════════════════════════════════════════════════════════════ -->
  <hr style="margin:32px 0;border:none;border-top:1px solid #ddd;" />
  <p style="font-size:11px;color:#aaa;text-align:center;">
    Relatório gerado automaticamente pela plataforma Stacks Infinity · ${dateStr}<br/>
    As respostas foram registradas e estão disponíveis em Relatórios Stackers.
  </p>

</section>
`.trim();
}
