import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { regenerateReportBySlug } from "@/lib/reports/regenerate";
import { applyReportAdjustment } from "@/lib/ai/apply-report-adjustment";

function safeStableStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json().catch(() => ({}));
    const instruction = String(body?.instruction || "").trim();

    const { data, error } = await supabase
      .from("profile_assessments")
      .select("id, agent_slug, raw_answers")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Assessment não encontrado" },
        { status: 404 }
      );
    }

    const originalRawAnswers = data.raw_answers ?? {};
    let adjustedRawAnswers = originalRawAnswers;

    if (instruction) {
      adjustedRawAnswers = await applyReportAdjustment(originalRawAnswers, instruction);
    }

    const changed =
      safeStableStringify(originalRawAnswers) !== safeStableStringify(adjustedRawAnswers);

    console.log("[assessments/regenerate] id:", id);
    console.log("[assessments/regenerate] slug:", String(data.agent_slug || "").trim());
    console.log("[assessments/regenerate] instruction:", instruction);
    console.log("[assessments/regenerate] changed:", changed);
    console.log(
      "[assessments/regenerate] originalRawAnswers:",
      JSON.stringify(originalRawAnswers, null, 2)
    );
    console.log(
      "[assessments/regenerate] adjustedRawAnswers:",
      JSON.stringify(adjustedRawAnswers, null, 2)
    );

    const reportMarkdown = regenerateReportBySlug(
      String(data.agent_slug || "").trim(),
      adjustedRawAnswers
    );

    console.log(
      "[assessments/regenerate] report length:",
      typeof reportMarkdown === "string" ? reportMarkdown.length : 0
    );

    const { error: updateError } = await supabase
      .from("profile_assessments")
      .update({
        raw_answers: adjustedRawAnswers,
        report_markdown: reportMarkdown,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: `Erro ao atualizar assessment: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      changed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao regenerar relatório",
      },
      { status: 500 }
    );
  }
}
