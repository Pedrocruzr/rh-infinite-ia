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
  finishedMessage = "Relatório gerado com sucesso e disponível em Avaliações recebidas.",
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
    <main className="h-[100dvh] overflow-hidden bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">{`Stacker de ${stackerName}`}</p>
            <h1 className="text-5xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-3 text-lg text-neutral-600">{subtitle}</p>
          </div>

          <Link
            href={backHref}
            className="rounded-2xl border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-50"
          >
            Voltar
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm leading-6 text-amber-900">
          {retentionNotice}
        </div>

        <div className={`${panelTopSpacingClass} rounded-[36px] border border-neutral-200 bg-neutral-50/40 p-5`}>
          <div className="mx-auto flex h-[calc(100dvh-300px)] min-h-[480px] max-h-[620px] max-w-5xl flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex w-full ${message.role === "assistant" ? "justify-center" : "justify-end"}`}
                >
                  <div className={message.role === "assistant" ? "w-full" : "max-w-[78%]"}>
                    <div
                      className={`rounded-[32px] px-8 py-6 text-[18px] leading-9 shadow-sm ${
                        message.role === "assistant"
                          ? "w-full border border-neutral-200 bg-white text-neutral-900"
                          : "bg-neutral-950 text-white"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {message.content}
                    </div>

                    {message.role === "user" && message.actions ? (
                      <div className="mt-2">{message.actions}</div>
                    ) : null}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex w-full justify-center">
                  <div className="w-full rounded-[32px] border border-neutral-200 bg-white px-8 py-6 text-sm text-neutral-500 shadow-sm">
                    Digitando...
                  </div>
                </div>
              )}

              {finished && (
                <div className="flex w-full justify-center">
                  <div className="w-full rounded-[32px] border border-neutral-200 bg-white px-8 py-6 text-sm text-neutral-700 shadow-sm">
                    {finishedMessage}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="mt-4 border-t border-neutral-200 pt-4">
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
                  className="w-full rounded-[28px] border border-neutral-300 bg-white px-5 py-4 text-lg outline-none focus:border-neutral-900 disabled:bg-neutral-100"
                />

                <div className="flex items-center justify-end gap-4">
                  <button
                    type="submit"
                    disabled={disableSend || finished}
                    className="rounded-[24px] bg-black px-7 py-4 text-lg text-white disabled:opacity-50"
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
