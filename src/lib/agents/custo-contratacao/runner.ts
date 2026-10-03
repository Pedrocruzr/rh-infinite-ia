type Session = Record<string, any>;

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

// ─── SVG CHARTS (Base visual DISC / Big Five adaptado para métricas de CpH) ──────

function generateCphGaugeSvg(cph: number, setor: string): string {
  let z1End = 2500;
  let z2End = 5000;
  const sLower = setor.toLowerCase();
  if (sLower.includes("varejo")) {
    z1End = 1500;
    z2End = 3000;
  } else if (sLower.includes("tec") || sLower.includes("ti") || sLower.includes("soft")) {
    z1End = 3000;
    z2End = 6000;
  }

  const W = 520, H = 100;
  const bx = 16, bw = 488, bh = 34, by = 42;
  const segW = bw / 3;

  // Calcula a posição do ponteiro nos 3 segmentos
  let pinX = bx + segW / 2;
  let activeZone = 0; // 0: enxuta, 1: media, 2: acima
  if (cph <= z1End) {
    activeZone = 0;
    const ratio = Math.max(0.15, Math.min(0.85, z1End > 0 ? cph / z1End : 0.5));
    pinX = bx + ratio * segW;
  } else if (cph <= z2End) {
    activeZone = 1;
    const ratio = Math.max(0.15, Math.min(0.85, (cph - z1End) / (z2End - z1End)));
    pinX = bx + segW + ratio * segW;
  } else {
    activeZone = 2;
    const ratio = Math.max(0.2, Math.min(0.85, (cph - z2End) / (z2End * 3)));
    pinX = bx + 2 * segW + ratio * segW;
  }

  pinX = Math.max(bx + 18, Math.min(bx + bw - 18, pinX));

  const zones = [
    {
      x: bx,
      w: segW,
      color: "#10b981",
      title: "Operação Enxuta",
      range: `Até ${brl(z1End)}`,
      isActive: activeZone === 0,
    },
    {
      x: bx + segW,
      w: segW,
      color: "#3b82f6",
      title: "Média de Mercado",
      range: `${brl(z1End)} a ${brl(z2End)}`,
      isActive: activeZone === 1,
    },
    {
      x: bx + 2 * segW,
      w: segW,
      color: "#f59e0b",
      title: "Acima da Média",
      range: `> ${brl(z2End)}`,
      isActive: activeZone === 2,
    },
  ];

  const zoneBgs = zones
    .map(
      (z) =>
        `<rect x="${z.x.toFixed(1)}" y="${by}" width="${z.w.toFixed(1)}" height="${bh}" fill="${z.color}" opacity="${z.isActive ? "0.95" : "0.78"}"/>`
    )
    .join("");

  const separators = `
    <line x1="${(bx + segW).toFixed(1)}" y1="${by}" x2="${(bx + segW).toFixed(1)}" y2="${by + bh}" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
    <line x1="${(bx + 2 * segW).toFixed(1)}" y1="${by}" x2="${(bx + 2 * segW).toFixed(1)}" y2="${by + bh}" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
  `;

  const zoneLabels = zones
    .map((z) => {
      const cx = (z.x + z.w / 2).toFixed(1);
      return `
      <text x="${cx}" y="${by + 14}" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${z.title}</text>
      <text x="${cx}" y="${by + 27}" font-size="9.5" font-weight="600" fill="rgba(255,255,255,0.92)" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${z.range}</text>
    `;
    })
    .join("");

  const badgeW = 160;
  const badgeH = 24;
  const badgeX = Math.max(bx, Math.min(bx + bw - badgeW, pinX - badgeW / 2));

  const pinTopBadge = `
    <g>
      <rect x="${badgeX.toFixed(1)}" y="4" width="${badgeW}" height="${badgeH}" rx="12" fill="#0f172a"/>
      <text x="${(badgeX + badgeW / 2).toFixed(1)}" y="20" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">Seu CpH: ${brl(cph)}</text>
      <path d="M ${(pinX - 5).toFixed(1)} 28 L ${(pinX + 5).toFixed(1)} 28 L ${pinX.toFixed(1)} 36 Z" fill="#0f172a"/>
    </g>
  `;

  const pinMarker = `
    <circle cx="${pinX.toFixed(1)}" cy="${by + bh / 2}" r="13" fill="#0f172a" stroke="#ffffff" stroke-width="2.5"/>
    <circle cx="${pinX.toFixed(1)}" cy="${by + bh / 2}" r="4.5" fill="#38bdf8"/>
  `;

  const border = `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="#cbd5e1" stroke-width="1.5" rx="8"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;margin:0 auto;max-width:520px;height:auto;" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="gauge-clip-3tier">
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="8"/>
    </clipPath>
    <g clip-path="url(#gauge-clip-3tier)">
      ${zoneBgs}
      ${separators}
      ${zoneLabels}
    </g>
    ${border}
    ${pinTopBadge}
    ${pinMarker}
  </svg>`;
}

