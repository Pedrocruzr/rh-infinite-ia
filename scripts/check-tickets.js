const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');

const projectDir = process.cwd();
loadEnvConfig(projectDir, true, { info: () => {}, error: () => {} });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  try {
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    console.log("Últimos chamados criados:");
    console.log(JSON.stringify(tickets, null, 2));
  } catch (err) {
    console.error("Erro ao consultar chamados:", err.message);
  }
}

check();
