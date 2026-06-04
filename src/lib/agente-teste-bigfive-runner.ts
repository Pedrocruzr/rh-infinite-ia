import {
  initializeBigFiveSession,
  runBigFiveStep,
  type BigFiveField,
  type BigFiveSession,
} from "@/lib/agente-teste-bigfive-flow";

export type { BigFiveField, BigFiveSession } from "@/lib/agente-teste-bigfive-flow";
export { initializeBigFiveSession, runBigFiveStep } from "@/lib/agente-teste-bigfive-flow";

// ─── tipos ────────────────────────────────────────────────────────────────────

type OCEANKey = "O" | "C" | "E" | "A" | "N";
type PctMap = Record<OCEANKey, number>;

// Mapeamento de itens para facetas e chaves
type ItemConfig = {
  id: number;
  fator: OCEANKey;
  faceta: string;
  chave: "+" | "-";
};

const ITEMS_CONFIG: Record<number, ItemConfig> = {
  1: { id: 1, fator: "O", faceta: "O1", chave: "+" },
  2: { id: 2, fator: "O", faceta: "O1", chave: "-" },
  3: { id: 3, fator: "O", faceta: "O1", chave: "+" },
  4: { id: 4, fator: "O", faceta: "O1", chave: "-" },
  5: { id: 5, fator: "O", faceta: "O2", chave: "+" },
  6: { id: 6, fator: "O", faceta: "O2", chave: "-" },
  7: { id: 7, fator: "O", faceta: "O2", chave: "+" },
  8: { id: 8, fator: "O", faceta: "O2", chave: "-" },
  9: { id: 9, fator: "O", faceta: "O3", chave: "+" },
  10: { id: 10, fator: "O", faceta: "O3", chave: "-" },
  11: { id: 11, fator: "O", faceta: "O3", chave: "+" },
  12: { id: 12, fator: "O", faceta: "O3", chave: "-" },
  13: { id: 13, fator: "O", faceta: "O4", chave: "+" },
  14: { id: 14, fator: "O", faceta: "O4", chave: "-" },
  15: { id: 15, fator: "O", faceta: "O4", chave: "+" },
  16: { id: 16, fator: "O", faceta: "O4", chave: "-" },
  17: { id: 17, fator: "O", faceta: "O5", chave: "+" },
  18: { id: 18, fator: "O", faceta: "O5", chave: "-" },
  19: { id: 19, fator: "O", faceta: "O5", chave: "+" },
  20: { id: 20, fator: "O", faceta: "O5", chave: "-" },
  21: { id: 21, fator: "O", faceta: "O6", chave: "+" },
  22: { id: 22, fator: "O", faceta: "O6", chave: "-" },
  23: { id: 23, fator: "O", faceta: "O6", chave: "+" },
  24: { id: 24, fator: "O", faceta: "O6", chave: "-" },

  25: { id: 25, fator: "C", faceta: "C1", chave: "+" },
  26: { id: 26, fator: "C", faceta: "C1", chave: "-" },
  27: { id: 27, fator: "C", faceta: "C1", chave: "+" },
  28: { id: 28, fator: "C", faceta: "C1", chave: "-" },
  29: { id: 29, fator: "C", faceta: "C2", chave: "+" },
  30: { id: 30, fator: "C", faceta: "C2", chave: "-" },
  31: { id: 31, fator: "C", faceta: "C2", chave: "+" },
  32: { id: 32, fator: "C", faceta: "C2", chave: "-" },
  33: { id: 33, fator: "C", faceta: "C3", chave: "+" },
  34: { id: 34, fator: "C", faceta: "C3", chave: "-" },
  35: { id: 35, fator: "C", faceta: "C3", chave: "+" },
  36: { id: 36, fator: "C", faceta: "C3", chave: "-" },
  37: { id: 37, fator: "C", faceta: "C4", chave: "+" },
  38: { id: 38, fator: "C", faceta: "C4", chave: "-" },
  39: { id: 39, fator: "C", faceta: "C4", chave: "+" },
  40: { id: 40, fator: "C", faceta: "C4", chave: "-" },
  41: { id: 41, fator: "C", faceta: "C5", chave: "+" },
  42: { id: 42, fator: "C", faceta: "C5", chave: "-" },
  43: { id: 43, fator: "C", faceta: "C5", fill: "C5", chave: "+" } as any,
  44: { id: 44, fator: "C", faceta: "C5", chave: "-" },
  45: { id: 45, fator: "C", faceta: "C6", chave: "+" },
  46: { id: 46, fator: "C", faceta: "C6", chave: "-" },
  47: { id: 47, fator: "C", faceta: "C6", chave: "+" },
  48: { id: 48, fator: "C", faceta: "C6", chave: "-" },

  49: { id: 49, fator: "E", faceta: "E1", chave: "+" },
  50: { id: 50, fator: "E", faceta: "E1", chave: "-" },
  51: { id: 51, fator: "E", faceta: "E1", chave: "+" },
  52: { id: 52, fator: "E", faceta: "E1", chave: "-" },
  53: { id: 53, fator: "E", faceta: "E2", chave: "+" },
  54: { id: 54, fator: "E", faceta: "E2", chave: "-" },
  55: { id: 55, fator: "E", faceta: "E2", chave: "+" },
  56: { id: 56, fator: "E", faceta: "E2", chave: "-" },
  57: { id: 57, fator: "E", faceta: "E3", chave: "+" },
  58: { id: 58, fator: "E", faceta: "E3", chave: "-" },
  59: { id: 59, fator: "E", faceta: "E3", chave: "+" },
  60: { id: 60, fator: "E", faceta: "E3", chave: "-" },
  61: { id: 61, fator: "E", faceta: "E4", chave: "+" },
  62: { id: 62, fator: "E", faceta: "E4", chave: "-" },
  63: { id: 63, fator: "E", faceta: "E4", chave: "+" },
  64: { id: 64, fator: "E", faceta: "E4", chave: "-" },
  65: { id: 65, fator: "E", faceta: "E5", chave: "+" },
  66: { id: 66, fator: "E", faceta: "E5", chave: "-" },
  67: { id: 67, fator: "E", faceta: "E5", chave: "+" },
  68: { id: 68, fator: "E", faceta: "E5", chave: "-" },
  69: { id: 69, fator: "E", faceta: "E6", chave: "+" },
  70: { id: 70, fator: "E", faceta: "E6", chave: "-" },
  71: { id: 71, fator: "E", faceta: "E6", chave: "+" },
  72: { id: 72, fator: "E", faceta: "E6", chave: "-" },

  73: { id: 73, fator: "A", faceta: "A1", chave: "+" },
  74: { id: 74, fator: "A", faceta: "A1", chave: "-" },
  75: { id: 75, fator: "A", faceta: "A1", chave: "+" },
  76: { id: 76, fator: "A", faceta: "A1", chave: "-" },
  77: { id: 77, fator: "A", faceta: "A2", chave: "+" },
  78: { id: 78, fator: "A", faceta: "A2", chave: "-" },
  79: { id: 79, fator: "A", faceta: "A2", chave: "+" },
  80: { id: 80, fator: "A", faceta: "A2", chave: "-" },
  81: { id: 81, fator: "A", faceta: "A3", chave: "+" },
  82: { id: 82, fator: "A", faceta: "A3", chave: "-" },
  83: { id: 83, fator: "A", faceta: "A3", chave: "+" },
  84: { id: 84, fator: "A", faceta: "A3", chave: "-" },
  85: { id: 85, fator: "A", faceta: "A4", chave: "+" },
  86: { id: 86, fator: "A", faceta: "A4", chave: "-" },
  87: { id: 87, fator: "A", faceta: "A4", chave: "+" },
  88: { id: 88, fator: "A", faceta: "A4", chave: "-" },
  89: { id: 89, fator: "A", faceta: "A5", chave: "+" },
  90: { id: 90, fator: "A", faceta: "A5", chave: "-" },
  91: { id: 91, fator: "A", faceta: "A5", chave: "+" },
  92: { id: 92, fator: "A", faceta: "A5", chave: "-" },
  93: { id: 93, fator: "A", faceta: "A6", chave: "+" },
  94: { id: 94, fator: "A", faceta: "A6", chave: "-" },
  95: { id: 95, fator: "A", faceta: "A6", chave: "+" },
  96: { id: 96, fator: "A", faceta: "A6", chave: "-" },

  97: { id: 97, fator: "N", faceta: "N1", chave: "+" },
  98: { id: 98, fator: "N", faceta: "N1", chave: "-" },
  99: { id: 99, fator: "N", faceta: "N1", chave: "+" },
  100: { id: 100, fator: "N", faceta: "N1", chave: "-" },
  101: { id: 101, fator: "N", faceta: "N2", chave: "+" },
  102: { id: 102, fator: "N", faceta: "N2", chave: "-" },
  103: { id: 103, fator: "N", faceta: "N2", chave: "+" },
  104: { id: 104, fator: "N", faceta: "N2", chave: "-" },
  105: { id: 105, fator: "N", faceta: "N3", chave: "+" },
  106: { id: 106, fator: "N", faceta: "N3", chave: "-" },
  107: { id: 107, fator: "N", faceta: "N3", chave: "+" },
  108: { id: 108, fator: "N", faceta: "N3", chave: "-" },
  109: { id: 109, fator: "N", faceta: "N4", chave: "+" },
  110: { id: 110, fator: "N", faceta: "N4", chave: "-" },
  111: { id: 111, fator: "N", faceta: "N4", chave: "+" },
  112: { id: 112, fator: "N", faceta: "N4", chave: "-" },
  113: { id: 113, fator: "N", faceta: "N5", chave: "+" },
  114: { id: 114, fator: "N", faceta: "N5", chave: "-" },
  115: { id: 115, fator: "N", faceta: "N5", chave: "+" },
  116: { id: 116, fator: "N", faceta: "N5", chave: "-" },
  117: { id: 117, fator: "N", faceta: "N6", chave: "+" },
  118: { id: 118, fator: "N", faceta: "N6", chave: "-" },
  119: { id: 119, fator: "N", faceta: "N6", chave: "+" },
  120: { id: 120, fator: "N", faceta: "N6", chave: "-" },
};

