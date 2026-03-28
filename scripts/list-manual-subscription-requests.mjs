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

const env = loadEnv(".env.local");
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const { data, error } = await supabase
  .from("support_tickets")
  .select("*")
  .ilike("subject", "Solicitação de assinatura%")
  .order("created_at", { ascending: false })
  .limit(50);

if (error) {
  console.error("[ERRO]", error.message);
  process.exit(1);
}

if (!data?.length) {
  console.log("Nenhuma solicitação manual encontrada.");
  process.exit(0);
}

for (const item of data) {
  console.log("\n==============================");
  console.log(`TICKET: ${item.id}`);
  console.log(`USER_ID: ${item.user_id ?? "—"}`);
  console.log(`ASSUNTO: ${item.subject}`);
  console.log(`STATUS: ${item.status}`);
  console.log(`CRIADO EM: ${item.created_at}`);
  console.log("MENSAGEM:");
  console.log(item.message ?? "—");
}
