export type JobDepartment =
  | "Administração (ADM)"
  | "Contabilidade"
  | "Financeiro"
  | "Tech / TI"
  | "Vendas / Comercial"
  | "RH & Gestão"
  | "Marketing";

export interface DepartmentConfig {
  id: string;
  name: JobDepartment;
  color: string;
  labelColor: string;
  badgeBg: string;
}

export const JOB_DEPARTMENTS: DepartmentConfig[] = [
  {
    id: "adm",
    name: "Administração (ADM)",
    color: "#8B5CF6", // Roxo / Violeta
    labelColor: "text-purple-400",
    badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  {
    id: "contabilidade",
    name: "Contabilidade",
    color: "#10B981", // Verde Esmeralda / Menta
    labelColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "financeiro",
    name: "Financeiro",
    color: "#06B6D4", // Ciano Elétrico
    labelColor: "text-cyan-400",
    badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "tech",
    name: "Tech / TI",
    color: "#3B82F6", // Azul Elétrico
    labelColor: "text-blue-400",
    badgeBg: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  {
    id: "vendas",
    name: "Vendas / Comercial",
    color: "#F59E0B", // Laranja / Âmbar
    labelColor: "text-amber-400",
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    id: "rh",
    name: "RH & Gestão",
    color: "#EC4899", // Rosa
    labelColor: "text-pink-400",
    badgeBg: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  },
  {
    id: "marketing",
    name: "Marketing",
    color: "#F43F5E", // Rose
    labelColor: "text-rose-400",
    badgeBg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
];

export function detectJobDepartment(rawTitle: string): JobDepartment {
  const s = (rawTitle || "").toLowerCase();

  // Contabilidade tem prioridade estrita para não colidir com finanças
  if (
    s.includes("contabil") ||
    s.includes("contábil") ||
    s.includes("contabilidade") ||
    s.includes("fiscal") ||
    s.includes("auditor")
  ) {
    return "Contabilidade";
  }

  // Financeiro
  if (
    s.includes("finan") ||
    s.includes("tesouraria") ||
    s.includes("faturamento") ||
    s.includes("cobrança") ||
    s.includes("cobranca") ||
    s.includes("controladoria")
  ) {
    return "Financeiro";
  }

  // Administração (ADM): Recepcionista, Secretária, Atendente, etc.
  if (
    s.includes("recep") ||
    s.includes("secret") ||
    s.includes("adm") ||
    s.includes("administra") ||
    s.includes("atendente") ||
    s.includes("portaria") ||
    s.includes("facilities") ||
    s.includes("office boy")
  ) {
    return "Administração (ADM)";
  }

  // Vendas / Comercial
  if (
    s.includes("vend") ||
    s.includes("comercial") ||
    s.includes("sdr") ||
    s.includes("bdr") ||
    s.includes("closer") ||
    s.includes("inside sales") ||
    s.includes("prospec") ||
    s.includes("consultor de vendas")
  ) {
    return "Vendas / Comercial";
  }

  // RH & Gestão
  if (
    s.includes("rh") ||
    s.includes("humano") ||
    s.includes("recrut") ||
    s.includes("talent") ||
    s.includes("people") ||
    s.includes("gestão de pessoas") ||
    s.includes("departamento pessoal") ||
    s.includes("dp") ||
    s.includes("psicol")
  ) {
    return "RH & Gestão";
  }

  // Marketing
  if (
    s.includes("mkt") ||
    s.includes("marketing") ||
    s.includes("growth") ||
    s.includes("copy") ||
    s.includes("design") ||
    s.includes("social media") ||
    s.includes("trafego") ||
    s.includes("tráfego") ||
    s.includes("comunic") ||
    s.includes("midia") ||
    s.includes("mídia")
  ) {
    return "Marketing";
  }

  // Tech / TI
  if (
    s.includes("tech") ||
    s.includes("ti") ||
    s.includes("dev") ||
    s.includes("software") ||
    s.includes("front") ||
    s.includes("back") ||
    s.includes("full") ||
    s.includes("engenheir") ||
    s.includes("dados") ||
    s.includes("qa") ||
    s.includes("suporte") ||
    s.includes("programad") ||
    s.includes("ux") ||
    s.includes("ui")
  ) {
    return "Tech / TI";
  }

  return "Administração (ADM)";
}

export function parseJobTitleAndArea(rawTitle: string): { cleanName: string; area: JobDepartment } {
  if (!rawTitle) return { cleanName: "", area: "Administração (ADM)" };

  // Verifica marcação explícita como "Nome • Área" ou "Nome [Área]"
  const bulletMatch = rawTitle.match(/^(.*?)\s*•\s*(.+)$/);
  if (bulletMatch) {
    const rawArea = bulletMatch[2].trim();
    for (const dep of JOB_DEPARTMENTS) {
      if (dep.name.toLowerCase() === rawArea.toLowerCase() || dep.name.toLowerCase().includes(rawArea.toLowerCase())) {
        return { cleanName: bulletMatch[1].trim(), area: dep.name };
      }
    }
  }

  const bracketMatch = rawTitle.match(/^(.*?)\s*\[(.+)\]$/);
  if (bracketMatch) {
    const rawArea = bracketMatch[2].trim();
    for (const dep of JOB_DEPARTMENTS) {
      if (dep.name.toLowerCase() === rawArea.toLowerCase() || dep.name.toLowerCase().includes(rawArea.toLowerCase())) {
        return { cleanName: bracketMatch[1].trim(), area: dep.name };
      }
    }
  }

  const detected = detectJobDepartment(rawTitle);
  return {
    cleanName: rawTitle.trim(),
    area: detected,
  };
}

export function formatJobTitleWithArea(cleanName: string, area: JobDepartment): string {
  const trimmed = (cleanName || "").trim();
  if (!area) return trimmed;
  return `${trimmed} • ${area}`;
}
