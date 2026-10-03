"use client";

import { Edit2, Trash2, UserMinus, CheckCircle2, XCircle } from "lucide-react";
import { getDepartmentConfig } from "@/lib/jobs/departments";
import type { TurnoverEmployee } from "@/lib/turnover/types";

interface TurnoverTableProps {
  employees: TurnoverEmployee[];
  onEdit: (emp: TurnoverEmployee) => void;
  onExit: (emp: TurnoverEmployee) => void;
  onDelete: (id: string) => void;
  isPurpleTheme?: boolean;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

function computeTenureDays(admissao: string, desligamento?: string | null): string {
  const d1 = new Date(admissao);
  const d2 = desligamento ? new Date(desligamento) : new Date();
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return "—";
  const days = Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} dias`;
  const months = Math.floor(days / 30);
  const remDays = days % 30;
  if (months < 12) return `${months}m ${remDays}d`;
  const years = (days / 365).toFixed(1);
  return `${years} anos`;
}

function formatBrl(val?: number): string {
  if (!val) return "—";
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function TurnoverTable({
  employees,
  onEdit,
  onExit,
  onDelete,
  isPurpleTheme,
}: TurnoverTableProps) {
  if (employees.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-3xl border p-12 text-center transition-all ${
          isPurpleTheme
            ? "border-purple-500/20 bg-[#180e29]/70 text-white"
            : "border-slate-200/80 bg-white/80 text-slate-900 dark:border-white/10 dark:bg-[#102033]/70 dark:text-white"
        }`}
      >
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Nenhum colaborador encontrado com os filtros atuais.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-3xl border shadow-sm transition-all duration-300 ${
        isPurpleTheme
          ? "border-purple-500/20 bg-[#180e29]/95 text-white"
          : "border-slate-200/80 bg-white/90 text-slate-900 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isPurpleTheme
                  ? "border-purple-500/20 bg-[#23153c]/70 text-purple-200"
                  : "border-slate-200/80 bg-slate-50/70 text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-400"
              }`}
            >
              <th className="py-3.5 pl-6 pr-3">Matrícula / Colaborador</th>
              <th className="py-3.5 px-3">Cargo</th>
              <th className="py-3.5 px-3">Departamento</th>
              <th className="py-3.5 px-3">Admissão</th>
              <th className="py-3.5 px-3">Status / Desligamento</th>
              <th className="py-3.5 px-3">Motivo da Saída</th>
              <th className="py-3.5 px-3">Tempo de Casa</th>
              <th className="py-3.5 px-3 text-right">Salário</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {employees.map((emp) => {
              const deptConfig = getDepartmentConfig(emp.departamento);
              const isDesligado = Boolean(emp.data_desligamento);

              return (
                <tr
                  key={emp.id}
                  className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5 ${
                    isPurpleTheme ? "hover:bg-purple-900/20" : ""
                  }`}
                >
                  {/* MATRÍCULA & NOME */}
                  <td className="py-3.5 pl-6 pr-3 font-semibold">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {emp.nome}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {emp.matricula}
                      </span>
                    </div>
                  </td>

                  {/* CARGO */}
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                    {emp.cargo}
                  </td>

                  {/* DEPARTAMENTO BADGE */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        deptConfig?.badgeBg || "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: deptConfig?.color || "#64748B" }}
                      />
                      {emp.departamento}
                    </span>
                  </td>

                  {/* DATA DE ADMISSÃO */}
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-mono">
                    {formatDate(emp.data_admissao)}
                  </td>

                  {/* STATUS / DESLIGAMENTO */}
                  <td className="py-3.5 px-3">
                    {isDesligado ? (
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 dark:text-rose-400">
                          <XCircle className="h-3 w-3" />
                          Desligado ({formatDate(emp.data_desligamento)})
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          Tipo: {emp.tipo_desligamento || "Não inf."}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Ativo
                      </span>
                    )}
                  </td>

                  {/* MOTIVO ESPECÍFICO */}
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                    {emp.motivo_especifico || "—"}
                  </td>

                  {/* TEMPO DE CASA */}
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {computeTenureDays(emp.data_admissao, emp.data_desligamento)}
                  </td>

                  {/* SALÁRIO */}
                  <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-200">
                    {formatBrl(emp.salario)}
                  </td>

                  {/* AÇÕES */}
                  <td className="py-3.5 pl-3 pr-6 text-right">
                    <div className="inline-flex items-center gap-1">
                      {/* Se estiver ativo, botão de registrar saída rápida */}
                      {!isDesligado && (
                        <button
                          type="button"
                          onClick={() => onExit(emp)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-500/10 hover:text-amber-500"
                          title="Registrar saída / demissão"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => onEdit(emp)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-sky-500/10 hover:text-sky-500"
                        title="Editar colaborador"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => onDelete(emp.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                        title="Excluir registro"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
