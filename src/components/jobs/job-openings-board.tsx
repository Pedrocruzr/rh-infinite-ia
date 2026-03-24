"use client";

import { JOB_STATUS_OPTIONS } from "@/lib/jobs/constants";
import { formatDateBR, getStatusBadgeClass, getStatusLabel } from "@/lib/jobs/utils";
import type { JobOpening, JobStatus } from "@/lib/jobs/types";

interface JobOpeningsBoardProps {
  items: JobOpening[];
  onEdit: (item: JobOpening) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: JobOpening, status: JobStatus) => void;
}

export function JobOpeningsBoard({
  items,
  onEdit,
  onDelete,
  onStatusChange,
}: JobOpeningsBoardProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {JOB_STATUS_OPTIONS.map((statusOption) => {
        const statusItems = items.filter((item) => item.status === statusOption.value);

        return (
          <section
            key={statusOption.value}
            className="rounded-2xl border bg-card p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">{statusOption.label}</h2>
              <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                {statusItems.length}
              </span>
            </div>

            <div className="space-y-3">
              {statusItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  Nenhuma vaga neste status.
                </div>
              ) : (
                statusItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border bg-background p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium">{item.nome_vaga}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Aberta em {formatDateBR(item.data_abertura)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                      <p>Dias em aberto: {item.dias_em_aberto}</p>
                      <p>Fechamento: {formatDateBR(item.data_fechamento)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.status !== "em_aberto" && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(item, "em_aberto")}
                          className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-muted"
                        >
                          Reabrir
                        </button>
                      )}

                      {item.status !== "pausada" && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(item, "pausada")}
                          className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-muted"
                        >
                          Pausar
                        </button>
                      )}

                      {item.status !== "fechada" && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(item, "fechada")}
                          className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-muted"
                        >
                          Fechar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-muted"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/30"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
