"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Download, Sparkles } from "lucide-react";

import type {
  JobFilters,
  JobOpening,
  JobOpeningPayload,
  JobStatus,
} from "@/lib/jobs/types";
import { exportJobOpeningsToCsv, filterJobOpenings } from "@/lib/jobs/utils";
import { JobOpeningFormDialog } from "./job-opening-form-dialog";
import { JobOpeningsBoard } from "./job-openings-board";
import { JobOpeningsFilters } from "./job-openings-filters";
import { JobOpeningsStats } from "./job-openings-stats";
import { JobOpeningsTable } from "./job-openings-table";

interface JobOpeningsClientProps {
  initialItems: JobOpening[];
}

const DEFAULT_FILTERS: JobFilters = {
  search: "",
  status: "todos",
  dateStart: "",
  dateEnd: "",
};

export function JobOpeningsClient({ initialItems }: JobOpeningsClientProps) {
  const [items, setItems] = useState<JobOpening[]>(initialItems);
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobOpening | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredItems = useMemo(
    () =>
      filterJobOpenings(
        items,
        filters.search,
        filters.status,
        filters.dateStart,
        filters.dateEnd
      ),
    [items, filters]
  );


  useEffect(() => {
    if (initialItems.length === 0) {
      void refreshItems();
    }
  }, [initialItems.length]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      open: items.filter((item) => item.status === "em_aberto").length,
      paused: items.filter((item) => item.status === "pausada").length,
      closed: items.filter((item) => item.status === "fechada").length,
    };
  }, [items]);

  async function refreshItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/job-openings", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao carregar vagas.");
      }

      setItems(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar vagas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(values: JobOpeningPayload) {
    setSubmitting(true);
    setError("");

    try {
      const isEditing = Boolean(editingItem?.id);
      const url = isEditing
        ? `/api/job-openings/${editingItem?.id}`
        : "/api/job-openings";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = response.status === 204 ? null : await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao salvar vaga.");
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      await refreshItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar vaga.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta vaga?");
    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`/api/job-openings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "Erro ao excluir vaga.");
      }

      await refreshItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir vaga.");
    }
  }

  async function handleStatusChange(item: JobOpening, status: JobStatus) {
    setError("");

    try {
      const response = await fetch(`/api/job-openings/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          data_fechamento:
            status === "fechada"
              ? new Date().toISOString().slice(0, 10)
              : null,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao alterar status.");
      }

      await refreshItems();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao alterar status."
      );
    }
  }

  function openCreateDialog() {
    setEditingItem(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(item: JobOpening) {
    setEditingItem(item);
    setIsDialogOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                <Sparkles className="h-3.5 w-3.5" />
                Operação de recrutamento
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                Painel de Vagas
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                Gerencie vagas, acompanhe status e exporte seus dados em um painel visual unificado.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => exportJobOpeningsToCsv(filteredItems)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </button>

              <button
                type="button"
                onClick={openCreateDialog}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950"
              >
                <BriefcaseBusiness className="h-4 w-4" />
                Nova vaga
              </button>
            </div>
          </div>
        </section>

        <JobOpeningsStats
          total={stats.total}
          open={stats.open}
          paused={stats.paused}
          closed={stats.closed}
        />

        <JobOpeningsFilters
          filters={filters}
          total={filteredItems.length}
          onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
          onClear={() => setFilters(DEFAULT_FILTERS)}
        />

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 px-4 py-6 text-sm text-slate-500 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#102033]/72 dark:text-slate-400">
            Atualizando vagas...
          </div>
        ) : null}

        <JobOpeningsBoard
          items={filteredItems}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />

        <JobOpeningsTable
          items={filteredItems}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>

      <JobOpeningFormDialog
        open={isDialogOpen}
        item={editingItem}
        submitting={submitting}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}
