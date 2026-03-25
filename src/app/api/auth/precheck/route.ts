import { NextRequest, NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/auth/rate-limit";
import { verifyTurnstileToken } from "@/lib/auth/turnstile";

const ACTION_RULES: Record<
  string,
  { limit: number; windowMs: number; requiresTurnstile: boolean }
> = {
  login: { limit: 6, windowMs: 60_000, requiresTurnstile: true },
  signup: { limit: 4, windowMs: 60_000, requiresTurnstile: true },
  google: { limit: 6, windowMs: 60_000, requiresTurnstile: true },
  resend: { limit: 4, windowMs: 60_000, requiresTurnstile: false },
  reset: { limit: 4, windowMs: 60_000, requiresTurnstile: false },
};

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = String(body?.action ?? "").trim();
  const token = body?.token ? String(body.token) : null;

  if (!ACTION_RULES[action]) {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  const ip = getIp(request);
  const { limit, windowMs, requiresTurnstile } = ACTION_RULES[action];
  const rateLimit = checkRateLimit(`auth:${action}:${ip}`, limit, windowMs);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Muitas tentativas. Tente novamente em instantes.",
        retryAfter: rateLimit.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
        },
      }
    );
  }

  if (requiresTurnstile) {
    const verification = await verifyTurnstileToken({ token, ip });

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || "Falha na validação de segurança." },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
