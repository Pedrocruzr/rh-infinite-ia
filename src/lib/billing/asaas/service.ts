import { asaasFetch } from "./client";
import type {
  AsaasCustomer,
  AsaasPayment,
  AsaasWebhookPayload,
  CreateCheckoutInput,
  CreateCheckoutResult,
} from "./types";

function centsToCurrencyValue(value: number) {
  return Number((value / 100).toFixed(2));
}

function buildExternalReference(input: CreateCheckoutInput) {
  return JSON.stringify({
    userId: input.userId,
    planId: input.planId,
    planCode: input.planCode,
    credits: input.monthlyCredits,
  });
}

async function createOrReuseCustomer(input: CreateCheckoutInput) {
  const customerPayload = {
    name: input.name,
    email: input.email,
    cpfCnpj: input.cpfCnpj ?? undefined,
    phone: input.phone ?? undefined,
    externalReference: input.userId,
    company: input.company ?? undefined,
  };

  try {
    const existing = await asaasFetch<{ data?: AsaasCustomer[] }>(
      `/customers?email=${encodeURIComponent(input.email)}`
    );

    const first = existing?.data?.[0];
    if (first?.id) {
      return first;
    }
  } catch {
    // segue para criação
  }

  const created = await asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(customerPayload),
  });

  return created;
}

async function createPayment(
  customerId: string,
  input: CreateCheckoutInput
) {
  const paymentPayload: Record<string, unknown> = {
    customer: customerId,
    billingType: input.method,
    value: centsToCurrencyValue(input.priceCents),
    description: `${input.planName} - ${input.monthlyCredits} créditos`,
    externalReference: buildExternalReference(input),
  };

  const payment = await asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify(paymentPayload),
  });

  return payment;
}

export async function createAsaasCheckout(
  input: CreateCheckoutInput
): Promise<CreateCheckoutResult> {
  const customer = await createOrReuseCustomer(input);
  const payment = await createPayment(customer.id, input);

  return {
    customerId: customer.id,
    paymentId: payment.id,
    status: payment.status,
    invoiceUrl: payment.invoiceUrl ?? payment.bankSlipUrl ?? null,
    pixQrCode: payment.pixQrCode ?? null,
    pixCopyPaste: payment.pixCopyPaste ?? null,
  };
}

export async function handleAsaasWebhook(_payload: AsaasWebhookPayload) {
  // Estrutura criada.
  // A ativação automática da assinatura pode ser ligada aqui depois que
  // o payload final do Asaas estiver confirmado no teu ambiente.
  return { ok: true };
}
