"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import UserMessageActions from "@/components/agents/user-message-actions";

type ParecerField =
  | "vaga"
  | "empresa"
  | "candidato"
  | "dataEntrevista"
  | "entrevistadores"
  | "motivacao"
  | "formacao"
  | "trajetoria"
  | "competenciasTecnicas"
  | "competenciasComportamentais"
  | "testes"
  | "referencias"
  | "fitCultural"
  | "pontosFortes"
  | "pontosAtencao"
  | "recomendacaoFinal";

type ParecerSession = {
  assessmentId?: string;
  vaga?: string;
  empresa?: string;
  candidato?: string;
  dataEntrevista?: string;
  entrevistadores?: string;
  motivacao?: string;
  formacao?: string;
  trajetoria?: string;
  competenciasTecnicas?: string;
  competenciasComportamentais?: string;
  testes?: string;
  referencias?: string;
  fitCultural?: string;
  pontosFortes?: string;
  pontosAtencao?: string;
  recomendacaoFinal?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
  reportMarkdown?: string | null;
};

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  sessionSnapshot?: ParecerSession | null;
  fieldSnapshot?: ParecerField | null;
};

function cloneSession<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export default function ParecerTecnicoChat() {
  const [session, setSession] = useState<ParecerSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentField, setCurrentField] = useState<ParecerField | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function startConversation() {
    try {
      setLoading(true);

      const response = await fetch("/api/agents/parecer-tecnico-entrevista", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao iniciar agente.");
      }

      setSession(data.session ?? {});
      setCurrentField(data.nextField ?? null);
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Erro ao iniciar o agente de parecer técnico.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function copyMessage(content: string) {
    try {
      await navigator.clipboard.writeText(content);
    } catch {}
  }

  function editMessage(messageId: string) {
    if (loading) return;

    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === messageId);
      if (index === -1) return prev;

      const target = prev[index];
      if (target.role !== "user") return prev;

      setSession(target.sessionSnapshot ?? null);
      setCurrentField(target.fieldSnapshot ?? null);
      setInput(target.content);
      setFinished(false);

      return prev.slice(0, index);
    });
  }

  async function sendAnswer() {
    if (!input.trim() || !currentField || loading || finished) {
      return;
    }

    const answer = input.trim();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: answer,
      sessionSnapshot: cloneSession(session),
      fieldSnapshot: currentField,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agents/parecer-tecnico-entrevista", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session,
          currentField,
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar resposta.");
      }

      setSession(data.session ?? null);
      setCurrentField(data.nextField ?? null);

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply,
          },
        ]);
      }

      if (data.reportMarkdown) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reportMarkdown,
          },
        ]);
      }

      setFinished(Boolean(data.done));
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? `Erro ao processar sua resposta: ${error.message}`
              : "Erro ao processar sua resposta.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">Recrutamento</p>
            <h1 className="text-5xl font-semibold tracking-tight">
              Parecer Técnico de Entrevista
            </h1>
            <p className="mt-3 text-lg text-neutral-600">
              Responda uma pergunta por vez. O parecer técnico será gerado apenas ao final da coleta.
            </p>
          </div>

          <Link
            href="/app/agentes"
            className="rounded-2xl border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-50"
          >
            Voltar
          </Link>
        </div>


        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm leading-6 text-amber-900">
          <strong>Aviso:</strong> esta avaliação ficará disponível por <strong>3 dias</strong> para consulta do recrutador.
          Recomendamos salvar ou copiar o relatório depois que ele for gerado.
        </div>

        <div className="rounded-[36px] border border-neutral-200 bg-neutral-50/40 p-5">
          <div className="mx-auto flex h-[calc(100dvh-300px)] min-h-[480px] max-h-[620px] max-w-5xl flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div className="max-w-[78%]">
                    <div
                      className={`rounded-[32px] px-8 py-6 text-[18px] leading-9 shadow-sm ${
                        message.role === "assistant"
                          ? "border border-neutral-200 bg-white text-neutral-900"
                          : "bg-neutral-950 text-white"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {message.content}
                    </div>

                    {message.role === "user" && (
                      <UserMessageActions
                        onCopy={() => void copyMessage(message.content)}
                        onEdit={() => editMessage(message.id)}
                      />
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-[32px] border border-neutral-200 bg-white px-8 py-6 text-sm text-neutral-500 shadow-sm">
                    Digitando...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="mt-4 border-t border-neutral-200 pt-4">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendAnswer();
                }}
                className="space-y-4"
              >
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendAnswer();
                    }
                  }}
                  placeholder={
                    finished
                      ? "Avaliação concluída."
                      : "Digite sua resposta aqui..."
                  }
                  disabled={loading || finished}
                  rows={3}
                  className="w-full rounded-[28px] border border-neutral-300 bg-white px-5 py-4 text-lg outline-none focus:border-neutral-900 disabled:bg-neutral-100"
                />

                <div className="flex items-center justify-end gap-4">
                  <button
                    type="submit"
                    disabled={loading || finished || !input.trim() || !currentField}
                    className="rounded-[24px] bg-black px-7 py-4 text-lg text-white disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              </form>

              {session?.assessmentId && (
                <p className="mt-4 text-xs text-neutral-400">
                  ID da avaliação: {session.assessmentId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
