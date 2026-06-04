"use client";

import { useEffect, useRef, useState } from "react";
import UserMessageActions from "@/components/agents/user-message-actions";
import StandardAgentLayout from "@/components/agents/standard-agent-layout";
import GenerateLinkDialog from "@/components/assessments/generate-link-dialog";
import { validateClientAgentInput } from "@/lib/agents/client-input-guards";

type GenericSession = Record<string, string | undefined> & {
  status?: string;
  reportStatus?: string;
  reportMarkdown?: string | null;
};

const FINAL_SUCCESS_MESSAGE =
  "Relatório gerado com sucesso e disponível em Relatórios Stackers.";

function removeFirstDuplicateFinalMessage(messages: Message[]): Message[] {
  const duplicatedIndexes = messages
    .map((message, index) =>
      message.role === "assistant" && message.content === FINAL_SUCCESS_MESSAGE ? index : -1
    )
    .filter((index) => index !== -1);

  if (duplicatedIndexes.length <= 1) {
    return messages;
  }

  const firstIndex = duplicatedIndexes[0];
  return messages.filter((_, index) => index != firstIndex);
}

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  sessionSnapshot?: GenericSession | null;
  fieldSnapshot?: string | null;
};

function cloneSession<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export default function AgenteTesteBigFivePage() {
  const [session, setSession] = useState<GenericSession | null>(null);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showEditChoiceDialog, setShowEditChoiceDialog] = useState(false);
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

      const response = await fetch("/api/agents/agente-teste-bigfive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || data.error || "Erro ao iniciar o agente.");
      }

      setSession(data.session ?? {});
      setCurrentField(data.nextField ?? data.currentField ?? null);
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
            error instanceof Error ? error.message : "Erro ao iniciar o agente.",
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
    const target = messages.find((message) => message.id === messageId);
    if (!target || target.role !== "user") return;

    setEditingMessageId(messageId);
    setInput(target.content);
    setFinished(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function restartAssessment() {
    if (loading) return;
    setEditingMessageId(null);
    setShowEditChoiceDialog(false);
    setSession(null);
    setCurrentField(null);
    setMessages([]);
    setInput("");
    setFinished(false);
    void startConversation();
  }

  async function submitAnswer(
    answer: string,
    activeSession: GenericSession,
    activeField: string | null,
    baseMessages?: Message[]
  ) {
    const validationError = validateClientAgentInput("agente-teste-bigfive", activeField ?? null, answer);
    if (validationError) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: validationError,
        },
      ]);
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: answer,
      sessionSnapshot: cloneSession(activeSession),
      fieldSnapshot: activeField,
    };

    setMessages([...(baseMessages ?? messages), userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agents/agente-teste-bigfive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: activeSession,
          message: answer,
          answer,
          currentField: activeField,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || data.error || "Erro ao processar resposta.");
      }

      setSession(data.session ?? {});
      setCurrentField(data.nextField ?? data.currentField ?? null);

      if (!(data.done || data.completed) && data.reply?.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply,
          },
        ]);
      }

      if (data.done || data.completed) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: FINAL_SUCCESS_MESSAGE,
          },
        ]);
      }

      setFinished(Boolean(data.done || data.completed));
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

  async function applySingleEdit() {
    if (!editingMessageId || loading) return;

    const index = messages.findIndex((message) => message.id === editingMessageId);
    if (index === -1) return;

    const target = messages[index];
    if (target.role !== "user") return;

    const nextInput = input.trim();
    if (!nextInput) return;

    const restoredSession = cloneSession(target.sessionSnapshot ?? {});
    const restoredField = target.fieldSnapshot ?? null;
    const truncatedMessages = messages.slice(0, index);

    setEditingMessageId(null);
    setShowEditChoiceDialog(false);
    setFinished(false);

    await submitAnswer(nextInput, restoredSession, restoredField, truncatedMessages);
  }

  async function sendAnswer() {
    if (!input.trim() || loading || finished) return;

    const answer = input.trim();
    if (editingMessageId) {
      setShowEditChoiceDialog(true);
      return;
    }

    if (!session) return;

    await submitAnswer(answer, session, currentField);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendAnswer();
    }
  }

  return (
    <>
      <StandardAgentLayout
        stackerName="Comportamento"
        title="Agente Teste Big Five"
        subtitle="Responda uma pergunta por vez. Ao final, a avaliação ficará disponível em Relatórios Stackers."
        headerExtra={<GenerateLinkDialog agentSlug="agente-teste-bigfive" />}
        messages={removeFirstDuplicateFinalMessage(messages).map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          actions:
            message.role === "user" ? (
              <UserMessageActions
                onCopy={() => void copyMessage(message.content)}
                onEdit={() => editMessage(message.id)}
              />
            ) : undefined,
        }))}
        loading={loading}
        finished={false}
        finishedMessage=""
        inputValue={input}
        onInputChange={setInput}
        onSend={() => void sendAnswer()}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        bottomRef={bottomRef}
        disableInput={loading || finished}
        disableSend={loading || finished || !input.trim()}
      />

      {showEditChoiceDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#1e2733] dark:bg-[#0f1724]">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Alterar somente esta ou todas?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Escolha se você quer corrigir só esta resposta e continuar dali, ou reiniciar o teste inteiro.
            </p>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => void applySingleEdit()}
                className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-slate-950 transition hover:border-sky-300 hover:bg-sky-100/70 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-white dark:hover:border-sky-400/35 dark:hover:bg-sky-500/15"
              >
                Somente esta
              </button>
              <button
                type="button"
                onClick={restartAssessment}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-[#2a3443] dark:bg-[#111927] dark:text-slate-200 dark:hover:border-[#3a475b] dark:hover:bg-[#162131]"
              >
                Todas
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEditChoiceDialog(false)}
                className="rounded-2xl px-3 py-2 text-sm text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
