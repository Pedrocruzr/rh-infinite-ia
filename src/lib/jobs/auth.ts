import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type JobOpeningsAccess = {
  userId: string | null;
  db: any;
  mode: "session" | "dev" | "none";
  error: string | null;
};

export async function resolveJobOpeningsAccess(): Promise<JobOpeningsAccess> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user) {
    return {
      userId: user.id,
      db: supabase,
      mode: "session",
      error: null,
    };
  }

  const devUserId = process.env.DEV_USER_ID ?? null;

  if (process.env.NODE_ENV === "development" && devUserId) {
    return {
      userId: devUserId,
      db: createAdminClient(),
      mode: "dev",
      error: error?.message ?? null,
    };
  }

  return {
    userId: null,
    db: null,
    mode: "none",
    error: error?.message ?? "Auth session missing!",
  };
}
