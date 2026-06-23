"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Lock, X } from "lucide-react";
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
      "agente-teste-bigfive",
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
  "agente-teste-bigfive": "Agente Teste Big Five",
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
  imageDark: string;
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
      image: catalogAgent?.image ?? "/agents/teste-perfil-comportamental-light.png",
      imageDark: (catalogAgent as any)?.imageDark ?? "/agents/teste-perfil-comportamental-dark.png",
    });
  }

  return resolved;
}

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.default;
}

export default function AgentesPage() {
  const [planCode, setPlanCode] = useState<"start" | "perfil_comportamental">("perfil_comportamental");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    const savedPlan = sessionStorage.getItem("simulated_plan_code") as "start" | "perfil_comportamental";
    if (savedPlan) {
      setPlanCode(savedPlan);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upsell") === "true") {
      setIsUpgradeModalOpen(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const handleTogglePlan = (newPlan: "start" | "perfil_comportamental") => {
    setPlanCode(newPlan);
    sessionStorage.setItem("simulated_plan_code", newPlan);
    document.cookie = `simulated_plan_code=${newPlan}; path=/; max-age=31536000`;
    window.location.reload();
  };

  useEffect(() => {
    if (planCode === "perfil_comportamental") {
      const hasSeenPromo = sessionStorage.getItem("has_seen_login_promo");
      if (!hasSeenPromo) {
        const timer = setTimeout(() => {
          setIsUpgradeModalOpen(true);
          sessionStorage.setItem("has_seen_login_promo", "true");
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [planCode]);

  const closeModal = () => setIsUpgradeModalOpen(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_22%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6 py-8 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)] md:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Central de agentes
            </div>
            <h1 className="font-michroma mt-6 text-4xl font-medium tracking-wide md:text-5xl">
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
                  {sectionAgents.map((agent) => {
                    const isBlocked = planCode === "perfil_comportamental" && agent.slug !== "teste-perfil-comportamental";

                    if (isBlocked) {
                      return (
                        <div
                          key={agent.slug}
                          onClick={() => setIsUpgradeModalOpen(true)}
                          className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.9rem] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_24px_60px_rgba(245,158,11,0.12)] dark:border-white/10 dark:bg-[#102033]/78 dark:shadow-[0_18px_50px_rgba(15,23,42,0.18)] dark:hover:border-amber-400/30"
                        >
                          <div className="relative h-52 shrink-0 overflow-hidden filter grayscale opacity-60">
                            <Image
                              src={agent.image}
                              alt={agent.displayName}
                              fill
                              className="object-cover transition duration-500 group-hover:scale-[1.03] dark:hidden"
                              sizes="(max-width: 1280px) 100vw, 33vw"
                            />
                            <Image
                              src={agent.imageDark}
                              alt={agent.displayName}
                              fill
                              className="hidden object-cover transition duration-500 group-hover:scale-[1.03] dark:block"
                              sizes="(max-width: 1280px) 100vw, 33vw"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${style.accent}`} />
                            <div className="absolute inset-x-0 bottom-0 p-5 flex items-center justify-between">
                              <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] backdrop-blur-sm ${style.categoryBadge}`}>
                                {agent.category}
                              </div>
                              <div className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
                                <Lock className="h-3 w-3" />
                                Upgrade
                              </div>
                            </div>
                          </div>

                          <div className={`flex flex-1 flex-col p-6 opacity-75 ${style.surface}`}>
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="text-2xl font-semibold leading-tight text-slate-500 dark:text-slate-400">
                                {agent.displayName}
                              </h3>
                            </div>

                            <p className="mt-3 text-base leading-7 text-slate-500 dark:text-slate-400">
                              {agent.shortDescription}
                            </p>

                            <div className="mt-auto flex items-center justify-between pt-6">
                              <span className="text-sm text-slate-400 dark:text-slate-500">
                                Bloqueado
                              </span>
                              <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                                Desbloquear agente
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
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
                            className="object-cover transition duration-500 group-hover:scale-[1.03] dark:hidden"
                            sizes="(max-width: 1280px) 100vw, 33vw"
                          />
                          <Image
                            src={agent.imageDark}
                            alt={agent.displayName}
                            fill
                            className="hidden object-cover transition duration-500 group-hover:scale-[1.03] dark:block"
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

                          <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
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
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Modal Promocional / Upgrade */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[#0c1929]/95 dark:shadow-[0_24px_80px_rgba(15,23,42,0.48)]">
            <button 
              onClick={closeModal}
              className="absolute right-6 top-6 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Acesso Ilimitado
              </div>
              
              <h2 className="font-michroma mt-6 text-2xl font-bold tracking-tight md:text-3xl leading-tight">
                Desbloqueie todos os Agentes
              </h2>
              
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Seu plano atual dá acesso exclusivo ao <strong>Teste de Perfil Comportamental</strong>.
                <br />
                Assine o pacote completo para desbloquear todos os robôs da plataforma!
              </p>

              <div className="mt-6 w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Oferta Especial</p>
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
                  Adquirir Plano Completo
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  onClick={closeModal}
                  className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Continuar no Plano Individual
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulador de Assinatura Local */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Simulador de Assinatura (Local)</p>
          <div className="flex gap-2">
            <button 
              onClick={() => handleTogglePlan("perfil_comportamental")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${planCode === "perfil_comportamental" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"}`}
            >
              Individual (R$ 67,90)
            </button>
            <button 
              onClick={() => handleTogglePlan("start")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${planCode === "start" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"}`}
            >
              Completo (R$ 197)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
