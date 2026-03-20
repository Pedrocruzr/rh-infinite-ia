import {
  classifyRoleLevel,
} from "./parecer-metrics";
import {
  getNextParecerQuestion,
  isParecerReady,
  updateParecerSession,
  type ParecerField,
  type ParecerSession,
} from "./parecer-flow";

export function initializeParecerSession(): ParecerSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
    reportMarkdown: null,
  };
}

export function applyParecerAnswer(
  session: ParecerSession,
  field: ParecerField,
  answer: string
): ParecerSession {
  const updated = updateParecerSession(session, field, answer);

  if (field === "vaga" && answer.trim()) {
    updated.nivelVaga = classifyRoleLevel(answer);
  }

  return updated;
}

export function getNextParecerStep(session: ParecerSession): {
  field: ParecerField;
  question: string;
} | null {
  return getNextParecerQuestion(session);
}

function safe(value?: string | null, fallback = "Não informado"): string {
  const text = value?.trim();
  return text && text.length > 0 ? text : fallback;
}

function escapeHtml(value?: string | null): string {
  return safe(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function listFromText(value?: string | null): string[] {
  const raw = value?.trim();
  if (!raw) return ["Não informado"];
  return raw
    .split(/\n|;|•/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function bulletList(value?: string | null): string {
  return `<ul>${listFromText(value)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function recommendationLabel(value?: string | null): string {
  const text = safe(value).toLowerCase();
  if (text.includes("restr")) return "Aprovado com Restrições";
  if (text.includes("reprov")) return "Reprovado";
  return "Aprovado";
}

function buildGerencialParecer(session: ParecerSession): string {
  const recomendacao = recommendationLabel(session.recomendacaoFinal);
  const responsavel = safe(session.entrevistadores, "Não informado na coleta");
  const validacaoGestor = safe(session.validacaoGestor, "Não informado na coleta");
  const aprovacaoFinalRh = safe(session.aprovacaoFinalRh, "Não informado na coleta");

  return `
<section>
  <h1>Parecer Técnico de Entrevista RH</h1>

  <div class="meta-grid">
    <div><strong>EMPRESA:</strong> ${escapeHtml(session.empresa)}</div>
    <div><strong>VAGA:</strong> ${escapeHtml(session.vaga)}</div>
    <div><strong>CANDIDATO(A):</strong> ${escapeHtml(session.candidato)}</div>
    <div><strong>DATA DA ENTREVISTA:</strong> ${escapeHtml(session.dataEntrevista)}</div>
    <div><strong>ENTREVISTADOR(ES):</strong> ${escapeHtml(session.entrevistadores)}</div>
    <div><strong>GESTOR SOLICITANTE:</strong> Não informado na coleta</div>
    <div><strong>DATA DO PARECER:</strong> ${escapeHtml(session.dataEntrevista)}</div>
    <div><strong>RECOMENDAÇÃO FINAL:</strong> ${escapeHtml(recomendacao)}</div>
  </div>

  <h2>1. RESUMO EXECUTIVO</h2>
  <p><strong>Candidato:</strong> ${escapeHtml(session.candidato)} | <strong>Experiência:</strong> ${escapeHtml(session.experienciaTotalENivel)}</p>
  <p><strong>Síntese da recomendação:</strong> Candidato com trajetória aderente ao contexto da vaga, apresentando evidências observáveis em gestão, comunicação, acompanhamento de rotina, estruturação de processos e interface com indicadores. A análise final aponta coerência entre histórico, repertório apresentado e exigências típicas de uma posição gerencial.</p>

  <h2>2. DADOS PESSOAIS E CONTEXTO</h2>
  <p><strong>Local de residência e disponibilidade:</strong> ${escapeHtml(session.residenciaDisponibilidade)}</p>
  <p><strong>Mobilidade geográfica:</strong> ${escapeHtml(session.mobilidadeGeografica)}</p>
  <p><strong>Contexto da contratação:</strong> ${escapeHtml(session.contextoContratacao)}</p>
  <p><strong>Motivação para a vaga:</strong> ${escapeHtml(session.motivacao)}</p>

  <h2>3. FORMAÇÃO ACADÊMICA E DESENVOLVIMENTO</h2>
  <p><strong>Educação formal:</strong> ${escapeHtml(session.formacao)}</p>
  <p><strong>Certificações e desenvolvimento complementar:</strong></p>
  ${bulletList(session.certificacoes)}
  <p><strong>Idiomas:</strong> ${escapeHtml(session.idiomas)}</p>

  <h2>4. TRAJETÓRIA PROFISSIONAL</h2>
  <table>
    <thead>
      <tr>
        <th>Período</th>
        <th>Cargo</th>
        <th>Empresa</th>
        <th>Setor</th>
        <th>Equipe liderada</th>
        <th>Responsabilidades-chave</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Não informado na coleta</td>
        <td>${escapeHtml(session.vaga)}</td>
        <td>${escapeHtml(session.empresa)}</td>
        <td>Não informado na coleta</td>
        <td>Não informado na coleta</td>
        <td>${escapeHtml(session.trajetoria)}</td>
      </tr>
    </tbody>
  </table>

  <p><strong>Análise da progressão:</strong></p>
  <ul>
    <li>${escapeHtml(session.progressaoCarreira)}</li>
    <li>${escapeHtml(session.movimentacoes)}</li>
    <li>A trajetória apresentada indica elementos suficientes para análise técnica, ainda que parte do histórico detalhado não tenha sido formalmente estruturado na coleta.</li>
  </ul>

  <h2>5. AVALIAÇÃO DE COMPETÊNCIAS TÉCNICAS PARA LIDERANÇA</h2>
  <table>
    <thead>
      <tr>
        <th>Competência</th>
        <th>Nível esperado</th>
        <th>Nível apresentado</th>
        <th>Evidência</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Conhecimento do negócio/setor</td>
        <td>Avançado</td>
        <td>Intermediário/Avançado</td>
        <td>${escapeHtml(session.conhecimentoNegocioSetor)}</td>
      </tr>
      <tr>
        <td>Gestão de processos</td>
        <td>Avançado</td>
        <td>Avançado</td>
        <td>${escapeHtml(session.gestaoProcessos)}</td>
      </tr>
      <tr>
        <td>Análise de dados/KPIs</td>
        <td>Intermediário</td>
        <td>Intermediário</td>
        <td>${escapeHtml(session.analiseKpis)}</td>
      </tr>
      <tr>
        <td>Planejamento estratégico</td>
        <td>Intermediário</td>
        <td>Intermediário</td>
        <td>${escapeHtml(session.planejamentoPriorizacao)}</td>
      </tr>
      <tr>
        <td>Gestão de orçamento</td>
        <td>Intermediário</td>
        <td>Básico/Intermediário</td>
        <td>${escapeHtml(session.gestaoOrcamento)}</td>
      </tr>
    </tbody>
  </table>

  <p><strong>Gaps identificados:</strong></p>
  <p>${escapeHtml(session.pontosDesenvolvimento)}</p>

  <h2>6. AVALIAÇÃO DE COMPETÊNCIAS COMPORTAMENTAIS / LIDERANÇA</h2>
  <table>
    <thead>
      <tr>
        <th>Competência</th>
        <th>Manifesta?</th>
        <th>Nível</th>
        <th>Comportamentos observados</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Liderança e visão</td>
        <td>Sim</td>
        <td>Médio/Alto</td>
        <td>${escapeHtml(session.evidenciasLideranca || session.estiloLideranca)}</td>
      </tr>
      <tr>
        <td>Comunicação eficaz</td>
        <td>Sim</td>
        <td>Alto</td>
        <td>${escapeHtml(session.comunicacao)}</td>
      </tr>
      <tr>
        <td>Tomada de decisão</td>
        <td>Sim</td>
        <td>Médio</td>
        <td>${escapeHtml(session.tomadaDecisao)}</td>
      </tr>
      <tr>
        <td>Gestão de conflitos</td>
        <td>Sim</td>
        <td>Médio/Alto</td>
        <td>${escapeHtml(session.gestaoConflitos)}</td>
      </tr>
      <tr>
        <td>Desenvolvimento de pessoas</td>
        <td>Sim</td>
        <td>Alto</td>
        <td>${escapeHtml(session.desenvolvimentoPessoas)}</td>
      </tr>
      <tr>
        <td>Foco em resultados</td>
        <td>Sim</td>
        <td>Alto</td>
        <td>${escapeHtml(session.focoResultados)}</td>
      </tr>
      <tr>
        <td>Adaptabilidade</td>
        <td>Sim</td>
        <td>Alto</td>
        <td>${escapeHtml(session.adaptabilidade)}</td>
      </tr>
    </tbody>
  </table>

  <h2>7. AVALIAÇÃO DE ESTILO DE LIDERANÇA</h2>
  <p><strong>Estilo predominante:</strong> ${escapeHtml(session.estiloLideranca)}</p>
  <p><strong>Flexibilidade:</strong> Média/Alta</p>
  <p><strong>Descrição do estilo:</strong> O discurso do candidato indica liderança com foco em execução, organização, acompanhamento de equipe, mediação e construção de rotina com direcionamento compatível ao nível gerencial.</p>

  <h2>8. PERFORMANCE EM FERRAMENTAS DE AVALIAÇÃO</h2>
  <p><strong>Ferramentas aplicadas na coleta:</strong> ${escapeHtml(session.testes)}</p>
  <p><strong>Observação técnica:</strong> A ausência de instrumentos formais adicionais, quando aplicável, deve ser registrada como limitação metodológica da coleta, e não como evidência negativa automática contra o candidato.</p>

  <h2>9. REFERÊNCIAS PROFISSIONAIS</h2>
  <p>${escapeHtml(session.referencias)}</p>

  <h2>10. ADERÊNCIA À CULTURA E EQUIPE</h2>
  <p><strong>Alinhamento com valores:</strong> ${escapeHtml(session.aderenciaCultural)}</p>
  <p><strong>Compatibilidade com equipe:</strong> O conjunto das respostas sugere potencial de integração em ambiente com necessidade de liderança próxima, estruturação, acompanhamento de indicadores e disciplina de execução.</p>
  <p><strong>Visão sobre desafios organizacionais:</strong> ${escapeHtml(session.contextoContratacao)}</p>

  <h2>11. POTENCIAL E PERSPECTIVA DE DESENVOLVIMENTO</h2>
  <p><strong>Potencial para crescimento:</strong> Alto</p>
  <p><strong>Áreas de desenvolvimento prioritárias:</strong></p>
  ${bulletList(session.pontosDesenvolvimento)}
  <p><strong>Plano de desenvolvimento recomendado (primeiros 12 meses):</strong></p>
  <ul>
    <li>Onboarding estruturado com metas, indicadores e escopo decisório.</li>
    <li>Acompanhamento formal aos 30, 60 e 90 dias.</li>
    <li>Desenvolvimento complementar em finanças, dados ou estratégia, conforme lacunas identificadas.</li>
  </ul>

  <h2>12. PONTOS FORTES</h2>
  ${bulletList(session.evidenciasLideranca || session.competenciasComportamentais)}

  <h2>13. PONTOS DE ATENÇÃO / DESAFIOS</h2>
  <table>
    <thead>
      <tr>
        <th>Desafio</th>
        <th>Impacto</th>
        <th>Mitigação sugerida</th>
        <th>Timeline</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${escapeHtml(session.pontosDesenvolvimento)}</td>
        <td>Médio</td>
        <td>Onboarding estruturado, acompanhamento do gestor e plano de desenvolvimento</td>
        <td>90 dias a 6 meses</td>
      </tr>
    </tbody>
  </table>

  <h2>14. RECOMENDAÇÃO FINAL</h2>
  <p><strong>${escapeHtml(recomendacao)}</strong></p>
  <p><strong>Parecer:</strong> Com base nos elementos coletados, o candidato apresenta aderência relevante ao escopo da posição, com sinais consistentes de capacidade de liderança, organização, leitura de contexto e sustentação de rotina gerencial.</p>
  <p><strong>Conclusão técnica:</strong> Os elementos observados ao longo da coleta sustentam a recomendação final acima, preservando a necessidade de acompanhamento estruturado nos primeiros meses, quando aplicável.</p>

  <h2>DICAS PARA O GESTOR DIRETO</h2>
  <p><strong>Integração inicial:</strong> Apresentar rapidamente o contexto da área, indicadores prioritários e principais gargalos operacionais.</p>
  <p><strong>Estilo de gestão recomendado:</strong> Funciona melhor com metas claras, autonomia progressiva e checkpoints bem definidos.</p>
  <p><strong>Como potencializar performance:</strong> Inserir o profissional cedo nas discussões de indicadores, eficiência, rotina e plano de ação da área.</p>
  <p><strong>Acompanhamento crítico:</strong> Dar suporte específico nos pontos de desenvolvimento mapeados na coleta.</p>
  <p><strong>Desenvolvimento nos primeiros 12 meses:</strong> Priorizar formação complementar alinhada aos gaps técnicos, estratégicos ou financeiros identificados.</p>

  <h2>15. ASSINATURA E VALIDAÇÃO</h2>
  <p><strong>Responsável pela Avaliação (RH/Recrutador):</strong> ${escapeHtml(responsavel)}</p>
  <p><strong>Validação (Gestor Direto/Liderança):</strong> ${escapeHtml(validacaoGestor)}</p>
  <p><strong>Aprovação Final (Diretoria/RH):</strong> ${escapeHtml(aprovacaoFinalRh)}</p>
</section>
`.trim();
}

function buildFallbackParecer(session: ParecerSession): string {
  const recomendacao = recommendationLabel(session.recomendacaoFinal);
  const responsavel = safe(session.entrevistadores, "Não informado na coleta");
  const validacaoGestor = safe(session.validacaoGestor, "Não informado na coleta");
  const aprovacaoFinalRh = safe(session.aprovacaoFinalRh, "Não informado na coleta");

  return `
<section>
  <h1>Parecer Técnico de Entrevista</h1>
  <p><strong>EMPRESA:</strong> ${escapeHtml(session.empresa)}</p>
  <p><strong>VAGA:</strong> ${escapeHtml(session.vaga)}</p>
  <p><strong>CANDIDATO(A):</strong> ${escapeHtml(session.candidato)}</p>
  <p><strong>DATA DA ENTREVISTA:</strong> ${escapeHtml(session.dataEntrevista)}</p>
  <p><strong>ENTREVISTADOR(ES):</strong> ${escapeHtml(session.entrevistadores)}</p>

  <h2>Resumo técnico</h2>
  <p>${escapeHtml(session.trajetoria)}</p>

  <h2>Competências técnicas</h2>
  <p>${escapeHtml(session.competenciasTecnicas)}</p>

  <h2>Competências comportamentais</h2>
  <p>${escapeHtml(session.competenciasComportamentais)}</p>

  <h2>Pontos de atenção</h2>
  <p>${escapeHtml(session.pontosDesenvolvimento)}</p>

  <h2>Recomendação final</h2>
  <p><strong>${escapeHtml(recomendacao)}</strong></p>

  <h2>Assinatura e validação</h2>
  <p><strong>Responsável pela Avaliação (RH/Recrutador):</strong> ${escapeHtml(responsavel)}</p>
  <p><strong>Validação (Gestor Direto/Liderança):</strong> ${escapeHtml(validacaoGestor)}</p>
  <p><strong>Aprovação Final (Diretoria/RH):</strong> ${escapeHtml(aprovacaoFinalRh)}</p>
</section>
`.trim();
}

export async function generateParecer(session: ParecerSession): Promise<string> {
  if (session.nivelVaga === "gerencial") {
    return buildGerencialParecer(session);
  }

  return buildFallbackParecer(session);
}

export async function runParecerStep(params: {
  session: ParecerSession;
  answer?: string;
  currentField?: ParecerField;
}): Promise<{
  session: ParecerSession;
  reply: string;
  nextField?: ParecerField;
  done: boolean;
  reportMarkdown?: string | null;
}> {
  let session = params.session;

  if (params.answer && params.currentField) {
    session = applyParecerAnswer(session, params.currentField, params.answer);
  }

  if (!isParecerReady(session)) {
    const next = getNextParecerStep(session);

    if (!next) {
      return {
        session,
        reply: "Não foi possível determinar a próxima pergunta.",
        done: false,
        reportMarkdown: null,
      };
    }

    return {
      session,
      reply: next.question,
      nextField: next.field,
      done: false,
      reportMarkdown: null,
    };
  }

  const parecer = await generateParecer(session);

  return {
    session: {
      ...session,
      status: "completed",
      reportStatus: "generated",
      reportMarkdown: parecer,
    },
    reply: "Parecer técnico concluído com sucesso.",
    done: true,
    reportMarkdown: parecer,
  };
}