// Configurações do IPIP-NEO-120
const FACTOR_NAMES: Record<OCEANKey, string> = {
  O: "Abertura à Experiência",
  C: "Conscienciosidade",
  E: "Extroversão",
  A: "Agradabilidade",
  N: "Neuroticismo",
};

const FACTOR_COLORS: Record<OCEANKey, string> = {
  O: "#06b6d4", // Cyan
  C: "#10b981", // Emerald
  E: "#f59e0b", // Amber
  A: "#3b82f6", // Blue
  N: "#ef4444", // Red
};

const FACETA_NAMES: Record<string, string> = {
  O1: "Imaginação", O2: "Interesses Artísticos", O3: "Intelecto", O4: "Liberalismo", O5: "Curiosidade", O6: "Flexibilidade",
  C1: "Organização", C2: "Responsabilidade", C3: "Persistência", C4: "Autodisciplina", C5: "Pontualidade", C6: "Planejamento",
  E1: "Entusiasmo", E2: "Sociabilidade", E3: "Assertividade", E4: "Busca de Estímulo", E5: "Emoções Positivas", E6: "Energia",
  A1: "Confiança", A2: "Altruísmo", A3: "Cooperação", A4: "Modéstia", A5: "Sensibilidade", A6: "Tolerância",
  N1: "Ansiedade", N2: "Irritabilidade", N3: "Vulnerabilidade ao Estresse", N4: "Autoconsciência", N5: "Melancolia", N6: "Instabilidade de Humor",
};

