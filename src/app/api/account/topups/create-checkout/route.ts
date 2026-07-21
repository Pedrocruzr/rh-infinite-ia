import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAsaasTopupCheckout } from "@/lib/billing/asaas/service";
import type { BillingCheckoutMethod } from "@/lib/billing/asaas/types";

type Body = {
  topupCode?: string;
  method?: BillingCheckoutMethod;
};

function normalizeDocument(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits || null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Body;
    const topupCode =
      typeof body.topupCode === "string" ? body.topupCode.trim() : "";
    const method =
      body.method === "PIX" || body.method === "CREDIT_CARD"
        ? body.method
        : "PIX";

    if (!topupCode) {
      return NextResponse.json(
        { error: "Pacote de créditos não informado." },
        { status: 400 }
      );
    }

    let topup: any = null;

    if (topupCode === "topup_perfil_avulso") {
      topup = {
        id: "topup_perfil_avulso_mock_id",
        code: "topup_perfil_avulso",
        name: "Avaliação Avulsa Extra",
        price_cents: 12900,
        credits: 3,
        expires_in_days: 30
      };
    } else {
      const { data, error: topupError } = await supabase
        .from("topup_products")
        .select("*")
        .eq("code", topupCode)
        .eq("active", true)
        .maybeSingle();

      if (!topupError && data) {
        topup = data;
      }
    }

    if (!topup) {
      return NextResponse.json(
        { error: "Pacote de créditos não encontrado." },
        { status: 404 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const documentNumber = normalizeDocument(
      (profile as any)?.document_number ??
        (typeof user.user_metadata?.document_number === "string"
          ? user.user_metadata.document_number
          : null)
    );

    if (!documentNumber || ![11, 14].includes(documentNumber.length)) {
      return NextResponse.json(
        {
          error:
            "Preencha CPF ou CNPJ no Perfil antes de continuar com a compra de créditos extras.",
        },
        { status: 400 }
      );
    }

    const result = await createAsaasTopupCheckout({
      userId: user.id,
      email: user.email ?? "",
      name:
        profile?.full_name?.trim() ||
        user.user_metadata?.full_name ||
        user.email ||
        "Usuário",
      company:
        typeof user.user_metadata?.company_name === "string"
          ? user.user_metadata.company_name
          : null,
      cpfCnpj: documentNumber,
      topupCode: topup.code,
      topupName: topup.name,
      topupId: topup.id,
      priceCents: Number(topup.price_cents),
      credits: Number(topup.credits),
      expiresInDays: Number((topup as any).expires_in_days ?? 30),
      method,
    });

    return NextResponse.json({
      ok: true,
      checkout: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao criar checkout de créditos extras.",
      },
      { status: 500 }
    );
  }
}
