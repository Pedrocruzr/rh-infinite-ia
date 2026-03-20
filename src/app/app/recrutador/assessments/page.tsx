import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function RecruiterAssessmentsPage() {
  const supabase = createAdminClient();

  await supabase
    .from("profile_assessments")
    .delete()
    .lt("expires_at", new Date().toISOString());

  const { data: assessments } = await supabase
    .from("profile_assessments")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white px-8 py-10 text-black">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-neutral-500">Recrutador</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">
          Avaliações recebidas
        </h1>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
          <strong>Aviso:</strong> este relatório ficará disponível por <strong>3 dias</strong> a partir da data de criação.
          Para evitar perda de informações, recomendamos que o recrutador <strong>copie ou salve o conteúdo</strong> para consulta posterior antes do prazo de expiração.
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
          <table className="w-full border-collapse text-left">
            <thead className="bg-neutral-50">
              <tr className="text-sm text-neutral-600">
                <th className="px-6 py-4">Candidato</th>
                <th className="px-6 py-4">Vaga</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Relatório</th>
                <th className="px-6 py-4">Criado em</th>
                <th className="px-6 py-4">Agente usado</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {assessments && assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <tr key={assessment.id} className="border-t border-neutral-200">
                    <td className="px-6 py-5">{assessment.candidate_name || "—"}</td>
                    <td className="px-6 py-5">{assessment.target_role || "—"}</td>
                    <td className="px-6 py-5">{assessment.status || "—"}</td>
                    <td className="px-6 py-5">{assessment.report_status || "—"}</td>
                    <td className="px-6 py-5">
                      {assessment.created_at
                        ? new Date(assessment.created_at).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-6 py-5">{assessment.agent_name || "—"}</td>
                    <td className="px-6 py-5">
                      <Link
                        href={`/app/recrutador/assessments/${assessment.id}`}
                        className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-neutral-500">
                    Nenhuma avaliação encontrada.
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
