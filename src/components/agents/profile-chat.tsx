"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import UserMessageActions from "@/components/agents/user-message-actions";

type ClosedOption = {
  id: string;
  label: string;
  value: string;
};

type QuestionKind = "text" | "single_choice";

type ProfileField =
  | "nome"
  | "vaga"
  | "competenciasPrincipais"
  | "discResposta"
  | "motivacao"
  | "competenciaExemplo1"
  | "competenciaExemplo2"
  | "competenciaExemplo3";

type ProfileSession = {
  assessmentId?: string;
  nome?: string;
  vaga?: string;
  competenciasPrincipais?: string[];
  discResposta?: string;
  motivacao?: string;
  competenciaExemplo1?: string;
  competenciaExemplo2?: string;
  competenciaExemplo3?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type FlowQuestion = {
  field: ProfileField;
  kind: QuestionKind;
  question: string;
  options?: ClosedOption[];
};

type ApiResponse = {
  session: ProfileSession;
  done: boolean;
  reply: string;
  nextQuestion: FlowQuestion | null;
  error?: string;
};

type ChatMessage = {
  id: string;
  role: "agent" | "candidate";
  content: string;
  sessionSnapshot?: ProfileSession | null;
  questionSnapshot?: FlowQuestion | null;
};

const FIRST_QUESTION: FlowQuestion = {
  field: "nome",
  kind: "text",
  question: "Para começarmos, qual é o seu nome completo?",
};

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export default function ProfileChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-agent-message",
      role: "agent",
      content: FIRST_QUESTION.question,
    },
  ]);
  const [session, setSession] = useState<ProfileSession>({
    status: "in_progress",
    reportStatus: "pending",
  });
  const [currentQuestion, setCurrentQuestion] = useState<FlowQuestion | null>(FIRST_QUESTION);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
      if (target.role !== "candidate") return prev;

      setSession(target.sessionSnapshot ?? { status: "in_progress", reportStatus: "pending" });
      setCurrentQuestion(target.questionSnapshot ?? FIRST_QUESTION);
      setFinished(false);

      if (target.questionSnapshot?.kind === "text") {
        setInput(target.content);
      } else {
        setInput("");
      }

      return prev.slice(0, index);
    });
  }

  async function sendAnswer(rawAnswer?: string) {
    const answer = (rawAnswer ?? input).trim();

    if (!answer || !currentQuestion || loading || finished) {
      return;
    }

    const candidateMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "candidate",
      content: answer,
      sessionSnapshot: cloneValue(session),
      questionSnapshot: cloneValue(currentQuestion),
    };

    setMessages((prev) => [...prev, candidateMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agents/teste-perfil-comportamental", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session,
          currentField: currentQuestion.field,
          answer,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar resposta.");
      }

      setSession(data.session);
      setCurrentQuestion(data.nextQuestion);
      setFinished(Boolean(data.done));

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content:
            error instanceof Error
              ? `Erro ao processar sua resposta: ${error.message}`
              : "Houve um erro ao processar sua resposta. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">Comportamento</p>
            <h1 className="text-5xl font-semibold tracking-tight">
              Teste de Perfil Comportamental
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              Responda uma pergunta por vez. Ao final, suas respostas ficarão disponíveis para análise do recrutador.
            </p>
          </div>

          <Link
            href="/app/agentes"
            className="rounded-2xl border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-50"
          >
            Voltar
          </Link>
        </div>

        <div className="rounded-[36px] border border-neutral-200 bg-neutral-50/40 p-6">
          <div className="mx-auto flex h-[72vh] max-w-5xl flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "agent" ? "justify-start" : "justify-end"}`}
                >
                  <div className="max-w-[78%]">
                    <div
                      className={`rounded-[32px] px-8 py-6 text-[18px] leading-9 shadow-sm ${
                        message.role === "agent"
                          ? "border border-neutral-200 bg-white text-neutral-900"
                          : "bg-neutral-950 text-white"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {message.content}
                    </div>

                    {message.role === "candidate" && (
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

            <div className="mt-6 border-t border-neutral-200 pt-6">
              {currentQuestion?.kind === "single_choice" && !finished ? (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-500">
                    Escolha uma opção para continuar:
                  </p>

                  <div className="grid gap-3">
                    {(currentQuestion.options ?? []).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => void sendAnswer(option.value)}
                        disabled={loading}
                        className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-left text-sm leading-7 hover:border-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
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
                    rows={4}
                    className="w-full rounded-[28px] border border-neutral-300 bg-white px-5 py-4 text-lg outline-none focus:border-neutral-900 disabled:bg-neutral-100"
                  />

                  <div className="flex items-center justify-end gap-4">
                    <button
                      type="submit"
                      disabled={loading || finished || !input.trim()}
                      className="rounded-[24px] bg-black px-7 py-4 text-lg text-white disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              )}

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
