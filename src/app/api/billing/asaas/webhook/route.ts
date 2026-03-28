import { NextResponse } from "next/server";
import { getAsaasConfig } from "@/lib/billing/asaas/config";
import { handleAsaasWebhook } from "@/lib/billing/asaas/service";

export async function POST(request: Request) {
  try {
    const config = getAsaasConfig();
    const token =
      request.headers.get("asaas-access-token") ||
      request.headers.get("authorization") ||
      "";

    if (config.webhookToken && token && !token.includes(config.webhookToken)) {
      return NextResponse.json({ error: "Webhook não autorizado." }, { status: 401 });
    }

    const payload = await request.json().catch(() => null);
    await handleAsaasWebhook(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao processar webhook Asaas.",
      },
      { status: 500 }
    );
  }
}
