"use client";

import { useMemo, useState } from "react";

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
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Suporte</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Canal direto para pedir ajuda, registrar problemas técnicos e acompanhar o andamento das solicitações.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="rounded-xl border px-4 py-2 text-sm transition hover:bg-muted"
            >
              {SUPPORT_EMAIL}
            </a>

            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              <span>🟢</span>
              <span>Abra no WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Enviar solicitação</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua conta já será usada como identificador do chamado.
            </p>
          </div>

          <div className="mb-4 rounded-2xl border bg-background p-4">
            <p className="text-sm font-medium">Conta identificada</p>
            <p className="mt-1 text-sm text-muted-foreground break-all">
              {accountIdentifier}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Assunto</span>
              <input
                value={form.subject}
                onChange={(event) =>
                  setForm((current) => ({ ...current, subject: event.target.value }))
                }
                placeholder="Ex: Erro ao executar agente"
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Mensagem</span>
              <textarea
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
                placeholder="Explique o problema, contexto e o que você já tentou fazer."
                className="min-h-[140px] rounded-xl border bg-background px-3 py-3 outline-none transition focus:border-primary"
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                {success}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={preencherProblemaTecnico}
                className="rounded-xl border px-4 py-2 text-sm transition hover:bg-muted"
              >
                Reportar problema técnico
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Enviando..." : "Enviar solicitação"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">FAQ técnico</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Respostas rápidas para os problemas mais comuns.
            </p>
          </div>

          <div className="space-y-4">
            {SUPPORT_FAQ.map((item) => (
              <article key={item.question} className="rounded-2xl border bg-background p-4">
                <h3 className="font-medium">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Status das solicitações</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Acompanhe data, assunto, prioridade e status dos seus chamados.
          </p>
        </div>

        {sortedTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
            Nenhuma solicitação enviada até agora.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-2xl border bg-background p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-base font-semibold">{ticket.subject}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {ticket.message}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
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
