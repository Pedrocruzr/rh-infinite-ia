import Link from "next/link";
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
    <main className="min-h-screen bg-background px-8 py-10 text-foreground">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-muted-foreground">Workspace</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">
          Stackers Agents
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          Agentes organizados por stack de decisão para estruturar, selecionar, desenvolver e encerrar com mais clareza.
        </p>

        <div className="mt-10 space-y-12">
          {SECTION_CONFIG.map((section) => {
            const sectionAgents = getAgentsBySlugs(section.slugs);

            if (!sectionAgents.length) return null;

            return (
              <section key={section.title}>
                <div className="mb-5">
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-base text-muted-foreground">
                    {section.subtitle}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {sectionAgents.map((agent) => (
                    <Link
                      key={agent!.slug}
                      href={`/app/agentes/${agent!.slug}`}
                      className="rounded-[28px] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-sm text-muted-foreground">
                        {agent!.category}
                      </p>

                      <h3 className="mt-3 text-2xl font-semibold leading-tight">
                        {TITLE_OVERRIDES[agent!.slug] ?? agent!.name}
                      </h3>

                      <p className="mt-3 text-base leading-7 text-muted-foreground">
                        {agent!.shortDescription}
                      </p>

                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {agent!.active ? "Ativo" : "Indisponível"}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          Abrir
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
