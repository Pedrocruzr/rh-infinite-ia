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
  agentSlug?: string;
};

export default function GenerateLinkDialog({ agentSlug = "teste-perfil-comportamental" }: Props) {
  const [open, setOpen] = useState(false);
  const [vaga, setVaga] = useState("");
  const [hours, setHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setLink(null);
    setVaga("");
    setHours(2);
    setCopied(false);
  }

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaga: vaga.trim(), hours, agentSlug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar link.");
      setLink(data.link);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao gerar link.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the input
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) { setOpen(v); if (!v) { setLink(null); setVaga(""); setCopied(false); } } }}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200/80 bg-white/85 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm shadow-emerald-100/40 transition hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-900 dark:border-emerald-400/20 dark:bg-slate-950/60 dark:text-emerald-400 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-500/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Gerar Link
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-w-lg overflow-hidden border border-emerald-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(240,253,244,0.96)_100%)] p-0 shadow-2xl shadow-emerald-200/25 ring-1 ring-emerald-100/60 dark:border-emerald-400/15 dark:bg-[linear-gradient(180deg,rgba(10,15,26,0.97)_0%,rgba(14,23,38,0.98)_100%)] dark:ring-emerald-400/10"
        onInteractOutside={(e) => { if (loading) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (loading) e.preventDefault(); }}
      >
        <DialogHeader className="gap-3 border-b border-emerald-100/80 px-6 py-6 dark:border-emerald-400/10">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Gerar Link de Avaliação
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">
            Envie o link para o candidato responder o teste sem precisar de login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {!link ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Vaga <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={vaga}
                  onChange={(e) => setVaga(e.target.value)}
                  placeholder="Ex: Analista de RH, Gerente Comercial..."
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Validade do link
                </label>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value={1}>1 hora</option>
                  <option value={2}>2 horas</option>
                  <option value={3}>3 horas</option>
                </select>
              </div>

              <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/70 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-emerald-400/10 dark:bg-emerald-500/8 dark:text-slate-300">
                O candidato receberá o questionário completo e, ao finalizar, as respostas serão salvas automaticamente para você em Relatórios Stackers.
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-400/20 dark:bg-emerald-500/10">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wide">
                  Link gerado com sucesso
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 break-all font-mono bg-white dark:bg-slate-900 rounded-lg px-3 py-2 border border-emerald-100 dark:border-emerald-400/10">
                  {link}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Copiado!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    Copiar link
                  </>
                )}
              </button>

              <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                Envie este link para o candidato por e-mail ou WhatsApp. Ele expira em {hours} hora{hours !== 1 ? "s" : ""}.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-emerald-100/80 bg-white/55 px-6 py-5 dark:border-emerald-400/10 dark:bg-slate-950/35">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="inline-flex min-w-28 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {link ? "Fechar" : "Cancelar"}
          </button>

          {!link && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Gerando...
                </>
              ) : (
                "Gerar Link"
              )}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