function generateDistributionBarSvg(totalInterno: number, totalExterno: number): string {
  const total = totalInterno + totalExterno;
  const pInt = total > 0 ? (totalInterno / total) * 100 : 50;
  const pExt = total > 0 ? (totalExterno / total) * 100 : 50;

  const W = 480, H = 48, bx = 8, bw = 464, bh = 22, by = 6;
  const wInt = Math.max(0, (pInt / 100) * bw);
  const wExt = Math.max(0, (pExt / 100) * bw);

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;margin:0 auto;max-width:480px;height:auto;" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="dist-bar-clip">
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6"/>
    </clipPath>
    <g clip-path="url(#dist-bar-clip)">
      <rect x="${bx}" y="${by}" width="${wInt.toFixed(1)}" height="${bh}" fill="#2563eb"/>
      <rect x="${(bx + wInt).toFixed(1)}" y="${by}" width="${wExt.toFixed(1)}" height="${bh}" fill="#8b5cf6"/>
    </g>
    ${wInt > 40 ? `<text x="${(bx + wInt / 2).toFixed(1)}" y="${by + bh / 2 + 4}" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">${pInt.toFixed(1)}%</text>` : ""}
    ${wExt > 40 ? `<text x="${(bx + wInt + wExt / 2).toFixed(1)}" y="${by + bh / 2 + 4}" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">${pExt.toFixed(1)}%</text>` : ""}
    <text x="${bx}" y="${by + bh + 14}" font-size="10" font-weight="600" fill="#2563eb">Custos Internos (${pInt.toFixed(1)}%)</text>
    <text x="${bx + bw}" y="${by + bh + 14}" font-size="10" font-weight="600" fill="#8b5cf6" text-anchor="end">Custos Externos (${pExt.toFixed(1)}%)</text>
  </svg>`;
}

function generateCostBarsSvg(
  items: Array<{ name: string; value: number; total: number }>,
  barColor: string
): string {
  const bh = 22, gap = 12, lw = 150, maxBw = 180, W = 460;
  const H = items.length * (bh + gap) + gap;
  const parts = items.map((item, i) => {
    const y = gap + i * (bh + gap);
    const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
    const bw = Math.max(item.value > 0 ? 6 : 0, Math.round((pct / 100) * maxBw));
    return (
      `<text x="0" y="${y + bh / 2 + 4}" font-size="11" font-weight="600" fill="#334155">${esc(item.name)}</text>` +
      `<rect x="${lw}" y="${y}" width="${maxBw}" height="${bh}" rx="4" fill="#f1f5f9"/>` +
      `<rect x="${lw}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${barColor}" opacity="0.9"/>` +
      `<text x="${lw + maxBw + 10}" y="${y + bh / 2 + 4}" font-size="11" font-weight="700" fill="#0f172a">${brl(item.value)} <tspan font-size="10" fill="#64748b" font-weight="500">(${pct.toFixed(0)}%)</tspan></text>`
    );
  }).join("");
  return `<svg viewBox="0 0 ${W + 50} ${H}" width="100%" style="display:block;max-width:510px;height:auto;" xmlns="http://www.w3.org/2000/svg">${parts}</svg>`;
}

// ─── GERADOR PRINCIPAL ─────────────────────────────────────────────────────────

export function buildCustoContratacaoReport(rawAnswers: Session) {
  const periodo = String(rawAnswers.periodo ?? "Não informado");
  const setor = String(rawAnswers.setor ?? "Geral");
  const contratacoes = Number(rawAnswers.contratacoes ?? 0);

  const salariosRh = Number(rawAnswers.salariosRh ?? 0);
  const encargosRh = Number(rawAnswers.encargosRh ?? 0);
  const beneficiosRh = Number(rawAnswers.beneficiosRh ?? 0);
  const tempoRh = Number(rawAnswers.tempoRh ?? 0);

  const custoHoraGestores = Number(rawAnswers.custoHoraGestores ?? 0);
  const horasGestores = Number(rawAnswers.horasGestores ?? 0);

  const infraestrutura = Number(rawAnswers.infraestrutura ?? 0);
  const tempoInfra = Number(rawAnswers.tempoInfra ?? 0);

  const onboardingDiretoUnit = Number(rawAnswers.onboardingDireto ?? 0);
  const custoHoraNovo = Number(rawAnswers.custoHoraNovo ?? 0);
  const horasOnboarding = Number(rawAnswers.horasOnboarding ?? 0);

  const anuncios = Number(rawAnswers.anuncios ?? 0);
  const agencias = Number(rawAnswers.agencias ?? 0);
  const ferramentas = Number(rawAnswers.ferramentas ?? 0);
  const testes = Number(rawAnswers.testes ?? 0);
  const relocacao = Number(rawAnswers.relocacao ?? 0);

  const custoEquipeRhTotal = salariosRh * (1 + encargosRh / 100) + beneficiosRh;
  const custoEquipeRhProporcional = custoEquipeRhTotal * (tempoRh / 100);
  const custoGestores = custoHoraGestores * horasGestores;
  const custoInfra = infraestrutura * (tempoInfra / 100);
  const onboardingDiretoTotal = onboardingDiretoUnit * contratacoes;
  const onboardingIndiretoUnit = custoHoraNovo * horasOnboarding;
  const onboardingIndiretoTotal = onboardingIndiretoUnit * contratacoes;
  const totalOnboarding = onboardingDiretoTotal + onboardingIndiretoTotal;

  const totalInterno =
    custoEquipeRhProporcional +
    custoGestores +
    custoInfra +
    onboardingDiretoTotal +
    onboardingIndiretoTotal;

  const totalExterno = anuncios + agencias + ferramentas + testes + relocacao;
  const totalGeral = totalInterno + totalExterno;
  const cph = contratacoes > 0 ? totalGeral / contratacoes : 0;

  const sLower = setor.toLowerCase();
  const benchmarkText =
    sLower.includes("varejo")
      ? "R$ 1.000 a R$ 3.000 por contratação"
      : sLower.includes("tec") || sLower.includes("ti") || sLower.includes("soft")
      ? "R$ 3.000 a R$ 6.000 por contratação"
      : "R$ 2.000 a R$ 5.000 por contratação (média geral de mercado)";

  const leituraBenchmark =
    sLower.includes("varejo") && cph >= 1000 && cph <= 3000
      ? "dentro da média e bem controlado"
      : sLower.includes("varejo") && cph < 1000
      ? "abaixo da média, com operação extremamente enxuta"
      : sLower.includes("varejo") && cph > 3000
      ? "acima da média do setor, exigindo revisão de eficiência"
      : cph > 0 && cph <= 3000
      ? "operação enxuta e dentro das melhores práticas de mercado"
      : cph <= 6000
      ? "dentro da média esperada para o segmento"
      : "acima da média de mercado, exigindo revisão de eficiência e processos";

  const internaPct = totalGeral > 0 ? round2((totalInterno / totalGeral) * 100) : 0;
  const externaPct = totalGeral > 0 ? round2((totalExterno / totalGeral) * 100) : 0;
  const rhPct = totalGeral > 0 ? round2((custoEquipeRhProporcional / totalGeral) * 100) : 0;

  const isEnxuto = cph > 0 && cph <= 3500;
  const classificacaoFinal = isEnxuto
    ? "Operação Enxuta e Eficiente"
    : cph <= 6000
    ? "Operação Balanceada"
    : "Operação com Oportunidade de Otimização";

  const badgeBg = isEnxuto ? "#ecfdf5" : cph <= 6000 ? "#eff6ff" : "#fffbeb";
  const badgeBorder = isEnxuto ? "#a7f3d0" : cph <= 6000 ? "#bfdbfe" : "#fde68a";
  const badgeColor = isEnxuto ? "#065f46" : cph <= 6000 ? "#1e40af" : "#92400e";

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  // Itens para barras SVG
  const internalItems = [
    { name: "Equipe RH (Dedicada)", value: custoEquipeRhProporcional, total: totalInterno },
    { name: "Gestores em Entrevistas", value: custoGestores, total: totalInterno },
    { name: "Onboarding & Integração", value: totalOnboarding, total: totalInterno },
    { name: "Infraestrutura Proporcional", value: custoInfra, total: totalInterno },
  ];

  const externalItems = [
    { name: "Anúncios & Divulgação", value: anuncios, total: totalExterno },
    { name: "Agências & Headhunters", value: agencias, total: totalExterno },
    { name: "Ferramentas & ATS", value: ferramentas, total: totalExterno },
    { name: "Testes & Avaliações", value: testes, total: totalExterno },
    { name: "Relocação de Talentos", value: relocacao, total: totalExterno },
  ];

  function card(label: string, value: string, highlight?: boolean, highlightColor?: string): string {
    const display = value && value !== "undefined" ? esc(value) : "—";
    const bg = highlight ? (highlightColor ? highlightColor : "#f0fdf4") : "#f8fafc";
    const border = highlight ? "#bbf7d0" : "#e2e8f0";
    return `<div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:14px 18px;min-width:140px;flex:1;">
      <p style="font-size:10px;color:#64748b;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">${label}</p>
      <p style="font-size:16px;font-weight:800;color:#0f172a;margin:0;">${display}</p>
    </div>`;
  }

  const headerCards = `
  <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px;">
    ${card("Período Analisado", periodo)}
    ${card("Setor / Segmento", setor)}
    ${card("Vagas Fechadas", `${contratacoes} ${contratacoes === 1 ? "vaga" : "vagas"}`)}
    ${card("Custo Total", brl(totalGeral))}
    ${card("Custo por Contratação (CpH)", brl(cph), true, "#eff6ff")}
  </div>`;

  const gaugeSvg = generateCphGaugeSvg(cph, setor);
  const distBarSvg = generateDistributionBarSvg(totalInterno, totalExterno);
  const internalBarsSvg = generateCostBarsSvg(internalItems, "#2563eb");
  const externalBarsSvg = generateCostBarsSvg(externalItems, "#8b5cf6");

  return `
<style>
  @media print {
    .page-break { page-break-after: always; break-after: page; }
    .no-break { page-break-inside: avoid; break-inside: avoid; }
    section { page-break-inside: avoid; break-inside: avoid; }
  }
</style>

<section style="background:#ffffff;border-radius:16px;padding:36px;color:#1e293b;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.05);font-family:system-ui,-apple-system,sans-serif;">

  <!-- CAPA / HEADER EXECUTIVO -->
  <div style="text-align:center;padding:24px 0 28px;border-bottom:2px solid #e2e8f0;">
    <h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 6px;letter-spacing:-0.03em;">Relatório Executivo de Custo por Contratação (CpH)</h1>
    <p style="font-size:13px;color:#64748b;margin:0 0 18px;">Relatório gerado em ${dateStr}</p>
    
    <div style="display:inline-flex;align-items:center;gap:8px;background:${badgeBg};color:${badgeColor};border:1px solid ${badgeBorder};padding:8px 24px;border-radius:9999px;font-size:13px;font-weight:700;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      Diagnóstico: ${esc(classificacaoFinal)}
    </div>
  </div>

  <!-- CARDS EXECUTIVOS -->
  ${headerCards}

  <!-- SEÇÃO 1: INDICADOR DE EFICIÊNCIA VS BENCHMARK -->
  <div style="margin-top:36px;border:1px solid #e2e8f0;border-radius:16px;padding:24px;background:#ffffff;">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #3b82f6;padding-bottom:10px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4M12 16V8"/></svg>
        <h3 style="color:#0f172a;margin:0;font-size:18px;font-weight:700;">1. Indicador de Eficiência do CpH vs Benchmark</h3>
      </div>
      <span style="background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;">
        Benchmark ${esc(setor)}: ${esc(benchmarkText)}
      </span>
    </div>
    <p style="font-size:13px;line-height:1.6;color:#475569;margin-bottom:22px;">
      O indicador abaixo compara o <strong>Custo Médio por Contratação (CpH)</strong> da sua organização em relação às referências consolidadas do segmento. Seu resultado aponta uma operação <strong>${esc(leituraBenchmark)}</strong>.
    </p>
    <div style="display:flex;justify-content:center;padding:10px 0 16px;">
      ${gaugeSvg}
    </div>
  </div>

  <!-- SEÇÃO 2: DISTRIBUIÇÃO ESTRATÉGICA DE CUSTOS -->
  <div style="margin-top:32px;border:1px solid #e2e8f0;border-radius:16px;padding:24px;background:#ffffff;">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #6366f1;padding-bottom:10px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        <h3 style="color:#0f172a;margin:0;font-size:18px;font-weight:700;">2. Distribuição Estratégica: Custos Internos vs Externos</h3>
      </div>
      <span style="background:#e0e7ff;color:#3730a3;border:1px solid #c7d2fe;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;">
        ${internaPct}% Interno / ${externaPct}% Externo
      </span>
    </div>
    
    <div style="display:flex;justify-content:center;padding:12px 0 20px;">
      ${distBarSvg}
    </div>

    <!-- CARDS DE VISÃO GERAL INTERNO E EXTERNO -->
    <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:10px;">
      <div style="flex:1;min-width:240px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:12px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:.05em;">Custos Internos</span>
          <span style="font-size:12px;font-weight:700;color:#64748b;">${internaPct}%</span>
        </div>
        <p style="font-size:22px;font-weight:800;color:#0f172a;margin:6px 0 2px;">${brl(totalInterno)}</p>
        <p style="font-size:11px;color:#64748b;margin:0;">Equipe RH, horas de liderança, integração e infraestrutura.</p>
      </div>

      <div style="flex:1;min-width:240px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #8b5cf6;border-radius:12px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:.05em;">Custos Externos</span>
          <span style="font-size:12px;font-weight:700;color:#64748b;">${externaPct}%</span>
        </div>
        <p style="font-size:22px;font-weight:800;color:#0f172a;margin:6px 0 2px;">${brl(totalExterno)}</p>
        <p style="font-size:11px;color:#64748b;margin:0;">Divulgação, softwares/ATS, consultorias e avaliações.</p>
      </div>
    </div>
  </div>

  <!-- SEÇÃO 3: DETALHAMENTO EM GRÁFICOS DE BARRAS -->
  <div style="display:flex;flex-wrap:wrap;gap:20px;margin-top:32px;">
    <!-- Custos Internos Bars -->
    <div style="flex:1;min-width:300px;border:1px solid #e2e8f0;border-radius:16px;padding:22px;background:#ffffff;">
      <div style="display:flex;align-items:center;gap:8px;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:18px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h4 style="font-size:15px;font-weight:700;color:#0f172a;margin:0;">Breakdown: Custos Internos</h4>
      </div>
      <div>
        ${internalBarsSvg}
      </div>
    </div>

    <!-- Custos Externos Bars -->
    <div style="flex:1;min-width:300px;border:1px solid #e2e8f0;border-radius:16px;padding:22px;background:#ffffff;">
      <div style="display:flex;align-items:center;gap:8px;border-bottom:2px solid #8b5cf6;padding-bottom:8px;margin-bottom:18px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <h4 style="font-size:15px;font-weight:700;color:#0f172a;margin:0;">Breakdown: Custos Externos</h4>
      </div>
      <div>
        ${externalBarsSvg}
      </div>
    </div>
  </div>

  <!-- SEÇÃO 4: TABELA ANALÍTICA DETALHADA -->
  <div style="margin-top:32px;border:1px solid #e2e8f0;border-radius:16px;padding:24px;background:#ffffff;">
    <div style="display:flex;align-items:center;gap:8px;border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:16px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      <h3 style="color:#0f172a;margin:0;font-size:18px;font-weight:700;">3. Composição Analítica do Investimento</h3>
    </div>

    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #cbd5e1;">
            <th style="padding:10px 12px;font-weight:700;color:#475569;">Centro de Custo</th>
            <th style="padding:10px 12px;font-weight:700;color:#475569;">Fórmula / Premissas</th>
            <th style="padding:10px 12px;font-weight:700;color:#475569;text-align:right;">Subtotal</th>
            <th style="padding:10px 12px;font-weight:700;color:#475569;text-align:right;">% Geral</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 12px;font-weight:600;color:#0f172a;">Equipe de Recrutamento (RH)</td>
            <td style="padding:10px 12px;color:#64748b;">${brl(custoEquipeRhTotal)} total × ${tempoRh}% dedicação</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;">${brl(custoEquipeRhProporcional)}</td>
            <td style="padding:10px 12px;text-align:right;color:#64748b;">${totalGeral > 0 ? ((custoEquipeRhProporcional / totalGeral) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;background:#fafafa;">
            <td style="padding:10px 12px;font-weight:600;color:#0f172a;">Horas de Liderança em Entrevistas</td>
            <td style="padding:10px 12px;color:#64748b;">${brl(custoHoraGestores)}/h × ${horasGestores} horas</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;">${brl(custoGestores)}</td>
            <td style="padding:10px 12px;text-align:right;color:#64748b;">${totalGeral > 0 ? ((custoGestores / totalGeral) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 12px;font-weight:600;color:#0f172a;">Onboarding (Direto + Indireto)</td>
            <td style="padding:10px 12px;color:#64748b;">(${brl(onboardingDiretoUnit)} + ${brl(onboardingIndiretoUnit)}) × ${contratacoes} vagas</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;">${brl(totalOnboarding)}</td>
            <td style="padding:10px 12px;text-align:right;color:#64748b;">${totalGeral > 0 ? ((totalOnboarding / totalGeral) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;background:#fafafa;">
            <td style="padding:10px 12px;font-weight:600;color:#0f172a;">Infraestrutura & Operação</td>
            <td style="padding:10px 12px;color:#64748b;">${brl(infraestrutura)} × ${tempoInfra}% proporcional</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;">${brl(custoInfra)}</td>
            <td style="padding:10px 12px;text-align:right;color:#64748b;">${totalGeral > 0 ? ((custoInfra / totalGeral) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 12px;font-weight:600;color:#0f172a;">Divulgação, Anúncios & Vagas</td>
            <td style="padding:10px 12px;color:#64748b;">Campanhas pagas e job boards</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;">${brl(anuncios)}</td>
            <td style="padding:10px 12px;text-align:right;color:#64748b;">${totalGeral > 0 ? ((anuncios / totalGeral) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;background:#fafafa;">
            <td style="padding:10px 12px;font-weight:600;color:#0f172a;">Agências & Consultorias Externas</td>
            <td style="padding:10px 12px;color:#64748b;">Honorários de hunting especializado</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;">${brl(agencias)}</td>
            <td style="padding:10px 12px;text-align:right;color:#64748b;">${totalGeral > 0 ? ((agencias / totalGeral) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 12px;font-weight:600;color:#0f172a;">Software, ATS & Testes</td>
            <td style="padding:10px 12px;color:#64748b;">Licenças de software (${brl(ferramentas)}) + Testes (${brl(testes)})</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;">${brl(ferramentas + testes)}</td>
            <td style="padding:10px 12px;text-align:right;color:#64748b;">${totalGeral > 0 ? (((ferramentas + testes) / totalGeral) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;background:#fafafa;">
            <td style="padding:10px 12px;font-weight:600;color:#0f172a;">Relocação & Logística</td>
            <td style="padding:10px 12px;color:#64748b;">Auxílio mudança e viagens</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;color:#0f172a;">${brl(relocacao)}</td>
            <td style="padding:10px 12px;text-align:right;color:#64748b;">${totalGeral > 0 ? ((relocacao / totalGeral) * 100).toFixed(1) : 0}%</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background:#f1f5f9;font-weight:800;border-top:2px solid #cbd5e1;">
            <td colspan="2" style="padding:12px;color:#0f172a;font-size:14px;">TOTAL GERAL DO PROCESSO</td>
            <td style="padding:12px;text-align:right;color:#0f172a;font-size:15px;">${brl(totalGeral)}</td>
            <td style="padding:12px;text-align:right;color:#0f172a;font-size:14px;">100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  <!-- SEÇÃO 5: DIAGNÓSTICO ESTRATÉGICO & PONTOS DE ATENÇÃO -->
  <div style="margin-top:32px;display:flex;flex-wrap:wrap;gap:16px;">
    <!-- Pontos Fortes -->
    <div style="flex:1;min-width:280px;background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #10b981;border-radius:12px;padding:20px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h4 style="color:#065f46;margin:0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Eficiências Identificadas</h4>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.6;color:#166534;">
        <li>${totalExterno === 0 ? "Processo extremamente enxuto sem despesas externas desnecessárias." : "Investimento externo alocado com foco em velocidade."}</li>
        <li>${totalExterno <= totalInterno ? "Forte aproveitamento da estrutura e capacidade interna." : "Uso assertivo de parceiros especializados para posições estratégicas."}</li>
        <li>${cph > 0 && cph <= 3000 ? "Custo Médio por Contratação altamente competitivo frente ao mercado." : "Processo estruturado com mapeamento claro de cada centro de custo."}</li>
      </ul>
    </div>

    <!-- Pontos de Atenção -->
    <div style="flex:1;min-width:280px;background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:12px;padding:20px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <h4 style="color:#92400e;margin:0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Pontos de Atenção</h4>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.6;color:#854d0e;">
        <li>${ferramentas === 0 ? "Ausência de ATS/software pode limitar escala e gerar gargalo operacional manual." : "O investimento em ATS deve ser acompanhado contra ganhos de agilidade e conversão."}</li>
        <li>${anuncios === 0 ? "Zero investimento em mídia pode restringir alcance de candidatos passivos qualificados." : "Monitorar ROI de anúncios para garantir que não haja desperdício de verba."}</li>
        <li>A equipe de RH representa <strong>${esc(rhPct)}%</strong> do custo total do ciclo.</li>
      </ul>
    </div>
  </div>

  <!-- SEÇÃO 6: RECOMENDAÇÕES PRÁTICAS DE OTIMIZAÇÃO -->
  <div style="margin-top:32px;border:1px solid #e2e8f0;border-radius:16px;padding:24px;background:#f8fafc;">
    <div style="display:flex;align-items:center;gap:8px;border-bottom:2px solid #0284c7;padding-bottom:10px;margin-bottom:16px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7Z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
      <h3 style="color:#0f172a;margin:0;font-size:18px;font-weight:700;">4. Recomendações Táticas para Otimização de CpH</h3>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;margin-top:16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
        <p style="font-weight:700;color:#0284c7;font-size:13px;margin:0 0 6px;">1. Programa de Indicação Interna (Referral)</p>
        <p style="font-size:12px;color:#475569;line-height:1.5;margin:0;">Indicações de colaboradores costumam reduzir o CpH em até 40%, diminuem o tempo de vaga aberta e elevam a retenção pós-onboarding.</p>
      </div>

      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
        <p style="font-weight:700;color:#0284c7;font-size:13px;margin:0 0 6px;">2. Automação de Triagem & IA</p>
        <p style="font-size:12px;color:#475569;line-height:1.5;margin:0;">Como o RH representa ${esc(rhPct)}% do custo, automatizar triagem e entrevistas iniciais libera tempo operacional dos analistas para negociação e fechamento.</p>
      </div>

      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
        <p style="font-weight:700;color:#0284c7;font-size:13px;margin:0 0 6px;">3. Redução do Tempo de Gestores</p>
        <p style="font-size:12px;color:#475569;line-height:1.5;margin:0;">Padronizar roteiros e critérios de avaliação com os gestores para diminuir o número de rodadas de entrevistas e o custo hora de liderança (${brl(custoGestores)}).</p>
      </div>

      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
        <p style="font-weight:700;color:#0284c7;font-size:13px;margin:0 0 6px;">4. Estruturação do Onboarding</p>
        <p style="font-size:12px;color:#475569;line-height:1.5;margin:0;">Garantir materiais assíncronos de integração para acelerar o time-to-productivity dos novos contratados e proteger o investimento inicial de ${brl(totalOnboarding)}.</p>
      </div>
    </div>
  </div>

  <!-- CONCLUSÃO EXECUTIVA -->
  <div style="margin-top:32px;background:#f8fafc;border-left:4px solid #0f172a;border-radius:8px;padding:18px 22px;">
    <p style="font-weight:700;color:#0f172a;font-size:14px;margin:0 0 6px;">Conclusão do Diagnóstico</p>
    <p style="font-size:13px;color:#475569;line-height:1.6;margin:0;">
      A operação atual fechou o período com <strong>${contratacoes} contratações</strong> e Custo Médio de <strong>${brl(cph)}</strong>. O equilíbrio entre despesas internas (${internaPct}%) e externas (${externaPct}%) evidencia uma gestão financeira ${isEnxuto ? "bastante disciplinada e enxuta" : "com oportunidades de ganho de eficiência operacional"}. O objetivo estratégico para os próximos ciclos é manter o CpH sob controle enquanto se aumenta o volume de atração e a qualidade técnica dos selecionados.
    </p>
  </div>

  <p style="font-size:11px;color:#94a3b8;border-left:3px solid #cbd5e1;padding-left:10px;margin:28px 0 0;">
    Este relatório foi emitido pelo módulo de Auditoria e Diagnóstico Financeiro da Stacker e permanece arquivado em "Relatórios Stackers" para governança e planejamento orçamentário.
  </p>

</section>
`.trim();
}
