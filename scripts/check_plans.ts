import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = "https://ngfwhcdcdqmpfgwpjclt.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

async function checkPlans() {
  const { data, error } = await supabase.from("plans").select("code, name");
  if (error) {
    console.error("Error fetching plans:", error);
  } else {
    console.log("Current plans in database:", data);
  }
}

checkPlans();
