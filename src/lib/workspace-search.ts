export type WorkspaceSearchItem = {
  title: string;
  href: string;
  category: string;
  keywords?: string[];
  description?: string;
  source?: "static" | "report" | "job";
  score?: number;
};

export const STATIC_WORKSPACE_SEARCH_ITEMS: WorkspaceSearchItem[] = [
  { title: "Agentes", href: "/app/agentes", category: "Navegação", keywords: ["hub", "stackers", "agents"] },
  { title: "Relatórios Stackers", href: "/app/recrutador/assessments", category: "Navegação", keywords: ["relatorios", "assessments", "downloads"] },
  { title: "Painel de Vagas", href: "/app/painel-de-vagas", category: "Navegação", keywords: ["vagas", "jobs"] },
  { title: "CLT IA", href: "/app/agentes/clt-ia", category: "Pesquisa", keywords: ["clt", "leis", "trabalho", "legislacao"] },
  { title: "Tutorial", href: "/app/tutorial", category: "Navegação", keywords: ["ajuda", "guia"] },
  { title: "Suporte", href: "/app/suporte", category: "Navegação", keywords: ["help", "atendimento"] },
  { title: "Configurações", href: "/app/configuracoes", category: "Conta", keywords: ["settings"] },
  { title: "Perfil", href: "/app/configuracoes/perfil", category: "Conta", keywords: ["conta", "empresa", "avatar"] },
  { title: "Segurança", href: "/app/configuracoes/seguranca", category: "Conta", keywords: ["senha", "acesso"] },
  { title: "Assinatura", href: "/app/configuracoes/assinatura", category: "Conta", keywords: ["plano", "credito", "wallet"] },

  { title: "Coletor de Dados Six Box", href: "/app/agentes/coletor-dados-six-box", category: "Agente", keywords: ["diagnostico", "six box"] },
  { title: "Analista de Diagnóstico Six Box", href: "/app/agentes/analista-diagnostico-six-box", category: "Agente", keywords: ["diagnostico", "six box"] },
  { title: "Analista de Pesquisa de Clima", href: "/app/agentes/pesquisa-clima-organizacional", category: "Agente", keywords: ["clima", "organizacional"] },
  { title: "Criador de Descrição de Cargo por Competência", href: "/app/agentes/descricao-cargo-competencia", category: "Agente", keywords: ["cargo", "competencias"] },
  { title: "Custo de Contratação", href: "/app/agentes/custo-contratacao", category: "Agente", keywords: ["contratacao", "custo"] },
  { title: "Taxa de Produtividade do Colaborador", href: "/app/agentes/taxa-produtividade-colaborador", category: "Agente", keywords: ["produtividade"] },
  { title: "Taxa de Aderência com a Vaga", href: "/app/agentes/taxa-aderencia-vaga", category: "Agente", keywords: ["aderencia", "vaga"] },
  { title: "Teste de Perfil Comportamental", href: "/app/agentes/teste-perfil-comportamental", category: "Agente", keywords: ["perfil", "comportamental"] },
  { title: "DISC", href: "/app/agentes/teste-perfil-disc", category: "Agente", keywords: ["disc", "perfil"] },
  { title: "Entrevistador Automatizado", href: "/app/agentes/entrevistador-automatizado", category: "Agente", keywords: ["entrevista"] },
  { title: "Parecer Técnico de Entrevista", href: "/app/agentes/parecer-tecnico-entrevista", category: "Agente", keywords: ["parecer", "entrevista"] },
  { title: "Onboarding Estratégico", href: "/app/agentes/onboarding-estrategico", category: "Agente", keywords: ["onboarding"] },
  { title: "Analista PDI", href: "/app/agentes/analista-pdi", category: "Agente", keywords: ["pdi", "desenvolvimento"] },
  { title: "Mentor de Dinâmicas", href: "/app/agentes/mentor-dinamicas", category: "Agente", keywords: ["dinamicas"] },
  { title: "Mapeamento de Competências", href: "/app/agentes/mapeamento-competencias", category: "Agente", keywords: ["competencias"] },
  { title: "Analista Fit Cultural", href: "/app/agentes/analista-fit-cultural", category: "Agente", keywords: ["fit", "cultural"] },
  { title: "Desligamento Humanizado", href: "/app/agentes/desligamento-humanizado", category: "Agente", keywords: ["desligamento"] },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getDefaultWorkspaceSearchItems(limit = 8) {
  return STATIC_WORKSPACE_SEARCH_ITEMS.slice(0, limit).map((item) => ({
    ...item,
    source: item.source ?? "static",
  }));
}

export function rankWorkspaceSearchItems(
  items: WorkspaceSearchItem[],
  query: string,
  limit = 10
) {
  const q = normalize(query);

  if (!q) {
    return items.slice(0, limit).map((item) => ({
      ...item,
      source: item.source ?? "static",
      score: item.score ?? 0,
    }));
  }

  return items
    .map((item) => {
      const haystack = normalize(
        [
          item.title,
          item.category,
          item.description ?? "",
          ...(item.keywords ?? []),
        ].join(" ")
      );

      let score = 0;

      if (normalize(item.title).includes(q)) score += 12;
      if (haystack.includes(q)) score += 6;

      const tokens = q.split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        if (haystack.includes(token)) score += 2;
      }

      return {
        ...item,
        source: item.source ?? "static",
        score,
      };
    })
    .filter((item) => (item.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}
