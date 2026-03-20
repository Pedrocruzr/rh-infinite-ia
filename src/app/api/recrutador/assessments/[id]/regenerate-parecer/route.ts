import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateParecer } from "@/lib/parecer-runner";
import type { ParecerSession } from "@/lib/parecer-flow";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_req: NextRequest, context: Params) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();

    const { data: assessment, error } = await supabase
      .from("profile_assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !assessment) {
      return NextResponse.json(
        { error: "Avaliação não encontrada." },
        { status: 404 }
      );
    }

    if (assessment.agent_slug !== "parecer-tecnico-entrevista") {
      return NextResponse.json(
        { error: "Regeneração disponível apenas para o agente de parecer técnico." },
        { status: 400 }
      );
    }

    const raw = (assessment.raw_answers ?? {}) as ParecerSession;

    const session: ParecerSession = {
      ...raw,
      assessmentId: assessment.id,
      empresa: raw.empresa ?? "",
      vaga: raw.vaga ?? assessment.target_role ?? "",
      candidato: raw.candidato ?? assessment.candidate_name ?? "",
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
      return NextResponse.json(
        { error: `Erro ao atualizar relatório: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao regenerar parecer:", error);

    return NextResponse.json(
      { error: "Erro ao regenerar o relatório do parecer técnico." },
      { status: 500 }
    );
  }
}
