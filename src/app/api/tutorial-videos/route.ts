import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { extractYouTubeVideoId } from "@/lib/tutorial/utils";

function isTutorialAdminEnabled() {
  return process.env.NODE_ENV === "development" || process.env.TUTORIAL_ADMIN_ENABLED === "true";
}

export async function GET() {
  const supabase = createAdminClient();

  let query = supabase
    .from("tutorial_videos")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!isTutorialAdminEnabled()) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Erro ao carregar vídeos.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!isTutorialAdminEnabled()) {
    return NextResponse.json(
      { error: "Área de admin do tutorial indisponível." },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const body = await request.json();

  const title = String(body?.title ?? "").trim();
  const description = body?.description ? String(body.description).trim() : null;
  const youtube_url = String(body?.youtube_url ?? "").trim();
  const is_published = Boolean(body?.is_published ?? true);

  if (!title) {
    return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
  }

  if (!youtube_url) {
    return NextResponse.json({ error: "Link do YouTube é obrigatório." }, { status: 400 });
  }

  if (!extractYouTubeVideoId(youtube_url)) {
    return NextResponse.json(
      { error: "Informe um link válido do YouTube." },
      { status: 400 }
    );
  }

  const { data: lastVideo } = await supabase
    .from("tutorial_videos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (lastVideo?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("tutorial_videos")
    .insert({
      title,
      description,
      youtube_url,
      is_published,
      sort_order,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao criar vídeo.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
