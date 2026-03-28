import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path) {
  const env = {};
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) value = value.slice(1, -1);
    env[key] = value;
  }
  return env;
}

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : "";
}

const userId = getArg("user");
const ticketId = getArg("ticket");
const planCode = getArg("plan");

if (!userId || !ticketId || !planCode) {
  console.error(
    'Uso: node scripts/reconcile-subscription-state.mjs --user="USER_ID" --ticket="TICKET_ID" --plan="profissional"'
  );
  process.exit(1);
}

const env = loadEnv(".env.local");
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const now = new Date().toISOString();

const { data: plan, error: planError } = await supabase
  .from("plans")
  .select("*")
  .eq("code", planCode)
  .eq("active", true)
  .maybeSingle();

if (planError || !plan) {
  console.error("[ERRO] plano não encontrado");
  process.exit(1);
}

const { data: subscription, error: subscriptionError } = await supabase
  .from("subscriptions")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (subscriptionError || !subscription) {
  console.error("[ERRO] assinatura não encontrada");
  process.exit(1);
}

const { data: wallet, error: walletError } = await supabase
  .from("credit_wallets")
  .select("*")
  .eq("user_id", userId)
  .maybeSingle();

if (walletError) {
  console.error("[ERRO] erro ao buscar carteira:", walletError.message);
  process.exit(1);
}

const { data: existingApprovedTx } = await supabase
  .from("credit_transactions")
  .select("*")
  .eq("user_id", userId)
  .eq("source_type", "support_ticket")
  .eq("source_id", ticketId)
  .maybeSingle();

if (existingApprovedTx?.id) {
  console.error("[ERRO] este ticket já possui transação lançada");
  process.exit(1);
}

const currentBalance = typeof wallet?.balance === "number" ? wallet.balance : 0;
const targetBalance = Number(plan.monthly_credits || 0);

if (wallet?.user_id) {
  const { error } = await supabase
    .from("credit_wallets")
    .update({
      balance: 0,
      updated_at: now,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[ERRO] falha ao zerar carteira:", error.message);
    process.exit(1);
  }
} else {
  const { error } = await supabase
    .from("credit_wallets")
    .insert({
      user_id: userId,
      balance: 0,
      updated_at: now,
    });

  if (error) {
    console.error("[ERRO] falha ao criar carteira:", error.message);
    process.exit(1);
  }
}

if (currentBalance !== 0) {
  const { error } = await supabase
    .from("credit_transactions")
    .insert({
      user_id: userId,
      subscription_id: subscription.id,
      delta: -currentBalance,
      balance_after: 0,
      transaction_type: "manual_adjustment",
      source_type: "reconciliation",
      source_id: ticketId,
      description: `Reconciliação manual para remover saldo inflado (${currentBalance})`,
      metadata: {
        mode: "reconciliation",
        previous_balance: currentBalance,
        target_plan: plan.code,
      },
      created_at: now,
    });

  if (error) {
    console.error("[ERRO] falha ao lançar ajuste de limpeza:", error.message);
    process.exit(1);
  }
}

const { error: subscriptionUpdateError } = await supabase
  .from("subscriptions")
  .update({
    plan_id: plan.id,
    status: "active",
    updated_at: now,
  })
  .eq("id", subscription.id);

if (subscriptionUpdateError) {
  console.error("[ERRO] falha ao normalizar assinatura:", subscriptionUpdateError.message);
  process.exit(1);
}

const { error: walletSetError } = await supabase
  .from("credit_wallets")
  .update({
    balance: targetBalance,
    updated_at: now,
  })
  .eq("user_id", userId);

if (walletSetError) {
  console.error("[ERRO] falha ao definir saldo final:", walletSetError.message);
  process.exit(1);
}

const { error: grantError } = await supabase
  .from("credit_transactions")
  .insert({
    user_id: userId,
    subscription_id: subscription.id,
    delta: targetBalance,
    balance_after: targetBalance,
    transaction_type: "subscription_grant",
    source_type: "support_ticket",
    source_id: ticketId,
    description: `Créditos liberados para o plano ${plan.name}`,
    metadata: {
      mode: "manual_pix",
      reconciled: true,
      plan_code: plan.code,
      plan_name: plan.name,
    },
    created_at: now,
  });

if (grantError) {
  console.error("[ERRO] falha ao lançar crédito correto:", grantError.message);
  process.exit(1);
}

const { data: ticket } = await supabase
  .from("support_tickets")
  .select("*")
  .eq("id", ticketId)
  .maybeSingle();

if (ticket?.id) {
  const originalMessage = String(ticket.message ?? "");
  const nextMessage =
    originalMessage +
    `\n\n[RECONCILIADO EM ${now}] Plano ${plan.name} normalizado manualmente. ` +
    `Saldo ajustado para ${targetBalance} créditos.`;

  await supabase
    .from("support_tickets")
    .update({
      message: nextMessage,
      updated_at: now,
    })
    .eq("id", ticket.id);
}

console.log("\n[OK] reconciliação concluída");
console.log(`USER_ID: ${userId}`);
console.log(`PLANO FINAL: ${plan.name} (${plan.code})`);
console.log(`SALDO ANTERIOR: ${currentBalance}`);
console.log(`SALDO FINAL: ${targetBalance}`);
console.log(`TICKET VINCULADO: ${ticketId}`);
