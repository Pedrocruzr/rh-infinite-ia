"use client";

import Link from "next/link";
import type { ReactNode, KeyboardEventHandler, RefObject } from "react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  actions?: ReactNode;
};

type StandardAgentLayoutProps = {
  backHref?: string;
  stackerName: string;
  title: string;
  subtitle: string;
  retentionNotice?: string;
  panelTopSpacingClass?: string;
  messages: Message[];
  loading?: boolean;
  finished?: boolean;
  finishedMessage?: string;
  inputValue: string;
  inputPlaceholder?: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  bottomRef?: RefObject<HTMLDivElement | null>;
  disableInput?: boolean;
  disableSend?: boolean;
};

export default function StandardAgentLayout({
  backHref = "/app/agentes",
  stackerName,
  title,
  subtitle,
  retentionNotice = "Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
  panelTopSpacingClass = "mt-5",
  messages,
  loading = false,
  finished = false,
  finishedMessage = "Relatório gerado com sucesso e disponível em Relatórios Stackers.",
  inputValue,
  inputPlaceholder = "Digite sua resposta aqui...",
  onInputChange,
  onSend,
  onKeyDown,
  inputRef,
  bottomRef,
  disableInput = false,
  disableSend = false,
}: StandardAgentLayoutProps) {
  return (
    <main className="h-[100dvh] overflow-hidden bg-background text-foreground dark:bg-[#05070b] dark:text-[#f3f5f7]">
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground dark:text-[#8b97a7]">{`Stacker de ${stackerName}`}</p>
            <h1 className="text-5xl font-semibold tracking-tight dark:text-[#f7f8fa]">{title}</h1>
            <p className="mt-3 text-lg text-muted-foreground dark:text-[#a8b3c2]">{subtitle}</p>
          </div>

          <Link
            href={backHref}
            className="rounded-2xl border border-border px-5 py-3 text-sm transition hover:bg-muted dark:border-[#202834] dark:bg-[#0c1118] dark:text-[#e8edf3] dark:hover:bg-[#131a23]"
          >
            Voltar
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300/50 bg-amber-500/10 px-5 py-3 text-sm leading-6 text-amber-900 dark:border-[#7a4a00] dark:bg-[#231500] dark:text-[#f0c56b]">
          {retentionNotice}
        </div>

        <div className={`${panelTopSpacingClass} rounded-[36px] border border-border bg-muted/30 p-5 dark:border-[#1a222d] dark:bg-[#0b1016]`}>
          <div className="mx-auto flex h-[calc(100dvh-300px)] min-h-[480px] max-h-[620px] max-w-5xl flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex w-full ${message.role === "assistant" ? "justify-center" : "justify-end"}`}
                >
                  <div className={message.role === "assistant" ? "w-full" : "max-w-[78%]"}>
                    <div
                      className={`select-text rounded-[32px] px-8 py-6 text-[18px] leading-9 shadow-sm ${
                        message.role === "assistant"
                          ? "w-full border border-border bg-card text-foreground dark:border-[#1e2733] dark:bg-[#0f151d] dark:text-[#edf2f7]"
                          : "bg-neutral-950 text-white dark:bg-[#f3f5f7] dark:text-[#0b1016]"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {message.content}
                    </div>

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
                  <div className="w-full rounded-[32px] border border-border bg-card px-8 py-6 text-sm text-muted-foreground shadow-sm dark:border-[#1e2733] dark:bg-[#0f151d] dark:text-[#9ba8b8]">
                    Digitando...
                  </div>
                </div>
              ) : null}

              {finished ? (
                <div className="flex w-full justify-center">
                  <div className="w-full rounded-[32px] border border-border bg-card px-8 py-6 text-sm text-muted-foreground shadow-sm dark:border-[#1e2733] dark:bg-[#0f151d] dark:text-[#9ba8b8]">
                    {finishedMessage}
                  </div>
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>

            <div className="mt-4 border-t border-border pt-4 dark:border-[#1a222d]">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  onSend();
                }}
                className="space-y-4"
              >
                <textarea
                  ref={inputRef}
                  autoFocus
                  value={inputValue}
                  onChange={(event) => onInputChange(event.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={finished ? "Avaliação concluída." : inputPlaceholder}
                  disabled={disableInput || finished}
                  rows={3}
                  className="w-full rounded-[28px] border border-border bg-card px-5 py-4 text-lg outline-none transition focus:border-neutral-900 dark:border-[#202834] dark:bg-[#0f151d] dark:text-[#f3f5f7] dark:placeholder:text-[#7f8b99] dark:focus:border-[#3b4b61] disabled:bg-muted dark:disabled:bg-[#10161d]"
                />

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground dark:text-[#8b97a7]">
                    Enter envia · Shift+Enter quebra linha
                  </p>

                  <button
                    type="submit"
                    disabled={disableSend || finished}
                    className="rounded-[24px] bg-black px-7 py-4 text-lg text-white transition hover:opacity-90 disabled:opacity-50 dark:bg-[#f3f5f7] dark:text-[#0b1016]"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
