"use client";

import { useState } from "react";

interface Props {
  agent: {
    slug: string;
    name: string;
    category: string;
    shortDescription: string;
    creditCost: number;
    active: boolean;
  };
}

export function AgentWorkspaceClient({ agent }: Props) {
  const [context, setContext] = useState("");
  const [objective, setObjective] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [runId, setRunId] = useState("");
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null);

  async function handleExecute() {
    setLoading(true);
    setError("");
    setResult("");
    setRunId("");
    setCreditsUsed(null);

    try {
      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: agent.slug,
          context,
          objective,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data?.error || "Falha ao executar agente.");
      }

      setResult(data.result ?? "Sem resposta.");
      setRunId(data.runId ?? "");
      setCreditsUsed(data.creditsUsed ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível executar o agente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Entrada do agente</h2>
            <p className="text-sm text-muted-foreground">
              Fluxo inicial conectado à API de execução.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contexto</label>
              <textarea
                className="min-h-[140px] w-full rounded-md border bg-background px-4 py-3 text-sm outline-none"
                placeholder="Descreva o contexto que será enviado ao agente..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Objetivo</label>
              <input
                className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none"
                placeholder="Objetivo da execução"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExecute}
              disabled={loading}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
            >
              {loading ? "Executando..." : "Executar agente"}
            </button>

            <a
              href="/app/agentes"
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              Voltar
            </a>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Resumo do agente</h2>
            <p className="text-sm text-muted-foreground">
              Metadados iniciais da execução.
            </p>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Créditos do agente</span>
              <span className="font-medium">{agent.creditCost}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-emerald-600">
                {agent.active ? "Ativo" : "Inativo"}
              </span>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium">Run ID</div>
              <div className="mt-2 break-all text-sm text-muted-foreground">
                {runId || "Ainda não executado."}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium">Créditos consumidos</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {creditsUsed ?? "Ainda não executado."}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium">Resultado</div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {result || "Aqui aparecerá a resposta gerada pelo agente."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
