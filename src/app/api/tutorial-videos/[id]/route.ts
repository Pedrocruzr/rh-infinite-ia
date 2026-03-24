import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

function isTutorialAdminEnabled() {
  return process.env.NODE_ENV === "development" || process.env.TUTORIAL_ADMIN_ENABLED === "true";
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isTutorialAdminEnabled()) {
    return NextResponse.json(
      { error: "Área de admin do tutorial indisponível." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("tutorial_videos")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Erro ao excluir vídeo.", details: error.message },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
