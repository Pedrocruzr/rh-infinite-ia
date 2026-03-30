"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  CircleHelp,
  PlayCircle,
  Search,
  Sparkles,
} from "lucide-react";

import type { TutorialVideo, TutorialVideoPayload } from "@/lib/tutorial/types";
import { getYouTubeThumbnail, matchesSearch } from "@/lib/tutorial/utils";

interface TutorialPageClientProps {
  initialVideos: TutorialVideo[];
  adminEnabled: boolean;
}

const GUIDES = [
  {
    title: "Como acessar os agentes",
    content:
      "Entre na área Agentes, escolha a categoria desejada e clique no card do agente que resolve a tarefa que você quer executar.",
  },
  {
    title: "Como preencher os campos",
    content:
      "Preencha com contexto real, claro e completo. Quanto mais específico for o briefing, melhor tende a ser a resposta do agente.",
  },
  {
    title: "Como interpretar as respostas",
    content:
      "Use a saída como apoio de decisão. Leia estrutura, critérios, recomendações e pontos de atenção antes de aplicar no processo.",
  },
  {
    title: "Boas práticas de uso",
    content:
      "Evite prompts vagos, revise os dados antes de enviar e salve os outputs mais úteis para padronizar o trabalho do time.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Preciso preencher todos os campos?",
    answer:
      "Os campos obrigatórios devem ser preenchidos. Nos opcionais, vale colocar detalhes que melhorem a qualidade da resposta.",
  },
  {
    question: "Posso copiar a resposta do agente?",
    answer:
      "Sim. A resposta foi pensada para apoiar operação, análise e padronização do trabalho no RH.",
  },
  {
    question: "O tutorial trava meu uso do produto?",
    answer:
      "Não. O tutorial existe para reduzir atrito. Você pode consultar e voltar para os agentes quando quiser.",
  },
  {
    question: "Como saber qual agente usar?",
    answer:
      "Comece pela categoria, leia a descrição do card e escolha o agente mais alinhado ao problema que você quer resolver.",
  },
];

const EMPTY_FORM: TutorialVideoPayload = {
  title: "",
  description: "",
  youtube_url: "",
  is_published: true,
};

export function TutorialPageClient({
  initialVideos,
  adminEnabled,
}: TutorialPageClientProps) {
  const [search, setSearch] = useState("");
  const [videos, setVideos] = useState<TutorialVideo[]>(initialVideos);
  const [form, setForm] = useState<TutorialVideoPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredGuides = useMemo(
    () =>
      GUIDES.filter(
        (item) =>
          matchesSearch(item.title, search) || matchesSearch(item.content, search)
      ),
    [search]
  );

  const filteredFaq = useMemo(
    () =>
      FAQ_ITEMS.filter(
        (item) =>
          matchesSearch(item.question, search) || matchesSearch(item.answer, search)
      ),
    [search]
  );

  const filteredVideos = useMemo(
    () =>
      videos.filter(
        (video) =>
          matchesSearch(video.title, search) ||
          matchesSearch(video.description ?? "", search)
      ),
    [videos, search]
  );

  async function handleCreateVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/tutorial-videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao criar vídeo.");
      }

      setVideos((current) =>
        [...current, payload.data].sort((a, b) => a.sort_order - b.sort_order)
      );
      setForm(EMPTY_FORM);
      setSuccess("Vídeo cadastrado com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar vídeo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteVideo(id: string) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este vídeo?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/tutorial-videos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "Erro ao excluir vídeo.");
      }

      setVideos((current) => current.filter((video) => video.id !== id));
      setSuccess("Vídeo excluído com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir vídeo.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Central de aprendizado
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Tutorial
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Aprenda a acessar os agentes, preencher os campos, interpretar as respostas
              e usar melhor a plataforma.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                document.getElementById("tutorial-rapido")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
            >
              Ver tutorial rápido
            </button>

            <Link
              href="/app/agentes"
              className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950"
            >
              Ir para os agentes
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Tutorial rápido
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Guias curtos por assunto.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                <PlayCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Vídeos curtos
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Conteúdo visual para acelerar uso.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                <CircleHelp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  FAQ
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Respostas rápidas e objetivas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#102033]/72">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-100">Buscar por assunto</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex: interpretar respostas, preencher campos, vídeos..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
            />
          </div>
        </label>
      </section>

      <section id="tutorial-rapido" className="grid gap-4 md:grid-cols-2">
        {filteredGuides.map((item) => (
          <article key={item.title} className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#102033]/72">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.content}</p>
          </article>
        ))}

        {filteredGuides.length === 0 && (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white/85 p-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#102033]/72 dark:text-slate-400 md:col-span-2">
            Nenhum conteúdo rápido encontrado para essa busca.
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Vídeos curtos</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Conteúdo rápido para acelerar seu uso da plataforma sem depender de suporte repetitivo.
          </p>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            Nenhum vídeo encontrado.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => {
              const thumbnail = getYouTubeThumbnail(video.youtube_url);

              return (
                <article
                  key={video.id}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-slate-50/80 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5"
                >
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={video.title}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-muted text-sm text-muted-foreground">
                        
                        Thumbnail indisponível
                      </div>
                    )}
                  </a>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold leading-5">{video.title}</h3>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                          video.is_published
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                        }`}
                      >
                        {video.is_published ? "Publicado" : "Rascunho"}
                      </span>
                    </div>

                    {video.description ? (
                      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {video.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                      >
                        Ver no YouTube
                      </a>

                      {adminEnabled ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(video.id)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/30"
                        >
                          Excluir
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Respostas diretas para reduzir dúvidas repetidas no uso do produto.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredFaq.map((item) => (
            <article key={item.question} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <h3 className="font-medium text-slate-950 dark:text-white">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.answer}</p>
            </article>
          ))}

          {filteredFaq.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 md:col-span-2">
              Nenhuma pergunta frequente encontrada para essa busca.
            </div>
          )}
        </div>
      </section>

      {adminEnabled ? (
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              Modo admin
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Admin de vídeos</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Cadastre vídeos com título, descrição e link do YouTube. A thumbnail será gerada automaticamente.
            </p>
          </div>

          <form onSubmit={handleCreateVideo} className="grid gap-4 lg:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm lg:col-span-1">
              <span className="font-medium text-slate-800 dark:text-slate-100">Título</span>
              <input
                value={form.title ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Ex: Como preencher os campos do agente"
                className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm lg:col-span-1">
              <span className="font-medium text-slate-800 dark:text-slate-100">Link do YouTube</span>
              <input
                value={form.youtube_url ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, youtube_url: event.target.value }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm lg:col-span-2">
              <span className="font-medium text-slate-800 dark:text-slate-100">Descrição</span>
              <textarea
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Explique rapidamente o que o vídeo ensina."
                className="min-h-[120px] rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
              <input
                type="checkbox"
                checked={Boolean(form.is_published)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_published: event.target.checked,
                  }))
                }
              />
              <span>Publicar vídeo imediatamente</span>
            </label>

            <div className="lg:col-span-2 flex flex-col gap-3">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                  {success}
                </div>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  {submitting ? "Salvando..." : "Adicionar vídeo"}
                </button>
              </div>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
