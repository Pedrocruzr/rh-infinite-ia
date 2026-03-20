"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Agent = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  image: string;
  creditCost: number;
  active: boolean;
};

function groupAgentsByCategory(agents: Agent[]) {
  return agents.reduce<Record<string, Agent[]>>((acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = [];
    acc[agent.category].push(agent);
    return acc;
  }, {});
}

interface Props {
  agents: Agent[];
}

export function AgentsCatalogClient({ agents }: Props) {
  const [query, setQuery] = useState("");

  const filteredAgents = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return agents;

    return agents.filter((agent) => {
      return (
        agent.name.toLowerCase().includes(term) ||
        agent.category.toLowerCase().includes(term) ||
        agent.shortDescription.toLowerCase().includes(term)
      );
    });
  }, [agents, query]);

  const groupedAgents = useMemo(
    () => groupAgentsByCategory(filteredAgents),
    [filteredAgents]
  );

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10">
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-sm text-muted-foreground">RH Infinite IA</div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Catálogo de Agentes
          </h1>
        </div>

        <p className="max-w-3xl text-muted-foreground">
          Explore os agentes disponíveis para estruturar recrutamento,
          desenvolvimento, desempenho, people analytics e gestão de pessoas.
        </p>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <input
            type="text"
            placeholder="Buscar agente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {filteredAgents.length} agente(s) encontrado(s)
          </p>
        </div>
      </div>

      {Object.keys(groupedAgents).length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground shadow-sm">
          Nenhum agente encontrado para a busca informada.
        </div>
      ) : (
        Object.entries(groupedAgents).map(([category, agents]) => (
          <section key={category} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{category}</h2>
              <span className="text-sm text-muted-foreground">
                {agents.length} agente(s)
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent) => (
                <article
                  key={agent.slug}
                  className="rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        {agent.category}
                      </div>

                      <h3 className="text-xl font-semibold">{agent.name}</h3>

                      <p className="text-sm text-muted-foreground">
                        {agent.shortDescription}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Créditos: {agent.creditCost}</span>
                        <span className="text-emerald-600">
                          {agent.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <Link
                        href={`/app/agentes/${agent.slug}`}
                        className="inline-flex w-full items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
                      >
                        Abrir agente
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </section>
  );
}
