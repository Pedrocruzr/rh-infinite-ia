import { JOB_STATUS_BADGE_CLASSES, JOB_STATUS_LABELS } from "./constants";
import type { JobOpening, JobStatus } from "./types";

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function computeOpenDays(
  dataAbertura: string,
  dataFechamento?: string | null
) {
  const start = parseDate(dataAbertura);
  const end = dataFechamento ? parseDate(dataFechamento) : new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export function formatDateBR(value?: string | null) {
  if (!value) return "—";
  const date = parseDate(value);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function getStatusLabel(status: JobStatus) {
  return JOB_STATUS_LABELS[status];
}

export function getStatusBadgeClass(status: JobStatus) {
  return JOB_STATUS_BADGE_CLASSES[status];
}

export function filterJobOpenings(
  items: JobOpening[],
  search: string,
  status: "todos" | JobStatus,
  dateStart: string,
  dateEnd: string
) {
  const normalizedSearch = search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch = normalizedSearch
      ? item.nome_vaga.toLowerCase().includes(normalizedSearch)
      : true;

    const matchesStatus = status === "todos" ? true : item.status === status;

    const itemStartDate = item.data_abertura ? parseDate(item.data_abertura) : null;

    const matchesDateStart =
      dateStart && itemStartDate ? itemStartDate >= parseDate(dateStart) : true;

    const matchesDateEnd =
      dateEnd && itemStartDate ? itemStartDate <= parseDate(dateEnd) : true;

    return matchesSearch && matchesStatus && matchesDateStart && matchesDateEnd;
  });
}

export function exportJobOpeningsToCsv(items: JobOpening[]) {
  const headers = [
    "Nome da vaga",
    "Data de abertura",
    "Data de fechamento",
    "Status",
    "Dias em aberto",
  ];

  const rows = items.map((item) => [
    escapeCsv(item.nome_vaga),
    item.data_abertura ?? "",
    item.data_fechamento ?? "",
    JOB_STATUS_LABELS[item.status],
    String(item.dias_em_aberto ?? 0),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `painel-de-vagas-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}
