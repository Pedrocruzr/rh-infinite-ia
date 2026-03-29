import { createClient as createServerClient } from "@/lib/supabase/server";
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
  const userId = String(input.userId || "")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, 36);

  const planCode = String(input.planCode || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 24);

  const credits = String(Number(input.monthlyCredits || 0));

  return `rhia|u:${userId}|p:${planCode}|c:${credits}`;
}

function getWebhookEventId(payload: AsaasWebhookPayload) {
  const paymentId = (payload as any)?.payment?.id || "unknown_payment";
  const eventType = (payload as any)?.event || "unknown_event";
  return `asaas:${eventType}:${paymentId}`;
}

function buildDueDate(daysAhead = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

function buildCustomerPayload(input: CreateCheckoutInput) {
  return {
    name: input.name,
    email: input.email,
    cpfCnpj: input.cpfCnpj ?? undefined,
    phone: input.phone ?? undefined,
    externalReference: input.userId,
    company: input.company ?? undefined,
  };
}

function isActionablePaymentEvent(eventType: string) {
  return eventType === "PAYMENT_CONFIRMED" || eventType === "PAYMENT_RECEIVED";
}

async function tryUpdateExistingCustomer(
  customerId: string,
  input: CreateCheckoutInput
) {
  const body = JSON.stringify(buildCustomerPayload(input));

  const attempts: Array<() => Promise<AsaasCustomer>> = [
    () =>
      asaasFetch<AsaasCustomer>(`/customers/${customerId}`, {
        method: "PUT",
        body,
      }),
    () =>
      asaasFetch<AsaasCustomer>(`/customers/${customerId}`, {
        method: "POST",
        body,
      }),
  ];

  for (const attempt of attempts) {
    try {
      const updated = await attempt();
      if (updated?.id) return updated;
    } catch {
      // tenta o próximo formato
    }
  }

  return null;
}

async function createOrReuseCustomer(input: CreateCheckoutInput) {
  const customerPayload = buildCustomerPayload(input);

  try {
    const existing = await asaasFetch<{ data?: AsaasCustomer[] }>(
      `/customers?email=${encodeURIComponent(input.email)}`
    );

    const first = existing?.data?.[0];
    if (first?.id) {
      const updated = await tryUpdateExistingCustomer(first.id, input);
      if (updated?.id) {
        return updated;
      }

      if (input.cpfCnpj) {
        const created = await asaasFetch<AsaasCustomer>("/customers", {
          method: "POST",
          body: JSON.stringify(customerPayload),
        });

        return created;
      }

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
    dueDate: buildDueDate(1),
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

export async function handleAsaasWebhook(payload: AsaasWebhookPayload) {
  const supabase = await createServerClient();
  const eventId = getWebhookEventId(payload);
  const eventType = String((payload as any)?.event || "unknown");

  const { data: captureData, error: captureError } = await supabase.rpc(
    "process_asaas_webhook",
    {
      p_event_id: eventId,
      p_event_type: eventType,
      p_payload: payload ?? {},
    }
  );

  if (captureError) {
    throw new Error(captureError.message || "Erro ao registrar webhook do Asaas.");
  }

  const captureResult = (captureData ?? { ok: true, eventId }) as Record<
    string,
    unknown
  >;

  if (!isActionablePaymentEvent(eventType)) {
    return captureResult;
  }

  const { data: paymentData, error: paymentError } = await supabase.rpc(
    "process_asaas_payment_event",
    {
      p_event_id: eventId,
      p_event_type: eventType,
      p_payload: payload ?? {},
    }
  );

  if (paymentError) {
    throw new Error(
      paymentError.message || "Erro ao processar pagamento confirmado do Asaas."
    );
  }

  return {
    ...captureResult,
    payment: paymentData ?? { ok: true, eventId, eventType },
  };
}
