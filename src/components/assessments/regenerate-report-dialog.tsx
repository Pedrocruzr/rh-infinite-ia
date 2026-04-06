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
          className="inline-flex items-center rounded-2xl border border-sky-200/70 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-sky-100/40 transition hover:border-sky-300 hover:bg-sky-50/80 hover:text-slate-950 dark:border-sky-400/20 dark:bg-slate-950/60 dark:text-slate-100 dark:shadow-sky-950/20 dark:hover:border-sky-400/40 dark:hover:bg-sky-500/10"
        >
          Gerar Novamente
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl overflow-hidden border border-sky-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(244,249,255,0.96)_100%)] p-0 shadow-2xl shadow-sky-200/25 ring-1 ring-sky-100/60 dark:border-sky-400/15 dark:bg-[linear-gradient(180deg,rgba(10,15,26,0.97)_0%,rgba(14,23,38,0.98)_100%)] dark:ring-sky-400/10">
        <DialogHeader className="gap-3 border-b border-sky-100/80 px-6 py-6 dark:border-sky-400/10">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Solicitar ajuste no relatório
          </DialogTitle>
          <DialogDescription className="max-w-lg text-[15px] leading-7 text-slate-600 dark:text-slate-300">
            Descreva exatamente o que o agente deve alterar antes de gerar novamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-3xl border border-sky-100 bg-white/80 p-3 shadow-inner shadow-sky-100/40 dark:border-sky-400/10 dark:bg-slate-950/40 dark:shadow-none">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Exemplo: alterar horas trabalhadas de 160 para 140"
              className="min-h-[180px] w-full resize-y rounded-2xl border border-slate-200/80 bg-white px-4 py-4 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100/80 dark:border-slate-800 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-500/10"
            />
          </div>

          <div className="rounded-2xl border border-sky-100/80 bg-sky-50/70 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-sky-400/10 dark:bg-sky-500/8 dark:text-slate-300">
            Exemplo curto: “Alterar horas trabalhadas de 160 para 140” ou
            “Corrigir entregas realizadas de 300 para 280”.
          </div>
        </div>

        <DialogFooter className="border-t border-sky-100/80 bg-white/55 px-6 py-5 dark:border-sky-400/10 dark:bg-slate-950/35">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex min-w-32 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading || !instruction.trim()}
            className="inline-flex min-w-40 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[linear-gradient(135deg,#2563eb_0%,#38bdf8_100%)] dark:text-white dark:shadow-sky-950/30"
          >
            {loading ? "Atualizando..." : "Aplicar e gerar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
