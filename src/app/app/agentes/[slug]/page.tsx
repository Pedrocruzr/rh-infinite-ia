import { notFound } from "next/navigation";
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
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">{agent.category}</div>
          <h1 className="text-4xl font-semibold tracking-tight">
            {agent.name}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            {agent.shortDescription}
          </p>
        </div>

        <AgentWorkspaceClient agent={agent} />
      </section>
    </main>
  );
}
