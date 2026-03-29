import Link from "next/link";
import { ArrowRight, Bot, Layers3, Sparkles } from "lucide-react";
import { agents } from "@/lib/agents";

const SECTION_CONFIG = [
  {
    title: "Stacker de Diagnóstico",
    subtitle: "Empilha leitura de cenário antes de qualquer ação.",
    slugs: [
      "coletor-dados-six-box",
      "analista-diagnostico-six-box",
      "pesquisa-clima-organizacional",
      "taxa-produtividade-colaborador",
      "custo-contratacao",
    ],
  },
  {
    title: "Stacker de Critérios",
    subtitle: "Empilha os parâmetros certos antes da seleção.",
    slugs: [
      "mapeamento-competencias",
      "analista-fit-cultural",
      "descricao-cargo-competencia",
    ],
  },
  {
    title: "Stacker de Recrutamento & Seleção",
    subtitle: "Empilha evidências antes da decisão de contratação.",
    slugs: [
      "entrevistador-automatizado",
      "mentor-dinamicas",
      "teste-perfil-comportamental",
      "teste-perfil-disc",
      "taxa-aderencia-vaga",
      "parecer-tecnico-entrevista",
    ],
  },
  {
    title: "Stacker de Desenvolvimento",
    subtitle: "Empilha integração e evolução após a entrada.",
    slugs: [
      "onboarding-estrategico",
      "analista-pdi",
    ],
  },
  {
    title: "Stacker de Encerramento",
    subtitle: "Empilha clareza, proteção e humanização no desligamento.",
    slugs: [
      "desligamento-humanizado",
    ],
  },
] as const;

const TITLE_OVERRIDES: Record<string, string> = {
  "coletor-dados-six-box": "Coletor de Dados Six Box",
  "analista-diagnostico-six-box": "Analista de Diagnóstico Six Box",
  "pesquisa-clima-organizacional": "Analista de Pesquisa de Clima",
  "taxa-produtividade-colaborador": "Analista de Taxa de Produtividade por Colaborador",
  "custo-contratacao": "Analista de Custo por Contratação",
  "mapeamento-competencias": "Agente de Mapeamento de Competências",
  "analista-fit-cultural": "Analista de Fit Cultural",
  "descricao-cargo-competencia": "Criador de Descrição de Cargo por Competência",
  "entrevistador-automatizado": "Entrevistador Automatizado",
  "mentor-dinamicas": "Mentor de Dinâmicas",
  "teste-perfil-comportamental": "Teste de Perfil Comportamental",
  "teste-perfil-disc": "DISC",
  "taxa-aderencia-vaga": "Especialista em Taxa de Aderência com a Vaga",
  "parecer-tecnico-entrevista": "Especialista em Parecer Técnico de Entrevista",
  "onboarding-estrategico": "Onboarding Estratégico",
  "analista-pdi": "Analista de Plano de Desenvolvimento",
  "desligamento-humanizado": "Desligamento Humanizado",
};

function getAgentsBySlugs(slugs: readonly string[]) {
  return slugs
    .map((slug) => agents.find((agent) => agent.slug === slug))
    .filter(Boolean);
}

export default function AgentesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_22%),linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_100%)] px-6 py-8 text-foreground dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#020817_0%,#07111f_100%)] md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_24px_80px_rgba(15,23,42,0.32)] md:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200">
                <Sparkles className="h-3.5 w-3.5" />
                Central de agentes
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white md:text-5xl">
                Stackers Agents
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                Agentes organizados por stack de decisão para estruturar, selecionar, desenvolver e encerrar com mais clareza.
              </p>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/5">
                  <Bot className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                  <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">Catálogo central</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Acesso rápido aos agentes já ativos no produto.</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/5">
                  <Layers3 className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                  <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">Stacks por etapa</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Diagnóstico, critérios, seleção, desenvolvimento e encerramento.</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/5">
                  <ArrowRight className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                  <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">Navegação direta</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Cada card leva direto para a execução do agente correspondente.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50/80 p-6 dark:border-white/8 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Resumo</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-slate-200/80 bg-white p-4 dark:border-white/8 dark:bg-slate-950/60">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Stacks</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{SECTION_CONFIG.length}</p>
                </div>
                <div className="rounded-[1.35rem] border border-slate-200/80 bg-white p-4 dark:border-white/8 dark:bg-slate-950/60">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Agentes mapeados</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{agents.length}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                A operação continua com a mesma lógica atual. Aqui estamos apenas reorganizando a apresentação para facilitar leitura, prioridade e entrada nos agentes.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 space-y-12">
          {SECTION_CONFIG.map((section) => {
            const sectionAgents = getAgentsBySlugs(section.slugs);

            if (!sectionAgents.length) return null;

            return (
              <section key={section.title}>
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
                    Stack operacional
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                    {section.subtitle}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {sectionAgents.map((agent) => (
                    <Link
                      key={agent!.slug}
                      href={`/app/agentes/${agent!.slug}`}
                      className="group rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_24px_60px_rgba(14,165,233,0.12)] dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[0_18px_50px_rgba(15,23,42,0.18)] dark:hover:border-sky-400/30 dark:hover:shadow-[0_24px_60px_rgba(14,165,233,0.12)]"
                    >
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {agent!.category}
                      </p>

                      <h3 className="mt-3 text-2xl font-semibold leading-tight text-slate-950 dark:text-white">
                        {TITLE_OVERRIDES[agent!.slug] ?? agent!.name}
                      </h3>

                      <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">
                        {agent!.shortDescription}
                      </p>

                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {agent!.active ? "Ativo" : "Indisponível"}
                        </span>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                          Abrir
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
