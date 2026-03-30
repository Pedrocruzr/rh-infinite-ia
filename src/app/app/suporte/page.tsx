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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:py-10">
        <SupportPageClient
          initialTickets={initialTickets}
          accountIdentifier={accountIdentifier}
        />
      </section>
    </main>
  );
}
