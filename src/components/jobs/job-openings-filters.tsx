"use client";

import { Search } from "lucide-react";
import type { JobFilters } from "@/lib/jobs/types";
import { JOB_STATUS_OPTIONS } from "@/lib/jobs/constants";

interface JobOpeningsFiltersProps {
  filters: JobFilters;
  total: number;
  onChange: (next: Partial<JobFilters>) => void;
  onClear: () => void;
  isPurpleTheme?: boolean;
}

export function JobOpeningsFilters({
  filters,
  total,
  onChange,
  onClear,
  isPurpleTheme = false,
}: JobOpeningsFiltersProps) {
  return (
    <div
      className={`rounded-[1.75rem] border p-5 transition-all duration-300 ${
        isPurpleTheme
          ? "border-purple-500/20 bg-gradient-to-b from-[#180e29]/90 to-[#0e071a]/95 shadow-[0_18px_50px_rgba(168,85,247,0.1)]"
          : "border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1928] dark:to-[#0A111C] dark:shadow-[0_18px_50px_rgba(0,0,0,0.4)]"
      }`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm">
          <span
            className={`font-medium ${
              isPurpleTheme ? "text-pink-200" : "text-slate-800 dark:text-slate-100"
            }`}
          >
            Buscar vaga
          </span>
          <div className="relative">
            <Search
              className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isPurpleTheme ? "text-pink-400" : "text-slate-400 dark:text-slate-500"
              }`}
            />
            <input
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Ex: Analista de RH"
              className={`h-12 w-full rounded-2xl border pl-11 pr-4 text-sm outline-none ring-0 transition placeholder:text-slate-400 ${
                isPurpleTheme
                  ? "border-purple-500/30 bg-[#251540]/80 text-white placeholder:text-purple-300/40 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                  : "border-slate-200 bg-white/90 text-slate-900 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              }`}
            />
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span
            className={`font-medium ${
              isPurpleTheme ? "text-pink-200" : "text-slate-800 dark:text-slate-100"
            }`}
          >
            Status
          </span>
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({ status: event.target.value as JobFilters["status"] })
            }
            className={`h-12 rounded-2xl border px-4 text-sm outline-none transition ${
              isPurpleTheme
                ? "border-purple-500/30 bg-[#251540]/80 text-white focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                : "border-slate-200 bg-white/90 text-slate-900 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-[#0c1827] dark:text-white dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
            }`}
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
          <span
            className={`font-medium ${
              isPurpleTheme ? "text-pink-200" : "text-slate-800 dark:text-slate-100"
            }`}
          >
            Abertura de
          </span>
          <input
            type="date"
            value={filters.dateStart}
            onChange={(event) => onChange({ dateStart: event.target.value })}
            className={`h-12 rounded-2xl border px-4 text-sm outline-none ring-0 transition ${
              isPurpleTheme
                ? "border-purple-500/30 bg-[#251540]/80 text-white focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                : "border-slate-200 bg-white/90 text-slate-900 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
            }`}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span
            className={`font-medium ${
              isPurpleTheme ? "text-pink-200" : "text-slate-800 dark:text-slate-100"
            }`}
          >
            Abertura até
          </span>
          <input
            type="date"
            value={filters.dateEnd}
            onChange={(event) => onChange({ dateEnd: event.target.value })}
            className={`h-12 rounded-2xl border px-4 text-sm outline-none ring-0 transition ${
              isPurpleTheme
                ? "border-purple-500/30 bg-[#251540]/80 text-white focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                : "border-slate-200 bg-white/90 text-slate-900 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
            }`}
          />
        </label>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs">
        <span
          className={`font-medium ${
            isPurpleTheme ? "text-pink-300/80" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {total} vaga(s) encontrada(s)
        </span>
        <button
          type="button"
          onClick={onClear}
          className={`rounded-xl border px-3.5 py-1.5 font-medium transition ${
            isPurpleTheme
              ? "border-purple-500/30 bg-purple-500/10 text-pink-300 hover:bg-purple-500/20 hover:text-white"
              : "border-slate-200 bg-white/90 text-slate-700 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
          }`}
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
