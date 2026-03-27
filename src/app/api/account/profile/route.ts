import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = {
  fullName?: string | null;
  companyName?: string | null;
  avatarUrl?: string | null;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const companyName =
    typeof body.companyName === "string" ? body.companyName.trim() : "";
  const avatarUrl =
    typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : "";

  const admin = createAdminClient();

  const profilePayload = {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName || null,
    avatar_url: avatarUrl || null,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message || "Erro ao salvar perfil." },
      { status: 500 }
    );
  }

  const nextUserMetadata = {
    ...(user.user_metadata ?? {}),
    full_name: fullName || null,
    company_name: companyName || null,
    avatar_url: avatarUrl || null,
  };

  const { error: metadataError } = await supabase.auth.updateUser({
    data: nextUserMetadata,
  });

  if (metadataError) {
    return NextResponse.json(
      { error: metadataError.message || "Erro ao salvar metadados do usuário." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    profile: profilePayload,
    userMetadata: nextUserMetadata,
  });
}
