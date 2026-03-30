import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { agents } from "@/lib/agents";
import { agentsCatalog } from "@/lib/catalog/agents";

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
    slugs: ["onboarding-estrategico", "analista-pdi"],
  },
  {
    title: "Stacker de Encerramento",
    subtitle: "Empilha clareza, proteção e humanização no desligamento.",
    slugs: ["desligamento-humanizado"],
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
  "clt-ia": "CLT IA",
};

const CATALOG_ALIASES: Record<string, string> = {
  "analista-fit-cultural": "analista-fit-cultura",
  "custo-contratacao": "custo-por-contratacao",
  "clt-ia": "teste-perfil-comportamental",
};

const CATEGORY_STYLES: Record<
  string,
  {
    sectionBadge: string;
    categoryBadge: string;
    accent: string;
    surface: string;
  }
> = {
  Diagnóstico: {
    sectionBadge: "border-sky-500/20 bg-sky-500/10 text-[#0b4f8a] dark:bg-cyan-500/12 dark:text-cyan-200 dark:border-cyan-400/20",
    categoryBadge: "bg-cyan-500/12 text-cyan-200 border-cyan-400/20 dark:bg-cyan-500/12 dark:text-cyan-200 dark:border-cyan-400/20",
    accent: "from-cyan-400/30 via-sky-500/10 to-transparent",
    surface: "dark:bg-cyan-400/10",
  },
  Critérios: {
    sectionBadge: "border-sky-500/20 bg-sky-500/10 text-[#0b4f8a] dark:bg-emerald-500/12 dark:text-emerald-200 dark:border-emerald-400/20",
    categoryBadge: "bg-emerald-500/12 text-emerald-200 border-emerald-400/20 dark:bg-emerald-500/12 dark:text-emerald-200 dark:border-emerald-400/20",
    accent: "from-emerald-400/30 via-teal-500/10 to-transparent",
    surface: "dark:bg-emerald-400/10",
  },
  "Recrutamento & Seleção": {
    sectionBadge: "border-sky-500/20 bg-sky-500/10 text-[#0b4f8a] dark:bg-violet-500/12 dark:text-violet-200 dark:border-violet-400/20",
    categoryBadge: "bg-violet-500/12 text-violet-200 border-violet-400/20 dark:bg-violet-500/12 dark:text-violet-200 dark:border-violet-400/20",
    accent: "from-violet-400/30 via-fuchsia-500/10 to-transparent",
    surface: "dark:bg-violet-400/10",
  },
  Desenvolvimento: {
    sectionBadge: "border-sky-500/20 bg-sky-500/10 text-[#0b4f8a] dark:bg-amber-500/12 dark:text-amber-200 dark:border-amber-400/20",
    categoryBadge: "bg-amber-500/12 text-amber-200 border-amber-400/20 dark:bg-amber-500/12 dark:text-amber-200 dark:border-amber-400/20",
    accent: "from-amber-400/30 via-orange-500/10 to-transparent",
    surface: "dark:bg-amber-400/10",
  },
  Encerramento: {
    sectionBadge: "border-sky-500/20 bg-sky-500/10 text-[#0b4f8a] dark:bg-rose-500/12 dark:text-rose-200 dark:border-rose-400/20",
    categoryBadge: "bg-rose-500/12 text-rose-200 border-rose-400/20 dark:bg-rose-500/12 dark:text-rose-200 dark:border-rose-400/20",
    accent: "from-rose-400/30 via-red-500/10 to-transparent",
    surface: "dark:bg-rose-400/10",
  },
  default: {
    sectionBadge: "border-sky-500/20 bg-sky-500/10 text-[#0b4f8a] dark:bg-sky-500/12 dark:text-sky-200 dark:border-sky-400/20",
    categoryBadge: "bg-sky-500/12 text-sky-200 border-sky-400/20 dark:bg-sky-500/12 dark:text-sky-200 dark:border-sky-400/20",
    accent: "from-sky-400/30 via-blue-500/10 to-transparent",
    surface: "dark:bg-sky-400/10",
  },
};

type RuntimeAgent = (typeof agents)[number];
type CatalogAgent = (typeof agentsCatalog)[number];
type VisualAgent = RuntimeAgent & {
  displayName: string;
  image: string;
};

function getCatalogAgent(slug: string): CatalogAgent | undefined {
  const direct = agentsCatalog.find((agent) => agent.slug === slug);
  if (direct) return direct;

  const alias = CATALOG_ALIASES[slug];
  if (!alias) return undefined;

  return agentsCatalog.find((agent) => agent.slug === alias);
}

function getAgentsBySlugs(slugs: readonly string[]) {
  const resolved: VisualAgent[] = [];

  for (const slug of slugs) {
    const runtimeAgent = agents.find((agent) => agent.slug === slug);
    if (!runtimeAgent) continue;

    const catalogAgent = getCatalogAgent(slug);

    resolved.push({
      ...runtimeAgent,
      displayName: TITLE_OVERRIDES[slug] ?? runtimeAgent.name,
      image: catalogAgent?.image ?? "/agents/teste-perfil-comportamental.png",
    });
  }

  return resolved;
}

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.default;
}

export default function AgentesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_22%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-8 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)] md:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Central de agentes
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Stackers Agents
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Agentes organizados por stack de decisão para estruturar, selecionar, desenvolver e encerrar com mais clareza.
            </p>
          </div>
        </section>

        <div className="mt-10 space-y-12">
          {SECTION_CONFIG.map((section) => {
            const sectionAgents = getAgentsBySlugs(section.slugs);
            const style = getCategoryStyle(sectionAgents[0]?.category ?? "");

            if (!sectionAgents.length) return null;

            return (
              <section key={section.title} className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] ${style.sectionBadge}`}>
                      {section.title}
                    </div>
                    <p className="mt-3 max-w-3xl text-base text-slate-600 dark:text-slate-400">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {sectionAgents.map((agent) => (
                    <Link
                      key={agent.slug}
                      href={`/app/agentes/${agent.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-[1.9rem] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_24px_60px_rgba(14,165,233,0.12)] dark:border-white/10 dark:bg-[#102033]/78 dark:shadow-[0_18px_50px_rgba(15,23,42,0.18)] dark:hover:border-sky-400/30"
                    >
                      <div className="relative h-52 shrink-0 overflow-hidden">
                        <Image
                          src={agent.image}
                          alt={agent.displayName}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 1280px) 100vw, 33vw"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${style.accent}`} />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] backdrop-blur-sm ${style.categoryBadge}`}>
                            {agent.category}
                          </div>
                        </div>
                      </div>

                      <div className={`flex flex-1 flex-col p-6 ${style.surface}`}>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-2xl font-semibold leading-tight text-slate-950 dark:text-white">
                            {agent.displayName}
                          </h3>
                        </div>

                        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">
                          {agent.shortDescription}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-6">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {agent.active ? "Ativo" : "Indisponível"}
                          </span>
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                            Abrir agente
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                          </span>
                        </div>
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
