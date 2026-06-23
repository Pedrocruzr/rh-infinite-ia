import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // Auth — precisa estar logado
    const authSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const vaga = String(body?.vaga ?? "").trim();
    const hours = Math.min(3, Math.max(1, Number(body?.hours ?? 2)));
    const agentSlug = String(body?.agentSlug ?? "teste-perfil-comportamental").trim();

    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("assessment_invitations")
      .insert({
        recruiter_id: user.id,
        vaga,
        agent_slug: agentSlug,
        status: "pending",
        expires_at: expiresAt,
      })
      .select("id, token, vaga, expires_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Erro ao criar convite: ${error.message}` },
        { status: 500 }
      );
    }

    let baseUrl = req.headers.get("origin") ?? "http://localhost:3000";
    if (process.env.NODE_ENV === "production") {
      baseUrl = "https://app.stackercompany.com.br";
    }
    const link = `${baseUrl}/avaliacao/${data.token}`;

    return NextResponse.json({ ok: true, link, token: data.token, expires_at: data.expires_at });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
