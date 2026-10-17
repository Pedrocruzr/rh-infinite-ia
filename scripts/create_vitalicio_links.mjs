import fs from "fs";

const apiKey = "process.env.ASAAS_API_KEY || """;

async function createLink(name, value, description) {
  const payload = {
    name,
    value,
    billingType: "UNDEFINED", // Aceita PIX, Cartão de Crédito e Boleto
    chargeType: "DETACHED",   // Pagamento ÚNICO / Vitalício (não recorrente)
    description,
    dueDateLimitDays: 3,
    notificationEnabled: true,
  };

  const res = await fetch("https://api.asaas.com/v3/paymentLinks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`Erro ao criar ${name}:`, data);
    throw new Error(`Falha ao criar link ${name}`);
  }
  console.log(`Criado com sucesso: ${name} (ID: ${data.id}) -> ${data.url}`);
  return data;
}

async function addLogo(linkId) {
  const fileBuffer = fs.readFileSync("public/brand/asaas_logo_ajustada.png");
  const form = new FormData();
  form.append("image", new Blob([fileBuffer], { type: "image/png" }), "logo_stacker.png");

  const res = await fetch(`https://api.asaas.com/v3/paymentLinks/${linkId}/images`, {
    method: "POST",
    headers: { access_token: apiKey },
    body: form,
  });
  const data = await res.json().catch(() => null);
  console.log(`Upload logo para ${linkId}:`, data?.id);

  if (data?.id) {
    const putRes = await fetch(`https://api.asaas.com/v3/paymentLinks/${linkId}/images/${data.id}/setAsMain`, {
      method: "PUT",
      headers: { access_token: apiKey },
    });
    console.log(`Set logo principal para ${linkId}: status ${putRes.status}`);
  }
}

async function main() {
  const items = [
    {
      name: "Painel de Vagas - Start (Acesso Vitalício)",
      value: 37,
      description: "Acesso Vitalício ao Painel de Vagas Stacker (Plano Start - Até 10 vagas ativas, pausadas e fechadas). Pagamento único, sem mensalidade.",
    },
    {
      name: "Painel de Vagas - Pro (Acesso Vitalício)",
      value: 67,
      description: "Acesso Vitalício ao Painel de Vagas Stacker (Plano Pro - Até 25 vagas ativas, pausadas e fechadas). Pagamento único, sem mensalidade.",
    },
    {
      name: "Painel de Turnover - Start (Acesso Vitalício)",
      value: 37,
      description: "Acesso Vitalício ao Painel de Turnover Stacker (Plano Start - Até 10 contas ativas e 10 desligamentos). Pagamento único, sem mensalidade.",
    },
    {
      name: "Painel de Turnover - Pro (Acesso Vitalício)",
      value: 67,
      description: "Acesso Vitalício ao Painel de Turnover Stacker (Plano Pro - Até 25 contas ativas e 25 desligamentos). Pagamento único, sem mensalidade.",
    },
  ];

  const results = [];
  for (const item of items) {
    const created = await createLink(item.name, item.value, item.description);
    await addLogo(created.id);
    results.push({
      name: item.name,
      value: item.value,
      id: created.id,
      url: created.url,
      chargeType: created.chargeType,
      billingType: created.billingType,
    });
  }

  console.log("\n=== NOVOS LINKS VITALÍCIOS (PAGAMENTO ÚNICO) ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("Erro na execução:", err);
  process.exit(1);
});
