import Link from "next/link";

import { SecurityForm } from "@/components/settings/security-form";

export default function SegurancaPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Segurança</h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie senha e recuperação de acesso da sua conta.
            </p>
          </div>

          <Link
            href="/app/configuracoes"
            className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
          >
            Voltar
          </Link>
        </div>

        <SecurityForm />
      </section>
    </main>
  );
}
