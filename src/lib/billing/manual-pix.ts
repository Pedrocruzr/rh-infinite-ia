export function getManualPixConfig() {
  return {
    beneficiary:
      process.env.NEXT_PUBLIC_PIX_BENEFICIARY?.trim() || "RH Infinite IA",
    key:
      process.env.NEXT_PUBLIC_PIX_KEY?.trim() || "pix@rhinfiniteia.com",
    city:
      process.env.NEXT_PUBLIC_PIX_CITY?.trim() || "Sao Paulo",
    instructions:
      process.env.NEXT_PUBLIC_PIX_INSTRUCTIONS?.trim() ||
      "Após o pagamento, envie o comprovante ao suporte para liberar sua assinatura.",
  };
}
