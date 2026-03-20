export default function SuportePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">Suporte</h1>
        <p className="text-muted-foreground">
          Área inicial de suporte do RH Infinite IA.
        </p>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium">Assunto</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Estrutura inicial do formulário de suporte.
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Mensagem</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Aqui entrará o conteúdo da solicitação.
              </div>
            </div>

            <button className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
              Enviar solicitação
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
