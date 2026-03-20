"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateReportButton({
  assessmentId,
  reportStatus,
}: {
  assessmentId: string;
  reportStatus?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const alreadyGenerated = reportStatus === "generated";

  async function handleGenerate() {
    if (alreadyGenerated) return;

    try {
      setLoading(true);

      const response = await fetch("/api/recrutador/relatorio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: assessmentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar relatório.");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao gerar relatório.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading || alreadyGenerated}
      className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
    >
      {alreadyGenerated ? "Relatório já gerado" : loading ? "Gerando..." : "Gerar relatório"}
    </button>
  );
}
