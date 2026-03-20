export type ParecerNivel =
  | "operacional"
  | "gerencial"
  | "estrategico";

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function classifyRoleLevel(roleName: string): ParecerNivel {
  const role = normalizeText(roleName);

  if (
    role.includes("diretor") ||
    role.includes("head") ||
    role.includes("executivo") ||
    role.includes("ceo") ||
    role.includes("cfo") ||
    role.includes("cto") ||
    role.includes("gerente geral") ||
    role.includes("estrateg")
  ) return "estrategico";

  if (
    role.includes("gerente") ||
    role.includes("coordenador") ||
    role.includes("supervisor") ||
    role.includes("lider")
  ) return "gerencial";

  return "operacional";
}

export function getParecerModelPath(level: ParecerNivel): string {
  if (level === "operacional") return "modelo-cargo-operacional.md";
  if (level === "gerencial") return "modelo-cargo-gerencial.md";
  return "modelo-cargo-estrategico.md";
}
