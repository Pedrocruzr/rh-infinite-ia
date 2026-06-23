"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import UserMessageActions from "@/components/agents/user-message-actions";
import { ArrowLeft, Search, Send, Lock, Sparkles, ArrowRight } from "lucide-react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export default function CltIaPage() {
  const [planCode, setPlanCode] = useState<"start" | "perfil_comportamental">("perfil_comportamental");

  useEffect(() => {
    const savedPlan = sessionStorage.getItem("simulated_plan_code") as "start" | "perfil_comportamental";
    if (savedPlan) {
      setPlanCode(savedPlan);
    }
  }, []);

  const handleTogglePlan = (newPlan: "start" | "perfil_comportamental") => {
    setPlanCode(newPlan);
    sessionStorage.setItem("simulated_plan_code", newPlan);
  };

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

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

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

  if (planCode === "perfil_comportamental") {
    return (
      <main className="h-[100dvh] overflow-hidden bg-background text-foreground dark:bg-[#05070b] dark:text-[#f3f5f7]">
        <div className="mx-auto flex h-full max-w-[1320px] flex-col px-4 py-4 sm:px-6 sm:py-5">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm text-muted-foreground dark:text-[#8b97a7]">
                Stacker de Pesquisa
              </p>
              <h1 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.04em] dark:text-[#f7f8fa] sm:text-[38px]">
                CLT IA
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground dark:text-[#a8b3c2] sm:text-base">
                Motor de busca legislativa com base local da CLT. Responde com resumo fiel e artigo localizado.
              </p>
            </div>

            <Link
              href="/app/agentes"
              className="absolute right-0 top-0 rounded-2xl border border-border px-5 py-3 text-sm transition hover:bg-muted dark:border-[#202834] dark:bg-[#0c1118] dark:text-[#e8edf3] dark:hover:bg-[#131a23] sm:static"
            >
              Voltar
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-[#1e2733] dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Lock className="h-6 w-6" />
                </div>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  Recurso Bloqueado
                </div>

                <h2 className="mt-6 text-2xl font-bold tracking-tight leading-tight text-slate-900 dark:text-white sm:text-3xl">
                  Desbloqueie o CLT IA
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Sua assinatura atual dá acesso exclusivo ao <strong>Teste de Perfil Comportamental</strong>.
                  <br />
                  Atualize seu plano para liberar o CLT IA e todos os outros robôs de inteligência artificial da plataforma!
                </p>

                <div className="mt-6 w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-white/5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Plano Completo</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">R$ 197<span className="text-lg font-medium text-slate-500">/mês</span></p>
                  <p className="mt-1 text-xs text-sky-600 dark:text-sky-300 font-semibold">Garante 120 créditos mensais</p>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3">
                  <a
                    href="https://checkout.asaas.com/..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-500 hover:shadow-sky-500/35"
                  >
                    Desbloquear Atualizando o Plano
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simulador de Assinatura Local */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Simulador de Assinatura (Local)</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleTogglePlan("perfil_comportamental")}
                className="rounded-lg px-3 py-1 text-xs font-semibold transition bg-amber-500 text-white"
              >
                Individual (R$ 67,90)
              </button>
              <button 
                onClick={() => handleTogglePlan("start")}
                className="rounded-lg px-3 py-1 text-xs font-semibold transition bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"
              >
                Completo (R$ 197)
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-background text-foreground dark:bg-[#05070b] dark:text-[#f3f5f7]">
      <div className="mx-auto flex h-full max-w-[1320px] flex-col px-4 py-4 sm:px-6 sm:py-5">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm text-muted-foreground dark:text-[#8b97a7]">
              Stacker de Pesquisa
            </p>
            <h1 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.04em] dark:text-[#f7f8fa] sm:text-[38px]">
              CLT IA
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground dark:text-[#a8b3c2] sm:text-base">
              Motor de busca legislativa com base local da CLT. Responde com resumo fiel e artigo localizado.
            </p>
          </div>

          <Link
            href="/app/agentes"
            className="absolute right-0 top-0 rounded-2xl border border-border px-5 py-3 text-sm transition hover:bg-muted dark:border-[#202834] dark:bg-[#0c1118] dark:text-[#e8edf3] dark:hover:bg-[#131a23] sm:static"
          >
            Voltar
          </Link>
        </div>

        <div className="mt-4">
          <div className="inline-flex max-w-full rounded-2xl border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-[#7a4a00] dark:bg-[#231500] dark:text-[#f0c56b] sm:px-5">
            Base local versionada da CLT. Use termos como artigo, rescisão, horas extras, férias, CTPS ou salário.
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto py-5 sm:py-6">
            <div className="mx-auto flex min-h-full max-w-[980px] flex-col justify-center">
              <div className="space-y-6">
                {layoutMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex w-full ${message.role === "assistant" ? "justify-center" : "justify-end"}`}
                  >
                    <div className={message.role === "assistant" ? "w-full" : "max-w-[78%]"}>
                      {message.id === "intro" ? (
                        <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center sm:px-8">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 text-[#d9dee5]">
                            <Search className="h-6 w-6" />
                          </div>
                          <h2 className="mt-6 text-base font-medium text-black dark:text-[#f3f5f7] sm:text-[18px]">
                            CLT IA
                          </h2>
                          <p className="mt-3 text-sm leading-7 text-[#8f98a6] sm:text-[15px]">
                            CLT IA pronto. Digite um tema, artigo ou dúvida. Exemplo: prazo de pagamento de rescisão, art. 477, horas extras, férias, CTPS.
                          </p>
                        </div>
                      ) : (
                        <div
                          className={`select-text rounded-[30px] px-5 py-5 text-base leading-8 shadow-sm sm:px-8 sm:py-6 sm:text-[18px] sm:leading-9 ${
                            message.role === "assistant"
                              ? "w-full border border-border bg-card text-foreground dark:border-[#1e2733] dark:bg-[#102033]/82 dark:text-[#edf2f7]"
                              : "bg-neutral-950 text-white dark:bg-[#102033]/88 dark:text-[#f3f5f7]"
                          }`}
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {message.content}
                        </div>
                      )}

                      {message.actions ? (
                        <div className={`mt-3 flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                          {message.actions}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                {loading ? (
                  <div className="flex w-full justify-center">
                    <div className="w-full rounded-[30px] border border-border bg-card px-5 py-5 text-sm text-muted-foreground shadow-sm dark:border-[#1e2733] dark:bg-[#102033]/82 dark:text-[#9ba8b8] sm:px-8 sm:py-6">
                      Digitando...
                    </div>
                  </div>
                ) : null}

                <div ref={bottomRef} />
              </div>
            </div>
          </div>

          <div className="pb-1 pt-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
              className="flex items-end gap-3"
            >
              <textarea
                ref={inputRef}
                autoFocus
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escreva sua pergunta..."
                disabled={loading}
                rows={1}
                className="w-full resize-y overflow-hidden rounded-[28px] border border-border bg-card px-4 py-4 text-base outline-none transition focus:border-neutral-900 dark:border-[#202834] dark:bg-[#102033]/88 dark:text-[#f3f5f7] dark:placeholder:text-[#7f8b99] dark:focus:border-[#3b4b61] disabled:bg-muted dark:disabled:bg-[#10161d] sm:px-5 sm:text-lg"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-border bg-card text-foreground transition hover:opacity-90 disabled:opacity-50 dark:border-[#202834] dark:bg-[#102033]/88 dark:text-[#f3f5f7] sm:h-[62px] sm:w-[62px]"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Simulador de Assinatura Local */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Simulador de Assinatura (Local)</p>
          <div className="flex gap-2">
            <button 
              onClick={() => handleTogglePlan("perfil_comportamental")}
              className="rounded-lg px-3 py-1 text-xs font-semibold transition bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"
            >
              Individual (R$ 67,90)
            </button>
            <button 
              onClick={() => handleTogglePlan("start")}
              className="rounded-lg px-3 py-1 text-xs font-semibold transition bg-sky-600 text-white"
            >
              Completo (R$ 197)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
