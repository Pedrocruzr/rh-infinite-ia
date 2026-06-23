import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAsaasSubscriptionCheckout } from "@/lib/billing/asaas/service";
import type { BillingCheckoutMethod } from "@/lib/billing/asaas/types";

type Body = {
  planCode?: string;
  method?: BillingCheckoutMethod;
};

function normalizeDocument(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits || null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Body;
    const requestedPlanCode =
      typeof body.planCode === "string" ? body.planCode.trim() : "start";
    const method =
      body.method === "PIX" || body.method === "CREDIT_CARD"
        ? body.method
        : "PIX";

    if (!requestedPlanCode) {
      return NextResponse.json({ error: "Plano não informado." }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("code", requestedPlanCode)
      .eq("active", true)
      .maybeSingle();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const documentNumber = normalizeDocument(
      (profile as any)?.document_number ??
        (typeof user.user_metadata?.document_number === "string"
          ? user.user_metadata.document_number
          : null)
    );

    if (!documentNumber || ![11, 14].includes(documentNumber.length)) {
      return NextResponse.json(
        {
          error:
            "Preencha CPF ou CNPJ no Perfil antes de continuar com a assinatura.",
        },
        { status: 400 }
      );
    }


    if (plan.code !== "start" && plan.code !== "perfil_comportamental") {
      return NextResponse.json(
        { error: "Apenas os planos Stacks Infinity e Perfil Comportamental estão disponíveis no momento." },
        { status: 400 }
      );
    }

    const result = await createAsaasSubscriptionCheckout({
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
      cpfCnpj: documentNumber,
      planCode: plan.code,
      planName: plan.name,
      planId: plan.id,
      priceCents: Number(plan.price_cents),
      monthlyCredits: Number(plan.monthly_credits),
      method,
    });

    const admin = createAdminClient();

    await admin
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan_id: plan.id,
          status: "pending_payment",
          asaas_customer_id: result.customerId,
          asaas_subscription_id: result.subscriptionId ?? null,
          cancel_at_period_end: false,
        },
        { onConflict: "user_id" }
      );

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
