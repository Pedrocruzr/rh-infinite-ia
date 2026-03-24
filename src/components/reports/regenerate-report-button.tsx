"use client";

import { useState } from "react";

type Props = {
  assessmentId: string;
  agentSlug: string;
};

export default function RegenerateReportButton({ assessmentId, agentSlug }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/assessments/${assessmentId}/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar novamente o relatório.");
      }

      window.location.reload();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao gerar novamente o relatório."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading}
      className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium hover:bg-black/5 disabled:opacity-50"
    >
      {loading ? "Gerando..." : "Gerar Novamente"}
    </button>
  );
}