// Textos de interpretação por nível (OCEAN)
const INTERPRETATIONS: Record<OCEANKey, { Alto: string; Medio: string; Baixo: string }> = {
  O: {
    Alto: "Apresenta forte curiosidade intelectual, imaginação ativa e apreensão estética. Gosta de novidades, novas ideias e de questionar convicções tradicionais. É ideal para papéis de inovação, design e estratégia.",
    Medio: "Apresenta equilíbrio entre pragmatismo e curiosidade. Consegue apreciar ideias inovadoras, mas valoriza a estabilidade e a aplicação prática da realidade, alternando bem entre inovação e rotina.",
    Baixo: "Prefere ideias consolidadas, rotina e abordagens tradicionais. É pragmático, focado no mundo real e no que já foi testado e aprovado, trazendo solidez e execução focada para o dia a dia.",
  },
  C: {
    Alto: "Demonstra alto nível de organização, autodisciplina e responsabilidade. É focado em metas, persistente e cumpre prazos de forma consistente, sendo altamente recomendável para cargos administrativos, de gestão e precisão técnica.",
    Medio: "Apresenta um bom balanço entre organização e flexibilidade. Consegue se planejar, mas lida bem com imprevistos sem perder o foco das entregas ou a qualidade do serviço.",
    Baixo: "Tende a ser espontâneo, flexível e menos apegado a regras rígidas. Pode apresentar dificuldades com organização sistemática de tarefas ou prazos muito curtos, necessitando de rotinas mais dinâmicas e adaptáveis.",
  },
  E: {
    Alto: "Muito sociável, comunicativo e dinâmico. Sente-se energizado ao interagir com outras pessoas, expressa-se com facilidade e lidera grupos de forma assertiva. Excelente para vendas, negociações e atendimento.",
    Medio: "Ambivalente (ambivertido). Lida bem com interações sociais e trabalho em equipe, mas também valoriza momentos de privacidade e foco individual para recarregar as energias e focar na produtividade técnica.",
    Baixo: "Reservado, silencioso e focado no mundo interno. Prefere trabalhar sozinho ou em pequenos grupos silenciosos, sendo altamente reflexivo nas interações e focado em atividades individuais.",
  },
  A: {
    Alto: "Altamente cooperativo, empático, confiante e atencioso. Prioriza a harmonia da equipe, tem facilidade para apoiar colegas e evitar conflitos destrutivos, sendo ideal para posições de suporte e RH.",
    Medio: "Equilibrado nas relações interpessoais. É cooperativo, mas sabe se posicionar com firmeza e competir de forma saudável quando a situação exige, dosando empatia e assertividade comercial.",
    Baixo: "Mais competitivo, cético e focado nas suas próprias metas. Tende a ser direto e questionador, não hesitando em confrontar ideias para alcançar resultados e solucionar problemas complexos sem sentimentalismos.",
  },
  N: {
    Alto: "Apresenta maior reatividade emocional, ansiedade ou vulnerabilidade ao estresse. Tende a se preocupar mais com prazos e riscos, exigindo ambientes previsíveis, acolhedores e com suporte contínuo da liderança.",
    Medio: "Apresenta reatividade emocional moderada. Lida bem com a maioria das pressões diárias, mas pode sofrer algum impacto sob estresse crônico ou crises agudas prolongadas na rotina de trabalho.",
    Baixo: "Muito calmo, estável e resiliente diante de pressões. Dificilmente perde a paciência ou se deixa abalar por contratempos, transmitindo segurança e equilíbrio emocional para todo o time.",
  },
};

