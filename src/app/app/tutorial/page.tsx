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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:py-10">
        <TutorialPageClient
          initialVideos={(data ?? []) as any}
          adminEnabled={adminEnabled}
        />
      </section>
    </main>
  );
}
