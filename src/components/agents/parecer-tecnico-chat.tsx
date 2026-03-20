"use client";

import { useEffect, useRef, useState } from "react";
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
  }, [messages]);

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
    <main className="min-h-screen bg-white px-6 py-6 text-black">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-sm text-neutral-500">Recrutamento</p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight">
            Parecer Técnico de Entrevista
          </h1>
          <p className="mt-4 text-xl text-neutral-600">
            Responda uma pergunta por vez. O parecer técnico será gerado apenas ao final da coleta.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
          <strong>Aviso:</strong> esta avaliação ficará disponível por <strong>3 dias</strong> para consulta do recrutador.
          Recomendamos salvar ou copiar o relatório depois que ele for gerado.
        </div>

        <div className="mt-6 rounded-[28px] border border-neutral-200 p-5">
          <div className="h-[38vh] overflow-y-auto pr-2">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={message.role === "user" ? "max-w-[52%]" : "max-w-[60%]"}>
                    <div
                      className={
                        message.role === "user"
                          ? "rounded-[22px] bg-black px-5 py-3 text-base leading-7 text-white"
                          : "rounded-[22px] border border-neutral-200 bg-white px-5 py-3 text-base leading-7 text-black shadow-sm"
                      }
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
              <div ref={bottomRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 border-t border-neutral-200 pt-5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || finished}
              placeholder={finished ? "Avaliação concluída." : "Digite sua resposta aqui..."}
              rows={3}
              className="w-full rounded-[20px] border border-neutral-200 px-5 py-4 text-base outline-none placeholder:text-neutral-400 disabled:bg-neutral-50"
            />

            <div className="mt-4 flex items-center justify-end gap-4">
              <button
                type="submit"
                disabled={loading || finished || !input.trim() || !currentField}
                className="rounded-[18px] bg-black px-7 py-3 text-base text-white disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
