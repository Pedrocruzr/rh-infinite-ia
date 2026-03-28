import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getManualPixConfig } from "@/lib/billing/manual-pix";

type Body = {
  planCode?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const planCode = typeof body.planCode === "string" ? body.planCode.trim() : "";

  if (!planCode) {
    return NextResponse.json({ error: "Plano não informado." }, { status: 400 });
  }

  const { data: plan, error: planError } = await admin
    .from("plans")
    .select("*")
    .eq("code", planCode)
    .eq("active", true)
    .maybeSingle();

  if (planError || !plan) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const pix = getManualPixConfig();

  const { data: ticket, error: ticketError } = await admin
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject: `Solicitação de assinatura - ${plan.name}`,
      priority: "alta",
      status: "aberto",
      message: [
        `Usuário: ${user.email ?? user.id}`,
        `Plano: ${plan.name}`,
        `Código do plano: ${plan.code}`,
        `Valor: ${(plan.price_cents / 100).toFixed(2)}`,
        `Créditos mensais: ${plan.monthly_credits}`,
        `Método: PIX manual`,
        `Chave PIX: ${pix.key}`,
      ].join("\n"),
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (ticketError) {
    return NextResponse.json(
      { error: ticketError.message || "Erro ao abrir solicitação de pagamento." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    plan: {
      code: plan.code,
      name: plan.name,
      price_cents: plan.price_cents,
      monthly_credits: plan.monthly_credits,
    },
    ticket: {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
    },
    pix,
  });
}
