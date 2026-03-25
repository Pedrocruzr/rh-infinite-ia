import { NextRequest, NextResponse } from "next/server";

import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";

const ALLOWED_PRIORITIES = ["baixa", "media", "alta"];
const DEFAULT_STATUS = "aberto";

export async function GET() {
  const access = await resolveJobOpeningsAccess();

  if (!access.userId || !access.db) {
    return NextResponse.json(
      { error: access.error || "Não autenticado." },
      { status: 401 }
    );
  }

  const { data, error } = await access.db
    .from("support_tickets")
    .select("*")
    .eq("user_id", access.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Erro ao carregar chamados.", details: error.message },
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

  const subject = String(body?.subject ?? "").trim();
  const message = String(body?.message ?? "").trim();
  const priority = String(body?.priority ?? "media").trim();

  if (!subject) {
    return NextResponse.json(
      { error: "Assunto é obrigatório." },
      { status: 400 }
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: "Mensagem é obrigatória." },
      { status: 400 }
    );
  }

  if (!ALLOWED_PRIORITIES.includes(priority)) {
    return NextResponse.json(
      { error: "Prioridade inválida." },
      { status: 400 }
    );
  }

  const { data, error } = await access.db
    .from("support_tickets")
    .insert({
      user_id: access.userId,
      subject,
      priority,
      status: DEFAULT_STATUS,
      message,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao criar chamado.", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
