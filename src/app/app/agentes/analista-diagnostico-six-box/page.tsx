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

export default function AnalistaDiagnosticoSixBoxPage() {
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

      const response = await fetch("/api/agents/analista-diagnostico-six-box", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentField: "start", session: {} }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reply || data.error || "Erro ao carregar o agente.");
      }

      const content =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply
          : "";

      setSession(data.session ?? {});
      setCurrentField(data.currentField ?? data.nextField ?? "uploadArquivos");
      setFinished(Boolean(data?.completed === true));

      if (content.trim()) {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content,
            sessionSnapshot: data.session ?? null,
          fieldSnapshot: data.currentField ?? data.nextField ?? null,
          },
        ]);
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Erro ao carregar o agente.",
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
      const response = await fetch("/api/agents/analista-diagnostico-six-box", {
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

      const completed = Boolean(data?.completed === true);

      setSession(data.session ?? {});
      setCurrentField(data.currentField ?? data.nextField ?? null);
      setFinished(completed);

      const reply =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply
          : "";

      if (!completed && reply.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: reply,
            sessionSnapshot: data.session ?? null,
          fieldSnapshot: data.currentField ?? data.nextField ?? null,
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
          fieldSnapshot: currentField,
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
      setCurrentField(target.fieldSnapshot ?? currentField ?? null);

      return prev.filter((_, i) => i < index);
    });

    setFinished(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }


  return (
    <StandardAgentLayout
      stackerName="Diagnóstico"
      title="Analista Diagnóstico Six Box"
      subtitle="Responda uma pergunta por vez. Ao final, o diagnóstico ficará disponível em Relatórios Stackers."
      messages={
        (finished
          ? []
          : messages.filter((message) => String(message.content || "").trim() !== "")
        ).map((message) => ({
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
        }))
      }
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
