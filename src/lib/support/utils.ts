import {
  SUPPORT_PRIORITY_BADGE_CLASSES,
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_STATUS_BADGE_CLASSES,
  SUPPORT_STATUS_LABELS,
} from "./constants";
import type { SupportPriority, SupportStatus, SupportTicket } from "./types";

export function formatDateTimeBR(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getSupportStatusLabel(status: string) {
  return SUPPORT_STATUS_LABELS[status as SupportStatus] ?? status;
}

export function getSupportPriorityLabel(priority: string) {
  return SUPPORT_PRIORITY_LABELS[priority as SupportPriority] ?? priority;
}

export function getSupportStatusBadgeClass(status: string) {
  return (
    SUPPORT_STATUS_BADGE_CLASSES[status as SupportStatus] ??
    "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
  );
}

export function getSupportPriorityBadgeClass(priority: string) {
  return (
    SUPPORT_PRIORITY_BADGE_CLASSES[priority as SupportPriority] ??
    "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
  );
}

export function sortSupportTickets(items: SupportTicket[]) {
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
