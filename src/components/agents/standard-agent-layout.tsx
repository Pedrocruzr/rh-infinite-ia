"use client";

import Link from "next/link";
import { Fragment, useEffect } from "react";
import type { ReactNode, KeyboardEventHandler, RefObject } from "react";
import { Send, Search } from "lucide-react";

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
  headerExtra?: ReactNode;
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

const AGENT_IMAGE_BY_TITLE: Record<string, string> = {
  "Analista Diagnóstico Six Box": "/agents/analista-diagnostico-six-box.png",
  "Analista Fit Cultural": "/agents/analista-fit-cultura.png",
  "Analista de PDI": "/agents/analista-pdi.png",
  "Custo de Contratação": "/agents/custo-contratacao.png",
  "Descrição de Cargo por Competência": "/agents/descricao-cargo-competencia.png",
  "Desligamento Humanizado": "/agents/desligamento-humanizado.png",
  "Entrevistador Automatizado": "/agents/entrevistador-automatizado.png",
  "Mapeamento de Competências": "/agents/mapeamento-competencias.png",
  "Mentor de Dinâmicas": "/agents/mentor-dinamicas.png",
  "Onboarding Estratégico": "/agents/onboarding-estrategico.png",
  "Parecer Técnico de Entrevista": "/agents/parecer-tecnico-entrevista.png",
  "Pesquisa de Clima Organizacional": "/agents/pesquisa-clima-organizacional.png",
  "Taxa de Aderência com a Vaga": "/agents/taxa-aderencia-vaga.png",
  "Taxa de Produtividade por Colaborador": "/agents/taxa-produtividade-colaborador.png",
  "Teste de Perfil Comportamental": "/agents/teste-perfil-comportamental.png",
  "Teste de Perfil DISC": "/agents/teste-perfil-disc.png",
  "Agente Teste Big Five": "/agents/analista-bigfive-light.png",
};

function renderFormattedAssistantContent(content: string) {
  const normalized = content.replace(/\s+-\s+/g, "\n- ").trim();
  const blocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const bulletStartIndex = lines.findIndex((line) => line.startsWith("- "));
    const hasBullets = bulletStartIndex >= 0;

    if (!hasBullets) {
      return (
        <p key={`paragraph-${blockIndex}`} className="whitespace-pre-wrap">
          {block}
        </p>
      );
    }

    const introLines = lines.slice(0, bulletStartIndex);
    const bulletLines = lines.slice(bulletStartIndex);

    return (
      <Fragment key={`block-${blockIndex}`}>
        {introLines.length ? (
          <p className="whitespace-pre-wrap">{introLines.join(" ")}</p>
        ) : null}
        <ul className="mt-4 list-inside space-y-2 pl-0 text-left">
          {bulletLines.map((line, lineIndex) => (
            <li key={`bullet-${blockIndex}-${lineIndex}`} className="list-disc">
              {line.replace(/^- /, "").trim().replace(/;$/, "")}
            </li>
          ))}
        </ul>
      </Fragment>
    );
  });
}

function hasBulletLikeContent(content: string) {
  return /\s-\s|(?:^|\n)-\s/.test(content);
}

