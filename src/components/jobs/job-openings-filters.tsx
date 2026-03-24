"use client";

import type { JobFilters } from "@/lib/jobs/types";
import { JOB_STATUS_OPTIONS } from "@/lib/jobs/constants";

interface JobOpeningsFiltersProps {
  filters: JobFilters;
  total: number;
  onChange: (next: Partial<JobFilters>) => void;
  onClear: () => void;
}

export function JobOpeningsFilters({
  filters,
  total,
  onChange,
  onClear,
}: JobOpeningsFiltersProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Buscar vaga</span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Ex: Analista de RH"
            className="h-11 rounded-xl border bg-background px-3 outline-none ring-0 transition focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({ status: event.target.value as JobFilters["status"] })
            }
            className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
          >
            <option value="todos">Todos</option>
            {JOB_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Abertura de</span>
          <input
            type="date"
            value={filters.dateStart}
            onChange={(event) => onChange({ dateStart: event.target.value })}
            className="h-11 rounded-xl border bg-background px-3 outline-none ring-0 transition focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Abertura até</span>
          <input
            type="date"
            value={filters.dateEnd}
            onChange={(event) => onChange({ dateEnd: event.target.value })}
            className="h-11 rounded-xl border bg-background px-3 outline-none ring-0 transition focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{total} vaga(s) encontrada(s)</span>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border px-3 py-2 transition hover:bg-muted"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
