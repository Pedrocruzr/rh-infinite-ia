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
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/75 dark:shadow-[0_18px_50px_rgba(15,23,42,0.18)] md:p-8">
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
              Entrada do agente
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Contexto de execução</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Fluxo inicial conectado à API de execução.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-white">Contexto</label>
              <textarea
                className="min-h-[140px] w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40"
                placeholder="Descreva o contexto que será enviado ao agente..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-white">Objetivo</label>
              <input
                className="w-full rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40"
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
              className="rounded-[1.1rem] bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              {loading ? "Executando..." : "Executar agente"}
            </button>

            <a
              href="/app/agentes"
              className="rounded-[1.1rem] border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/8"
            >
              Voltar
            </a>
          </div>

          {error ? (
            <div className="rounded-[1.25rem] border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/75 dark:shadow-[0_18px_50px_rgba(15,23,42,0.18)] md:p-8">
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
              Saída e telemetria
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Resumo do agente</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Metadados iniciais da execução.
            </p>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 p-4 dark:border-white/10">
              <span className="text-slate-500 dark:text-slate-400">Créditos do agente</span>
              <span className="font-medium text-slate-900 dark:text-white">{agent.creditCost}</span>
            </div>

            <div className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 p-4 dark:border-white/10">
              <span className="text-slate-500 dark:text-slate-400">Status</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-300">
                {agent.active ? "Ativo" : "Inativo"}
              </span>
            </div>

            <div className="rounded-[1.25rem] border border-slate-200 p-4 dark:border-white/10">
              <div className="text-sm font-medium text-slate-900 dark:text-white">Run ID</div>
              <div className="mt-2 break-all text-sm text-slate-500 dark:text-slate-400">
                {runId || "Ainda não executado."}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-slate-200 p-4 dark:border-white/10">
              <div className="text-sm font-medium text-slate-900 dark:text-white">Créditos consumidos</div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {creditsUsed ?? "Ainda não executado."}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-slate-200 p-4 dark:border-white/10">
              <div className="text-sm font-medium text-slate-900 dark:text-white">Resultado</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500 dark:text-slate-400">
                {result || "Aqui aparecerá a resposta gerada pelo agente."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
