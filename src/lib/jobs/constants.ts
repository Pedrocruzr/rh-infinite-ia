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
