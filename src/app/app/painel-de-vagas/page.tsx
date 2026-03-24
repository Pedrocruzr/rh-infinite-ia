import { JobOpeningsClient } from "@/components/jobs/job-openings-client";
import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";

export const dynamic = "force-dynamic";

export default async function PainelDeVagasPage() {
  const access = await resolveJobOpeningsAccess();

  let initialItems: any[] = [];

  if (access.userId && access.db) {
    const { data } = await access.db
      .from("job_openings")
      .select("*")
      .eq("user_id", access.userId)
      .order("created_at", { ascending: false });

    initialItems = data ?? [];
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
        <JobOpeningsClient initialItems={initialItems} />
      </section>
    </main>
  );
}
