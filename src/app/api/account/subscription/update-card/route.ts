import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateAsaasSubscriptionCard } from "@/lib/billing/asaas/service";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { 
          error: "Não autenticado.", 
          details: authError ? { message: authError.message, status: authError.status } : null 
        }, 
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      number,
      holderName,
      expiryMonth,
      expiryYear,
      ccv,
      holderInfo,
    } = body;

    // Validate inputs
    if (!number || !holderName || !expiryMonth || !expiryYear || !ccv) {
      return NextResponse.json(
        { error: "Dados do cartão incompletos." },
        { status: 400 }
      );
    }

    if (
      !holderInfo?.name ||
      !holderInfo?.email ||
      !holderInfo?.cpfCnpj ||
      !holderInfo?.postalCode ||
      !holderInfo?.addressNumber ||
      !holderInfo?.phone
    ) {
      return NextResponse.json(
        { error: "Dados do titular do cartão incompletos." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: subscription, error: subscriptionError } = await admin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: "Assinatura não encontrada." },
        { status: 404 }
      );
    }

    const subscriptionId = (subscription as any).asaas_subscription_id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Você não possui uma assinatura vinculada no Asaas." },
        { status: 400 }
      );
    }

    if (subscriptionId === "mock_subscription_id") {
      return NextResponse.json({ ok: true });
    }

    // Determine client remote IP for security/antifraud validation
    const ipHeader =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const remoteIp = ipHeader.split(",")[0].trim();

    await updateAsaasSubscriptionCard(subscriptionId, {
      holderName,
      number,
      expiryMonth,
      expiryYear,
      ccv,
      holderInfo: {
        name: holderInfo.name,
        email: holderInfo.email,
        cpfCnpj: String(holderInfo.cpfCnpj).replace(/\D/g, ""),
        postalCode: String(holderInfo.postalCode).replace(/\D/g, ""),
        addressNumber: holderInfo.addressNumber,
        phone: String(holderInfo.phone).replace(/\D/g, ""),
      },
      remoteIp,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar dados do cartão de crédito.",
      },
      { status: 500 }
    );
  }
}
