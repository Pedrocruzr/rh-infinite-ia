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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {item ? "Editar vaga" : "Nova vaga"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha os dados principais da vaga.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border px-3 py-2 text-sm transition hover:bg-muted"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Nome da vaga</span>
            <input
              value={form.nome_vaga}
              onChange={(event) => updateField("nome_vaga", event.target.value)}
              placeholder="Ex: Analista de Recrutamento"
              className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Data de abertura</span>
              <input
                type="date"
                value={form.data_abertura}
                onChange={(event) =>
                  updateField("data_abertura", event.target.value)
                }
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Status</span>
              <select
                value={form.status}
                onChange={(event) => handleStatusChange(event.target.value)}
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
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
              <span className="font-medium">Data de fechamento</span>
              <input
                type="date"
                value={form.data_fechamento ?? ""}
                onChange={(event) =>
                  updateField("data_fechamento", event.target.value || null)
                }
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
              />
            </label>
          )}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border px-4 py-2 text-sm transition hover:bg-muted"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Salvando..." : item ? "Salvar alterações" : "Criar vaga"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
