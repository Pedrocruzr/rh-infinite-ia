"use client";

import { useEffect, useState } from "react";
import { Lock, Sparkles, ArrowRight } from "lucide-react";

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

  const [planCode, setPlanCode] = useState<string>("perfil_comportamental");

  useEffect(() => {
    const savedPlan = sessionStorage.getItem("simulated_plan_code") as string;
    if (savedPlan) {
      setPlanCode(savedPlan);
    }
  }, []);

  const handleTogglePlan = (newPlan: string) => {
    setPlanCode(newPlan);
    sessionStorage.setItem("simulated_plan_code", newPlan);
    document.cookie = `simulated_plan_code=${newPlan}; path=/; max-age=31536000`;
    window.location.reload();
  };

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

  const isAgentBlocked = (planCode === "perfil_comportamental" || planCode.startsWith("perfil_")) && agent.slug !== "teste-perfil-comportamental";

  if (isAgentBlocked) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-10">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-[#1e2733] dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <div className="flex flex-col items-center text-center text-slate-950 dark:text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Lock className="h-6 w-6" />
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Recurso Bloqueado
              </div>

              <h2 className="mt-6 text-2xl font-bold tracking-tight leading-tight sm:text-3xl">
                Desbloqueie o {agent.name}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Sua assinatura atual dá acesso exclusivo ao <strong>Teste de Perfil Comportamental</strong>.
                <br />
                Atualize seu plano para liberar o {agent.name} e todos os outros robôs de inteligência artificial da plataforma!
              </p>

              <div className="mt-6 w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Plano Completo</p>
                <p className="mt-2 text-3xl font-extrabold">R$ 297<span className="text-lg font-medium text-slate-500">/mês</span></p>
                <p className="mt-1 text-xs text-sky-600 dark:text-sky-300 font-semibold">Garante 29 créditos mensais</p>
              </div>

              <div className="mt-8 flex w-full flex-col gap-3">
                <a
                  href="https://checkout.asaas.com/..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-500 hover:shadow-sky-500/35"
                >
                  Desbloquear Atualizando o Plano
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Simulador de Assinatura Local */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Simulador de Assinatura (Local)</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleTogglePlan("perfil_start")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${planCode.startsWith("perfil_") ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"}`}
              >
                Perfil Start (R$ 129)
              </button>
              <button 
                onClick={() => handleTogglePlan("start")}
                className="rounded-lg px-3 py-1 text-xs font-semibold transition bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"
              >
                Completo (R$ 197)
              </button>
            </div>
          </div>
        )}
      </div>
    );
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

      {/* Simulador de Assinatura Local */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Simulador de Assinatura (Local)</p>
          <div className="flex gap-2">
            <button 
              onClick={() => handleTogglePlan("perfil_start")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${planCode.startsWith("perfil_") ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"}`}
            >
              Perfil Start (R$ 129)
            </button>
            <button 
              onClick={() => handleTogglePlan("start")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${planCode === "start" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"}`}
            >
              Completo (R$ 197)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
