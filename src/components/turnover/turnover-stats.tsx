"use client";

import {
  Users,
  UserMinus,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
} from "lucide-react";
import type { TurnoverMetrics } from "@/lib/turnover/types";

interface TurnoverStatsProps {
  metrics: TurnoverMetrics;
  isPurpleTheme?: boolean;
}

function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function TurnoverStats({ metrics, isPurpleTheme }: TurnoverStatsProps) {
  const isUp = metrics.variacaoMesAnterior > 0;
  const isDown = metrics.variacaoMesAnterior < 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* CARD 1: Taxa de Turnover de Desligamento */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
          isPurpleTheme
            ? "border-purple-500/25 bg-[#1a0f2e]/90 text-white shadow-purple-950/30"
            : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/50 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Taxa de Turnover (TD)
          </span>
          <div
            className={`rounded-xl p-2 ${
              isPurpleTheme
                ? "bg-purple-500/20 text-purple-300"
                : "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300"
            }`}
          >
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            {metrics.taxaTurnoverDesligamento}%
          </span>
          {metrics.mesAnteriorTaxaTD > 0 && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                isUp
                  ? "text-rose-500 dark:text-rose-400"
                  : isDown
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              }`}
              title={`Mês anterior: ${metrics.mesAnteriorTaxaTD}%`}
            >
              {isUp ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isUp ? `+${metrics.variacaoMesAnterior}%` : `${metrics.variacaoMesAnterior}%`}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Geral (TG): <strong className="font-semibold text-slate-700 dark:text-slate-300">{metrics.taxaTurnoverGeral}%</strong>
        </p>
      </div>

      {/* CARD 2: Total de Ativos (Headcount) */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
          isPurpleTheme
            ? "border-purple-500/25 bg-[#1a0f2e]/90 text-white shadow-purple-950/30"
            : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/50 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Efetivo Ativo
          </span>
          <div
            className={`rounded-xl p-2 ${
              isPurpleTheme
                ? "bg-purple-500/20 text-purple-300"
                : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"
            }`}
          >
            <Users className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            {metrics.efetivoAtivoAtual}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            colaboradores
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Admissões no período: <strong className="font-semibold text-emerald-600 dark:text-emerald-400">+{metrics.totalAdmissoesPeriodo}</strong>
        </p>
      </div>

      {/* CARD 3: Total de Desligados */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
          isPurpleTheme
            ? "border-purple-500/25 bg-[#1a0f2e]/90 text-white shadow-purple-950/30"
            : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/50 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Desligamentos
          </span>
          <div
            className={`rounded-xl p-2 ${
              isPurpleTheme
                ? "bg-purple-500/20 text-purple-300"
                : "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300"
            }`}
          >
            <UserMinus className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            {metrics.totalDesligamentosPeriodo}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            saídas
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Voluntário: <strong className="font-semibold text-amber-600 dark:text-amber-400">{metrics.turnoverVoluntarioPct}%</strong> • Involuntário: <strong className="font-semibold text-slate-700 dark:text-slate-300">{metrics.turnoverInvoluntarioPct}%</strong>
        </p>
      </div>

      {/* CARD 4: Early Turnover (<= 90 dias) */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
          isPurpleTheme
            ? "border-purple-500/25 bg-[#1a0f2e]/90 text-white shadow-purple-950/30"
            : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/50 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Early Turnover (&le;90d)
          </span>
          <div
            className={`rounded-xl p-2 ${
              metrics.earlyTurnoverPct > 15
                ? "bg-rose-500/15 text-rose-500"
                : isPurpleTheme
                ? "bg-purple-500/20 text-purple-300"
                : "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300"
            }`}
          >
            {metrics.earlyTurnoverPct > 15 ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            {metrics.earlyTurnoverPct}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({metrics.earlyTurnoverQtd} saídas)
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Tempo médio de casa: <strong className="font-semibold text-slate-700 dark:text-slate-300">{metrics.tempoMedioCasaMeses} meses</strong>
        </p>
      </div>

      {/* CARD 5: Custo Estimado do Turnover */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
          isPurpleTheme
            ? "border-pink-500/30 bg-gradient-to-br from-[#23153c] to-[#160d26] text-white shadow-pink-950/20"
            : "border-sky-500/20 bg-gradient-to-br from-sky-50/70 to-blue-50/50 text-slate-900 dark:border-sky-400/20 dark:bg-[#102033]/90 dark:text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            Custo Estimado
          </span>
          <div
            className={`rounded-xl p-2 ${
              isPurpleTheme
                ? "bg-pink-500/20 text-pink-300"
                : "bg-sky-500/15 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300"
            }`}
          >
            <DollarSign className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <span className="text-2xl font-extrabold tracking-tight">
            {formatBrl(metrics.custoEstimadoTurnover)}
          </span>
        </div>

        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Base: Demitidos × Salário Médio ({formatBrl(metrics.salarioMedio)}) × 2.5
        </p>
      </div>
    </div>
  );
}
