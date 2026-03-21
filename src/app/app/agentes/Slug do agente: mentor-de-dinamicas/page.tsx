"use client";

import { useEffect, useRef, useState } from "react";
import UserMessageActions from "@/components/agents/user-message-actions";
import StandardAgentLayout from "@/components/agents/standard-agent-layout";

type GenericSession = Record<string, string | undefined>;

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  sessionSnapshot?: GenericSession | null;
};

function cloneSession<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export default function Nome do componente da página (ex: TestePerfilDiscPage): MentorDeDinamicasPage() {
  const [session, setSession] = useState<GenericSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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

      const response = await fetch("/api/agents/Slug do agente: mentor-de-dinamicas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || "Erro ao iniciar o agente.");
      }

      setSession(data.session ?? {});
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

    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === messageId);
      if (index === -1) return prev;

      const target = prev[index];
      if (target.role !== "user") return prev;

      setSession(target.sessionSnapshot ?? null);
      setInput(target.content);
      setFinished(false);

      return prev.slice(0, index);
    });
  }

  async function sendAnswer() {
    if (!input.trim() || !session || loading || finished) return;

    const answer = input.trim();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: answer,
      sessionSnapshot: cloneSession(session),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agents/Slug do agente: mentor-de-dinamicas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session,
          message: answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || "Erro ao processar resposta.");
      }

      setSession(data.session ?? {});
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.completed
            ? "Relatório gerado com sucesso e disponível em Avaliações recebidas."
            : data.reply,
        },
      ]);

      setFinished(Boolean(data.completed));
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendAnswer();
    }
  }

  return (
    <StandardAgentLayout
      stackerName="Nome completo do stacker (ex: Diagnóstico, Recrutamento & Seleção, Desenvolvimento & Cultura): Recrutamento & Seleção"
      title="Título do agente: Mentor de Dinâmicas"
      subtitle="Subtítulo do agente: Responda uma pergunta por vez. Ao final, o material ficará disponível em Avaliações recebidas."
      messages={messages.map((message) => ({
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
      finished={finished}
      finishedMessage="Relatório gerado com sucesso e disponível em Avaliações recebidas."
      inputValue={input}
      onInputChange={setInput}
      onSend={() => void sendAnswer()}
      onKeyDown={handleKeyDown}
      inputRef={inputRef}
      bottomRef={bottomRef}
      disableInput={loading || finished}
      disableSend={loading || finished || !input.trim()}
    />
  );
}
