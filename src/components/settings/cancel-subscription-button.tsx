"use client";

import { useState } from "react";

export function CancelSubscriptionButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const cancellationReasons = [
    "Preço muito alto / Sem orçamento no momento",
    "Não estou utilizando a plataforma o suficiente",
    "Dificuldades técnicas ou bugs ao usar os agentes de IA",
    "Os agentes não atenderam minhas expectativas de qualidade",
    "Vou migrar para outra ferramenta concorrente",
    "Outro motivo (Feedback adicional)",
  ];

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReason) {
      setError("Por favor, selecione um motivo para o cancelamento.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/account/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: selectedReason,
          feedback: feedback.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao cancelar assinatura.");
      }

      setIsOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar assinatura.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:text-red-700 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-red-500/30 dark:hover:text-red-200"
      >
        Cancelar assinatura
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#102033]">
            <div className="p-6">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Cancelar sua Assinatura?
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Sentimos muito em ver você partir! Ao cancelar, você deixará de ter as renovações automáticas, mas continuará com acesso a todos os agentes e créditos até o fim do seu período pago atual.
              </p>

              <form onSubmit={handleCancel} className="mt-5 space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Qual o motivo principal do cancelamento?
                  </label>
                  
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {cancellationReasons.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-sm cursor-pointer transition ${
                          selectedReason === reason
                            ? "border-sky-500 bg-sky-500/5 text-sky-900 dark:border-sky-400 dark:text-sky-200"
                            : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancellation_reason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={() => {
                            setSelectedReason(reason);
                            setError(null);
                          }}
                          className="mt-0.5 h-4 w-4 border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="font-medium">{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Como podemos melhorar? (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Conta pra gente o que faltou ou como podemos melhorar sua experiência..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 transition dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                  >
                    Manter Assinatura
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedReason}
                    className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Cancelando..." : "Confirmar Cancelamento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
