import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import RegenerateReportDialog from "@/components/assessments/regenerate-report-dialog";
import AssessmentReportContent from "@/components/assessments/assessment-report-content";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RecruiterAssessmentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: assessment } = await supabase
    .from("profile_assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (!assessment) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-8 py-10 text-black">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight">
              Detalhe da avaliação
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              Visualize o conteúdo completo gerado pelo agente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {assessment?.id ? <RegenerateReportDialog assessmentId={assessment.id} /> : null}
            <a
              href={`/api/recrutador/assessments/${assessment.id}/download`}
              className="rounded-2xl border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-50"
            >
              Baixar
            </a>
            <Link
              href="/app/recrutador/assessments"
              className="rounded-2xl border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-50"
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-neutral-200 bg-neutral-50/50 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-neutral-500">Agente usado</p>
              <p className="mt-2 text-lg font-medium">{assessment.agent_name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Criado em</p>
              <p className="mt-2 text-lg font-medium">
                {assessment.created_at
                  ? new Date(assessment.created_at).toLocaleString("pt-BR")
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-10">
          <AssessmentReportContent assessment={assessment} />
        </div>
      </div>
    </main>
  );
}
