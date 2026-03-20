export default function PainelDeVagasPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">
          Painel de Vagas
        </h1>
        <p className="text-muted-foreground">
          Estrutura inicial do módulo de vagas.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            Em aberto
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            Pausadas
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            Fechadas
          </div>
        </div>
      </section>
    </main>
  );
}
