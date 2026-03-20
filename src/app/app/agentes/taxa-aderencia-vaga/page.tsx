"use client";

import { useEffect, useRef, useState } from "react";
import UserMessageActions from "@/components/agents/user-message-actions";

type TaxaAderenciaField =
  | "culturalMission"
  | "culturalVision"
  | "culturalValues"
  | "culturalContext"
  | "targetRole"
  | "recruiterName"
  | "validatorName"
  | "approverName"
  | "candidateName"
  | "candidateExperience"
  | "behavioralTestInput";

type TaxaAderenciaSession = {
  assessmentId?: string;
  culturalMission?: string;
  culturalVision?: string;
  culturalValues?: string;
  culturalContext?: string;
  targetRole?: string;
  recruiterName?: string;
  validatorName?: string;
  approverName?: string;
  candidateName?: string;
  candidateExperience?: string;
  behavioralTestInput?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  sessionSnapshot?: TaxaAderenciaSession | null;
  fieldSnapshot?: TaxaAderenciaField | null;
};

function cloneSession<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export default function TaxaAderenciaVagaPage() {
  const [session, setSession] = useState<TaxaAderenciaSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentField, setCurrentField] = useState<TaxaAderenciaField | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    void startConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!loading && !finished) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [messages, loading, finished]);

  async function startConversation() {
    try {
      setLoading(true);

      const response = await fetch("/api/agents/taxa-aderencia-vaga", {
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

      setSession(data.session);
      setCurrentField(data.nextField);
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
            error instanceof Error ? error.message : "Erro ao iniciar agente.",
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
    if (!input.trim() || !currentField || !session || loading || finished) {
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
      const response = await fetch("/api/agents/taxa-aderencia-vaga", {
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

      setSession(data.session);
      setCurrentField(data.nextField ?? null);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
        },
      ]);
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

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    await sendAnswer();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendAnswer();
    }
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div>
          <p className="text-sm text-neutral-500">Recrutamento</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight">
            Taxa de Aderência à Vaga
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            Responda uma pergunta por vez. Ao final, o relatório ficará disponível para análise do recrutador.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm leading-6 text-amber-900">
          <strong>Aviso:</strong> esta avaliação ficará disponível por <strong>3 dias</strong> para consulta do recrutador.
          Recomendamos salvar ou copiar o relatório depois que ele for gerado.
        </div>

        <div className="mt-4 rounded-[36px] border border-neutral-200 bg-neutral-50/40 p-5">
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
              <form onSubmit={handleSubmit} className="flex items-end gap-4">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua resposta aqui..."
                  className="min-h-[120px] flex-1 rounded-[28px] border border-neutral-300 bg-white px-6 py-5 text-[18px] leading-8 text-black outline-none placeholder:text-neutral-400"
                  disabled={loading || finished}
                />
                <button
                  type="submit"
                  disabled={loading || finished || !input.trim()}
                  className="rounded-[28px] bg-neutral-500 px-8 py-5 text-[18px] font-medium text-white disabled:opacity-70"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
