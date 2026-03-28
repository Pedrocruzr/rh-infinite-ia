import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAsaasCheckout } from "@/lib/billing/asaas/service";
import type { BillingCheckoutMethod } from "@/lib/billing/asaas/types";

type Body = {
  planCode?: string;
  method?: BillingCheckoutMethod;
};

export async function POST(request: Request) {
  try {
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
    const method =
      body.method === "PIX" || body.method === "CREDIT_CARD"
        ? body.method
        : "PIX";

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

    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const result = await createAsaasCheckout({
      userId: user.id,
      email: user.email ?? "",
      name:
        profile?.full_name?.trim() ||
        user.user_metadata?.full_name ||
        user.email ||
        "Usuário",
      company:
        typeof user.user_metadata?.company_name === "string"
          ? user.user_metadata.company_name
          : null,
      planCode: plan.code,
      planName: plan.name,
      planId: plan.id,
      priceCents: Number(plan.price_cents),
      monthlyCredits: Number(plan.monthly_credits),
      method,
    });

    return NextResponse.json({
      ok: true,
      checkout: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao criar checkout de assinatura.",
      },
      { status: 500 }
    );
  }
}
