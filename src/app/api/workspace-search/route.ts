import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDefaultWorkspaceSearchItems,
  rankWorkspaceSearchItems,
  STATIC_WORKSPACE_SEARCH_ITEMS,
  type WorkspaceSearchItem,
} from "@/lib/workspace-search";

export const dynamic = "force-dynamic";

function dedupeItems(items: WorkspaceSearchItem[]) {
  const seen = new Set<string>();
  const result: WorkspaceSearchItem[] = [];

  for (const item of items) {
    const key = `${item.href}::${item.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ ok: false, items: [] }, { status: 401 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({
      ok: true,
      items: getDefaultWorkspaceSearchItems(8),
    });
  }

  const admin = createAdminClient();

  const [reportsResponse, jobsResponse] = await Promise.all([
    admin
      .from("profile_assessments")
      .select("id, agent_name, candidate_name, target_role, created_at")
      .eq("report_status", "generated")
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("job_openings")
      .select("id, nome_vaga")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const reportItems: WorkspaceSearchItem[] = (reportsResponse.data ?? []).map((item: any) => ({
    title:
      item.candidate_name?.trim() ||
      item.target_role?.trim() ||
      item.agent_name?.trim() ||
      "Relatório",
    href: `/app/recrutador/assessments/${item.id}`,
    category: "Relatório",
    description: item.agent_name ? `Gerado por ${item.agent_name}` : "Relatório gerado",
    keywords: [
      item.agent_name ?? "",
      item.candidate_name ?? "",
      item.target_role ?? "",
      "relatorio",
      "assessment",
    ].filter(Boolean),
    source: "report",
  }));

  const jobItems: WorkspaceSearchItem[] = (jobsResponse.data ?? []).map((item: any) => ({
    title: item.nome_vaga?.trim() || "Vaga",
    href: "/app/painel-de-vagas",
    category: "Vaga",
    description: "Painel de Vagas",
    keywords: [item.nome_vaga ?? "", "vaga", "cargo", "job"].filter(Boolean),
    source: "job",
  }));

  const staticItems = rankWorkspaceSearchItems(STATIC_WORKSPACE_SEARCH_ITEMS, query, 12);
  const dynamicItems = rankWorkspaceSearchItems([...reportItems, ...jobItems], query, 20);

  const merged = dedupeItems([...dynamicItems, ...staticItems])
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 10);

  return NextResponse.json({
    ok: true,
    items: merged,
  });
}
