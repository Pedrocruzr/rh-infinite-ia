"use client";

import { useEffect, useState } from "react";
import { JOB_DEPARTMENTS } from "@/lib/jobs/departments";
import { MOTIVOS_DESLIGAMENTO } from "@/lib/turnover/constants";
import type {
  TurnoverEmployee,
  TurnoverEmployeePayload,
  TipoDesligamento,
  MotivoDesligamento,
} from "@/lib/turnover/types";

interface TurnoverEmployeeDialogProps {
  open: boolean;
  item?: TurnoverEmployee | null;
  submitting?: boolean;
  isPurpleTheme?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TurnoverEmployeePayload) => Promise<void> | void;
}

export function TurnoverEmployeeDialog({
  open,
  item,
  submitting = false,
  isPurpleTheme = false,
  onOpenChange,
  onSubmit,
}: TurnoverEmployeeDialogProps) {
  const [matricula, setMatricula] = useState("");
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [departamento, setDepartamento] = useState<string>(JOB_DEPARTMENTS[0].name);
  const [salario, setSalario] = useState<string>("4500");
  const [dataAdmissao, setDataAdmissao] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [isDesligado, setIsDesligado] = useState(false);
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
      if (item) {
        setMatricula(item.matricula || "");
        setNome(item.nome || "");
        setCargo(item.cargo || "");
        setDepartamento(item.departamento || JOB_DEPARTMENTS[0].name);
        setSalario(item.salario ? String(item.salario) : "0");
        setDataAdmissao(item.data_admissao || new Date().toISOString().slice(0, 10));

        const desligado = Boolean(item.data_desligamento);
        setIsDesligado(desligado);
        setDataDesligamento(
          item.data_desligamento || new Date().toISOString().slice(0, 10)
        );
        setTipoDesligamento(item.tipo_desligamento || "voluntario");
        setMotivoEspecifico(item.motivo_especifico || MOTIVOS_DESLIGAMENTO[0].id);
      } else {
        const randomNum = Math.floor(100 + Math.random() * 900);
        setMatricula(`COL-${randomNum}`);
        setNome("");
        setCargo("");
        setDepartamento(JOB_DEPARTMENTS[0].name);
        setSalario("4500");
        setDataAdmissao(new Date().toISOString().slice(0, 10));
        setIsDesligado(false);
        setDataDesligamento(new Date().toISOString().slice(0, 10));
        setTipoDesligamento("voluntario");
        setMotivoEspecifico(MOTIVOS_DESLIGAMENTO[0].id);
      }
      setError("");
    }
  }, [open, item]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!matricula.trim()) {
      setError("Informe a matrícula ou código de identificação.");
      return;
    }
    if (!nome.trim()) {
      setError("Informe o nome completo do colaborador.");
      return;
    }
    if (!cargo.trim()) {
      setError("Informe o cargo ocupado.");
      return;
    }
    if (!dataAdmissao) {
      setError("Informe a data de admissão.");
      return;
    }
    const numSalario = Number(salario);
    if (isNaN(numSalario) || numSalario < 0) {
      setError("Informe um salário válido.");
      return;
    }

    if (isDesligado) {
      if (!dataDesligamento) {
        setError("Informe a data de desligamento.");
        return;
      }
      if (dataDesligamento < dataAdmissao) {
        setError("A data de desligamento não pode ser anterior à data de admissão.");
        return;
      }
    }

    setError("");

    await onSubmit({
      matricula: matricula.trim(),
      nome: nome.trim(),
      cargo: cargo.trim(),
      departamento,
      salario: numSalario,
      data_admissao: dataAdmissao,
      data_desligamento: isDesligado ? dataDesligamento : null,
      tipo_desligamento: isDesligado ? tipoDesligamento : null,
      motivo_especifico: isDesligado ? motivoEspecifico : null,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div
        className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl transition-all ${
          isPurpleTheme
            ? "border-purple-500/20 bg-gradient-to-b from-[#180e29] to-[#0e071a] text-white"
            : "border-slate-200/80 bg-white text-slate-900 dark:border-white/10 dark:bg-[#102033] dark:text-white"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {item ? "Editar Colaborador" : "Novo Colaborador"}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cadastre o colaborador na base fato do RH para cálculo contínuo de turnover e custos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-slate-200/80 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:text-white transition"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-500">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Matrícula / ID <span className="text-rose-500">*</span>
              </span>
              <input
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ex: COL-102"
                className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Nome Completo <span className="text-rose-500">*</span>
              </span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silva"
                className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Cargo <span className="text-rose-500">*</span>
              </span>
              <input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Desenvolvedor Pleno"
                className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Departamento / Área <span className="text-rose-500">*</span>
              </span>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {JOB_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.name} className="dark:bg-[#102033]">
                    {dept.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Salário Base (R$) <span className="text-rose-500">*</span>
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                placeholder="4500.00"
                className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Data de Admissão <span className="text-rose-500">*</span>
              </span>
              <input
                type="date"
                value={dataAdmissao}
                onChange={(e) => setDataAdmissao(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </label>
          </div>

          {/* Seção de Status / Desligamento */}
          <div
            className={`mt-4 rounded-2xl border p-4 transition-all ${
              isDesligado
                ? isPurpleTheme
                  ? "border-purple-500/30 bg-purple-500/10"
                  : "border-rose-500/30 bg-rose-500/5 dark:border-rose-500/20 dark:bg-rose-500/10"
                : "border-slate-200/80 bg-slate-50/40 dark:border-white/5 dark:bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Colaborador Desligado?
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Marque para registrar data e motivo da rescisão contratual.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDesligado}
                  onChange={(e) => setIsDesligado(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {isDesligado && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <label className="flex flex-col gap-1.5 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Data Desligamento <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="date"
                    value={dataDesligamento}
                    onChange={(e) => setDataDesligamento(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Tipo de Rescisão <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={tipoDesligamento}
                    onChange={(e) =>
                      setTipoDesligamento(e.target.value as TipoDesligamento)
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <option value="voluntario" className="dark:bg-[#102033]">
                      Voluntário (Pediu demissão)
                    </option>
                    <option value="involuntario" className="dark:bg-[#102033]">
                      Involuntário (Demitido pela empresa)
                    </option>
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Motivo Específico <span className="text-rose-500">*</span>
                  </span>
                  <select
                    value={motivoEspecifico}
                    onChange={(e) => setMotivoEspecifico(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {MOTIVOS_DESLIGAMENTO.map((m) => (
                      <option key={m.id} value={m.id} className="dark:bg-[#102033]">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition disabled:opacity-50 ${
                isPurpleTheme
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/25 hover:from-purple-500 hover:to-pink-500"
                  : "bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500"
              }`}
            >
              {submitting
                ? "Salvando..."
                : item
                ? "Atualizar Colaborador"
                : "Salvar Colaborador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
