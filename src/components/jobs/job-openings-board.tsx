"use client";

import { JOB_STATUS_OPTIONS } from "@/lib/jobs/constants";
import { formatDateBR, getStatusBadgeClass, getStatusLabel } from "@/lib/jobs/utils";
import type { JobOpening, JobStatus } from "@/lib/jobs/types";
import { parseJobTitleAndArea, JOB_DEPARTMENTS } from "@/lib/jobs/departments";
import { Clock, Calendar, Check, Pause, Play, Edit3, Trash2, UserCheck } from "lucide-react";

interface JobOpeningsBoardProps {
  items: JobOpening[];
  onEdit: (item: JobOpening) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: JobOpening, status: JobStatus) => void;
  onMarkHired?: (item: JobOpening) => void;
  isPurpleTheme?: boolean;
}

export function JobOpeningsBoard({
  items,
  onEdit,
  onDelete,
  onStatusChange,
  onMarkHired,
  isPurpleTheme = false,
}: JobOpeningsBoardProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {JOB_STATUS_OPTIONS.map((statusOption) => {
        const statusItems = items.filter((item) => item.status === statusOption.value);

        return (
          <section
            key={statusOption.value}
            className={`rounded-[2rem] border p-5 transition-all duration-300 ${
              isPurpleTheme
                ? "border-purple-500/20 bg-gradient-to-b from-[#180e29]/75 to-[#0e071a]/85 shadow-[0_16px_45px_rgba(168,85,247,0.08)]"
                : "border-slate-200/80 bg-white/85 shadow-[0_16px_45px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1928]/85 dark:to-[#0A111C]/90"
            }`}
          >
            {/* Column Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    statusOption.value === "em_aberto"
                      ? isPurpleTheme
                        ? "bg-pink-400"
                        : "bg-[#2BEF83]"
                      : statusOption.value === "pausada"
                        ? "bg-amber-400"
                        : isPurpleTheme
                          ? "bg-purple-400"
                          : "bg-sky-400"
                  }`}
                />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {statusOption.label}
                </h2>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isPurpleTheme
                    ? "border border-purple-500/30 bg-purple-500/10 text-pink-300"
                    : "border border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                }`}
              >
                {statusItems.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="space-y-3.5">
              {statusItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400 dark:border-white/10 dark:text-slate-500">
                  Nenhuma vaga neste status.
                </div>
              ) : (
                statusItems.map((item) => {
                  const dias = item.dias_em_aberto ?? 0;
                  // SLA Calculation (ideal: 30 days)
                  const slaPct = Math.min(100, Math.round((dias / 30) * 100));
                  const slaColor =
                    dias <= 15
                      ? isPurpleTheme
                        ? "bg-pink-500"
                        : "bg-[#2BEF83]"
                      : dias <= 30
                        ? "bg-amber-400"
                        : "bg-red-500";

                  return (
                    <div
                      key={item.id}
                      className={`group relative overflow-hidden rounded-2xl border p-4.5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer ${
                        isPurpleTheme
                          ? "border-purple-500/25 bg-[#1a0f30]/90 shadow-sm hover:border-pink-500/40 hover:shadow-pink-500/10"
                          : "border-slate-200/90 bg-white/95 shadow-sm hover:border-sky-300 dark:border-white/10 dark:bg-[#102033]/90 dark:hover:border-white/25"
                      }`}
                    >
                      {/* Top rim highlight */}
                      <div
                        className={`pointer-events-none absolute inset-x-4 top-0 h-[2px] opacity-70 ${
                          isPurpleTheme
                            ? "bg-gradient-to-r from-transparent via-pink-400 to-transparent"
                            : "bg-gradient-to-r from-transparent via-[#2BEF83] to-transparent"
                        }`}
                      />

                      {/* Header Title & Status */}
                      {(() => {
                        const { cleanName, area } = parseJobTitleAndArea(item.nome_vaga);
                        const deptConfig = JOB_DEPARTMENTS.find((d) => d.name === area);

                        return (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-[#2BEF83] transition-colors">
                                  {cleanName}
                                </h3>
                                <span
                                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                                    deptConfig
                                      ? deptConfig.badgeBg
                                      : "border-purple-500/30 bg-purple-500/15 text-purple-300"
                                  }`}
                                >
                                  {area}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span>Aberta em {formatDateBR(item.data_abertura)}</span>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                                item.status
                              )}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                          </div>
                        );
                      })()}

                      {/* SLA Progress Bar & Days */}
                      <div className="mt-3.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-xs dark:border-white/5 dark:bg-white/5">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            SLA de Fechamento
                          </span>
                          <span>{dias} dias em aberto</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${slaColor}`}
                            style={{ width: `${Math.max(8, slaPct)}%` }}
                          />
                        </div>
                        {item.data_fechamento && (
                          <p className="mt-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            ✓ Contratação finalizada em: {formatDateBR(item.data_fechamento)}
                          </p>
                        )}
                      </div>

                      {/* Actions Row */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-1">
                        {/* BOTÃO CONTRATADO: Adiciona à Tendência de Contratação */}
                        {item.status !== "fechada" && (
                          <button
                            type="button"
                            onClick={() => (onMarkHired ? onMarkHired(item) : onStatusChange(item, "fechada"))}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition-all duration-300 ${
                              isPurpleTheme
                                ? "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-pink-500/20 hover:scale-105"
                                : "bg-gradient-to-r from-[#2BEF83] to-[#2488BA] text-slate-950 shadow-emerald-500/20 hover:scale-105 dark:text-slate-950"
                            }`}
                            title="Marcar como Contratado e somar à Tendência de Contratação do mês"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Contratado
                          </button>
                        )}

                        {item.status !== "em_aberto" && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(item, "em_aberto")}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-emerald-400/40"
                          >
                            <Play className="h-3 w-3 text-emerald-500" />
                            Reabrir
                          </button>
                        )}

                        {item.status !== "pausada" && item.status !== "fechada" && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(item, "pausada")}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-amber-400/40"
                          >
                            <Pause className="h-3 w-3 text-amber-500" />
                            Pausar
                          </button>
                        )}

                        {item.status !== "fechada" && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(item, "fechada")}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-violet-400/40"
                          >
                            <Check className="h-3 w-3 text-violet-500" />
                            Fechar
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-sky-400/40"
                        >
                          <Edit3 className="h-3 w-3 text-sky-500" />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-200/80 bg-red-50/50 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
