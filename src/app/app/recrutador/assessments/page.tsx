import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function RecruiterAssessmentsPage() {
  const supabase = createAdminClient();

  const { data: assessments } = await supabase
    .from("profile_assessments")
    .select("*")
    .eq("report_status", "generated")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-background px-8 py-10 text-foreground">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">
          Relatórios Stackers
        </h1>

        <div className="mt-6 rounded-2xl border border-amber-300/50 bg-amber-500/10 px-5 py-4 text-sm leading-7 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <strong>Aviso:</strong> este relatório ficará disponível por <strong>3 dias</strong> a partir da data de criação.
          Para evitar perda de informações, recomendamos que o recrutador <strong>copie, salve ou baixe o conteúdo</strong> para consulta posterior antes do prazo de expiração.
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border">
          <table className="w-full border-collapse text-left">
            <thead className="bg-muted/40">
              <tr className="text-sm text-muted-foreground">
                <th className="px-6 py-4">Agente usado</th>
                <th className="px-6 py-4">Criado em</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {assessments && assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <tr key={assessment.id} className="border-t border-border">
                    <td className="px-6 py-5">{assessment.agent_name || "—"}</td>
                    <td className="px-6 py-5">
                      {assessment.created_at
                        ? new Date(assessment.created_at).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/app/recrutador/assessments/${assessment.id}`}
                          className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted/40"
                        >
                          Abrir
                        </Link>
                        <a
                          href={`/api/recrutador/assessments/${assessment.id}/download`}
                          className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted/40"
                        >
                          Baixar
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-muted-foreground">
                    Nenhum relatório encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
