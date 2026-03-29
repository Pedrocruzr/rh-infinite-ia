import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Fluxo legado desativado. Use o checkout oficial de assinatura.",
      code: "LEGACY_BILLING_DISABLED",
    },
    { status: 410 }
  );
}
