"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import StandardAgentLayout from "@/components/agents/standard-agent-layout";
import UserMessageActions from "@/components/agents/user-message-actions";

type GenericSession = Record<string, any> & {
  status?: string;
  reportStatus?: string;
  reportMarkdown?: string | null;
  assessmentId?: string;
};

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  sessionSnapshot?: GenericSession | null;
  fieldSnapshot?: string | null;
};

export default function ColetorDadosSixBoxPage() {
  const [session, setSession] = useState<GenericSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    void startConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, finished]);

  useEffect(() => {
    if (!finished && !loading) {
      inputRef.current?.focus();
    }
  }, [messages, finished, loading]);

  async function startConversation() {
    try {
      setLoading(true);

      const response = await fetch("/api/agents/coletor-dados-six-box", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentField: "start", session: {} }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || data.error || "Erro ao carregar o questionário.");
      }

      const content =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply
          : "Você já tem um questionário pronto? (sim/não)";

      setSession(data.session ?? {});
      setCurrentField(data.currentField ?? data.nextField ?? "temQuestionario");
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: content.replace(/\(sim\/nao\)/gi, "(sim/não)"),
          sessionSnapshot: data.session ?? null,
        },
      ]);
      setFinished(Boolean(data?.completed === true));
    } catch (error) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Erro ao carregar o questionário.",
          sessionSnapshot: null,
        },
      ]);
      setFinished(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const answer = input.trim();
    if (!answer || loading || finished) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: answer,
      sessionSnapshot: session,
      fieldSnapshot: currentField,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agents/coletor-dados-six-box", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer,
          message: answer,
          currentField,
          session,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || data.error || "Erro ao processar a resposta.");
      }

      const reply =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply
          : typeof data.reportMarkdown === "string" && data.reportMarkdown.trim()
            ? data.reportMarkdown
            : "Resposta processada, mas sem conteúdo disponível.";

      setSession(data.session ?? {});
      setCurrentField(data.currentField ?? data.nextField ?? null);
      setFinished(Boolean(data?.completed === true));

      if (String(reply).trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply.replace(/\(sim\/nao\)/gi, "(sim/não)"),
            sessionSnapshot: data.session ?? null,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Erro ao processar a resposta.",
          sessionSnapshot: session,
        },
      ]);
      setFinished(false);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

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
      setSession(target.sessionSnapshot ?? session ?? null);

      return prev.filter((_, i) => i < index);
    });

    setFinished(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <StandardAgentLayout
      stackerName="Diagnóstico"
      title="Coletor de Dados Six Box"
      subtitle="Este agente disponibiliza ou melhora o questionário Six Box para aplicação e orienta como usar no Google Forms ou no respondi.app."
      messages={(finished ? [] : messages.filter((message) => String(message.content || "").trim() !== "")).map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        actions: message.role === "user" ? (
          <UserMessageActions
            onCopy={() => void copyMessage(message.content)}
            onEdit={() => editMessage(message.id)}
          />
        ) : undefined,
      }))}
      loading={loading}
      finished={finished}
      finishedMessage={finished ? "Relatório gerado com sucesso e disponível em Relatórios Stackers." : ""}
      inputValue={input}
      onInputChange={setInput}
      onSend={() => {
        void handleSend();
      }}
      onKeyDown={handleKeyDown}
      inputRef={inputRef}
      bottomRef={bottomRef}
      disableInput={finished || loading}
      disableSend={finished || loading || !input.trim()}
    />
  );
}
