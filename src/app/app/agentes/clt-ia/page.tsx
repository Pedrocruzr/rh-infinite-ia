"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import UserMessageActions from "@/components/agents/user-message-actions";
import StandardAgentLayout from "@/components/agents/standard-agent-layout";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export default function CltIaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "CLT IA pronto. Digite um tema, artigo ou dúvida. Exemplo: prazo de pagamento de rescisão, art. 477, horas extras, férias, CTPS.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [loading]);

  async function copyMessage(content: string) {
    try {
      await navigator.clipboard.writeText(content);
    } catch {}
  }

  function editMessage(id: string) {
    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === id);
      if (index === -1) return prev;

      const target = prev[index];
      if (target.role !== "user") return prev;

      setInput(target.content);
      return prev.filter((_, i) => i < index);
    });

    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function handleSend() {
    const query = input.trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agents/clt-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.reply || "Erro ao consultar CLT IA.");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data?.reply || "Tema não encontrado na base atual.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Erro ao consultar CLT IA.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  const layoutMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        actions:
          message.role === "user" ? (
            <UserMessageActions
              onCopy={() => void copyMessage(message.content)}
              onEdit={() => editMessage(message.id)}
            />
          ) : undefined,
      })),
    [messages]
  );

  return (
    <StandardAgentLayout
      backHref="/app/agentes"
      stackerName="Pesquisa"
      title="CLT IA"
      subtitle="Motor de busca legislativa com base local da CLT. Responde com resumo fiel e artigo localizado."
      retentionNotice="Base local versionada da CLT. Use termos como artigo, rescisão, horas extras, férias, CTPS ou salário."
      messages={layoutMessages}
      loading={loading}
      inputValue={input}
      inputPlaceholder="Digite: prazo de pagamento de rescisão, art. 477, horas extras..."
      onInputChange={setInput}
      onSend={() => void handleSend()}
      onKeyDown={handleKeyDown}
      inputRef={inputRef}
      bottomRef={bottomRef}
      disableSend={loading || !input.trim()}
      disableInput={loading}
      panelTopSpacingClass="mt-5"
    />
  );
}
