export type BillingCheckoutMethod = "PIX" | "CREDIT_CARD";

export type CreateCheckoutInput = {
  userId: string;
  email: string;
  name: string;
  cpfCnpj?: string | null;
  phone?: string | null;
  company?: string | null;
  planCode: string;
  planName: string;
  planId: string;
  priceCents: number;
  monthlyCredits: number;
  method: BillingCheckoutMethod;
};

export type AsaasCustomer = {
  id: string;
  name?: string;
  email?: string;
};

export type AsaasPayment = {
  id: string;
  status?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  value?: number;
  billingType?: string;
};

export type CreateCheckoutResult = {
  customerId: string;
  paymentId: string;
  status?: string;
  invoiceUrl?: string | null;
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
};

export type AsaasWebhookPayload = {
  event?: string;
  payment?: {
    id?: string;
    customer?: string;
    value?: number;
    status?: string;
    billingType?: string;
    externalReference?: string;
  };
};
