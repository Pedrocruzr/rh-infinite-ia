import Link from "next/link";
import { BadgeCheck, Download, FileText, Sparkles, Lock } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";

export default async function RecruiterAssessmentsPage() {
  const user = await getSessionUser();
  const supabase = createAdminClient();

  const query = supabase
    .from("profile_assessments")
    .select("*")
    .eq("report_status", "generated")
    .order("created_at", { ascending: false });

  const { data: assessments } = user?.id
    ? await query.eq("recruiter_id", user.id)
    : await query;

  const { data: unlocks } = user?.id
    ? await supabase
        .from("usage_events")
        .select("metadata")
        .eq("user_id", user.id)
        .eq("event_type", "report_unlock")
    : { data: [] };

  const unlockedIds = new Set(
    unlocks?.map((u) => (u.metadata as any)?.assessment_id).filter(Boolean) || []
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-6 text-slate-950 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7 lg:p-8 dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
            <Sparkles className="h-3.5 w-3.5" />
            Central de relatórios
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.05em] sm:mt-6 sm:text-4xl lg:text-5xl">
            Relatórios Stackers
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base md:text-lg dark:text-slate-300">
            Consulte avaliações geradas, acompanhe o histórico e abra rapidamente cada relatório completo.
          </p>

          <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Relatórios gerados</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Acesso centralizado às avaliações.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Leitura rápida</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Agente, data e ação em uma visão só.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Download imediato</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Baixe antes do prazo expirar.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 rounded-[1.75rem] border border-amber-300/50 bg-amber-500/10 px-4 py-4 text-sm leading-7 text-amber-900 sm:px-5 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <strong>Aviso:</strong> este relatório ficará disponível por <strong>3 dias</strong> a partir da data de criação.
          Para evitar perda de informações, recomendamos que o recrutador <strong>copie, salve ou baixe o conteúdo</strong> para consulta posterior antes do prazo de expiração.
        </div>

        <div className="mt-8 hidden overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:block dark:border-white/10 dark:bg-[#102033]/72">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-100/80 dark:bg-white/5">
              <tr className="text-sm text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4">Agente usado</th>
                <th className="px-6 py-4">Criado em</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {assessments && assessments.length > 0 ? (
                assessments.map((assessment) => {
                  const isUnlocked = unlockedIds.has(assessment.id);
                  return (
                    <tr key={assessment.id} className="border-t border-slate-200/80 dark:border-white/10">
                      <td className="px-6 py-5">{assessment.agent_name || "—"}</td>
                      <td className="px-6 py-5">
                        {assessment.created_at
                          ? new Date(assessment.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
                          : "—"}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/app/recrutador/assessments/${assessment.id}`}
                            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                          >
                            {isUnlocked ? "Abrir" : "Desbloquear"}
                          </Link>
                          {isUnlocked ? (
                            <a
                              href={`/api/recrutador/assessments/${assessment.id}/download`}
                              className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                            >
                              Baixar
                            </a>
                          ) : (
                            <button
                              disabled
                              className="rounded-xl border border-slate-200/50 bg-slate-100/50 px-4 py-2 text-sm font-medium text-slate-400 dark:border-white/5 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed inline-flex items-center gap-1.5"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              Bloqueado
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-slate-500 dark:text-slate-400">
                    Nenhum relatório encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 space-y-4 md:hidden">
          {assessments && assessments.length > 0 ? (
            assessments.map((assessment) => {
              const isUnlocked = unlockedIds.has(assessment.id);
              return (
                <article
                  key={assessment.id}
                  className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Agente usado</p>
                      <h2 className="mt-1 text-base font-semibold leading-6 text-slate-950 dark:text-white">
                        {assessment.agent_name || "—"}
                      </h2>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Criado em</p>
                      <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                        {assessment.created_at
                          ? new Date(assessment.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/app/recrutador/assessments/${assessment.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                    >
                      {isUnlocked ? "Abrir" : "Desbloquear"}
                    </Link>
                    {isUnlocked ? (
                      <a
                        href={`/api/recrutador/assessments/${assessment.id}/download`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                      >
                        Baixar
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/50 bg-slate-100/50 px-4 py-3 text-sm font-medium text-slate-400 dark:border-white/5 dark:bg-white/5 dark:text-slate-500 cursor-not-allowed"
                      >
                        <Lock className="h-4 w-4" />
                        Bloqueado
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 px-5 py-8 text-sm text-slate-500 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#102033]/72 dark:text-slate-400">
              Nenhum relatório encontrado.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
