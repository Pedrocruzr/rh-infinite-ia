import { assertAsaasConfig } from "./config";

export async function asaasFetch<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const config = assertAsaasConfig();

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: config.apiKey,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message =
      data?.errors?.[0]?.description ||
      data?.message ||
      data?.error ||
      "Erro ao chamar API do Asaas.";
    throw new Error(message);
  }

  return data as T;
}
