import { createAdminClient } from "../src/lib/supabase/admin";
import { generateParecer } from "../src/lib/parecer-runner";
import type { ParecerSession } from "../src/lib/parecer-flow";

async function main() {
  const supabase = createAdminClient();

  const { data: assessment, error } = await supabase
    .from("profile_assessments")
    .select("*")
    .eq("agent_slug", "parecer-tecnico-entrevista")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar o último parecer: ${error.message}`);
  }

  if (!assessment) {
    throw new Error("Nenhuma avaliação do agente parecer-tecnico-entrevista foi encontrada.");
  }

  const raw = (assessment.raw_answers ?? {}) as ParecerSession;

  const session: ParecerSession = {
    ...raw,
    assessmentId: assessment.id,
    empresa: raw.empresa ?? assessment.agent_name ?? raw.empresa,
    vaga: raw.vaga ?? assessment.target_role ?? raw.vaga,
    candidato: raw.candidato ?? assessment.candidate_name ?? raw.candidato,
    status: "completed",
    reportStatus: "generated",
  };

  const reportMarkdown = await generateParecer(session);

  const { error: updateError } = await supabase
    .from("profile_assessments")
    .update({
      candidate_name: session.candidato ?? assessment.candidate_name ?? "",
      target_role: session.vaga ?? assessment.target_role ?? "",
      status: "completed",
      report_status: "generated",
      report_markdown: reportMarkdown,
      raw_answers: {
        ...raw,
        ...session,
        status: "completed",
        reportStatus: "generated",
        reportMarkdown,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessment.id);

  if (updateError) {
    throw new Error(`Erro ao atualizar o último parecer: ${updateError.message}`);
  }

  console.log("OK: último parecer regenerado com o novo modelo.");
  console.log(`ID: ${assessment.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
