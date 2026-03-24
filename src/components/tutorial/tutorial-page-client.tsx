"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Tutorial</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
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
              className="rounded-xl border px-4 py-2 text-sm transition hover:bg-muted"
            >
              Ver tutorial rápido
            </button>

            <Link
              href="/app/agentes"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Ir para os agentes
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Buscar por assunto</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ex: interpretar respostas, preencher campos, vídeos..."
            className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
          />
        </label>
      </section>

      <section id="tutorial-rapido" className="grid gap-4 md:grid-cols-2">
        {filteredGuides.map((item) => (
          <article key={item.title} className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.content}</p>
          </article>
        ))}

        {filteredGuides.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-card p-5 text-sm text-muted-foreground md:col-span-2">
            Nenhum conteúdo rápido encontrado para essa busca.
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Vídeos curtos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Conteúdo rápido para acelerar seu uso da plataforma sem depender de suporte repetitivo.
          </p>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
            Nenhum vídeo encontrado.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => {
              const thumbnail = getYouTubeThumbnail(video.youtube_url);

              return (
                <article
                  key={video.id}
                  className="overflow-hidden rounded-2xl border bg-background shadow-sm"
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
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {video.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border px-3 py-2 text-sm transition hover:bg-muted"
                      >
                        Ver no YouTube
                      </a>

                      {adminEnabled ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(video.id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/30"
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

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Respostas diretas para reduzir dúvidas repetidas no uso do produto.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredFaq.map((item) => (
            <article key={item.question} className="rounded-2xl border bg-background p-4">
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </article>
          ))}

          {filteredFaq.length === 0 && (
            <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground md:col-span-2">
              Nenhuma pergunta frequente encontrada para essa busca.
            </div>
          )}
        </div>
      </section>

      {adminEnabled ? (
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Admin de vídeos</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre vídeos com título, descrição e link do YouTube. A thumbnail será gerada automaticamente.
            </p>
          </div>

          <form onSubmit={handleCreateVideo} className="grid gap-4 lg:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm lg:col-span-1">
              <span className="font-medium">Título</span>
              <input
                value={form.title ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Ex: Como preencher os campos do agente"
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm lg:col-span-1">
              <span className="font-medium">Link do YouTube</span>
              <input
                value={form.youtube_url ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, youtube_url: event.target.value }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm lg:col-span-2">
              <span className="font-medium">Descrição</span>
              <textarea
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Explique rapidamente o que o vídeo ensina."
                className="min-h-[120px] rounded-xl border bg-background px-3 py-3 outline-none transition focus:border-primary"
              />
            </label>

            <label className="flex items-center gap-3 text-sm">
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
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
