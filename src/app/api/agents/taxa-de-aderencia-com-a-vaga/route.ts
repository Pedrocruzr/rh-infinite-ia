import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateTaxaAderenciaReport } from "@/lib/agents/taxa-de-aderencia-com-a-vaga/runner";

type RequestBody = {
  assessmentId?: string;
  answers?: {
    recruiterName?: string;
    validatorName?: string;
    approverName?: string;
    targetRole?: string;
    culturalMission?: string;
    culturalVision?: string;
    culturalValues?: string;
    culturalContext?: string;
    candidateName?: string;
    candidateDisc?: string;
    candidateEnneagram?: string;
    candidateExperience?: string;
    behavioralTestInput?: string;
  };
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const answers = body.answers ?? {};
    const supabase = createAdminClient();

    const candidateName = (answers.candidateName ?? "").trim();
    const targetRole = (answers.targetRole ?? "").trim();

    if (!candidateName) {
      return NextResponse.json(
        { ok: false, error: "candidateName é obrigatório." },
        { status: 400 },
      );
    }

    if (!targetRole) {
      return NextResponse.json(
        { ok: false, error: "targetRole é obrigatório." },
        { status: 400 },
      );
    }

    const reportHtml = generateTaxaAderenciaReport(answers);
    const now = new Date().toISOString();
    const expiresAt = addDays(new Date(), 3);

    const payload = {
      candidate_name: candidateName,
      target_role: targetRole,
      agent_slug: "taxa-de-aderencia-com-a-vaga",
      status: "completed",
      report_status: "generated",
      report_markdown: reportHtml,
      raw_answers: {
        ...answers,
        status: "completed",
        reportStatus: "generated",
      },
      expires_at: expiresAt,
      updated_at: now,
    };

    if (body.assessmentId) {
      const { data, error } = await supabase
        .from("profile_assessments")
        .update(payload)
        .eq("id", body.assessmentId)
        .select("id, candidate_name, target_role, agent_slug, status, report_status")
        .single();

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        ok: true,
        mode: "updated",
        assessment: data,
        report: reportHtml,
      });
    }

    const { data, error } = await supabase
      .from("profile_assessments")
      .insert({
        ...payload,
        created_at: now,
      })
      .select("id, candidate_name, target_role, agent_slug, status, report_status")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "inserted",
      assessment: data,
      report: reportHtml,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erro inesperado ao gerar relatório.",
      },
      { status: 500 },
    );
  }
}
