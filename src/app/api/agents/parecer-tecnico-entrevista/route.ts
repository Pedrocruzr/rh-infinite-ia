import { NextRequest, NextResponse } from "next/server";
import {
  initializeParecerSession,
  runParecerStep,
} from "@/lib/parecer-runner";
import type { ParecerField, ParecerSession } from "@/lib/parecer-flow";

type RequestBody = {
  session?: ParecerSession;
  answer?: string;
  currentField?: ParecerField;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;

    const session = body.session ?? initializeParecerSession();

    const result = await runParecerStep({
      session,
      answer: body.answer,
      currentField: body.currentField,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na rota parecer-tecnico-entrevista:", error);

    return NextResponse.json(
      { error: "Erro ao processar o agente de parecer técnico de entrevista." },
      { status: 500 }
    );
  }
}