// ─── score logic ─────────────────────────────────────────────────────────────

type ScoresResult = {
  fatoresRaw: Record<OCEANKey, number>;
  fatoresPct: Record<OCEANKey, number>;
  facetasRaw: Record<string, number>;
  facetasPct: Record<string, number>;
};

function buildBigFiveScores(session: BigFiveSession): ScoresResult {
  const fatoresRaw: Record<OCEANKey, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const facetasRaw: Record<string, number> = {};

  // Inicializa facetas
  for (const k of Object.keys(FACETA_NAMES)) {
    facetasRaw[k] = 0;
  }

  // Percorre as 120 questões
  for (let i = 1; i <= 120; i++) {
    const rawVal = parseInt(String(session[`q${i}`] ?? "").trim(), 10);
    const item = ITEMS_CONFIG[i];
    if (!item || Number.isNaN(rawVal)) continue;

    let score = rawVal;
    if (item.chave === "-") {
      score = 6 - rawVal; // Inverte pontuação Likert 5 pontos
    }

    fatoresRaw[item.fator] += score;
    facetasRaw[item.faceta] += score;
  }

  const fatoresPct: Record<OCEANKey, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const facetasPct: Record<string, number> = {};

  // Calcula percentual dos fatores (Min 24, Max 120)
  for (const f of ["O", "C", "E", "A", "N"] as const) {
    const val = fatoresRaw[f];
    // Ajusta para escala 0% a 100%
    fatoresPct[f] = Math.round(((val - 24) / 96) * 100);
  }

  // Calcula percentual das facetas (Min 4, Max 20)
  for (const k of Object.keys(FACETA_NAMES)) {
    const val = facetasRaw[k] || 4;
    facetasPct[k] = Math.round(((val - 4) / 16) * 100);
  }

  return { fatoresRaw, fatoresPct, facetasRaw, facetasPct };
}

