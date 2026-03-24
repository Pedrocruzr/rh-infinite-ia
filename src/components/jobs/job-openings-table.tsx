"use client";

import { formatDateBR, getStatusBadgeClass, getStatusLabel } from "@/lib/jobs/utils";
import type { JobOpening, JobStatus } from "@/lib/jobs/types";

interface JobOpeningsTableProps {
  items: JobOpening[];
  onEdit: (item: JobOpening) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: JobOpening, status: JobStatus) => void;
}

export function JobOpeningsTable({
  items,
  onEdit,
  onDelete,
  onStatusChange,
}: JobOpeningsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Vaga</th>
              <th className="px-4 py-3 font-medium">Abertura</th>
              <th className="px-4 py-3 font-medium">Fechamento</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dias em aberto</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nenhuma vaga encontrada com os filtros atuais.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{item.nome_vaga}</td>
                  <td className="px-4 py-3">{formatDateBR(item.data_abertura)}</td>
                  <td className="px-4 py-3">{formatDateBR(item.data_fechamento)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.dias_em_aberto}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-muted"
                      >
                        Editar
                      </button>

                      {item.status !== "fechada" ? (
                        <button
                          type="button"
                          onClick={() => onStatusChange(item, "fechada")}
                          className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-muted"
                        >
                          Fechar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onStatusChange(item, "em_aberto")}
                          className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-muted"
                        >
                          Reabrir
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/30"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
