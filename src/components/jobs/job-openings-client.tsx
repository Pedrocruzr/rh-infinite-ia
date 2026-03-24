"use client";

import { useEffect, useMemo, useState } from "react";

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
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              Painel de Vagas
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie vagas, acompanhe status e exporte seus dados.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => exportJobOpeningsToCsv(filteredItems)}
              className="rounded-xl border px-4 py-2 text-sm transition hover:bg-muted"
            >
              Exportar CSV
            </button>

            <button
              type="button"
              onClick={openCreateDialog}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              + Nova vaga
            </button>
          </div>
        </div>

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
          <div className="rounded-2xl border bg-card px-4 py-6 text-sm text-muted-foreground shadow-sm">
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
