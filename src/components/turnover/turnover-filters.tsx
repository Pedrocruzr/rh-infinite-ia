"use client";

import { Download, Search, UserMinus, ChevronDown } from "lucide-react";
import { JOB_DEPARTMENTS } from "@/lib/jobs/departments";
import { MESES_ANO } from "@/lib/turnover/constants";
import type { TurnoverFilters } from "@/lib/turnover/types";

interface TurnoverFiltersProps {
  filters: TurnoverFilters;
  onFiltersChange: (filters: TurnoverFilters) => void;
  onOpenExitDialog: () => void;
  onExport: () => void;
  isPurpleTheme?: boolean;
}

export function TurnoverFiltersBar({
  filters,
  onFiltersChange,
  onOpenExitDialog,
  onExport,
  isPurpleTheme,
}: TurnoverFiltersProps) {
  const selectBaseClass = `appearance-none rounded-2xl border pl-3.5 pr-7 py-2 text-xs font-semibold outline-none transition-all cursor-pointer w-auto max-w-fit ${
    isPurpleTheme
      ? "border-purple-500/30 bg-[#23153c] text-white hover:border-pink-500/60"
      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-sky-400 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
  }`;

  return (
    <div
      className={`flex flex-col gap-4 rounded-3xl border p-5 shadow-sm transition-all duration-300 ${
        isPurpleTheme
          ? "border-purple-500/20 bg-[#180e29]/95 text-white"
          : "border-slate-200/80 bg-white/90 text-slate-900 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* BUSCA POR NOME / MATRÍCULA / CARGO */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por colaborador, matrícula ou cargo..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className={`w-full rounded-2xl border pl-10 pr-4 py-2 text-xs font-medium outline-none transition-all ${
              isPurpleTheme
                ? "border-purple-500/30 bg-[#23153c] text-white placeholder-purple-300/40 focus:border-pink-500/60"
                : "border-slate-200 bg-slate-50/70 text-slate-900 placeholder-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
            }`}
          />
        </div>

        {/* FILTROS DE DEPARTAMENTO, STATUS E PERÍODO */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Departamento */}
          <div className="relative inline-flex items-center">
            <select
              value={filters.departamento}
              onChange={(e) => onFiltersChange({ ...filters, departamento: e.target.value })}
              className={selectBaseClass}
            >
              <option value="todos" className="dark:bg-[#102033]">Todos os Departamentos</option>
              {JOB_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.name} className="dark:bg-[#102033]">
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Status (Todos / Ativos / Desligados) */}
          <div className="relative inline-flex items-center">
            <select
              value={filters.status}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value as "todos" | "ativos" | "desligados",
                })
              }
              className={selectBaseClass}
            >
              <option value="todos" className="dark:bg-[#102033]">Todos os Status</option>
              <option value="ativos" className="dark:bg-[#102033]">Apenas Ativos</option>
              <option value="desligados" className="dark:bg-[#102033]">Apenas Desligados</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Mês de Análise */}
          <div className="relative inline-flex items-center">
            <select
              value={filters.periodoMes}
              onChange={(e) =>
                onFiltersChange({ ...filters, periodoMes: parseInt(e.target.value, 10) })
              }
              className={selectBaseClass}
            >
              <option value="0" className="dark:bg-[#102033]">Ano Inteiro (Jan a Dez)</option>
              {MESES_ANO.map((m) => (
                <option key={m.numero} value={m.numero} className="dark:bg-[#102033]">
                  {m.nome}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* BOTÕES DE AÇÃO: REGISTRAR SAÍDA E EXPORTAR PLANILHA (SEM DUPLICAR NOVO COLABORADOR) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenExitDialog}
            className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
              isPurpleTheme
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                : "border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100/70 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300"
            }`}
            title="Registrar saída ou demissão de um colaborador ativo"
          >
            <UserMinus className="h-3.5 w-3.5" />
            Registrar Saída
          </button>

          <button
            type="button"
            onClick={onExport}
            className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition-all ${
              isPurpleTheme
                ? "border-purple-500/30 bg-[#23153c] text-white hover:bg-purple-900/40"
                : "border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/6 dark:text-slate-200"
            }`}
            title="Exportar planilha analítica de Turnover Global"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar Planilha
          </button>
        </div>
      </div>
    </div>
  );
}
