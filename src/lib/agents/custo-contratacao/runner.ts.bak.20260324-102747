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

export function buildCustoContratacaoReport(rawAnswers: Session) {
  const periodo = String(rawAnswers.periodo ?? "Não informado");
  const setor = String(rawAnswers.setor ?? "Não informado");
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

  const totalInterno =
    custoEquipeRhProporcional +
    custoGestores +
    custoInfra +
    onboardingDiretoTotal +
    onboardingIndiretoTotal;

  const totalExterno = anuncios + agencias + ferramentas + testes + relocacao;
  const totalGeral = totalInterno + totalExterno;
  const cph = contratacoes > 0 ? totalGeral / contratacoes : 0;

  const benchmarkText =
    setor.toLowerCase() === "varejo"
      ? "R$ 1.000 a R$ 3.000 por contratação"
      : setor.toLowerCase() === "tecnologia"
      ? "R$ 3.000 a R$ 6.000 por contratação"
      : "Varia conforme setor e nível hierárquico";

  const leituraBenchmark =
    setor.toLowerCase() === "varejo" && cph >= 1000 && cph <= 3000
      ? "dentro da média e bem controlado"
      : setor.toLowerCase() === "varejo" && cph < 1000
      ? "abaixo da média, com operação extremamente enxuta"
      : setor.toLowerCase() === "varejo" && cph > 3000
      ? "acima da média do setor, exigindo revisão de eficiência"
      : "exige comparação contextual com o setor e o nível das vagas";

  const internaPct = totalGeral > 0 ? round2((totalInterno / totalGeral) * 100) : 0;
  const externaPct = totalGeral > 0 ? round2((totalExterno / totalGeral) * 100) : 0;
  const rhPct = totalGeral > 0 ? round2((custoEquipeRhProporcional / totalGeral) * 100) : 0;

  const classificacaoFinal =
    cph > 0 && cph <= 3000 ? "Operação Enxuta e Eficiente" : "Operação com Oportunidade de Otimização";

  return `
<section>
  <h1>📊 RELATÓRIO DE CUSTO POR CONTRATAÇÃO (CpH)</h1>

  <h2>🧾 1. Resumo Executivo</h2>
  <p>📅 <strong>Período:</strong> ${esc(periodo)}</p>
  <p>🏢 <strong>Setor:</strong> ${esc(setor)}</p>
  <p>👥 <strong>Contratações:</strong> ${esc(contratacoes)}</p>
  <p>💰 <strong>Custo Total de Recrutamento:</strong> ${esc(brl(totalGeral))}</p>
  <p>📉 <strong>Custo por Contratação (CpH):</strong> ${esc(brl(cph))}</p>

  <h2>💰 2. Detalhamento dos Custos</h2>
  <h3>🔹 Custos Internos</h3>
  <p><strong>1. Equipe de Recrutamento (RH):</strong></p>
  <p>Salários + encargos + benefícios = ${esc(brl(custoEquipeRhTotal))}</p>
  <p>Proporcional (${esc(tempoRh)}%) = ${esc(brl(custoEquipeRhProporcional))}</p>

  <p><strong>2. Gestores em entrevistas:</strong></p>
  <p>${esc(brl(custoHoraGestores))}/h × ${esc(horasGestores)}h = ${esc(brl(custoGestores))}</p>

  <p><strong>3. Infraestrutura:</strong></p>
  <p>${esc(brl(infraestrutura))} × ${esc(tempoInfra)}% = ${esc(brl(custoInfra))}</p>

  <p><strong>4. Onboarding:</strong></p>
  <p>Direto: ${esc(brl(onboardingDiretoUnit))} × ${esc(contratacoes)} = ${esc(brl(onboardingDiretoTotal))}</p>
  <p>Indireto: ${esc(brl(onboardingIndiretoUnit))} × ${esc(contratacoes)} = ${esc(brl(onboardingIndiretoTotal))}</p>

  <p>📌 <strong>Total Custos Internos:</strong> ${esc(brl(totalInterno))}</p>

  <h3>🔹 Custos Externos</h3>
  <p>Anúncios: ${esc(brl(anuncios))}</p>
  <p>Agências: ${esc(brl(agencias))}</p>
  <p>Ferramentas: ${esc(brl(ferramentas))}</p>
  <p>Testes: ${esc(brl(testes))}</p>
  <p>Relocação: ${esc(brl(relocacao))}</p>

  <p>📌 <strong>Total Custos Externos:</strong> ${esc(brl(totalExterno))}</p>

  <p>📌 <strong>Total Geral</strong></p>
  <p>👉 ${esc(brl(totalInterno))} + ${esc(brl(totalExterno))} = ${esc(brl(totalGeral))}</p>
  <p>👉 CpH = ${esc(brl(totalGeral))} ÷ ${esc(contratacoes)} = ${esc(brl(cph))}</p>

  <h2>📈 3. Análise Contextualizada</h2>
  <p>Com base nos benchmarks de mercado:</p>
  <p>💡 <strong>${esc(setor)} (benchmark):</strong> ${esc(benchmarkText)}</p>
  <p>✅ <strong>Seu CpH:</strong> ${esc(brl(cph))} → ${esc(leituraBenchmark)}</p>

  <p>📊 <strong>Interpretação:</strong></p>
  <ul>
    <li>${totalExterno === 0 ? "Processo extremamente enxuto" : "Há investimento externo relevante no processo"}</li>
    <li>${totalExterno <= totalInterno ? "Forte uso de recursos internos" : "Dependência maior de custos externos"}</li>
    <li>${cph > 0 && cph <= 3000 ? "Alta eficiência operacional" : "Eficiência operacional com espaço para otimização"}</li>
  </ul>

  <p>⚠ <strong>Porém, atenção a alguns pontos:</strong></p>
  <ul>
    <li>${ferramentas === 0 ? "Ausência total de ferramentas pode limitar escala" : "O custo com ferramentas precisa ser confrontado com ganho de produtividade"}</li>
    <li>${anuncios === 0 ? "Nenhum investimento em anúncios pode restringir alcance" : "O investimento em anúncios deve ser monitorado contra qualidade e velocidade"}</li>
    <li>Dependência do RH em ${esc(rhPct)}% do custo total</li>
  </ul>

  <h2>🚀 4. Recomendações de Otimização</h2>
  <p><strong>🔹 1. Implementar canais de indicação (Referral)</strong></p>
  <p>Potencial: reduzir tempo e custo; aumentar qualidade das contratações.</p>
  <p>👉 Sugestão: bônus simples proporcional ao nível da vaga.</p>

  <p><strong>🔹 2. Avaliar uso de ATS básico</strong></p>
  <p>Mesmo com custo baixo atual, pode reduzir tempo operacional, melhorar organização e aumentar escala.</p>

  <p><strong>🔹 3. Otimizar tempo do RH</strong></p>
  <p>Hoje o RH representa aproximadamente ${esc(rhPct)}% do custo total.</p>
  <p>👉 Ações:</p>
  <ul>
    <li>padronizar triagem</li>
    <li>criar banco de talentos</li>
    <li>automatizar etapas simples</li>
  </ul>

  <p><strong>🔹 4. Investir minimamente em atração</strong></p>
  <p>Você está com ${esc(brl(anuncios))} em anúncios.</p>
  <p>👉 Teste controlado pode aumentar volume qualificado e reduzir tempo de fechamento.</p>

  <h2>📊 5. Métricas Complementares</h2>
  <p>💡 <strong>Custo por tipo de custo:</strong></p>
  <p>Interno: ${esc(internaPct)}%</p>
  <p>Externo: ${esc(externaPct)}%</p>
  <p>👉 ${internaPct > 80 ? "Forte dependência interna (pode gerar gargalo)" : "Mix mais equilibrado entre custo interno e externo"}</p>

  <p>💡 <strong>Custo médio por etapa:</strong></p>
  <p>RH: ${esc(brl(custoEquipeRhProporcional))}</p>
  <p>Onboarding: ${esc(brl(onboardingDiretoTotal + onboardingIndiretoTotal))}</p>
  <p>Infra + outros: ${esc(brl(custoInfra + custoGestores + testes + ferramentas + anuncios + agencias + relocacao))}</p>

  <p>💡 <strong>Eficiência geral:</strong></p>
  <ul>
    <li>CpH ${cph <= 3000 ? "baixo ✅" : "em revisão ⚠️"}</li>
    <li>${totalExterno <= totalInterno ? "Baixo investimento externo ✅" : "Investimento externo relevante ⚠️"}</li>
    <li>${cph > 0 && cph <= 3000 ? "Alta eficiência operacional ✅" : "Eficiência com oportunidade de melhoria ⚠️"}</li>
  </ul>
  <p>👉 <strong>Classificação:</strong> ${esc(classificacaoFinal)}</p>

  <h2>🧠 Conclusão Final</h2>
  <p>Você está operando com um modelo ${cph > 0 && cph <= 3000 ? "econômico e eficiente" : "que precisa de maior equilíbrio entre custo, escala e qualidade"}, especialmente considerando o contexto do setor ${esc(setor)}.</p>
  <p>👉 O próximo nível não é apenas cortar custo — é ganhar escala e qualidade sem perder eficiência.</p>
</section>
`.trim();
}
