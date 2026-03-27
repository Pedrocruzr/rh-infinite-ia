import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Context = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: Request, context: Context) {
  const params = await context.params;
  const supabase = createAdminClient();

  const { data: assessment, error } = await supabase
    .from("profile_assessments")
    .select("id,candidate_name,agent_name,created_at,report_markdown,report_status")
    .eq("id", params.id)
    .eq("report_status", "generated")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Erro ao carregar relatório" }, { status: 500 });
  }

  if (!assessment) {
    return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });
  }

  const title = `Relatório Stacker - ${assessment.candidate_name || assessment.agent_name || assessment.id}`;
  const filenameBase = slugify(
    assessment.candidate_name || assessment.agent_name || `assessment-${assessment.id}`
  );

  const reportHtml = assessment.report_markdown || "<p>Nenhum relatório disponível.</p>";

  const docHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40"
      lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; color: #0f172a; }
      body { font-family: Arial, Helvetica, sans-serif; padding: 32px; }
      .report-shell { max-width: 1100px; margin: 0 auto; }
      h1 { margin: 0 0 32px; font-size: 28pt; line-height: 1.15; font-weight: 700; }
      h2 { margin: 28px 0 14px; font-size: 20pt; line-height: 1.2; font-weight: 700; }
      h3 { margin: 22px 0 12px; font-size: 16pt; line-height: 1.2; font-weight: 700; }
      h4 { margin: 18px 0 10px; font-size: 13pt; line-height: 1.2; font-weight: 700; }
      p, li { font-size: 11pt; line-height: 1.7; margin: 0 0 10pt; }
      ul, ol { margin: 0 0 14pt; padding-left: 24pt; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 14pt 0 18pt; }
      th, td {
        border: 1px solid #cbd5e1;
        padding: 8pt 10pt;
        text-align: left;
        vertical-align: top;
        font-size: 10.5pt;
        line-height: 1.5;
        word-wrap: break-word;
      }
      thead th { background: #f8fafc; font-weight: 700; }
      img, table, pre, blockquote, section, article, .card, .block { page-break-inside: avoid; }
      pre, code { white-space: pre-wrap; word-break: break-word; }
      @page { size: A4; margin: 16mm; }
    </style>
  </head>
  <body>
    <div class="report-shell">
      ${reportHtml}
    </div>
  </body>
</html>`;

  return new NextResponse(docHtml, {
    status: 200,
    headers: {
      "Content-Type": "application/msword; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-stacker-${filenameBase}.doc"`,
      "Cache-Control": "no-store, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0"
    },
  });
}
