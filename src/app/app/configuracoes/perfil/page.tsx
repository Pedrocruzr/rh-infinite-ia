import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/settings/profile-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Perfil</h1>
            <p className="mt-2 text-muted-foreground">
              Atualize os dados principais da sua conta.
            </p>
          </div>

          <Link
            href="/app/configuracoes"
            className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
          >
            Voltar
          </Link>
        </div>

        <ProfileForm
          userId={user.id}
          email={user.email ?? ""}
          initialFullName={profile?.full_name ?? ""}
          initialAvatarUrl={profile?.avatar_url ?? ""}
        />
      </section>
    </main>
  );
}
