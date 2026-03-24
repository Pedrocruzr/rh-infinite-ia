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

function productivityRate(hours: number, entregas: number) {
  return hours > 0 ? entregas / hours : 0;
}

function atingimento(real: number, meta: number) {
  return meta > 0 ? (real / meta) * 100 : 0;
}

function retorno(receita: number, custo: number) {
  return custo > 0 ? receita / custo : 0;
}

export function buildProdutividadeReport(rawAnswers: Session) {
  const nomeColaborador = String(rawAnswers.nomeColaborador ?? "Não informado");
  const cargo = String(rawAnswers.cargo ?? "Não informado");
  const setor = String(rawAnswers.setor ?? "Não informado");
  const periodo = String(rawAnswers.periodo ?? "Não informado");
  const tipoIndicador = String(rawAnswers.tipoIndicador ?? "Não informado");
  const horasTrabalhadas = Number(rawAnswers.horasTrabalhadas ?? 0);
  const entregas = Number(rawAnswers.entregas ?? 0);
  const receitaGerada = Number(rawAnswers.receitaGerada ?? 0);
  const custoColaborador = Number(rawAnswers.custoColaborador ?? 0);
  const metaEsperada = Number(rawAnswers.metaEsperada ?? 0);
  const observacoes = String(rawAnswers.observacoes ?? "Sem observações relevantes.");

  const taxaProd = productivityRate(horasTrabalhadas, entregas);
  const atingMeta = atingimento(entregas, metaEsperada);
  const retornoFinanceiro = retorno(receitaGerada, custoColaborador);

  const classificacao =
    atingMeta >= 100
      ? "Produtividade acima ou dentro da meta"
      : atingMeta >= 80
      ? "Produtividade próxima da meta"
      : "Produtividade abaixo da meta esperada";

  const leitura =
    atingMeta >= 100
      ? "O colaborador atingiu ou superou a meta esperada no período, indicando boa eficiência operacional dentro do contexto analisado."
      : atingMeta >= 80
      ? "O colaborador ficou próximo da meta. O cenário sugere necessidade de pequenos ajustes de processo, suporte ou capacitação."
      : "A produtividade ficou abaixo da meta esperada. O ideal é investigar contexto, gargalos operacionais e suporte necessário antes de qualquer decisão."

  return `
<section>
  <h1>Relatório de Taxa de Produtividade por Colaborador</h1>

  <h2>1. Resumo Executivo</h2>
  <p><strong>Colaborador:</strong> ${esc(nomeColaborador)}</p>
  <p><strong>Cargo:</strong> ${esc(cargo)}</p>
  <p><strong>Setor:</strong> ${esc(setor)}</p>
  <p><strong>Período:</strong> ${esc(periodo)}</p>
  <p><strong>Indicador principal:</strong> ${esc(tipoIndicador)}</p>

  <h2>2. Cálculo de Produtividade</h2>
  <p><strong>Horas trabalhadas:</strong> ${esc(horasTrabalhadas)}</p>
  <p><strong>Entregas realizadas:</strong> ${esc(entregas)}</p>
  <p><strong>Taxa de produtividade:</strong> ${esc(round2(taxaProd))} ${esc(tipoIndicador)}/hora</p>

  <h2>3. Comparação com Meta</h2>
  <p><strong>Meta esperada:</strong> ${esc(metaEsperada)}</p>
  <p><strong>Atingimento da meta:</strong> ${esc(round2(atingMeta))}%</p>
  <p><strong>Classificação:</strong> ${esc(classificacao)}</p>

  <h2>4. Análise Financeira</h2>
  <p><strong>Receita gerada:</strong> ${esc(receitaGerada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }))}</p>
  <p><strong>Custo do colaborador:</strong> ${esc(custoColaborador.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }))}</p>
  <p><strong>Retorno financeiro:</strong> ${esc(round2(retornoFinanceiro))}x</p>

  <h2>5. Leitura Analítica</h2>
  <p>${esc(leitura)}</p>

  <h2>6. Aplicabilidade Prática para RH</h2>
  <ul>
    <li>Usar a métrica para identificar gargalos e oportunidades de suporte.</li>
    <li>Evitar análise isolada: produtividade deve ser lida junto com contexto, qualidade e condições de trabalho.</li>
    <li>Usar os dados para desenvolvimento, treinamento e melhoria de processo, não para vigilância excessiva.</li>
    <li>Comparar produtividade apenas entre funções equivalentes.</li>
  </ul>

  <h2>7. Recomendações</h2>
  <ul>
    <li>Revisar clareza de metas e indicadores do cargo.</li>
    <li>Verificar se há recursos, sistemas e treinamento adequados.</li>
    <li>Realizar feedback estruturado com base em dados e contexto.</li>
    <li>Monitorar evolução da produtividade em novo ciclo de análise.</li>
  </ul>

  <h2>8. Observações do Contexto</h2>
  <p>${esc(observacoes)}</p>
</section>
`.trim();
}
