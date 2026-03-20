import Link from "next/link";

export default function ConfiguracoesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Área inicial de configurações da conta.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/app/configuracoes/perfil"
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            Perfil
          </Link>
          <Link
            href="/app/configuracoes/seguranca"
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            Segurança
          </Link>
          <Link
            href="/app/configuracoes/assinatura"
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            Assinatura
          </Link>
        </div>
      </section>
    </main>
  );
}
