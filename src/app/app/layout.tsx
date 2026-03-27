import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ReactNode } from "react";

export default async function InternalAppLayout({
  children,
}: {
  children: ReactNode;
}) {

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
<Link href="/app/recrutador/assessments" className="block rounded-lg px-3 py-2 hover:bg-neutral-100">
              Relatórios Stackers
            </Link>
<Link href="/app/painel-de-vagas" className="block rounded-lg px-3 py-2 hover:bg-neutral-100">
              Painel de Vagas
            </Link>
<Link href="/app/configuracoes" className="block rounded-lg px-3 py-2 hover:bg-neutral-100">
              Configurações
            </Link>
          </nav>
        
          <div className="mt-8">
            <SignOutButton />
          </div>

        </aside>

        <section>{children}</section>
      </div>
    </div>
  );
}
