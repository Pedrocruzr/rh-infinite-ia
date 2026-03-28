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

function addOneMonth(iso) {
  const date = new Date(iso);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : "";
}

const ticketId = getArg("ticket");
if (!ticketId) {
  console.error('Uso: node scripts/approve-manual-subscription.mjs --ticket="ID_DO_TICKET"');
  process.exit(1);
}

const env = loadEnv(".env.local");
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const { data: ticket, error: ticketError } = await supabase
  .from("support_tickets")
  .select("*")
  .eq("id", ticketId)
  .maybeSingle();

if (ticketError || !ticket) {
  console.error("[ERRO] ticket não encontrado");
  process.exit(1);
}

const message = String(ticket.message ?? "");
const planCodeMatch = message.match(/Código do plano:\s*([a-z0-9-_]+)/i);
const planCode = planCodeMatch?.[1]?.trim();

if (!ticket.user_id) {
  console.error("[ERRO] ticket sem user_id");
  process.exit(1);
}

if (!planCode) {
  console.error("[ERRO] não consegui extrair o código do plano do ticket");
  process.exit(1);
}

const { data: existingCredit } = await supabase
  .from("credit_transactions")
  .select("id")
  .eq("source_type", "support_ticket")
  .eq("source_id", ticket.id)
  .maybeSingle();

if (existingCredit?.id) {
  console.error("[ERRO] este ticket já foi aprovado antes");
  process.exit(1);
}

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

const now = new Date().toISOString();
const periodEnd = addOneMonth(now);

const { data: existingSubscription } = await supabase
  .from("subscriptions")
  .select("*")
  .eq("user_id", ticket.user_id)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

let subscription = null;

if (existingSubscription?.id) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      plan_id: plan.id,
      status: "active",
      current_period_start: now,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      updated_at: now,
    })
    .eq("id", existingSubscription.id)
    .select("*")
    .single();

  if (error) {
    console.error("[ERRO] falha ao atualizar assinatura:", error.message);
    process.exit(1);
  }

  subscription = data;
} else {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: ticket.user_id,
      plan_id: plan.id,
      status: "active",
      current_period_start: now,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[ERRO] falha ao criar assinatura:", error.message);
    process.exit(1);
  }

  subscription = data;
}

const { data: wallet } = await supabase
  .from("credit_wallets")
  .select("*")
  .eq("user_id", ticket.user_id)
  .maybeSingle();

const currentBalance = typeof wallet?.balance === "number" ? wallet.balance : 0;
const nextBalance = currentBalance + Number(plan.monthly_credits || 0);

if (wallet?.user_id) {
  const { error } = await supabase
    .from("credit_wallets")
    .update({
      balance: nextBalance,
      updated_at: now,
    })
    .eq("user_id", ticket.user_id);

  if (error) {
    console.error("[ERRO] falha ao atualizar carteira:", error.message);
    process.exit(1);
  }
} else {
  const { error } = await supabase
    .from("credit_wallets")
    .insert({
      user_id: ticket.user_id,
      balance: nextBalance,
      updated_at: now,
    });

  if (error) {
    console.error("[ERRO] falha ao criar carteira:", error.message);
    process.exit(1);
  }
}

const { error: transactionError } = await supabase
  .from("credit_transactions")
  .insert({
    user_id: ticket.user_id,
    subscription_id: subscription.id,
    delta: Number(plan.monthly_credits || 0),
    balance_after: nextBalance,
    transaction_type: "subscription_grant",
    source_type: "support_ticket",
    source_id: ticket.id,
    description: `Créditos liberados manualmente para o plano ${plan.name}`,
    metadata: {
      approved_from_ticket: ticket.id,
      plan_code: plan.code,
      plan_name: plan.name,
      mode: "manual_pix",
    },
    created_at: now,
  });

if (transactionError) {
  console.error("[ERRO] falha ao criar transação:", transactionError.message);
  process.exit(1);
}

const approvalNote =
  `\n\n[APROVADO EM ${now}] Plano ${plan.name} ativado manualmente. ` +
  `${plan.monthly_credits} créditos liberados. Saldo atual: ${nextBalance}.`;

const { error: ticketUpdateError } = await supabase
  .from("support_tickets")
  .update({
    message: `${message}${approvalNote}`,
    updated_at: now,
  })
  .eq("id", ticket.id);

if (ticketUpdateError) {
  console.error("[ERRO] falha ao atualizar ticket:", ticketUpdateError.message);
  process.exit(1);
}

console.log("\n[OK] pagamento manual aprovado com sucesso");
console.log(`TICKET: ${ticket.id}`);
console.log(`USER_ID: ${ticket.user_id}`);
console.log(`PLANO: ${plan.name} (${plan.code})`);
console.log(`CRÉDITOS LIBERADOS: ${plan.monthly_credits}`);
console.log(`SALDO ATUAL: ${nextBalance}`);
console.log(`ASSINATURA: ${subscription.id}`);
