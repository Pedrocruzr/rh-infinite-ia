"use client";

import { Search } from "lucide-react";
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
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#102033]/72">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-100">Buscar vaga</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Ex: Analista de RH"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 pl-11 pr-4 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-100">Status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({ status: event.target.value as JobFilters["status"] })
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
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
          <span className="font-medium text-slate-800 dark:text-slate-100">Abertura de</span>
          <input
            type="date"
            value={filters.dateStart}
            onChange={(event) => onChange({ dateStart: event.target.value })}
            className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-100">Abertura até</span>
          <input
            type="date"
            value={filters.dateEnd}
            onChange={(event) => onChange({ dateEnd: event.target.value })}
            className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none ring-0 transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">{total} vaga(s) encontrada(s)</span>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
