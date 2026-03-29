function clean(value?: string) {
  return value?.trim() || "";
}

function resolveEnvValue(primary?: string, previewOverride?: string) {
  const main = clean(primary);
  const preview = clean(previewOverride);
  const isPreview = clean(process.env.VERCEL_ENV) === "preview";

  if (isPreview && preview) {
    return preview;
  }

  return main;
}

export function getAsaasConfig() {
  return {
    apiKey: resolveEnvValue(
      process.env.ASAAS_API_KEY,
      process.env.ASAAS_PREVIEW_API_KEY
    ),
    baseUrl: resolveEnvValue(
      process.env.ASAAS_BASE_URL,
      process.env.ASAAS_PREVIEW_BASE_URL
    ),
    webhookToken: resolveEnvValue(
      process.env.ASAAS_WEBHOOK_TOKEN,
      process.env.ASAAS_PREVIEW_WEBHOOK_TOKEN
    ),
    successUrl:
      resolveEnvValue(
        process.env.NEXT_PUBLIC_BILLING_SUCCESS_URL,
        process.env.NEXT_PUBLIC_BILLING_PREVIEW_SUCCESS_URL
      ) || "/app/configuracoes/assinatura",
    cancelUrl:
      resolveEnvValue(
        process.env.NEXT_PUBLIC_BILLING_CANCEL_URL,
        process.env.NEXT_PUBLIC_BILLING_PREVIEW_CANCEL_URL
      ) || "/app/configuracoes/assinatura",
  };
}

export function assertAsaasConfig() {
  const config = getAsaasConfig();

  if (!config.apiKey) {
    throw new Error("ASAAS_API_KEY não configurada.");
  }

  if (!config.baseUrl) {
    throw new Error("ASAAS_BASE_URL não configurada.");
  }

  return config;
}
