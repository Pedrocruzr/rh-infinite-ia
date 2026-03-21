import type { EntrevistadorAutomatizadoSession } from "./flow";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safe(value: string | undefined, fallback = "Não informado"): string {
  const text = value?.trim();
  return escapeHtml(text && text.length > 0 ? text : fallback);
}

function negativeOrValue(value: string | undefined): string {
  const text = value?.trim();
  if (!text) return "Não informado";
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (["nao", "não", "nenhum", "nenhuma", "sem mais informacoes", "sem mais informações"].includes(normalized)) {
    return "Não foram sinalizadas observações adicionais.";
  }

  return text;
}

export function buildEntrevistadorAutomatizadoReport(
  session: EntrevistadorAutomatizadoSession
): string {
  const recrutadorNome = safe(session.recrutadorNome);
  const candidatoNome = safe(session.candidatoNome);
  const vagaAlvo = safe(session.vagaAlvo);
  const contextoContratacao = safe(session.contextoContratacao);
  const objetivoPrincipalVaga = safe(session.objetivoPrincipalVaga);
  const responsabilidadesCriticas = safe(session.responsabilidadesCriticas);
  const competenciasTecnicas = safe(session.competenciasTecnicas);
  const competenciasComportamentais = safe(session.competenciasComportamentais);
  const desafiosFuncao = safe(session.desafiosFuncao);
  const criteriosEliminatorios = safe(session.criteriosEliminatorios);
  const nivelExperiencia = safe(session.nivelExperiencia);
  const observacoesFitCultural = safe(negativeOrValue(session.observacoesFitCultural));
  const nomeGestorDireto = safe(session.nomeGestorDireto);
  const aprovacaoFinalRh = safe(session.aprovacaoFinalRh);

  return `
<h1>Relatório Técnico - Entrevistador Automatizado</h1>

<p><strong>Aviso:</strong> esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.</p>

<h2>Identificação da solicitação</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr>
    <td><strong>Agente</strong></td>
    <td>Entrevistador Automatizado</td>
  </tr>
  <tr>
    <td><strong>Candidato</strong></td>
    <td>${candidatoNome}</td>
  </tr>
  <tr>
    <td><strong>Vaga</strong></td>
    <td>${vagaAlvo}</td>
  </tr>
  <tr>
    <td><strong>Recrutador responsável</strong></td>
    <td>${recrutadorNome}</td>
  </tr>
  <tr>
    <td><strong>Gestor direto</strong></td>
    <td>${nomeGestorDireto}</td>
  </tr>
  <tr>
    <td><strong>Aprovação final</strong></td>
    <td>${aprovacaoFinalRh}</td>
  </tr>
</table>

<h2>Leitura técnica do contexto</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr>
    <td><strong>Contexto da contratação</strong></td>
    <td>${contextoContratacao}</td>
  </tr>
  <tr>
    <td><strong>Objetivo principal da vaga</strong></td>
    <td>${objetivoPrincipalVaga}</td>
  </tr>
  <tr>
    <td><strong>Nível de experiência esperado</strong></td>
    <td>${nivelExperiencia}</td>
  </tr>
  <tr>
    <td><strong>Desafios da função</strong></td>
    <td>${desafiosFuncao}</td>
  </tr>
</table>

<h2>Critérios de avaliação da entrevista</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr>
    <td><strong>Responsabilidades críticas</strong></td>
    <td>${responsabilidadesCriticas}</td>
  </tr>
  <tr>
    <td><strong>Competências técnicas exigidas</strong></td>
    <td>${competenciasTecnicas}</td>
  </tr>
  <tr>
    <td><strong>Competências comportamentais exigidas</strong></td>
    <td>${competenciasComportamentais}</td>
  </tr>
  <tr>
    <td><strong>Critérios eliminatórios</strong></td>
    <td>${criteriosEliminatorios}</td>
  </tr>
  <tr>
    <td><strong>Observações de fit cultural</strong></td>
    <td>${observacoesFitCultural}</td>
  </tr>
</table>

<h2>Roteiro estruturado de entrevista</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr>
    <td><strong>Etapa</strong></td>
    <td><strong>Objetivo</strong></td>
    <td><strong>Pergunta orientadora</strong></td>
    <td><strong>Evidência esperada</strong></td>
  </tr>
  <tr>
    <td>Abertura</td>
    <td>Validar contexto profissional e aderência inicial</td>
    <td>Quero começar entendendo seu momento profissional. O que te motivou a participar desta seleção para a vaga de ${vagaAlvo}?</td>
    <td>Clareza de motivação, coerência com a vaga e maturidade na comunicação.</td>
  </tr>
  <tr>
    <td>Abertura</td>
    <td>Validar entendimento da posição</td>
    <td>Na sua visão, qual é o principal objetivo de um profissional dessa função dentro da empresa?</td>
    <td>Leitura de negócio, entendimento do impacto do cargo e noção de prioridade.</td>
  </tr>
  <tr>
    <td>Técnica</td>
    <td>Explorar domínio operacional</td>
    <td>Me conte uma situação em que você executou atividades semelhantes a estas responsabilidades: ${responsabilidadesCriticas}.</td>
    <td>Experiência concreta, repertório prático e domínio das entregas centrais.</td>
  </tr>
  <tr>
    <td>Técnica</td>
    <td>Validar competência técnica crítica</td>
    <td>Quais resultados você já gerou utilizando estas competências técnicas: ${competenciasTecnicas}?</td>
    <td>Exemplos objetivos, indicadores, autonomia e aplicação real do conhecimento.</td>
  </tr>
  <tr>
    <td>Técnica</td>
    <td>Medir profundidade e consistência</td>
    <td>Descreva uma decisão difícil que você precisou tomar em uma rotina parecida com esta vaga. Como analisou o cenário e qual foi sua decisão final?</td>
    <td>Capacidade analítica, julgamento, priorização e responsabilidade sobre impacto.</td>
  </tr>
  <tr>
    <td>Comportamental</td>
    <td>Validar repertório comportamental</td>
    <td>Me dê um exemplo real em que você precisou demonstrar ${competenciasComportamentais} em um contexto de pressão ou mudança.</td>
    <td>Autopercepção, maturidade emocional, clareza na ação e aprendizado aplicado.</td>
  </tr>
  <tr>
    <td>Comportamental</td>
    <td>Entender resposta a desafios</td>
    <td>Considerando que essa função enfrenta estes desafios: ${desafiosFuncao}, como você costuma se organizar para manter performance e qualidade?</td>
    <td>Organização, resiliência, disciplina, senso de prioridade e estabilidade de execução.</td>
  </tr>
  <tr>
    <td>Comportamental</td>
    <td>Investigar colaboração e relacionamento</td>
    <td>Conte uma situação em que você precisou alinhar expectativas com liderança, pares ou clientes internos para entregar resultado.</td>
    <td>Comunicação, negociação, escuta ativa e capacidade de alinhamento.</td>
  </tr>
  <tr>
    <td>Fit Cultural</td>
    <td>Checar aderência ao ambiente</td>
    <td>Que tipo de ambiente de trabalho favorece sua melhor performance e quais comportamentos você acredita que fortalecem uma equipe?</td>
    <td>Compatibilidade com cultura, responsabilidade coletiva e consciência de contexto.</td>
  </tr>
  <tr>
    <td>Fit Cultural</td>
    <td>Testar aderência aos pontos sensíveis da vaga</td>
    <td>Existe algum tipo de rotina, modelo de gestão ou cenário operacional em que você entende que performa menos? Como lida com isso?</td>
    <td>Transparência, autoconhecimento e maturidade para reconhecer limites sem fuga de responsabilidade.</td>
  </tr>
  <tr>
    <td>Risco</td>
    <td>Confrontar critérios eliminatórios</td>
    <td>Há algum ponto do seu histórico ou forma de trabalho que possa gerar preocupação em relação a estes critérios de atenção: ${criteriosEliminatorios}?</td>
    <td>Consistência, honestidade, segurança na narrativa e ausência de incompatibilidades críticas.</td>
  </tr>
  <tr>
    <td>Fechamento</td>
    <td>Fechar com visão de compromisso e aderência</td>
    <td>Se for contratado para esta posição, quais seriam suas prioridades nos primeiros 30 dias para gerar resultado com segurança?</td>
    <td>Capacidade de rampa, visão prática de integração e orientação a resultado.</td>
  </tr>
</table>

<h2>Gaps e pontos de atenção para o entrevistador</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr>
    <td><strong>Ponto de atenção 1</strong></td>
    <td>Buscar exemplos concretos e mensuráveis. Evitar aceitar respostas excessivamente genéricas ou teóricas.</td>
  </tr>
  <tr>
    <td><strong>Ponto de atenção 2</strong></td>
    <td>Confrontar discurso com histórico real de execução, principalmente nos temas técnicos e nos desafios críticos da função.</td>
  </tr>
  <tr>
    <td><strong>Ponto de atenção 3</strong></td>
    <td>Checar coerência entre motivação do candidato, contexto da contratação e maturidade para operar no ritmo exigido pela vaga.</td>
  </tr>
  <tr>
    <td><strong>Ponto de atenção 4</strong></td>
    <td>Investigar sinais compatíveis com os critérios eliminatórios antes de avançar para etapa final.</td>
  </tr>
</table>

<h2>Plano técnico de condução</h2>
<p>Conduzir a entrevista em blocos, iniciando por contexto e motivação, avançando para repertório técnico, aprofundando evidências comportamentais e encerrando com aderência cultural e plano de entrada. Em cada resposta, o entrevistador deve solicitar situação, ação, resultado e aprendizado para elevar a precisão da análise.</p>

<h2>Encerramento técnico</h2>
<p>O roteiro foi estruturado para aumentar a consistência da entrevista, reduzir subjetividade excessiva e ampliar a capacidade de comparar candidatos com base em critérios observáveis, alinhados à vaga e ao contexto informado pelo recrutador.</p>

<h2>Assinatura e validação</h2>
<p><strong>Responsável pela Avaliação (RH/Recrutador):</strong> ${recrutadorNome}</p>
<p><strong>Validação (Gestor Direto/Liderança):</strong> ${nomeGestorDireto}</p>
<p><strong>Aprovação Final (Diretoria/RH):</strong> ${aprovacaoFinalRh}</p>
`.trim();
}
