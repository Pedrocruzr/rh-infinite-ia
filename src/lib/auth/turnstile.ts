export async function verifyTurnstileToken(params: {
  token?: string | null;
  ip?: string | null;
}) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!secret || !siteKey) {
    return {
      success: true,
      skipped: true,
    };
  }

  if (!params.token) {
    return {
      success: false,
      skipped: false,
      error: "Validação anti-bot obrigatória.",
    };
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", params.token);

  if (params.ip) {
    formData.append("remoteip", params.ip);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );

  const payload = (await response.json()) as {
    success?: boolean;
    ["error-codes"]?: string[];
  };

  if (!payload.success) {
    return {
      success: false,
      skipped: false,
      error: "Falha na validação anti-bot.",
      details: payload["error-codes"] ?? [],
    };
  }

  return {
    success: true,
    skipped: false,
  };
}
