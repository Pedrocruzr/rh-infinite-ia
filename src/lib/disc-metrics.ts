export type DiscProfile = "D" | "I" | "S" | "C";

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function inferDiscProfile(answer: string): DiscProfile[] {
  const text = normalizeText(answer);
  const hits: DiscProfile[] = [];

  if (
    text.includes("resultado") ||
    text.includes("controle") ||
    text.includes("desafio") ||
    text.includes("meta") ||
    text.includes("decidi") ||
    text.includes("assumi") ||
    text.includes("prazo") ||
    text.includes("prioridade")
  ) hits.push("D");

  if (
    text.includes("pessoas") ||
    text.includes("comunic") ||
    text.includes("persu") ||
    text.includes("anim") ||
    text.includes("relacion") ||
    text.includes("colabor") ||
    text.includes("engaj") ||
    text.includes("alinh")
  ) hits.push("I");

  if (
    text.includes("harmonia") ||
    text.includes("ajudei") ||
    text.includes("calma") ||
    text.includes("equipe") ||
    text.includes("segurança") ||
    text.includes("constancia") ||
    text.includes("confiança") ||
    text.includes("respeito")
  ) hits.push("S");

  if (
    text.includes("qualidade") ||
    text.includes("regra") ||
    text.includes("detalhe") ||
    text.includes("analisei") ||
    text.includes("dados") ||
    text.includes("precisao") ||
    text.includes("fonte") ||
    text.includes("chec")
  ) hits.push("C");

  return hits;
}

export function getDiscLabel(profile: DiscProfile): string {
  switch (profile) {
    case "D":
      return "Dominância";
    case "I":
      return "Influência";
    case "S":
      return "Estabilidade";
    case "C":
      return "Conformidade";
  }
}

export function rankDiscProfiles(answers: string[]) {
  const score: Record<DiscProfile, number> = {
    D: 0,
    I: 0,
    S: 0,
    C: 0,
  };

  for (const answer of answers) {
    const inferred = inferDiscProfile(answer);
    for (const profile of inferred) {
      score[profile] += 1;
    }
  }

  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .map(([profile, value]) => ({
      profile: profile as DiscProfile,
      score: value,
      label: getDiscLabel(profile as DiscProfile),
    }));
}
