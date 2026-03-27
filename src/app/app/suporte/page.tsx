import { SupportPageClient } from "@/components/support/support-page-client";
import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";

export const dynamic = "force-dynamic";

export default async function SuportePage() {
  const access = await resolveJobOpeningsAccess();

  let initialTickets: any[] = [];
  let accountIdentifier = "Conta não identificada";

  if (access.userId && access.db) {
    const { data } = await access.db
      .from("support_tickets")
      .select("*")
      .eq("user_id", access.userId)
      .order("created_at", { ascending: false });

    initialTickets = data ?? [];
    accountIdentifier =
      process.env.NODE_ENV === "development"
        ? `DEV_USER_ID: ${access.userId}`
        : access.userId;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
        <SupportPageClient
          initialTickets={initialTickets}
          accountIdentifier={accountIdentifier}
        />
      </section>
    </main>
  );
}
