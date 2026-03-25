"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);

    try {
      await supabase.auth.signOut();

      await fetch("/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
    >
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
