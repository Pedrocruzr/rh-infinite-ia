import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = {
  planCode?: string;
};

function addOneMonth(iso: string) {
  const date = new Date(iso);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

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
  const nextPeriodEnd = addOneMonth(now);

  const { data: existingSubscription } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const subscriptionPayload = {
    user_id: user.id,
    plan_id: plan.id,
    status: "active",
    current_period_start: now,
    current_period_end: nextPeriodEnd,
    cancel_at_period_end: false,
    updated_at: now,
  };

  let subscription: any = null;

  if (existingSubscription?.id) {
    const { data, error } = await admin
      .from("subscriptions")
      .update(subscriptionPayload)
      .eq("id", existingSubscription.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao atualizar assinatura." },
        { status: 500 }
      );
    }

    subscription = data;
  } else {
    const { data, error } = await admin
      .from("subscriptions")
      .insert({
        ...subscriptionPayload,
        created_at: now,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao criar assinatura." },
        { status: 500 }
      );
    }

    subscription = data;
  }

  const { data: wallet } = await admin
    .from("credit_wallets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentBalance =
    typeof wallet?.balance === "number" ? wallet.balance : 0;

  const nextBalance = Math.max(currentBalance, plan.monthly_credits);
  const delta = nextBalance - currentBalance;

  if (wallet?.user_id) {
    const { error } = await admin
      .from("credit_wallets")
      .update({
        balance: nextBalance,
        updated_at: now,
      })
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao atualizar carteira." },
        { status: 500 }
      );
    }
  } else {
    const { error } = await admin.from("credit_wallets").insert({
      user_id: user.id,
      balance: nextBalance,
      updated_at: now,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao criar carteira." },
        { status: 500 }
      );
    }
  }

  if (delta !== 0) {
    const { error } = await admin.from("credit_transactions").insert({
      user_id: user.id,
      subscription_id: subscription.id,
      delta,
      balance_after: nextBalance,
      transaction_type: "subscription_grant",
      source_type: "plan",
      source_id: plan.id,
      description: `Créditos liberados pelo plano ${plan.name}`,
      metadata: {
        plan_code: plan.code,
        plan_name: plan.name,
        flow: "manual_plan_selection",
      },
      created_at: now,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao registrar crédito." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    plan: {
      id: plan.id,
      code: plan.code,
      name: plan.name,
      monthly_credits: plan.monthly_credits,
      price_cents: plan.price_cents,
    },
    subscription,
    wallet: {
      user_id: user.id,
      balance: nextBalance,
    },
  });
}
