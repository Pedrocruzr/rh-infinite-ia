import { createAdminClient } from "../src/lib/supabase/admin";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function run() {
  console.log("=== Criando Usuário de Teste para Revisão da Hotmart ===");
  const email = "teste-hotmart@stackercompany.com.br";
  const password = "Hotmart123!";
  const name = "Revisor Hotmart";

  const supabase = createAdminClient();

  try {
    // 1. Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    let user = existingUsers.users.find(u => u.email === email);

    if (!user) {
      console.log("Criando usuário no Supabase Auth...");
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name }
      });
      if (createError) throw createError;
      user = newUser.user;
      console.log(`Usuário criado com ID: ${user.id}`);
    } else {
      console.log(`Usuário já existe com ID: ${user.id}`);
    }

    // 2. Fetch 'start' plan to give access to all agents for review
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id")
      .eq("code", "start")
      .maybeSingle();

    if (planError || !plan) {
      throw new Error("Plano 'start' não encontrado no banco de dados.");
    }

    // 3. Create or update active subscription
    console.log("Ativando assinatura do usuário...");
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false
      })
      .select("id")
      .maybeSingle();

    // If active subscription exists, force update
    if (subError) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan_id: plan.id,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        })
        .eq("user_id", user.id);
      if (updateError) throw updateError;
    }

    // 4. Grant credits to wallet
    console.log("Adicionando créditos de teste...");
    const { error: grantError } = await supabase
      .from("credit_grants")
      .insert({
        user_id: user.id,
        source_type: "topup",
        source_id: "hotmart_test_initial",
        total_credits: 100,
        remaining_credits: 100,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    // Recompute wallet
    const { error: rpcError } = await supabase.rpc("recompute_credit_wallet", { p_user_id: user.id });
    if (rpcError) console.error("Erro ao recomputar carteira:", rpcError);

    console.log("✅ Usuário de teste ativo criado com sucesso!");
    console.log(`E-mail: ${email}`);
    console.log(`Senha: ${password}`);
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

run();
