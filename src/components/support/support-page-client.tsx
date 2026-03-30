"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CircleHelp,
  LifeBuoy,
  Mail,
  MessageCircleMore,
  Sparkles,
} from "lucide-react";

import {
  SUPPORT_EMAIL,
  SUPPORT_FAQ,
  SUPPORT_WHATSAPP_URL,
} from "@/lib/support/constants";
import type { SupportTicket, SupportTicketPayload } from "@/lib/support/types";
import {
  formatDateTimeBR,
  getSupportPriorityBadgeClass,
  getSupportPriorityLabel,
  getSupportStatusBadgeClass,
  getSupportStatusLabel,
  sortSupportTickets,
} from "@/lib/support/utils";

interface SupportPageClientProps {
  initialTickets: SupportTicket[];
  accountIdentifier: string;
}

const DEFAULT_FORM: SupportTicketPayload = {
  subject: "",
  priority: "media",
  message: "",
};

export function SupportPageClient({
  initialTickets,
  accountIdentifier,
}: SupportPageClientProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(sortSupportTickets(initialTickets));
  const [form, setForm] = useState<SupportTicketPayload>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sortedTickets = useMemo(() => sortSupportTickets(tickets), [tickets]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao enviar solicitação.");
      }

      setTickets((current) => sortSupportTickets([payload.data, ...current]));
      setForm(DEFAULT_FORM);
      setSuccess("Solicitação enviada com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar solicitação."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function preencherProblemaTecnico() {
    setForm({
      subject: "Problema técnico na plataforma",
      priority: "alta",
      message:
        "Descreva aqui o que aconteceu, em qual página ocorreu o problema, o que você esperava que acontecesse e, se possível, os passos para reproduzir.",
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Canal direto
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Suporte
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Canal direto para pedir ajuda, registrar problemas técnicos e acompanhar o andamento das solicitações.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
            >
              <Mail className="h-4 w-4" />
              {SUPPORT_EMAIL}
            </a>

            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              <MessageCircleMore className="h-4 w-4" />
              <span>Abrir no WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Abertura de chamado
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Mensagem direta e rastreável.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Conta identificada
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Histórico vinculado ao usuário.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                <CircleHelp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  FAQ técnico
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Respostas rápidas para dúvidas comuns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Enviar solicitação</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sua conta já será usada como identificador do chamado.
            </p>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Conta identificada</p>
            <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
              {accountIdentifier}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-100">Assunto</span>
              <input
                value={form.subject}
                onChange={(event) =>
                  setForm((current) => ({ ...current, subject: event.target.value }))
                }
                placeholder="Ex: Erro ao executar agente"
                className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-100">Mensagem</span>
              <textarea
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
                placeholder="Explique o problema, contexto e o que você já tentou fazer."
                className="min-h-[160px] rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                {success}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={preencherProblemaTecnico}
                className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
              >
                Reportar problema técnico
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
              >
                {submitting ? "Enviando..." : "Enviar solicitação"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">FAQ técnico</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Respostas rápidas para os problemas mais comuns.
            </p>
          </div>

          <div className="space-y-4">
            {SUPPORT_FAQ.map((item) => (
              <article key={item.question} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <h3 className="font-medium text-slate-950 dark:text-white">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Status das solicitações</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Acompanhe data, assunto, prioridade e status dos seus chamados.
          </p>
        </div>

        {sortedTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            Nenhuma solicitação enviada até agora.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">{ticket.subject}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {ticket.message}
                    </p>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Enviado em {formatDateTimeBR(ticket.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getSupportPriorityBadgeClass(
                        ticket.priority
                      )}`}
                    >
                      Prioridade: {getSupportPriorityLabel(ticket.priority)}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getSupportStatusBadgeClass(
                        ticket.status
                      )}`}
                    >
                      {getSupportStatusLabel(ticket.status)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
