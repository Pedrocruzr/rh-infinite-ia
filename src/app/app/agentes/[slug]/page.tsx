import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AgentWorkspaceClient } from "@/components/agents/agent-workspace-client";
import { agentsCatalog } from "@/lib/catalog/agents";

interface AgentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { slug } = await params;

  const agent = agentsCatalog.find((item) => item.slug === slug);

  if (!agent) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_22%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#020817_0%,#07111f_100%)] dark:text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 md:px-8 md:py-10">
        <Link
          href="/app/agentes"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para agentes
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_24px_80px_rgba(15,23,42,0.32)]">
          <div className="grid gap-0 xl:grid-cols-[360px_1fr]">
            <div className="relative min-h-[320px] overflow-hidden">
              <Image
                src={agent.image}
                alt={agent.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 360px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.5))]" />
            </div>

            <div className="p-8 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200">
                <Sparkles className="h-3.5 w-3.5" />
                {agent.category}
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                {agent.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                {agent.shortDescription}
              </p>
              <div className="mt-8 grid gap-3 md:grid-cols-3">
                <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Execução</p>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Fluxo conectado</p>
                </div>
                <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Saída</p>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Resultado em tempo real</p>
                </div>
                <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Rota</p>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Página dinâmica ativa</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AgentWorkspaceClient agent={agent} />
      </section>
    </main>
  );
}
