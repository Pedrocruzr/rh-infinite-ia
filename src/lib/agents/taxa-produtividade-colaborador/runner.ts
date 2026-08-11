type Session = Record<string, any>;

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

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function productivityRate(hours: number, entregas: number) {
  return hours > 0 ? entregas / hours : 0;
}

function atingimento(real: number, meta: number) {
  return meta > 0 ? (real / meta) * 100 : 0;
}

function retorno(receita: number, custo: number) {
  return custo > 0 ? receita / custo : 0;
}

function inferUnit(indicador: string) {
  const i = String(indicador ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (i.includes("atendimento")) return "atendimentos/hora";
  if (i.includes("venda")) return "vendas/hora";
  if (i.includes("process")) return "processos/hora";
  if (i.includes("tarefa")) return "tarefas/hora";
  if (i.includes("document")) return "documentos/hora";
  if (i.includes("receita")) return "receita por hora";
  return "entregas/hora";
}

function classificacaoMeta(pct: number) {
  if (pct > 100) return "Acima da meta";
  if (pct >= 95) return "Na meta";
  if (pct >= 80) return "Próximo da meta";
  return "Abaixo da meta";
}

function statusBadge(classe: string) {
  if (classe === "Acima da meta" || classe === "Na meta") {
    return `<span style="display:inline-block; background:#dcfce7 !important; color:#166534 !important; padding:4px 12px; border-radius:12px; font-size:12px; font-weight:700; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">${esc(classe)}</span>`;
  }
  if (classe === "Próximo da meta") {
    return `<span style="display:inline-block; background:#e0f2fe !important; color:#0369a1 !important; padding:4px 12px; border-radius:12px; font-size:12px; font-weight:700; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">${esc(classe)}</span>`;
  }
  return `<span style="display:inline-block; background:#fee2e2 !important; color:#991b1b !important; padding:4px 12px; border-radius:12px; font-size:12px; font-weight:700; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">${esc(classe)}</span>`;
}

function statusColor(pct: number) {
  if (pct >= 95) return "#10b981";
  if (pct >= 80) return "#0284c7";
  return "#f59e0b";
}

export function buildProdutividadeColaboradorReport(rawAnswers: Session) {
  const dateStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const nomeColaborador = String(rawAnswers.nomeColaborador ?? "Não informado");
  const cargo = String(rawAnswers.cargo ?? "Não informado");
  const setor = String(rawAnswers.setor ?? "Não informado");
  const periodo = String(rawAnswers.periodo ?? "Não informado");
  const tipoIndicador = String(rawAnswers.tipoIndicador ?? "Não informado");
  const unidade = inferUnit(tipoIndicador);
  const horasTrabalhadas = Number(rawAnswers.horasTrabalhadas ?? 0);
  const entregas = Number(rawAnswers.entregas ?? 0);
  const receitaGerada = Number(rawAnswers.receitaGerada ?? 0);
  const custoColaborador = Number(rawAnswers.custoColaborador ?? 0);
  const metaEsperada = Number(rawAnswers.metaEsperada ?? 0);
  const observacoes = String(rawAnswers.observacoes ?? "Sem observações relevantes.");

  const produtividade = productivityRate(horasTrabalhadas, entregas);
  const metaProdutividade = horasTrabalhadas > 0 ? metaEsperada / horasTrabalhadas : 0;
  const atingMeta = atingimento(entregas, metaEsperada);
  const atingProd = atingimento(produtividade, metaProdutividade);
  const retornoFinanceiro = retorno(receitaGerada, custoColaborador);
  const classeMeta = classificacaoMeta(atingMeta);

  const obs = String(observacoes ?? "").trim();
  const obsLow = obs
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const contextAnalysis =
    !obs || obsLow === "sem observacoes" || obsLow === "sem observações" || obsLow === "sem observacoes relevantes"
      ? "Não foram registradas observações contextuais relevantes na coleta. Ainda assim, é recomendável validar com a liderança se houve algum fator operacional, técnico ou comportamental que possa ter influenciado a produtividade no período analisado."
      : obsLow.includes("novo na funcao") || obsLow.includes("nova funcao") || obsLow.includes("novo no cargo")
      ? "O contexto informado indica que o colaborador pode ainda estar em fase de adaptação à função. Nesse cenário, a produtividade precisa ser lida com cautela, considerando curva de aprendizagem, assimilação de rotina, domínio técnico e segurança na execução. Para RH e liderança, o mais adequado é acompanhar a evolução ao longo dos próximos ciclos, realizar uma conversa estruturada sobre dificuldades iniciais e verificar se há necessidade de apoio, integração adicional ou treinamento direcionado."
      : obsLow.includes("treinamento em andamento") || obsLow.includes("em treinamento") || obsLow.includes("capacitando")
      ? "O contexto informado mostra que o colaborador está em processo de treinamento ou desenvolvimento. Isso pode impactar diretamente o ritmo de entrega no curto prazo, sem necessariamente indicar baixo desempenho estrutural. O ponto de atenção para RH e gestão é observar se a produtividade atual está compatível com a fase de desenvolvimento, acompanhar a evolução após o treinamento e validar se o conteúdo aplicado está gerando ganho real de desempenho."
      : obsLow.includes("falta de sistema") || obsLow.includes("sistema lento") || obsLow.includes("problema no sistema") || obsLow.includes("instabilidade")
      ? "O contexto aponta um possível gargalo estrutural ou tecnológico. Nesse caso, a produtividade observada pode estar sendo afetada por limitações de sistema, lentidão operacional ou falhas de ferramenta, e não apenas por fatores individuais. A leitura correta para RH e liderança é investigar o impacto real da estrutura sobre o desempenho, mapear o nível de retrabalho gerado e evitar conclusões precipitadas sobre performance individual enquanto esse fator persistir."
      : obsLow.includes("sobrecarga") || obsLow.includes("muita demanda") || obsLow.includes("equipe reduzida") || obsLow.includes("acumulo")
      ? "O contexto informado sugere sobrecarga operacional. Isso significa que a produtividade precisa ser interpretada junto à distribuição de demanda, volume de trabalho, priorização e capacidade real de execução. Para RH e gestão, o ponto central é entender se a queda de performance vem de falta de capacidade individual ou de excesso estrutural de demanda. Nesses casos, é recomendável revisar fluxo, redistribuição de tarefas e apoio da liderança."
      : obsLow.includes("falta de treinamento") || obsLow.includes("precisa de treinamento") || obsLow.includes("sem treinamento")
      ? "O contexto sugere lacuna de capacitação. Nesse cenário, a produtividade pode estar abaixo do esperado por ausência de preparo técnico, clareza de processo ou prática suficiente. A melhor leitura para RH é tratar o dado como sinal de desenvolvimento necessário, e não como julgamento isolado de desempenho. O caminho mais indicado é mapear as lacunas, estruturar treinamento e reavaliar após novo ciclo."
      : `O contexto informado pelo usuário exige leitura qualitativa complementar. A observação registrada foi: "${obs}". Isso indica que a produtividade não deve ser interpretada apenas pelo número final, mas também pelas condições em que o colaborador executou suas atividades. Para RH e liderança, o ideal é validar impacto real desse fator no desempenho, identificar se se trata de causa temporária ou estrutural e acompanhar a evolução em um novo período de análise.`;

  const leituraCalculo =
    metaEsperada > 0
      ? `O colaborador realizou ${round2(produtividade)} ${unidade}, atingindo ${round2(atingMeta)}% da meta estabelecida. Isso representa um desempenho ${classeMeta.toLowerCase()} para a função, considerando o contexto informado.`
      : `O colaborador realizou ${round2(produtividade)} ${unidade}. Como a meta não foi definida, a leitura deve considerar o contexto, a qualidade e a comparação com o padrão interno da área.`;

  const analiseFinanceira =
    receitaGerada > 0
      ? `A área apresenta receita direta atribuível. O retorno financeiro estimado é de ${round2(retornoFinanceiro)}x sobre o custo do colaborador.`
      : `A área não apresenta receita direta atribuível. A análise financeira deve considerar valor agregado indireto, como qualidade, redução de retrabalho, eficiência e experiência do cliente.`;

  const barWidth = Math.min(100, Math.max(5, Math.round(atingMeta)));
  const barColor = statusColor(atingMeta);

  return `
<style>
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
  .prod-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
  }
  .prod-table th, .prod-table td {
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    text-align: left;
    font-size: 13px;
  }
  .prod-table th {
    background-color: #f8fafc !important;
    color: #0f172a;
    font-weight: 700;
  }
</style>

<section style="background:#ffffff; border-radius:16px; padding:32px; color:#334155; margin-bottom:24px; font-family: system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">

  <!-- CAPA / CABEÇALHO DO RELATÓRIO -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; border-radius: 14px; padding: 32px 24px; color: #ffffff !important; text-align: center; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(15,23,42,0.15); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; margin: 0 0 8px; font-weight:600; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Auditoria de Performance & Produtividade</p>
    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #ffffff !important; letter-spacing: -0.5px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Relatório de Taxa de Produtividade</h1>
    <p style="font-size: 14px; color: #cbd5e1 !important; margin: 0 0 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Colaborador: <strong style="color:#ffffff !important;">${esc(nomeColaborador)}</strong> • Cargo: ${esc(cargo)} (${esc(setor)}) • Gerado em ${dateStr}</p>
    <div style="display: inline-block; background: #0284c7 !important; color: #ffffff !important; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      Diagnóstico Executivo de Eficiência Operacional
    </div>
  </div>

  <!-- CARDS DE METRICAS PRINCIPAIS (KPIS) -->
  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:28px;">
    <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:18px; text-align:center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block; margin-bottom:6px;">Taxa de Produtividade</span>
      <strong style="color:#0f172a; font-size:22px; display:block;">${esc(round2(produtividade))}</strong>
      <span style="font-size:12px; color:#64748b;">${esc(unidade)}</span>
    </div>

    <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:18px; text-align:center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block; margin-bottom:6px;">Atingimento da Meta</span>
      <strong style="color:${barColor}; font-size:22px; display:block;">${esc(round2(atingMeta))}%</strong>
      <div style="background:#e2e8f0; border-radius:6px; height:6px; width:100%; margin-top:8px; overflow:hidden;">
        <div style="background:${barColor} !important; height:100%; width:${barWidth}%; border-radius:6px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;"></div>
      </div>
    </div>

    <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:18px; text-align:center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block; margin-bottom:6px;">Classificação Geral</span>
      <div style="margin-top:6px;">
        ${statusBadge(classeMeta)}
      </div>
      <span style="font-size:12px; color:#64748b; display:block; margin-top:6px;">${esc(entregas)} de ${esc(metaEsperada)} entregas</span>
    </div>

    <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:18px; text-align:center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block; margin-bottom:6px;">Retorno Financeiro (ROI)</span>
      <strong style="color:#0f172a; font-size:22px; display:block;">${receitaGerada > 0 ? esc(round2(retornoFinanceiro) + "x") : "Indireto"}</strong>
      <span style="font-size:12px; color:#64748b;">${receitaGerada > 0 ? "Receita / Custo" : "Valor agregado à área"}</span>
    </div>
  </div>

  <!-- SEÇÃO 1: RESUMO EXECUTIVO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">1. RESUMO EXECUTIVO</h2>
  <table class="prod-table">
    <tbody>
      <tr><td style="width:240px; font-weight:600; background:#f8fafc;">Colaborador(a)</td><td><strong>${esc(nomeColaborador)}</strong></td></tr>
      <tr><td style="font-weight:600; background:#f8fafc;">Cargo</td><td>${esc(cargo)}</td></tr>
      <tr><td style="font-weight:600; background:#f8fafc;">Área / Setor</td><td>${esc(setor)}</td></tr>
      <tr><td style="font-weight:600; background:#f8fafc;">Período de Análise</td><td>${esc(periodo)}</td></tr>
      <tr><td style="font-weight:600; background:#f8fafc;">Indicador Principal</td><td>${esc(tipoIndicador)} (${esc(unidade)})</td></tr>
      <tr><td style="font-weight:600; background:#f8fafc;">Classificação Geral</td><td>${statusBadge(classeMeta)}</td></tr>
    </tbody>
  </table>

  <!-- SEÇÃO 2: PRODUTIVIDADE - INDICADORES OBJETIVOS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">2. PRODUTIVIDADE – INDICADORES OBJETIVOS</h2>
  <table class="prod-table">
    <thead>
      <tr>
        <th>Indicador</th>
        <th>Realizado</th>
        <th>Meta</th>
        <th>Atingimento</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Horas Trabalhadas</strong></td>
        <td>${esc(horasTrabalhadas)}h</td>
        <td>${esc(horasTrabalhadas)}h</td>
        <td>100%</td>
        <td><span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700;">OK</span></td>
      </tr>
      <tr>
        <td><strong>Volume Realizado (Entregas)</strong></td>
        <td>${esc(entregas)}</td>
        <td>${esc(metaEsperada)}</td>
        <td>${esc(round2(atingMeta))}%</td>
        <td>${statusBadge(classeMeta)}</td>
      </tr>
      <tr>
        <td><strong>Taxa de Produtividade</strong></td>
        <td>${esc(round2(produtividade))} ${esc(unidade)}</td>
        <td>${esc(round2(metaProdutividade))} ${esc(unidade)}</td>
        <td>${esc(round2(atingProd))}%</td>
        <td>${statusBadge(classeMeta)}</td>
      </tr>
    </tbody>
  </table>

  <!-- SEÇÃO 3: CÁLCULO DE PRODUTIVIDADE DETALHADO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">3. CÁLCULO DE PRODUTIVIDADE DETALHADO</h2>
  <table class="prod-table">
    <thead>
      <tr>
        <th>Variável</th>
        <th>Valor Registrado</th>
        <th>Fórmula / Memória de Cálculo</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Horas Trabalhadas no Período</td><td>${esc(horasTrabalhadas)} horas</td><td>Total de horas ativas apuradas no período</td></tr>
      <tr><td>Entregas Realizadas</td><td>${esc(entregas)} unidades</td><td>Total de entregas concluídas</td></tr>
      <tr><td>Taxa de Produtividade Bruta</td><td><strong>${esc(round2(produtividade))} ${esc(unidade)}</strong></td><td>${esc(entregas)} entregas ÷ ${esc(horasTrabalhadas)} horas</td></tr>
      <tr><td>Meta de Produtividade Esperada</td><td>${esc(round2(metaProdutividade))} ${esc(unidade)}</td><td>${esc(metaEsperada)} meta total ÷ ${esc(horasTrabalhadas)} horas</td></tr>
      <tr><td>Percentual de Atingimento</td><td><strong>${esc(round2(atingMeta))}%</strong></td><td>(${esc(entregas)} ÷ ${esc(metaEsperada)}) × 100</td></tr>
      <tr><td>Classificação Final</td><td>${statusBadge(classeMeta)}</td><td>Faixa de enquadramento metodológico</td></tr>
    </tbody>
  </table>

  <div style="background:#f8fafc !important; border-left:4px solid #0284c7 !important; border-radius:8px; padding:16px; margin-bottom:28px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#0f172a;">Leitura do Cálculo de Desempenho:</p>
    <p style="margin:0; font-size:13px; color:#334155; line-height:1.5;">${esc(leituraCalculo)}</p>
  </div>

  <!-- SEÇÃO 4: ANÁLISE FINANCEIRA -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">4. ANÁLISE FINANCEIRA (CUSTO X RETORNO)</h2>
  <table class="prod-table">
    <thead>
      <tr>
        <th>Item Financeiro</th>
        <th>Valor</th>
        <th>Critério / Aplicação</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Receita Gerada pelo Colaborador</strong></td>
        <td><strong>${esc(money(receitaGerada))}</strong></td>
        <td>${receitaGerada > 0 ? "Receita direta gerada no período" : "Área de suporte/atendimento (sem receita direta atribuída)"}</td>
      </tr>
      <tr>
        <td><strong>Custo Total do Colaborador</strong></td>
        <td>${esc(money(custoColaborador))}</td>
        <td>Salário, encargos e benefícios no período apurado</td>
      </tr>
      <tr>
        <td><strong>Retorno Financeiro (ROI)</strong></td>
        <td><strong>${receitaGerada > 0 ? esc(round2(retornoFinanceiro) + "x") : "Valor Indireto"}</strong></td>
        <td>${receitaGerada > 0 ? "Receita gerada ÷ custo total do colaborador" : "Foco em qualidade, eficiência e suporte operacional"}</td>
      </tr>
    </tbody>
  </table>

  <div style="background:#f8fafc !important; border-left:4px solid #0284c7 !important; border-radius:8px; padding:16px; margin-bottom:28px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#0f172a;">Análise Financeira Complementar:</p>
    <p style="margin:0; font-size:13px; color:#334155; line-height:1.5;">${esc(analiseFinanceira)}</p>
  </div>

  <!-- SEÇÃO 5: CLIMA E CONTEXTO – INDICADORES SUBJETIVOS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">5. CLIMA E CONTEXTO (INDICADORES SUBJETIVOS)</h2>
  
  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:24px;">
    <p style="margin:0 0 6px 0; font-size:13px; font-weight:700; color:#0f172a;">Contexto Registrado:</p>
    <p style="margin:0 0 14px 0; font-size:13px; color:#475569; font-style:italic;">"${esc(observacoes)}"</p>
    
    <p style="margin:0 0 6px 0; font-size:13px; font-weight:700; color:#0f172a;">Parecer Contextual da Metodologia:</p>
    <p style="margin:0 0 14px 0; font-size:13px; color:#334155; line-height:1.6;">${esc(contextAnalysis)}</p>

    <p style="margin:0 0 8px 0; font-size:13px; font-weight:700; color:#0f172a;">Diretrizes para RH e Liderança:</p>
    <ul style="margin:0 0 0 20px; padding:0; font-size:13px; color:#334155; line-height:1.6;">
      <li>Verificar se o contexto operacional impactou diretamente o ritmo, a qualidade ou a consistência das entregas.</li>
      <li>Evitar leitura puramente numérica da produtividade sem considerar as condições de trabalho do período.</li>
      <li>Confirmar com a liderança imediata se houve impacto temporário, estrutural ou recorrente.</li>
      <li>Utilizar o indicador como base para apoio, desenvolvimento individual e melhoria de processos.</li>
    </ul>
  </div>

  <!-- SEÇÃO 6: COMPARAÇÃO COM METAS E REFERÊNCIAS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">6. COMPARAÇÃO COM METAS E REFERÊNCIAS</h2>
  <table class="prod-table">
    <thead>
      <tr>
        <th>Dimensão</th>
        <th>Resultado Apurado</th>
        <th>Referência / Meta</th>
        <th>Diagnóstico Comparativo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Volume de Entregas</strong></td>
        <td><strong>${esc(round2(atingMeta))}%</strong></td>
        <td>Meta: ${esc(metaEsperada)} unidades</td>
        <td>${atingMeta >= 100 ? "Atingiu ou superou a meta estabelecida" : `Abaixo da meta em ${esc(round2(100 - atingMeta))}%`}</td>
      </tr>
      <tr>
        <td><strong>Taxa de Produtividade</strong></td>
        <td>${esc(round2(produtividade))} ${esc(unidade)}</td>
        <td>${esc(round2(metaProdutividade))} ${esc(unidade)}</td>
        <td>${statusBadge(classeMeta)}</td>
      </tr>
      <tr>
        <td><strong>Retorno sobre Custo</strong></td>
        <td>${receitaGerada > 0 ? esc(round2(retornoFinanceiro) + "x") : "Valor Indireto"}</td>
        <td>Sustentabilidade Financeira</td>
        <td>${receitaGerada > 0 ? (retornoFinanceiro >= 3 ? "Retorno financeiro alto" : "Retorno financeiro moderado") : "Atividade de apoio e suporte"}</td>
      </tr>
    </tbody>
  </table>

  <!-- SEÇÃO 7: ANÁLISE INTEGRADA -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">7. ANÁLISE INTEGRADA (NÚMEROS, CONTEXTO E QUALIDADE)</h2>
  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:28px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
    <p style="margin:0 0 10px 0; color:#0f172a; font-weight:700; font-size:14px;">Diagnóstico Geral: Desempenho ${esc(classeMeta.toLowerCase())}.</p>
    <p style="margin:0; color:#334155; font-size:13px; line-height:1.6;">
      A produtividade deve ser interpretada de forma sistêmica, combinando o volume produzido com a complexidade das rotinas e as condições de infraestrutura. A metodologia recomenda que gestores analisem gargalos de processos e ferramentas antes de atribuir qualquer desvio de performance exclusivamente a fatores individuais.
    </p>
  </div>

  <!-- SEÇÃO 8: RECOMENDAÇÕES E PLANO DE AÇÃO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">8. RECOMENDAÇÕES E PLANO DE AÇÃO</h2>
  <table class="prod-table">
    <thead>
      <tr>
        <th>Oportunidade / Eixo</th>
        <th>Ação Proposta</th>
        <th>Responsável</th>
        <th>Prazo</th>
        <th>Prioridade</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Alinhamento de Metas</strong></td>
        <td>Revisar e formalizar critérios de meta, qualidade e ritmo esperado para a função.</td>
        <td>Gestor / RH</td>
        <td>15 dias</td>
        <td><span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700;">Alta</span></td>
      </tr>
      <tr>
        <td><strong>Contexto Operacional</strong></td>
        <td>Investigar gargalos estruturais, sistemas, ferramentas e distribuição de carga de trabalho.</td>
        <td>Gestor Direto</td>
        <td>15 dias</td>
        <td><span style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700;">Alta</span></td>
      </tr>
      <tr>
        <td><strong>Desenvolvimento Individual</strong></td>
        <td>Conduzir sessão de feedback estruturado e mapear necessidades de capacitação.</td>
        <td>Gestor / RH</td>
        <td>30 dias</td>
        <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700;">Média</span></td>
      </tr>
      <tr>
        <td><strong>Monitoramento Contínuo</strong></td>
        <td>Acompanhar a evolução da taxa de produtividade em ciclos regulares de 30 dias.</td>
        <td>RH</td>
        <td>30 dias</td>
        <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700;">Média</span></td>
      </tr>
    </tbody>
  </table>

  <!-- SEÇÃO 9: PRÓXIMOS PASSOS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">9. PRÓXIMOS PASSOS E MONITORAMENTO</h2>
  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
      <strong style="color:#0f172a; font-size:14px; display:block; margin-bottom:6px;">1. Devolutiva ao Colaborador</strong>
      <p style="margin:0; font-size:13px; color:#475569; line-height:1.5;">Apresentar os números, alinhar a percepção do contexto operacional e ouvir as considerações do profissional.</p>
    </div>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
      <strong style="color:#0f172a; font-size:14px; display:block; margin-bottom:6px;">2. Acompanhamento Operacional</strong>
      <p style="margin:0; font-size:13px; color:#475569; line-height:1.5;">Monitorar as melhorias de rotina, fluxo de sistemas e apoio de liderança acordados no plano de ação.</p>
    </div>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
      <strong style="color:#0f172a; font-size:14px; display:block; margin-bottom:6px;">3. Reavaliação no Novo Ciclo</strong>
      <p style="margin:0; font-size:13px; color:#475569; line-height:1.5;">Executar nova apuração integrada após 30 a 60 dias para mensurar o ganho real de produtividade.</p>
    </div>
  </div>

</section>
  `.trim();
}
