"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  assessmentId: string;
};

export default function RegenerateReportDialog({ assessmentId }: Props) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    if (!instruction.trim() || loading) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/assessments/${assessmentId}/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instruction: instruction.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao regenerar relatório.");
      }

      setOpen(false);
      setInstruction("");
      window.location.reload();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao regenerar relatório."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
        >
          Gerar Novamente
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar ajuste no relatório</DialogTitle>
          <DialogDescription>
            Descreva exatamente o que o agente deve alterar antes de gerar novamente.
          </DialogDescription>
        </DialogHeader>

        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Exemplo: alterar horas trabalhadas de 160 para 140"
          className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
        />

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Exemplo curto: “Alterar horas trabalhadas de 160 para 140” ou
          “Corrigir entregas realizadas de 300 para 280”.
        </p>

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/6 dark:text-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading || !instruction.trim()}
            className="inline-flex items-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            {loading ? "Atualizando..." : "Aplicar e gerar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
