import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function isTutorialAdmin() {
  if (process.env.NODE_ENV === "development") return true;

  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.app_role === "owner";
}
