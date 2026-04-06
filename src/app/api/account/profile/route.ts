import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Body = {
  fullName?: string | null;
  companyName?: string | null;
  documentNumber?: string | null;
  avatarUrl?: string | null;
};

function normalizeDocument(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return digits;
}

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
  const documentNumber = normalizeDocument(body.documentNumber);

  if (
    documentNumber &&
    documentNumber.length !== 11 &&
    documentNumber.length !== 14
  ) {
    return NextResponse.json(
      { error: "Informe um CPF ou CNPJ válido." },
      { status: 400 }
    );
  }

  const { data: profileData, error: profileError } = await supabase.rpc(
    "upsert_my_profile",
    {
      p_email: user.email ?? null,
      p_full_name: fullName || null,
      p_avatar_url: avatarUrl || null,
      p_document_number: documentNumber,
    }
  );

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
    document_number: documentNumber,
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
    profile: profileData,
    userMetadata: nextUserMetadata,
  });
}
