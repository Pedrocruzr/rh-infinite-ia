import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, Sparkles, Lock } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import RegenerateReportDialog from "@/components/assessments/regenerate-report-dialog";
import AssessmentReportContent from "@/components/assessments/assessment-report-content";
import UnlockReportButton from "@/components/assessments/unlock-report-button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RecruiterAssessmentDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user?.id) {
    notFound();
  }

  const supabase = createAdminClient();

  const { data: assessment } = await supabase
    .from("profile_assessments")
    .select("*")
    .eq("id", id)
    .single();

  if (!assessment) {
    notFound();
  }

  // Validate ownership
  if (assessment.recruiter_id && assessment.recruiter_id !== user.id) {
    notFound();
  }

  // Check if report is unlocked
  const { data: existingUnlock } = await supabase
    .from("usage_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_type", "report_unlock")
    .eq("metadata->>assessment_id", id)
    .maybeSingle();

  const isUnlocked = !!existingUnlock;

  // Fetch current credit balance
  const { data: wallet } = await supabase
    .from("credit_wallets")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch agent cost
  const { data: agent } = await supabase
    .from("agents")
    .select("name, credit_cost")
    .eq("slug", assessment.agent_slug)
    .maybeSingle();

  const cost = agent?.credit_cost ?? 2;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-8 py-10 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                <Sparkles className="h-3.5 w-3.5" />
                Relatório detalhado
              </div>
              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em]">
                Detalhe da avaliação
              </h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Visualize o conteúdo completo gerado pelo agente.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isUnlocked && assessment?.id ? (
                <>
                  <RegenerateReportDialog assessmentId={assessment.id} />
                  <a
                    href={`/api/recrutador/assessments/${assessment.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                  >
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </a>
                </>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/50 bg-slate-100/50 px-5 py-3 text-sm font-medium text-slate-400 dark:border-white/5 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed"
                >
                  <Lock className="h-4 w-4" />
                  PDF Bloqueado
                </button>
              )}
              <Link
                href="/app/recrutador/assessments"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </div>
          </div>

          <div className="mb-6 rounded-[1.75rem] border border-slate-200/80 bg-slate-50/70 p-6 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Agente usado</p>
                <p className="mt-2 text-lg font-medium">{assessment.agent_name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Criado em</p>
                <p className="mt-2 text-lg font-medium">
                  {assessment.created_at
                    ? new Date(assessment.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Conteúdo completo</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Leitura integral do relatório.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Download rápido</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Exportação em um clique.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Regeneração guiada</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ajuste fino sem sair da tela.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0b1728]">
          {isUnlocked ? (
            <AssessmentReportContent assessment={assessment} />
          ) : (
            <UnlockReportButton
              assessmentId={assessment.id}
              cost={cost}
              currentBalance={wallet?.balance ?? 0}
            />
          )}
        </div>
      </div>
    </main>
  );
}
