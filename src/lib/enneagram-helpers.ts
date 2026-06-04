export const ENNEA_DATA_ROUTE: Record<number, { name: string; centerLabel: string; core_fear: string; core_desire: string }> = {
  1: { name: "Reformador",    centerLabel: "Instintivo (Corpo)",   core_fear: "Estar errado, ser corrupto ou imperfeito",          core_desire: "Ser bom, íntegro e correto" },
  2: { name: "Prestativo",    centerLabel: "Emocional (Coração)",  core_fear: "Ser indesejado, não amado ou inútil",               core_desire: "Sentir-se amado e necessário" },
  3: { name: "Realizador",    centerLabel: "Emocional (Coração)",  core_fear: "Fracasso e insignificância",                        core_desire: "Sentir-se valioso por meio de resultados e reconhecimento" },
  4: { name: "Individualista",centerLabel: "Emocional (Coração)",  core_fear: "Não ter identidade ou ser comum demais",            core_desire: "Ser autêntico, especial e significativo" },
  5: { name: "Investigador",  centerLabel: "Mental (Cabeça)",      core_fear: "Incompetência, invasão e esgotamento de recursos",  core_desire: "Entender o mundo e preservar autonomia" },
  6: { name: "Leal",          centerLabel: "Mental (Cabeça)",      core_fear: "Falta de apoio, orientação e segurança",            core_desire: "Ter base confiável e pertencer a algo seguro" },
  7: { name: "Entusiasta",    centerLabel: "Mental (Cabeça)",      core_fear: "Ficar preso em dor, tédio ou limitação",            core_desire: "Manter liberdade, prazer e possibilidades abertas" },
  8: { name: "Desafiador",    centerLabel: "Instintivo (Corpo)",   core_fear: "Ser controlado, ferido ou traído",                  core_desire: "Ser forte, autônomo e proteger os seus" },
  9: { name: "Pacificador",   centerLabel: "Instintivo (Corpo)",   core_fear: "Conflito, ruptura e perda de conexão",              core_desire: "Manter paz interior e harmonia com o ambiente" },
};

export function buildEnneagramScoresRoute(session: Record<string, unknown>): Record<number, number> {
  const s: Record<number, number> = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };

  const fc: Record<string, [number, number]> = {
    ea:[1,7], eb:[2,5], ec:[8,9], ed:[3,6], ee:[8,2],
  };
  for (const [field, [ta, tb]] of Object.entries(fc)) {
    const v = String(session[field] ?? "").toUpperCase();
    if (v === "A") s[ta] += 2;
    else if (v === "B") s[tb] += 2;
  }

  const lm: Record<string, number> = {
    el1:1, el2:3, el3:9, el4:7, el5:6, el6:5, el7:8, el8:3, el9:3, el10:4,
  };
  for (const [field, type] of Object.entries(lm)) {
    const v = parseInt(String(session[field] ?? "0"), 10);
    if (v >= 1 && v <= 5) s[type] += v;
  }

  return s;
}

export function getEnneaDominantRoute(scores: Record<number, number>): number {
  return parseInt(Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0], 10);
}

export function getEnneaWingRoute(scores: Record<number, number>, primary: number): number {
  const prev = primary === 1 ? 9 : primary - 1;
  const next = primary === 9 ? 1 : primary + 1;
  return (scores[prev] ?? 0) >= (scores[next] ?? 0) ? prev : next;
}
