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
          className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
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
          className="min-h-[140px] w-full rounded-xl border p-3 text-sm outline-none"
        />

        <p className="text-xs text-neutral-500">
          Exemplo curto: “Alterar horas trabalhadas de 160 para 140” ou
          “Corrigir entregas realizadas de 300 para 280”.
        </p>

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading || !instruction.trim()}
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Atualizando..." : "Aplicar e gerar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
