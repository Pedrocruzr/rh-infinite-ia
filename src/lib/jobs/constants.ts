import type { JobStatus } from "./types";

export const JOB_STATUS_OPTIONS: Array<{ value: JobStatus; label: string }> = [
  { value: "em_aberto", label: "Em aberto" },
  { value: "pausada", label: "Pausada" },
  { value: "fechada", label: "Fechada" },
];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  em_aberto: "Em aberto",
  pausada: "Pausada",
  fechada: "Fechada",
};

export const JOB_STATUS_BADGE_CLASSES: Record<JobStatus, string> = {
  em_aberto:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300",
  pausada:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300",
  fechada:
    "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300",
};

export const JOB_ORIGIN_CHANNELS = [
  "LinkedIn",
  "Indicação Interna",
  "Gupy",
  "Site de Carreiras",
  "Instagram / Redes",
  "Outros",
] as const;

export interface OriginChannelConfig {
  name: string;
  color: string;
  labelColor: string;
  badgeBg: string;
}

export const JOB_ORIGIN_CONFIG: Record<string, OriginChannelConfig> = {
  LinkedIn: {
    name: "LinkedIn",
    color: "#0A66C2",
    labelColor: "text-sky-400",
    badgeBg: "border-sky-500/30 bg-sky-500/15 text-sky-400",
  },
  "Indicação Interna": {
    name: "Indicação Interna",
    color: "#2BEF83",
    labelColor: "text-emerald-400",
    badgeBg: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 dark:text-[#2BEF83]",
  },
  Gupy: {
    name: "Gupy",
    color: "#00E0FF",
    labelColor: "text-cyan-400",
    badgeBg: "border-cyan-500/30 bg-cyan-500/15 text-cyan-400",
  },
  "Site de Carreiras": {
    name: "Site de Carreiras",
    color: "#8B5CF6",
    labelColor: "text-purple-400",
    badgeBg: "border-purple-500/30 bg-purple-500/15 text-purple-400",
  },
  "Instagram / Redes": {
    name: "Instagram / Redes",
    color: "#EC4899",
    labelColor: "text-pink-400",
    badgeBg: "border-pink-500/30 bg-pink-500/15 text-pink-400",
  },
  Outros: {
    name: "Outros",
    color: "#F59E0B",
    labelColor: "text-amber-400",
    badgeBg: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  },
};