function getLevelLabel(pct: number): "Baixo" | "Medio" | "Alto" {
  if (pct < 38) return "Baixo";
  if (pct < 63) return "Medio";
  return "Alto";
}

// ─── SVG Charts ───────────────────────────────────────────────────────────────

function generateRadarOceanSvg(pct: PctMap): string {
  const cx = 160, cy = 160, r = 100, n = 5;
  const dims: OCEANKey[] = ["O", "C", "E", "A", "N"];

  function ang(i: number) {
    return -Math.PI / 2 + (i * 2 * Math.PI) / n;
  }

  function pt(i: number, val: number) {
    const frac = val / 100;
    return {
      x: cx + r * frac * Math.cos(ang(i)),
      y: cy + r * frac * Math.sin(ang(i)),
    };
  }

  const grid = [25, 50, 75, 100].map((p) => {
    const gr = (r * p) / 100;
    return `<circle cx="${cx}" cy="${cy}" r="${gr}" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>`;
  }).join("");

  const axes = dims.map((_, i) => {
    const p = pt(i, 100);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#cbd5e1" stroke-width="1"/>`;
  }).join("");

  const polyPts = dims.map((d, i) => {
    const p = pt(i, pct[d] ?? 0);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");
  const polygon = `<polygon points="${polyPts}" fill="rgba(99,102,241,0.18)" stroke="#6366f1" stroke-width="2.2" stroke-linejoin="round"/>`;

  const dots = dims.map((d, i) => {
    const p = pt(i, pct[d] ?? 0);
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5.5" fill="${FACTOR_COLORS[d]}" stroke="#fff" stroke-width="1.5"/>`;
  }).join("");

  const labels = dims.map((d, i) => {
    const a = ang(i);
    const dist = r + 18;
    const lx = cx + dist * Math.cos(a);
    const ly = cy + dist * Math.sin(a);
    const anchor = lx > cx + 8 ? "start" : lx < cx - 8 ? "end" : "middle";
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="12" font-weight="bold" fill="${FACTOR_COLORS[d]}" text-anchor="${anchor}" dominant-baseline="middle">${d} (${pct[d]}%)</text>`;
  }).join("");

  return `<svg viewBox="0 0 320 320" width="100%" style="max-width:320px;display:block;margin:0 auto;" xmlns="http://www.w3.org/2000/svg">${grid}${axes}${polygon}${dots}${labels}</svg>`;
}

function generateFacetaBarsSvg(
  items: Array<{ name: string; value: number }>,
  color: string
): string {
  const bh = 24, gap = 12, lw = 150, maxBw = 180, W = 370;
  const H = items.length * (bh + gap) + gap;

  const parts = items.map((item, i) => {
    const y = gap + i * (bh + gap);
    const bw = Math.max(4, Math.round((item.value / 100) * maxBw));
    return (
      `<text x="0" y="${y + bh / 2 + 4}" font-size="12" fill="#334155" font-weight="500">${item.name}</text>` +
      `<rect x="${lw}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${color}" opacity="0.85"/>` +
      `<text x="${lw + bw + 8}" y="${y + bh / 2 + 4}" font-size="11" font-weight="bold" fill="${color}">${item.value}%</text>`
    );
  }).join("");

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:380px;" xmlns="http://www.w3.org/2000/svg">${parts}</svg>`;
}

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

// ─── relatorio principal ──────────────────────────────────────────────────────

export function generateBigFiveReport(session: BigFiveSession & Record<string, unknown>): string {
  const { fatoresRaw, fatoresPct, facetasRaw, facetasPct } = buildBigFiveScores(session);

  const nome = String(session.nome ?? "Não informado");
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const td = (session.termsData ?? null) as Record<string, string> | null;
  const pNome        = td ? (String(td.nome ?? "")).trim()               : String(session.nome ?? "");
  const pSobrenome   = td ? (String(td.sobrenome ?? "")).trim()          : String(session.sobrenome ?? "");
  const pSexo        = td ? (String(td.sexo ?? "")).trim()               : String(session.sexo ?? "");
  const pTelefone    = td ? (String(td.telefone ?? "")).trim()           : String(session.telefone ?? "");
  const pEmail       = td ? (String(td.email ?? "")).trim()              : String(session.email ?? "");
  const pEstado      = td ? (String(td.estado ?? "")).trim()             : String(session.estado ?? "");
  const pCidade      = td ? (String(td.cidade ?? "")).trim()             : String(session.cidade ?? "");
  const pEmpresa     = td ? (String(td.empresa ?? "")).trim()            : String(session.empresa ?? "");
  const pStatus      = td ? (String(td.statusProfissional ?? "")).trim() : String(session.statusProfissional ?? "");
  const pArea        = td ? (String(td.area ?? "")).trim()               : String(session.area ?? "");
  const pCargo       = td ? (String(td.cargo ?? "")).trim()              : String(session.cargo ?? "");

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

  const radarChart = generateRadarOceanSvg(fatoresPct);

  // Facetas bars por fator
  function renderFactorBlock(f: OCEANKey): string {
    const col = FACTOR_COLORS[f];
    const pct = fatoresPct[f];
    const level = getLevelLabel(pct);
    const interp = INTERPRETATIONS[f][level];
    
    // Filtra as 6 facetas deste fator
    const facKeys = Object.keys(FACETA_NAMES).filter((k) => k.startsWith(f));
    const items = facKeys.map((k) => ({
      name: FACETA_NAMES[k],
      value: facetasPct[k] ?? 0,
    }));

    const barSvg = generateFacetaBarsSvg(items, col);

    return `
    <div style="margin-top:24px;border:1px solid #e2e8f0;border-radius:16px;padding:24px;background:#ffffff;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid ${col};padding-bottom:8px;margin-bottom:16px;">
        <h3 style="color:${col};margin:0;font-size:18px;">${FACTOR_NAMES[f]} (${f})</h3>
        <span style="background:${col};color:#fff;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:700;margin-left:16px;white-space:nowrap;">Nível: ${level} (${pct}%)</span>
      </div>
      <p style="font-size:14px;line-height:1.6;color:#334155;margin-bottom:20px;">${interp}</p>
      <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:center;">
        <div style="flex:1;min-width:280px;">${barSvg}</div>
      </div>
    </div>`;
  }

  const sumarioItems: Array<[string, number]> = [
    ["Introdução à Metodologia Big Five", 3],
    ["Visão Geral do Perfil em Gráfico Radar", 3],
    ["Análise das Dimensões do OCEAN", 4],
    ["Abertura à Experiência", 4],
    ["Conscienciosidade", 5],
    ["Extroversão", 5],
    ["Agradabilidade", 6],
    ["Neuroticismo (Instabilidade Emocional)", 6],
    ["Orientações para o Recrutador", 7],
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
  <div style="text-align:center;padding:32px 0 24px;border-bottom:3px solid #1e1b4b;">
    <p style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Relatório de Mapeamento de Personalidade Big Five</p>
    <h1 style="font-size:26px;margin:0 0 8px;color:#0f172a;">${esc(fullName)}</h1>
    <p style="font-size:12px;color:#64748b;">Gerado em ${dateStr}</p>
    <div style="margin-top:18px;display:inline-block;background:#1e1b4b;color:#fff;padding:8px 28px;border-radius:20px;font-size:14px;font-weight:600;">
      Metodologia Base: IPIP-NEO-120
    </div>
  </div>

  ${headerCards}

  <p style="font-size:11px;color:#94a3b8;border-left:3px solid #e2e8f0;padding-left:10px;margin:20px 0 0;">
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
  <h2>1. Introdução à Metodologia Big Five</h2>
  <p>A teoria da personalidade dos <strong>Cinco Grandes Fatores</strong> (ou <i>Big Five / OCEAN</i>) é o modelo psicométrico mais robusto e aceito cientificamente em todo o mundo. Desenvolvida ao longo de décadas de pesquisas empíricas por renomados psicólogos, a metodologia agrupa os traços de comportamento humanos estáveis em cinco domínios universais:</p>
  <ul>
    <li><strong style="color:${FACTOR_COLORS.O};">O — Abertura à Experiência:</strong> Grau de curiosidade intelectual, imaginação, flexibilidade e gosto por novidades.</li>
    <li><strong style="color:${FACTOR_COLORS.C};">C — Conscienciosidade:</strong> Organização, autodisciplina, orientação a metas e responsabilidade profissional.</li>
    <li><strong style="color:${FACTOR_COLORS.E};">E — Extroversão:</strong> Nível de extroversão, sociabilidade, assertividade em público e energia comunicativa.</li>
    <li><strong style="color:${FACTOR_COLORS.A};">A — Agradabilidade:</strong> Nível de cooperação, empatia, altruísmo e busca de harmonia interpessoal.</li>
    <li><strong style="color:${FACTOR_COLORS.N};">N — Neuroticismo (Instabilidade Emocional):</strong> Reatividade a estresses, regulação do humor, sensibilidade e autoconsciência.</li>
  </ul>
  <p>Diferente de testes tipológicos rígidos, o Big Five avalia intensidade e tendências em espectros contínuos, oferecendo uma visão incrivelmente precisa e preditiva de performance profissional e fit com a cultura das empresas.</p>

  <!-- 2. GRÁFICO RADAR GERAL -->
  <h2>2. Visão Geral do Perfil em Gráfico Radar</h2>
  <p>O gráfico abaixo apresenta a intensidade de cada um dos cinco fatores principais para <strong>${esc(fullName)}</strong>.</p>
  
  <div style="text-align:center;margin:32px 0;">
    ${radarChart}
  </div>

  <h2>3. Análise das Dimensões do OCEAN</h2>
  <p>Abaixo, detalhamos o perfil do avaliado em cada dimensão principal, com suas respectivas 6 facetas detalhadas em gráficos percentuais de intensidade.</p>

  ${renderFactorBlock("O")}
  ${renderFactorBlock("C")}
  ${renderFactorBlock("E")}
  ${renderFactorBlock("A")}
  ${renderFactorBlock("N")}

  <!-- 4. ORIENTAÇÕES AO RECRUTADOR -->
  <h2>4. Orientações para o Recrutador</h2>
  <p>Use este relatório como insumo essencial para apoiar sua tomada de decisão:</p>
  <ul>
    <li><strong>Aprofundamento na entrevista:</strong> Use os fatores com pontuação mais alta ou mais baixa para realizar perguntas direcionadas de comportamento do passado.</li>
    <li><strong>Gestão de riscos:</strong> Avalie se a intensidade de Neuroticismo (N) ou a baixa Agradabilidade (A) podem gerar atritos no contexto da vaga em questão.</li>
    <li><strong>Integração pós-contratação:</strong> Fatores como Conscienciosidade (C) e Abertura (O) orientam sobre qual nível de supervisão ou tipo de tarefas delegadas o colaborador performará melhor.</li>
  </ul>

  <!-- RODAPÉ -->
  <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0;" />
  <p style="font-size:11px;color:#94a3b8;text-align:center;">
    Relatório gerado automaticamente pela plataforma Stacks Infinity · ${dateStr}<br/>
    As respostas foram registradas e estão disponíveis em Relatórios Stackers.
  </p>

</section>
  `.trim();
}

export { generateBigFiveReport as buildBigFiveReport };
export { generateBigFiveReport as buildBigFiveRunnerReport };
export default generateBigFiveReport;
export { isPersonalBigFiveField } from "@/lib/agente-teste-bigfive-flow";
export { buildBigFiveScores };
