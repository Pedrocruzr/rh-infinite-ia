"use client";

import { useEffect, useState } from "react";
import { UserMinus, AlertCircle } from "lucide-react";
import { MOTIVOS_DESLIGAMENTO } from "@/lib/turnover/constants";
import type {
  TurnoverEmployee,
  TurnoverExitPayload,
  TipoDesligamento,
} from "@/lib/turnover/types";

interface TurnoverExitDialogProps {
  open: boolean;
  employee?: TurnoverEmployee | null;
  submitting?: boolean;
  isPurpleTheme?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, values: TurnoverExitPayload) => Promise<void> | void;
}

export function TurnoverExitDialog({
  open,
  employee,
  submitting = false,
  isPurpleTheme = false,
  onOpenChange,
  onSubmit,
}: TurnoverExitDialogProps) {
  const [dataDesligamento, setDataDesligamento] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [tipoDesligamento, setTipoDesligamento] =
    useState<TipoDesligamento>("voluntario");
  const [motivoEspecifico, setMotivoEspecifico] = useState<string>(
    MOTIVOS_DESLIGAMENTO[0].id
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDataDesligamento(new Date().toISOString().slice(0, 10));
      setTipoDesligamento("voluntario");
      setMotivoEspecifico(MOTIVOS_DESLIGAMENTO[0].id);
      setError("");
    }
  }, [open, employee]);

  if (!open || !employee) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employee) return;
    if (!dataDesligamento) {
      setError("Informe a data do desligamento.");
      return;
    }
    if (dataDesligamento < employee.data_admissao) {
      setError("A data de desligamento não pode ser anterior à admissão.");
      return;
    }

    setError("");
    await onSubmit(employee.id, {
      data_desligamento: dataDesligamento,
      tipo_desligamento: tipoDesligamento,
      motivo_especifico: motivoEspecifico,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div
        className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl transition-all ${
          isPurpleTheme
            ? "border-purple-500/20 bg-gradient-to-b from-[#180e29] to-[#0e071a] text-white"
            : "border-slate-200/80 bg-white text-slate-900 dark:border-white/10 dark:bg-[#102033] dark:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <UserMinus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Registrar Desligamento</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Atualize o status do colaborador para contabilização nos índices de turnover.
            </p>
          </div>
        </div>

        {/* Resumo do colaborador */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-xs dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {employee.nome}
            </span>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {employee.matricula}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400">Cargo:</span> {employee.cargo}
            </div>
            <div>
              <span className="text-slate-400">Setor:</span> {employee.departamento}
            </div>
            <div>
              <span className="text-slate-400">Admissão:</span> {employee.data_admissao}
            </div>
            <div>
              <span className="text-slate-400">Salário:</span>{" "}
              {employee.salario.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Data Efetiva de Desligamento <span className="text-rose-500">*</span>
            </span>
            <input
              type="date"
              value={dataDesligamento}
              onChange={(e) => setDataDesligamento(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none transition focus:border-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Tipo de Desligamento <span className="text-rose-500">*</span>
            </span>
            <select
              value={tipoDesligamento}
              onChange={(e) =>
                setTipoDesligamento(e.target.value as TipoDesligamento)
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none transition focus:border-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="voluntario" className="dark:bg-[#102033]">
                Voluntário (Iniciativa do Colaborador / Pediu demissão)
              </option>
              <option value="involuntario" className="dark:bg-[#102033]">
                Involuntário (Iniciativa da Empresa / Demissão)
              </option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Motivo Específico da Saída <span className="text-rose-500">*</span>
            </span>
            <select
              value={motivoEspecifico}
              onChange={(e) => setMotivoEspecifico(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none transition focus:border-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {MOTIVOS_DESLIGAMENTO.map((m) => (
                <option key={m.id} value={m.id} className="dark:bg-[#102033]">
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:from-rose-500 hover:to-red-500 transition disabled:opacity-50"
            >
              {submitting ? "Processando..." : "Confirmar Desligamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
