import { NextRequest, NextResponse } from "next/server";

import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";
import { computeOpenDays } from "@/lib/jobs/utils";
import type { JobStatus } from "@/lib/jobs/types";

export async function GET() {
  const access = await resolveJobOpeningsAccess();

  if (!access.userId || !access.db) {
    return NextResponse.json(
      { error: access.error || "Não autenticado." },
      { status: 401 }
    );
  }

  const { data, error } = await access.db
    .from("job_openings")
    .select("*")
    .eq("user_id", access.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Erro ao carregar vagas.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const access = await resolveJobOpeningsAccess();

  if (!access.userId || !access.db) {
    return NextResponse.json(
      { error: access.error || "Não autenticado." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const nome_vaga = String(body?.nome_vaga ?? "").trim();
  const data_abertura = String(body?.data_abertura ?? "").trim();
  const status = String(body?.status ?? "em_aberto").trim() as JobStatus;
  const data_fechamento = body?.data_fechamento
    ? String(body.data_fechamento).trim()
    : null;

  if (!nome_vaga) {
    return NextResponse.json(
      { error: "Nome da vaga é obrigatório." },
      { status: 400 }
    );
  }

  if (!data_abertura) {
    return NextResponse.json(
      { error: "Data de abertura é obrigatória." },
      { status: 400 }
    );
  }

  if (!["em_aberto", "pausada", "fechada"].includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  if (status === "fechada" && !data_fechamento) {
    return NextResponse.json(
      { error: "Vaga fechada exige data de fechamento." },
      { status: 400 }
    );
  }

  const payload = {
    user_id: access.userId,
    nome_vaga,
    data_abertura,
    data_fechamento: status === "fechada" ? data_fechamento : null,
    status,
    dias_em_aberto: computeOpenDays(
      data_abertura,
      status === "fechada" ? data_fechamento : null
    ),
  };

  const { data, error } = await access.db
    .from("job_openings")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao criar vaga.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
