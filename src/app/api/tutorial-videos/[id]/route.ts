import { NextResponse } from "next/server";

import { isTutorialAdmin } from "@/lib/auth/tutorial-admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isTutorialAdmin())) {
    return NextResponse.json(
      { error: "Área de admin do tutorial indisponível." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const supabase = await createClient();

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
