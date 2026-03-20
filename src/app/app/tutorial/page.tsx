export default function TutorialPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">Tutorial</h1>
        <p className="text-muted-foreground">
          Área inicial de tutoriais do RH Infinite IA.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Como acessar os agentes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Espaço inicial para vídeos e guias de uso.
            </p>
          </article>

          <article className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Como usar créditos</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Estrutura para conteúdo educacional e onboarding.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
