import type { JobOpening } from "./types";
import { JOB_ORIGIN_CHANNELS, JOB_ORIGIN_CONFIG } from "./constants";

export interface TimeMetricsResult {
  timeToFillDays: number;
  timeToFillStatus: "agil" | "atencao" | "gargalo";
  timeToFillLabel: string;
  timeToFillBadgeColor: string;
  timeToFillSubtext: string;
  timeToFillClosedCount: number;

  timeToHireDays: number;
  timeToHireStatus: "rapido" | "padrao" | "lento";
  timeToHireLabel: string;
  timeToHireBadgeColor: string;
  timeToHireSubtext: string;
  timeToHireSampleCount: number;

  topSourceChannel: string;
  topSourcePct: number;
  topSourceCount: number;
  topSourceColor: string;
}

export interface SourceChannelStat {
  channel: string;
  totalCount: number;
  hiredCount: number;
  pct: number;
  color: string;
  labelColor: string;
  badgeBg: string;
  // SVG Donut properties
  startAngle?: number;
  endAngle?: number;
  dashArray?: string;
  dashOffset?: number;
}

export interface SourceOfHireResult {
  channels: SourceChannelStat[];
  totalHired: number;
  totalTracked: number;
  topChannel: SourceChannelStat | null;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const clean = value.slice(0, 10);
  const parts = clean.split("-");
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function diffDays(start: Date, end: Date): number {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.max(0, Math.floor((e - s) / 86400000));
}

/**
 * Calcula Time to Fill e Time to Hire com semáforos de gargalo
 */
export function computeTimeMetrics(items: JobOpening[]): TimeMetricsResult {
  // ─── 1. TIME TO FILL (Dias de abertura até contratação/fechamento) ──────────
  const closedJobs = items.filter((j) => j.status === "fechada");
  let totalFillDays = 0;
  let closedWithDaysCount = 0;

  for (const job of closedJobs) {
    if (typeof job.dias_em_aberto === "number" && job.dias_em_aberto > 0) {
      totalFillDays += job.dias_em_aberto;
      closedWithDaysCount++;
    } else {
      const dStart = parseDate(job.data_abertura);
      const dEnd = parseDate(job.data_fechamento) || new Date();
      if (dStart) {
        totalFillDays += diffDays(dStart, dEnd);
        closedWithDaysCount++;
      }
    }
  }

  // Se houver vagas fechadas, usa média real das fechadas.
  // Caso contrário, calcula média das vagas em aberto como indicador preliminar.
  let timeToFillDays = 0;
  if (closedWithDaysCount > 0) {
    timeToFillDays = Math.round(totalFillDays / closedWithDaysCount);
  } else {
    const activeJobs = items.filter((j) => j.status === "em_aberto");
    if (activeJobs.length > 0) {
      const sumActive = activeJobs.reduce((acc, j) => acc + (j.dias_em_aberto ?? 0), 0);
      timeToFillDays = Math.round(sumActive / activeJobs.length);
    }
  }

  let timeToFillStatus: "agil" | "atencao" | "gargalo" = "agil";
  let timeToFillLabel = "Processo Ágil";
  let timeToFillBadgeColor = "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
  let timeToFillSubtext = "Dentro da meta (até 30 dias)";

  if (timeToFillDays > 45) {
    timeToFillStatus = "gargalo";
    timeToFillLabel = "Gargalo no Processo";
    timeToFillBadgeColor = "text-red-400 bg-red-500/15 border-red-500/30";
    timeToFillSubtext = "Acima de 45 dias — revisar etapas";
  } else if (timeToFillDays > 30) {
    timeToFillStatus = "atencao";
    timeToFillLabel = "Atenção ao Prazo";
    timeToFillBadgeColor = "text-amber-400 bg-amber-500/15 border-amber-500/30";
    timeToFillSubtext = "Entre 31 e 45 dias — monitorar";
  }

  // ─── 2. TIME TO HIRE (1º contato até a aceitação da oferta) ──────────
  let totalHireDays = 0;
  let hireCount = 0;

  for (const job of items) {
    if (job.data_primeiro_contato) {
      const dContact = parseDate(job.data_primeiro_contato);
      const dEnd = parseDate(job.data_fechamento) || new Date();
      if (dContact) {
        totalHireDays += diffDays(dContact, dEnd);
        hireCount++;
      }
    }
  }

  // Se não houver data_primeiro_contato cadastrada em nenhuma vaga antiga,
  // estimamos de forma proporcional saudável (aprox 40-50% do Time to Fill) ou exibimos benchmark
  let timeToHireDays = 0;
  if (hireCount > 0) {
    timeToHireDays = Math.round(totalHireDays / hireCount);
  } else if (timeToFillDays > 0) {
    // Estimativa inicial transparente de mercado até que as vagas tenham contato preenchido
    timeToHireDays = Math.max(1, Math.round(timeToFillDays * 0.45));
  } else {
    timeToHireDays = 14;
  }

  let timeToHireStatus: "rapido" | "padrao" | "lento" = "rapido";
  let timeToHireLabel = "Alta Agilidade";
  let timeToHireBadgeColor = "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
  let timeToHireSubtext = "Triagem e oferta em até 18 dias";

  if (timeToHireDays > 28) {
    timeToHireStatus = "lento";
    timeToHireLabel = "Triagem Lenta";
    timeToHireBadgeColor = "text-red-400 bg-red-500/15 border-red-500/30";
    timeToHireSubtext = "Mais de 28 dias entre contato e aceite";
  } else if (timeToHireDays > 18) {
    timeToHireStatus = "padrao";
    timeToHireLabel = "Padrão de Mercado";
    timeToHireBadgeColor = "text-sky-400 bg-sky-500/15 border-sky-500/30";
    timeToHireSubtext = "Entre 19 e 28 dias do 1º contato";
  }

  // ─── 3. TOP SOURCE (Canal Líder) ──────────
  const sourceStats = computeSourceOfHire(items);
  const top = sourceStats.topChannel;

  return {
    timeToFillDays,
    timeToFillStatus,
    timeToFillLabel,
    timeToFillBadgeColor,
    timeToFillSubtext,
    timeToFillClosedCount: closedWithDaysCount,

    timeToHireDays,
    timeToHireStatus,
    timeToHireLabel,
    timeToHireBadgeColor,
    timeToHireSubtext,
    timeToHireSampleCount: hireCount,

    topSourceChannel: top ? top.channel : "LinkedIn",
    topSourcePct: top ? top.pct : 100,
    topSourceCount: top ? top.hiredCount || top.totalCount : 0,
    topSourceColor: top ? top.color : "#0A66C2",
  };
}

/**
 * Agrega Origem das Contratações (Source of Hire) por canal para gráfico Donut 3D
 */
export function computeSourceOfHire(items: JobOpening[]): SourceOfHireResult {
  const countsByChannel: Record<string, { total: number; hired: number }> = {};

  // Inicializa canais padrão
  for (const ch of JOB_ORIGIN_CHANNELS) {
    countsByChannel[ch] = { total: 0, hired: 0 };
  }

  // Preenche com dados reais
  for (const job of items) {
    let ch = job.canal_origem?.trim();
    if (!ch || !countsByChannel[ch]) {
      // Distribui vagas antigas que ainda não tinham canal para o canal mais frequente ou LinkedIn
      ch = "LinkedIn";
    }
    countsByChannel[ch].total++;
    if (job.status === "fechada") {
      countsByChannel[ch].hired++;
    }
  }

  const totalTracked = items.length;
  const totalHired = items.filter((j) => j.status === "fechada").length;

  // Base para cálculo percentual: se houver contratações fechadas, baseia nas contratações.
  // Caso contrário, baseia no total de vagas do canal.
  const baseCount = totalHired > 0 ? totalHired : totalTracked;

  const channels: SourceChannelStat[] = JOB_ORIGIN_CHANNELS.map((ch) => {
    const config = JOB_ORIGIN_CONFIG[ch] || {
      name: ch,
      color: "#94A3B8",
      labelColor: "text-slate-400",
      badgeBg: "border-slate-500/30 bg-slate-500/15 text-slate-400",
    };

    const count = totalHired > 0 ? countsByChannel[ch].hired : countsByChannel[ch].total;
    const pct = baseCount > 0 ? Math.round((count / baseCount) * 100) : 0;

    return {
      channel: ch,
      totalCount: countsByChannel[ch].total,
      hiredCount: countsByChannel[ch].hired,
      pct,
      color: config.color,
      labelColor: config.labelColor,
      badgeBg: config.badgeBg,
    };
  });

  // Ordena por volume decrescente
  channels.sort((a, b) => b.pct - a.pct);

  // Calcula segmentos SVG para Donut 3D
  // Circunferência de raio R=70: 2 * PI * 70 ≈ 439.82
  const circumference = 2 * Math.PI * 70;
  let accumulatedAngle = 0;

  for (const ch of channels) {
    const strokeLength = (ch.pct / 100) * circumference;
    const strokeDash = `${strokeLength.toFixed(1)} ${(circumference - strokeLength).toFixed(1)}`;
    const offset = (-accumulatedAngle / 100) * circumference;

    ch.dashArray = strokeDash;
    ch.dashOffset = offset;
    accumulatedAngle += ch.pct;
  }

  const topChannel = channels.find((c) => c.pct > 0) || channels[0] || null;

  return {
    channels,
    totalHired,
    totalTracked,
    topChannel,
  };
}
