import fs from "node:fs/promises";
import path from "node:path";

type StoredArticle = {
  article: string;
  text: string;
};

export type CltMatch = {
  article: string;
  theme: string;
  rigor: "NORMATIVO" | "CRÍTICO" | "PROIBITIVO";
  text: string;
  score: number;
};

const KNOWLEDGE_PATH = path.join(
  process.cwd(),
  "src",
  "lib",
  "agents",
  "clt-ia",
  "knowledge.json"
);

let cachePromise: Promise<StoredArticle[]> | null = null;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inferTheme(query: string) {
  const q = normalize(query);

  if (q.includes("rescis") || q.includes("demiss") || q.includes("dispensa")) {
    return "Rescisão";
  }

  if (q.includes("jornada") || q.includes("hora")) {
    return "Jornada";
  }

  if (q.includes("ferias") || q.includes("descanso")) {
    return "Férias e descanso";
  }

  if (q.includes("ctps") || q.includes("carteira")) {
    return "CTPS";
  }

  if (q.includes("salario")) {
    return "Salário";
  }

  return "Consulta legislativa";
}

function inferRigor(article: string): "NORMATIVO" | "CRÍTICO" | "PROIBITIVO" {
  const a = normalize(article);

  if (a.includes("482")) return "PROIBITIVO";
  if (a.includes("477")) return "CRÍTICO";
  return "NORMATIVO";
}

function summarizeFaithfully(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();

  if (clean.length <= 550) {
    return clean;
  }

  const sentences =
    clean.match(/.*?[.!?](\s|$)/g)?.map((sentence: string) => sentence.trim()) ??
    [];

  if (!sentences.length) {
    return `${clean.slice(0, 550).trim()}...`;
  }

  let result = "";

  for (const sentence of sentences) {
    const next = `${result} ${sentence}`.trim();
    if (next.length > 550) break;
    result = next;
  }

  return result || `${clean.slice(0, 550).trim()}...`;
}

async function loadKnowledge(): Promise<StoredArticle[]> {
  if (!cachePromise) {
    cachePromise = fs
      .readFile(KNOWLEDGE_PATH, "utf8")
      .then((content: string) => JSON.parse(content) as StoredArticle[]);
  }

  return cachePromise;
}

function scoreArticle(query: string, item: StoredArticle) {
  const q = normalize(query);
  const article = normalize(item.article);
  const text = normalize(item.text);

  let score = 0;

  const articleQuery = q.match(/art(?:igo)?\.?\s*(\d+[a-z\-º]*)/i);
  if (articleQuery) {
    const wanted = articleQuery[1];
    if (article.includes(wanted)) {
      score += 120;
    }
  }

  const keywordBoosts: Array<{ test: RegExp; boost: RegExp }> = [
    { test: /rescis|demiss|dispensa/, boost: /art\.\s*477|art\.\s*482/i },
    { test: /jornada|hora|horas extras|extra/, boost: /art\.\s*58|art\.\s*59/i },
    { test: /ferias|descanso/, boost: /art\.\s*129|art\.\s*130|art\.\s*131|art\.\s*132|art\.\s*133|art\.\s*134/i },
    { test: /ctps|carteira/, boost: /art\.\s*13|art\.\s*14|art\.\s*29/i },
    { test: /salario/, boost: /salario|remuneracao/i },
  ];

  for (const rule of keywordBoosts) {
    if (rule.test.test(q) && rule.boost.test(item.text)) {
      score += 50;
    }
  }

  const tokens = q
    .split(/[^a-z0-9]+/i)
    .map((token: string) => token.trim())
    .filter((token: string) => token.length >= 3);

  for (const token of tokens) {
    if (text.includes(token)) score += 6;
    if (article.includes(token)) score += 12;
  }

  if (text.includes(q)) score += 30;

  return score;
}

export async function searchCltKnowledge(query: string): Promise<{
  theme: string;
  matches: CltMatch[];
}> {
  const knowledge = await loadKnowledge();
  const theme = inferTheme(query);

  const matches = knowledge
    .map((item: StoredArticle) => ({
      article: item.article,
      text: item.text,
      score: scoreArticle(query, item),
      rigor: inferRigor(item.article),
      theme,
    }))
    .filter((item: CltMatch) => item.score > 0)
    .sort((a: CltMatch, b: CltMatch) => b.score - a.score)
    .slice(0, 3);

  return { theme, matches };
}

export function formatCltAnswer(query: string, matches: CltMatch[]) {
  if (!matches.length) {
    return "Tema não encontrado na base atual.";
  }

  const theme = inferTheme(query);
  const primary = matches[0];

  const articleBlock = matches
    .map((match: CltMatch) => `${match.article}\n${match.text}`)
    .join("\n\n");

  return [
    `🔍 Tema: ${theme}`,
    "",
    `📝 Resumo Fiel: ${summarizeFaithfully(primary.text)}`,
    "",
    "⚖️ Artigo na Íntegra:",
    articleBlock,
  ].join("\n");
}
