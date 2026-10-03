"use client";

import { useEffect, useMemo, useState } from "react";

import { JOB_STATUS_OPTIONS } from "@/lib/jobs/constants";
import type { JobOpening, JobOpeningPayload, JobStatus } from "@/lib/jobs/types";

interface JobOpeningFormDialogProps {
  open: boolean;
  item?: JobOpening | null;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: JobOpeningPayload) => Promise<void> | void;
}

const EMPTY_FORM: JobOpeningPayload = {
  nome_vaga: "",
  data_abertura: new Date().toISOString().slice(0, 10),
  data_fechamento: null,
  status: "em_aberto",
};

export function JobOpeningFormDialog({
  open,
  item,
  submitting = false,
  onOpenChange,
  onSubmit,
}: JobOpeningFormDialogProps) {
  const initialState = useMemo<JobOpeningPayload>(() => {
    if (!item) return EMPTY_FORM;

    return {
      nome_vaga: item.nome_vaga,
      data_abertura: item.data_abertura,
      data_fechamento: item.data_fechamento,
      status: item.status,
    };
  }, [item]);

  const [form, setForm] = useState<JobOpeningPayload>(initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initialState);
      setError("");
    }
  }, [initialState, open]);

  function updateField<K extends keyof JobOpeningPayload>(
    key: K,
    value: JobOpeningPayload[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.nome_vaga.trim()) {
      setError("Informe o nome da vaga.");
      return;
    }

    if (!form.data_abertura) {
      setError("Informe a data de abertura.");
      return;
    }

    if (form.status === "fechada" && !form.data_fechamento) {
      setError("Vaga fechada exige data de fechamento.");
      return;
    }

    setError("");
    await onSubmit({
      ...form,
      data_fechamento: form.status === "fechada" ? form.data_fechamento : null,
    });
  }

  function handleStatusChange(value: string) {
    const status = value as JobStatus;
    updateField("status", status);

    if (status !== "fechada") {
      updateField("data_fechamento", null);
    } else if (!form.data_fechamento) {
      updateField("data_fechamento", new Date().toISOString().slice(0, 10));
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-[#102033]/92">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {item ? "Editar vaga" : "Nova vaga"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Preencha os dados principais da vaga.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-100">Nome da vaga</span>
            <input
              value={form.nome_vaga}
              onChange={(event) => updateField("nome_vaga", event.target.value)}
              placeholder="Ex: Analista de Recrutamento"
              className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-100">Data de abertura</span>
              <input
                type="date"
                value={form.data_abertura}
                onChange={(event) =>
                  updateField("data_abertura", event.target.value)
                }
                className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-100">Status</span>
              <select
                value={form.status}
                onChange={(event) => handleStatusChange(event.target.value)}
                className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              >
                {JOB_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {form.status === "fechada" && (
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-100">Data de fechamento</span>
              <input
                type="date"
                value={form.data_fechamento ?? ""}
                onChange={(event) =>
                  updateField("data_fechamento", event.target.value || null)
                }
                className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              />
            </label>
          )}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              {submitting ? "Salvando..." : item ? "Salvar alterações" : "Criar vaga"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
