import { NextResponse } from "next/server";
import { formatCltAnswer, searchCltKnowledge } from "@/lib/agents/clt-ia/pdf-search";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query =
      typeof body?.message === "string"
        ? body.message.trim()
        : typeof body?.query === "string"
          ? body.query.trim()
          : "";

    if (!query) {
      return NextResponse.json(
        {
          ok: false,
          reply: "Digite um tema, artigo ou dúvida sobre a CLT para pesquisar.",
        },
        { status: 400 }
      );
    }

    const result = await searchCltKnowledge(query);

    return NextResponse.json({
      ok: true,
      reply: formatCltAnswer(query, result.matches),
      matches: result.matches.map((item) => ({
        article: item.article,
        theme: item.theme,
        rigor: item.rigor,
      })),
    });
  } catch (error) {
    console.error("CLT_IA_ROUTE_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        reply: "Erro ao consultar a base legislativa.",
      },
      { status: 500 }
    );
  }
}
