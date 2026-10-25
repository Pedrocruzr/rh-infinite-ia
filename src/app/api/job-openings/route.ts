import { NextRequest, NextResponse } from "next/server";

import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";
import { computeOpenDays } from "@/lib/jobs/utils";
import type { JobStatus } from "@/lib/jobs/types";
import { getUserPlanType, getJobOpeningsLimit } from "@/lib/auth/access-control";
import { cookies } from "next/headers";

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

  const cookieStore = await cookies();
  const simulatedPlan = cookieStore.get("simulated_plan_code")?.value;
  const planType = await getUserPlanType(access.db, { id: access.userId }, simulatedPlan);

  if (planType === "vagas") {
    const { count } = await access.db
      .from("job_openings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", access.userId);

    const limit = getJobOpeningsLimit(simulatedPlan);
    if ((count ?? 0) >= limit) {
      const planName = limit === 10 ? "Start (10 vagas)" : "Pro (25 vagas)";
      return NextResponse.json(
        {
          error: `Você atingiu o limite de ${limit} vagas do seu plano ${planName}. Faça upgrade para continuar adicionando novas vagas.`,
          code: "LIMIT_REACHED",
          limit,
        },
        { status: 403 }
      );
    }
  }

  const data_primeiro_contato = body?.data_primeiro_contato
    ? String(body.data_primeiro_contato).trim()
    : null;
  const canal_origem = body?.canal_origem
    ? String(body.canal_origem).trim()
    : "LinkedIn";

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
    data_primeiro_contato,
    canal_origem,
  };

  let { data, error } = await access.db
    .from("job_openings")
    .insert(payload)
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

    const retry = await access.db
      .from("job_openings")
      .insert(legacyPayload)
      .select("*")
      .single();

    if (retry.error) {
      return NextResponse.json(
        { error: "Erro ao criar vaga.", details: retry.error.message },
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
      { error: "Erro ao criar vaga.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}

