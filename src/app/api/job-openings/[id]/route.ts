import { NextRequest, NextResponse } from "next/server";

import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";
import { computeOpenDays } from "@/lib/jobs/utils";
import type { JobStatus } from "@/lib/jobs/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await resolveJobOpeningsAccess();

  if (!access.userId || !access.db) {
    return NextResponse.json(
      { error: access.error || "Não autenticado." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();

  const { data: existing, error: existingError } = await access.db
    .from("job_openings")
    .select("*")
    .eq("id", id)
    .eq("user_id", access.userId)
    .single();

  if (existingError || !existing) {
    return NextResponse.json(
      { error: "Vaga não encontrada." },
      { status: 404 }
    );
  }

  const nome_vaga = body?.nome_vaga ?? existing.nome_vaga;
  const data_abertura = body?.data_abertura ?? existing.data_abertura;
  const status = (body?.status ?? existing.status) as JobStatus;
  const explicitClosingDate =
    body?.data_fechamento === ""
      ? null
      : body?.data_fechamento ?? existing.data_fechamento ?? null;

  if (!String(nome_vaga).trim()) {
    return NextResponse.json(
      { error: "Nome da vaga é obrigatório." },
      { status: 400 }
    );
  }

  if (!String(data_abertura).trim()) {
    return NextResponse.json(
      { error: "Data de abertura é obrigatória." },
      { status: 400 }
    );
  }

  if (!["em_aberto", "pausada", "fechada"].includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const data_fechamento =
    status === "fechada"
      ? explicitClosingDate || new Date().toISOString().slice(0, 10)
      : null;

  const data_primeiro_contato =
    body?.data_primeiro_contato !== undefined
      ? body.data_primeiro_contato
        ? String(body.data_primeiro_contato).trim()
        : null
      : existing.data_primeiro_contato ?? null;

  const canal_origem =
    body?.canal_origem !== undefined
      ? body.canal_origem
        ? String(body.canal_origem).trim()
        : "LinkedIn"
      : existing.canal_origem ?? "LinkedIn";

  const updatePayload = {
    nome_vaga: String(nome_vaga).trim(),
    data_abertura: String(data_abertura).trim(),
    status,
    data_fechamento,
    dias_em_aberto: computeOpenDays(
      String(data_abertura).trim(),
      data_fechamento
    ),
    data_primeiro_contato,
    canal_origem,
  };

  let { data, error } = await access.db
    .from("job_openings")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", access.userId)
    .select("*")
    .single();

  // Fallback de segurança: caso as novas colunas ainda não tenham sido migradas no Supabase
  if (
    error &&
    (error.message?.includes("data_primeiro_contato") ||
      error.message?.includes("canal_origem") ||
      error.code === "PGRST204" ||
      error.code === "42703")
  ) {
    const legacyPayload = {
      nome_vaga: String(nome_vaga).trim(),
      data_abertura: String(data_abertura).trim(),
      status,
      data_fechamento,
      dias_em_aberto: computeOpenDays(
        String(data_abertura).trim(),
        data_fechamento
      ),
    };

    const retry = await access.db
      .from("job_openings")
      .update(legacyPayload)
      .eq("id", id)
      .eq("user_id", access.userId)
      .select("*")
      .single();

    if (retry.error) {
      return NextResponse.json(
        { error: "Erro ao atualizar vaga.", details: retry.error.message },
        { status: 500 }
      );
    }

    data = {
      ...retry.data,
      data_primeiro_contato,
      canal_origem,
    };
    error = null;
  }

  if (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar vaga.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await resolveJobOpeningsAccess();

  if (!access.userId || !access.db) {
    return NextResponse.json(
      { error: access.error || "Não autenticado." },
      { status: 401 }
    );
  }

  const { id } = await params;

  const { error } = await access.db
    .from("job_openings")
    .delete()
    .eq("id", id)
    .eq("user_id", access.userId);

  if (error) {
    return NextResponse.json(
      { error: "Erro ao excluir vaga.", details: error.message },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
