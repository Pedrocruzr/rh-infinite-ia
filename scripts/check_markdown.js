const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/pedroneto/Desktop/projetocodex/microsaas/rh-infinite-ia/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('profile_assessments')
    .select('id, created_at, report_markdown')
    .eq('agent_slug', 'analista-diagnostico-six-box')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data.length) {
    console.error("Error:", error);
    return;
  }

  const md = data[0].report_markdown;
  console.log("Latest ID:", data[0].id);
  console.log("Length of report_markdown:", md?.length);
  console.log("First 300 chars:", md?.substring(0, 300));
  console.log("Contains SVG:", md?.includes('<svg') || md?.includes('<circle'));
}

run();
