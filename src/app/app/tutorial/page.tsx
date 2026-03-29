import { TutorialPageClient } from "@/components/tutorial/tutorial-page-client";
import { isTutorialAdmin } from "@/lib/auth/tutorial-admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TutorialPage() {
  const supabase = await createClient();
  const adminEnabled = await isTutorialAdmin();

  let query = supabase
    .from("tutorial_videos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!adminEnabled) {
    query = query.eq("is_published", true);
  }

  const { data } = await query;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
        <TutorialPageClient
          initialVideos={(data ?? []) as any}
          adminEnabled={adminEnabled}
        />
      </section>
    </main>
  );
}
