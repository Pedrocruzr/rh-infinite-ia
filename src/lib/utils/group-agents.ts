type Agent = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  image: string;
  creditCost: number;
  active: boolean;
};

export function groupAgentsByCategory(agents: readonly Agent[]) {
  return agents.reduce<Record<string, Agent[]>>((acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = [];
    }

    acc[agent.category].push(agent);
    return acc;
  }, {});
}
