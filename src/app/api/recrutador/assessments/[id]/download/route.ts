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
    return NextResponse.json(
      { error: "Erro ao carregar relatório" },
      { status: 500 }
    );
  }

  if (!assessment) {
    return NextResponse.json(
      { error: "Relatório não encontrado" },
      { status: 404 }
    );
  }

  const title = `Relatório Stacker - ${assessment.candidate_name || assessment.agent_name || assessment.id}`;
  const filenameBase = slugify(
    assessment.candidate_name || assessment.agent_name || `assessment-${assessment.id}`
  );

  const reportHtml = assessment.report_markdown || "<p>Nenhum relatório disponível.</p>";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; color: #0f172a; }
      body {
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 32px;
      }
      .report-shell {
        max-width: 1100px;
        margin: 0 auto;
      }
      h1 { margin: 0 0 32px; font-size: 42px; line-height: 1.1; font-weight: 600; }
      h2 { margin: 48px 0 20px; font-size: 30px; line-height: 1.2; font-weight: 600; }
      h3 { margin: 40px 0 16px; font-size: 24px; line-height: 1.2; font-weight: 600; }
      h4 { margin: 28px 0 12px; font-size: 20px; line-height: 1.25; font-weight: 600; }
      p, li { font-size: 18px; line-height: 1.8; margin: 0 0 14px; }
      ul, ol { margin: 0 0 24px; padding-left: 28px; }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin: 20px 0 28px;
      }
      th, td {
        border: 1px solid #e5e7eb;
        padding: 12px 14px;
        text-align: left;
        vertical-align: top;
        font-size: 16px;
        line-height: 1.7;
        overflow-wrap: anywhere;
      }
      thead th {
        background: #f8fafc;
        font-weight: 600;
      }
      img, table, pre, blockquote, section, article, .card, .block {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      pre, code {
        white-space: pre-wrap;
        word-break: break-word;
      }
      @page {
        size: A4;
        margin: 16mm;
      }
      @media print {
        body { padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="report-shell">
      ${reportHtml}
    </div>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-stacker-${filenameBase}.html"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
