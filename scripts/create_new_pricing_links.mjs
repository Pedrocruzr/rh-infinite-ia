import fs from "fs";

const apiKey = "process.env.ASAAS_API_KEY || """;

async function createLink(name, value, description) {
  const payload = {
    name,
    value,
    billingType: "CREDIT_CARD",
    chargeType: "RECURRENT",
    subscriptionCycle: "MONTHLY",
    description,
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
      name: "Painel de Vagas - Start",
      value: 37,
      description: "Acesso ao Painel de Vagas Stacker (Plano Start R$ 37/mês - Até 10 vagas ativas, pausadas e fechadas)",
    },
    {
      name: "Painel de Vagas - Pro",
      value: 67,
      description: "Acesso ao Painel de Vagas Stacker (Plano Pro R$ 67/mês - Até 25 vagas ativas, pausadas e fechadas)",
    },
    {
      name: "Painel de Turnover - Start",
      value: 37,
      description: "Acesso ao Painel de Turnover Stacker (Plano Start R$ 37/mês - Até 10 contas ativas e 10 desligamentos)",
    },
    {
      name: "Painel de Turnover - Pro",
      value: 67,
      description: "Acesso ao Painel de Turnover Stacker (Plano Pro R$ 67/mês - Até 25 contas ativas e 25 desligamentos)",
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
    });
  }

  console.log("\n=== LINKS GERADOS ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("Erro na execução:", err);
  process.exit(1);
});
