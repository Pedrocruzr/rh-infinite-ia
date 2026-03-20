import Link from "next/link";
import { agentsCatalog } from "@/lib/catalog/agents";

export default function HomePage() {
  const featuredAgents = agentsCatalog.slice(0, 6);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
            RH Infinite IA
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Agentes de IA para estruturar, acelerar e profissionalizar o RH.
          </h1>

          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Base inicial do microSaaS com catálogo de agentes, planos e
            arquitetura pronta para autenticação, billing e execução dos
            fluxos.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              Entrar
            </Link>

            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center rounded-md border px-5 py-3 text-sm font-medium transition hover:bg-muted"
            >
              Criar conta
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredAgents.map((agent) => (
            <article
              key={agent.slug}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {agent.category}
                </div>

                <h2 className="text-xl font-semibold">{agent.name}</h2>

                <p className="text-sm text-muted-foreground">
                  {agent.shortDescription}
                </p>

                <div className="flex items-center justify-between pt-2 text-sm">
                  <span>Créditos: {agent.creditCost}</span>
                  <span
                    className={
                      agent.active ? "text-emerald-600" : "text-red-500"
                    }
                  >
                    {agent.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
