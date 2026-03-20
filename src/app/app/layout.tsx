import Link from "next/link";
import { ReactNode } from "react";

export default function InternalAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        <aside className="border-r border-neutral-200 p-6">
          <p className="text-sm text-neutral-500">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold">RH Infinite IA</h1>

          <nav className="mt-10 space-y-3 text-sm">
            <Link href="/app/agentes" className="block rounded-lg px-3 py-2 hover:bg-neutral-100">
              Agentes
            </Link>

            <Link href="/app/tutorial" className="block rounded-lg px-3 py-2 hover:bg-neutral-100">
              Tutorial
            </Link>

            <Link href="/app/suporte" className="block rounded-lg px-3 py-2 hover:bg-neutral-100">
              Suporte
            </Link>

            <Link href="/app/configuracoes" className="block rounded-lg px-3 py-2 hover:bg-neutral-100">
              Configurações
            </Link>

            <Link href="/app/recrutador/assessments" className="block rounded-lg px-3 py-2 hover:bg-neutral-100">
              Avaliações recebidas
            </Link>
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </div>
  );
}
