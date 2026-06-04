import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

import { createClient } from "@/lib/supabase/server";

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
  
  // Auth — precisa estar logado
  const authSupabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: assessment, error } = await supabase
    .from("profile_assessments")
    .select("id,candidate_name,agent_name,created_at,report_markdown,report_status,recruiter_id")
    .eq("id", params.id)
    .eq("report_status", "generated")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Erro ao carregar relatório" }, { status: 500 });
  }

  if (!assessment) {
    return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });
  }

  // Check ownership
  if (assessment.recruiter_id && assessment.recruiter_id !== user.id) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  // Check if unlocked
  const { data: existingUnlock } = await supabase
    .from("usage_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_type", "report_unlock")
    .eq("metadata->>assessment_id", params.id)
    .maybeSingle();

  if (!existingUnlock) {
    return NextResponse.json(
      { error: "Você precisa desbloquear este relatório com créditos antes de baixar o PDF." },
      { status: 403 }
    );
  }

  const title = `Relatório Stacker — ${assessment.candidate_name || assessment.agent_name || assessment.id}`;
  const reportHtml = assessment.report_markdown || "<p>Nenhum relatório disponível.</p>";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #fff; color: #0f172a; font-family: Arial, Helvetica, sans-serif; }
    body { padding: 32px; }
    .shell { max-width: 1050px; margin: 0 auto; }
    section {
      background: #fff;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
    }
    h1 { font-size: 26pt; font-weight: 700; margin-bottom: 24px; color: #0f172a; line-height: 1.15; }
    h2 { font-size: 18pt; font-weight: 700; margin: 24px 0 12px; color: #0f172a; }
    h3 { font-size: 14pt; font-weight: 700; margin: 20px 0 10px; color: #0f172a; }
    h4 { font-size: 12pt; font-weight: 700; margin: 16px 0 8px; color: #0f172a; }
    p, li { font-size: 11pt; line-height: 1.75; margin-bottom: 8pt; color: #374151; }
    ul, ol { padding-left: 22pt; margin-bottom: 12pt; }
    table { width: 100%; border-collapse: collapse; margin: 12pt 0 16pt; }
    th, td { border: 1px solid #cbd5e1; padding: 7pt 9pt; text-align: left; vertical-align: top; font-size: 10pt; line-height: 1.5; color: #374151; }
    thead th { background: #f8fafc; font-weight: 700; color: #0f172a; }
    svg, img { display: block; margin: 0 auto; max-width: 100%; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      @page { size: A4; margin: 14mm 16mm; }
      section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#1e293b;color:#f1f5f9;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;font-family:Arial,sans-serif;font-size:14px;">
    <span>📄 Para salvar como PDF: <strong>Arquivo → Imprimir → Salvar como PDF</strong></span>
    <button onclick="window.print()" style="background:#3b82f6;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">⬇ Baixar PDF</button>
  </div>
  <div class="shell" style="margin-top:52px;">
    ${reportHtml}
  </div>
  <script>
    window.onload = function() {
      // pequeno delay para garantir renderização dos SVGs
      setTimeout(function() { window.print(); }, 600);
    };
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
