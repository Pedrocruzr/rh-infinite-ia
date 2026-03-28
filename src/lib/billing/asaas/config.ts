export function getAsaasConfig() {
  return {
    apiKey: process.env.ASAAS_API_KEY?.trim() || "",
    baseUrl: process.env.ASAAS_BASE_URL?.trim() || "",
    webhookToken: process.env.ASAAS_WEBHOOK_TOKEN?.trim() || "",
    successUrl:
      process.env.NEXT_PUBLIC_BILLING_SUCCESS_URL?.trim() ||
      "/app/configuracoes/assinatura",
    cancelUrl:
      process.env.NEXT_PUBLIC_BILLING_CANCEL_URL?.trim() ||
      "/app/configuracoes/assinatura",
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
