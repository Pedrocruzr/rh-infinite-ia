import { createClient } from "@supabase/supabase-js";
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTests() {
  console.log("=== Iniciando Testes de Integração do Webhook Asaas ===");

  const testEmail = `test_asaas_${Date.now()}@example.com`;
  const testPaymentId = `pay_test_${Date.now()}`;
  const testSubscriptionId = `sub_test_${Date.now()}`;

  console.log(`\nEmail de teste gerado: ${testEmail}`);
  console.log(`Payment ID: ${testPaymentId}`);
  console.log(`Subscription ID: ${testSubscriptionId}`);

  // Payload mockado enriquecido com detalhes do cliente
  const mockPayload = {
    event: "PAYMENT_RECEIVED",
    payment: {
      id: testPaymentId,
      subscription: testSubscriptionId,
      customer: "cus_test_999",
      value: 67.90,
      status: "RECEIVED",
      billingType: "CREDIT_CARD"
    },
    customerDetails: {
      email: testEmail,
      name: "Cliente Teste Asaas Link Externo"
    }
  };

  // --- TESTE 1: Cliente não existe no banco (saved_for_later_registration) ---
  console.log("\n[Teste 1] Testando pagamento recebido para cliente INEXISTENTE (deve salvar pendente)...");
  
  const { data: res1, error: err1 } = await supabase.rpc("process_asaas_payment_event", {
    p_event_id: `evt_test_1_${Date.now()}`,
    p_event_type: "PAYMENT_RECEIVED",
    p_payload: mockPayload
  });

  if (err1) {
    console.error("❌ Falha na RPC do Teste 1:", err1.message);
  } else {
    console.log("✔️ Resposta da RPC do Teste 1:", res1);
    if (res1.status === "saved_for_later_registration") {
      console.log("✅ Sucesso: O pagamento foi salvo para cadastro posterior!");
    } else {
      console.error("❌ Erro: O status deveria ser 'saved_for_later_registration'.");
    }
  }

  // Verificar se o registro foi salvo na tabela pending_asaas_purchases
  const { data: pendingRecord, error: pendingErr } = await supabase
    .from("pending_asaas_purchases")
    .select("*")
    .eq("payment_id", testPaymentId)
    .maybeSingle();

  if (pendingErr || !pendingRecord) {
    console.error("❌ Registro pendente não foi encontrado na tabela pending_asaas_purchases.");
  } else {
    console.log("✅ Registro pendente encontrado na tabela com sucesso!");
    console.log(`   Pendente: Email=${pendingRecord.email}, Processed=${pendingRecord.processed}`);
  }

  // --- TESTE 2: Cadastro de Novo Usuário Consumindo Compra Pendente ---
  console.log("\n[Teste 2] Simulando o cadastro do usuário para levantar o trigger e consumir a compra pendente...");
  
  // Criar um novo usuário na auth com o mesmo email
  const tempPassword = "Password123!";
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: "Cliente Teste Asaas Link Externo" }
  });

  if (authErr) {
    console.error("❌ Erro ao criar usuário de teste na Auth:", authErr.message);
  } else {
    const newUserId = authData.user?.id;
    console.log(`✅ Usuário criado na Auth com ID: ${newUserId}`);

    // Verificar se o trigger handle_new_user processou a compra pendente
    const { data: subRecord, error: subErr } = await supabase
      .from("subscriptions")
      .select("*, plans(code, name, monthly_credits)")
      .eq("user_id", newUserId)
      .maybeSingle();

    if (subErr || !subRecord) {
      console.error("❌ Assinatura não foi criada para o novo usuário.");
    } else {
      console.log("✅ Assinatura criada automaticamente!");
      console.log(`   Plano: ${subRecord.plans.name} (${subRecord.plans.code})`);
      console.log(`   Status da Assinatura: ${subRecord.status}`);
      console.log(`   Asaas Subscription ID: ${subRecord.asaas_subscription_id}`);
      
      if (subRecord.plans.code === "perfil_comportamental") {
        console.log("✅ Sucesso: O plano associado foi o Perfil Comportamental!");
      } else {
        console.error("❌ Erro: O plano deveria ser 'perfil_comportamental'.");
      }
    }

    // Verificar os créditos do usuário
    const { data: walletRecord } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", newUserId)
      .maybeSingle();

    console.log(`   Saldo da carteira de créditos: ${walletRecord?.balance} créditos`);
    if (walletRecord?.balance === 9) {
      console.log("✅ Sucesso: O usuário recebeu os 9 créditos corretos do plano!");
    } else {
      console.error("❌ Erro: O saldo deveria ser 9 créditos.");
    }

    // Verificar se a compra pendente foi marcada como processada
    const { data: updatedPending } = await supabase
      .from("pending_asaas_purchases")
      .select("processed")
      .eq("payment_id", testPaymentId)
      .maybeSingle();
      
    if (updatedPending?.processed === true) {
      console.log("✅ Compra pendente marcada como processada = true!");
    } else {
      console.error("❌ Erro: A compra pendente ainda está como processada = false.");
    }

    // Limpar dados do teste
    console.log("\nLimpar dados do teste...");
    if (newUserId) {
      await supabase.auth.admin.deleteUser(newUserId);
      console.log("   Usuário deletado da Auth.");
    }
    await supabase.from("pending_asaas_purchases").delete().eq("payment_id", testPaymentId);
    console.log("   Compra pendente deletada.");
  }

  console.log("\n=== Testes Concluídos ===");
}

runTests();