export default function StandardAgentLayout({
  backHref = "/app/agentes",
  stackerName,
  title,
  subtitle,
  retentionNotice = "Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.",
  panelTopSpacingClass = "mt-5",
  headerExtra,
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
  const initialAssistantId = messages.find((message) => message.role === "assistant")?.id;
  const hasUserMessages = messages.some((message) => message.role === "user");
  const agentImageSrc = AGENT_IMAGE_BY_TITLE[title] ?? null;

  useEffect(() => {
    const textarea = inputRef?.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const maxH = 360;
    const newH = Math.min(textarea.scrollHeight, maxH);
    textarea.style.height = `${newH}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxH ? "auto" : "hidden";
  }, [inputRef, inputValue]);

  return (
    <main className="h-[100dvh] overflow-hidden bg-background text-foreground dark:bg-[#05070b] dark:text-[#f3f5f7]">
      <div className="mx-auto flex h-full max-w-[1320px] flex-col px-4 py-4 sm:px-6 sm:py-5">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground dark:text-[#8b97a7]">{`Stacker de ${stackerName}`}</p>
            <h1 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.04em] dark:text-[#f7f8fa] sm:text-[38px]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground dark:text-[#a8b3c2] sm:text-base">
              {subtitle}
            </p>
          </div>

          <div className="absolute right-0 top-0 flex items-center gap-2 sm:static">
            {headerExtra}
            <Link
              href={backHref}
              className="rounded-2xl border border-border px-5 py-3 text-sm transition hover:bg-muted dark:border-[#202834] dark:bg-[#0c1118] dark:text-[#e8edf3] dark:hover:bg-[#131a23]"
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <div className="inline-flex max-w-full rounded-2xl border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-[#7a4a00] dark:bg-[#231500] dark:text-[#f0c56b] sm:px-5">
            {retentionNotice}
          </div>
        </div>

        <div className={`flex min-h-0 flex-1 flex-col ${panelTopSpacingClass}`}>
          <div className="flex-1 overflow-y-auto py-5 sm:py-6">
            <div className="mx-auto flex min-h-full max-w-[980px] flex-col justify-center">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex w-full ${message.role === "assistant" ? "justify-center" : "justify-end"}`}
                  >
                    <div className={message.role === "assistant" ? "w-full" : "max-w-[78%]"}>
                      {message.role === "assistant" &&
                      message.id === initialAssistantId &&
                      !hasUserMessages &&
                      !finished ? (
                        <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center sm:px-8">
                          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#10161d] text-[#d9dee5]">
                            {agentImageSrc ? (
                              <img
                                src={agentImageSrc}
                                alt={title}
                                className="h-full w-full object-cover"
                                draggable={false}
                              />
                            ) : (
                              <Search className="h-6 w-6" />
                            )}
                          </div>
                          <h2 className="mt-6 text-base font-medium text-black dark:text-[#f3f5f7] sm:text-[18px]">
                            {title}
                          </h2>
                          <div
                            className={`mx-auto mt-3 max-w-[760px] space-y-4 text-sm leading-7 text-[#8f98a6] sm:text-[15px] ${
                              hasBulletLikeContent(message.content) ? "text-left" : "text-center"
                            }`}
                          >
                            {renderFormattedAssistantContent(message.content)}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`select-text rounded-[30px] px-5 py-5 text-base leading-8 shadow-sm sm:px-8 sm:py-6 sm:text-[18px] sm:leading-9 ${
                            message.role === "assistant"
                              ? "w-full border border-border bg-card text-foreground dark:border-[#1e2733] dark:bg-[#102033]/82 dark:text-[#edf2f7]"
                              : "bg-neutral-950 text-white dark:bg-[#102033]/88 dark:text-[#f3f5f7]"
                          }`}
                        >
                          {message.role === "assistant" ? (
                            <div className="space-y-4 text-left">
                              {renderFormattedAssistantContent(message.content)}
                            </div>
                          ) : (
                            <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
                          )}
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

                {finished && finishedMessage ? (
                  <div className="flex w-full justify-center">
                    <div className="w-full rounded-[30px] border border-border bg-card px-5 py-5 text-sm text-muted-foreground shadow-sm dark:border-[#1e2733] dark:bg-[#102033]/82 dark:text-[#9ba8b8] sm:px-8 sm:py-6">
                      {finishedMessage}
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
                onSend();
              }}
              className="flex items-end gap-3"
            >
              <textarea
                ref={inputRef}
                autoFocus
                value={inputValue}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={finished ? "Avaliação concluída." : inputPlaceholder}
                disabled={disableInput || finished}
                rows={1}
                className="w-full resize-none overflow-hidden rounded-[28px] border border-border bg-card px-4 py-4 text-base outline-none transition focus:border-neutral-900 dark:border-[#202834] dark:bg-[#102033]/88 dark:text-[#f3f5f7] dark:placeholder:text-[#7f8b99] dark:focus:border-[#3b4b61] disabled:bg-muted dark:disabled:bg-[#10161d] sm:px-5 sm:text-lg"
              />

              <button
                type="submit"
                disabled={disableSend || finished}
                className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-border bg-card text-foreground transition hover:opacity-90 disabled:opacity-50 dark:border-[#202834] dark:bg-[#102033]/88 dark:text-[#f3f5f7] sm:h-[62px] sm:w-[62px]"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
          </div>
      </div>
    </main>
  );
}
