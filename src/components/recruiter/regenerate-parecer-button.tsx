"use client";

import { useState } from "react";

type Props = {
  assessmentId: string;
};

export default function RegenerateParecerButton({ assessmentId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);

      const response = await fetch(`/api/recrutador/assessments/${assessmentId}/regenerate-parecer`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao regenerar relatório.");
      }

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
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
    >
      {loading ? "Gerando..." : "Gerar relatório novamente"}
    </button>
  );
}
