const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');

const projectDir = process.cwd();
loadEnvConfig(projectDir, true, { info: () => {}, error: () => {} });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  try {
    const targetEmail = "testekiwify@stackercompany.com.br";
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', targetEmail)
      .maybeSingle();

    if (!profile) {
      console.log("Perfil não encontrado.");
      return;
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    console.log("Informaçoes da assinatura:");
    console.log(JSON.stringify(subscription, null, 2));
  } catch (err) {
    console.error("Erro:", err.message);
  }
}

check();
