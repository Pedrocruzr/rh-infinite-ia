import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import GenerateReportButton from "@/components/recruiter/generate-report-button";

export default async function RecruiterAssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: assessment, error } = await supabase
    .from("profile_assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !assessment) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-black">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-500">Recrutador</p>
            <h1 className="text-4xl font-semibold">
              {assessment.candidate_name || "Candidato sem nome"}
            </h1>
            <p className="mt-2 text-neutral-600">
              Vaga: {assessment.target_role || "Não informada"}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/app/recrutador/assessments"
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Voltar
            </Link>

            <GenerateReportButton
              assessmentId={assessment.id}
              reportStatus={assessment.report_status}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
          <strong>Aviso:</strong> este relatório ficará disponível por <strong>3 dias</strong> a partir da data de criação.
          Para evitar perda de informações, recomendamos que o recrutador <strong>copie ou salve o conteúdo</strong> para consulta posterior antes do prazo de expiração.
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">Dados gerais</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p><strong>Status:</strong> {assessment.status}</p>
              <p><strong>Status do relatório:</strong> {assessment.report_status}</p>
              <p><strong>Agente usado:</strong> {assessment.agent_name || "—"}</p>
              <p><strong>DISC:</strong> {assessment.disc_answer || "—"}</p>
              <p><strong>Motivação:</strong> {assessment.motivation_answer || "—"}</p>
              <p><strong>Competências:</strong> {(assessment.competencies || []).join(", ") || "—"}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">Respostas abertas</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="font-medium">Exemplo 1</p>
                <p className="text-neutral-700">{assessment.example_1 || "—"}</p>
              </div>
              <div>
                <p className="font-medium">Exemplo 2</p>
                <p className="text-neutral-700">{assessment.example_2 || "—"}</p>
              </div>
              <div>
                <p className="font-medium">Exemplo 3</p>
                <p className="text-neutral-700">{assessment.example_3 || "—"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-semibold">Relatório profissional</h2>

          {assessment.report_markdown ? (
            <pre className="mt-6 whitespace-pre-wrap text-[16px] leading-8 text-neutral-800">
              {assessment.report_markdown}
            </pre>
          ) : (
            <p className="mt-4 text-neutral-500">
              O relatório ainda não foi gerado. Clique em <strong>Gerar relatório</strong>.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
