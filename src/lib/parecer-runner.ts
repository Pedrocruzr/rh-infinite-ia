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
  const dateStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  return `
<style>
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
  .parecer-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .parecer-table th, .parecer-table td {
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    text-align: left;
    font-size: 13px;
  }
  .parecer-table th {
    background-color: #f8fafc !important;
    color: #0f172a;
    font-weight: 700;
  }
</style>

<section style="background:#ffffff; border-radius:16px; padding:32px; color:#334155; margin-bottom:24px; font-family: system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">

  <!-- CAPA / CABEÇALHO DO RELATÓRIO -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; border-radius: 14px; padding: 32px 24px; color: #ffffff !important; text-align: center; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(15,23,42,0.15); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; margin: 0 0 8px; font-weight:600; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Relatório Técnico — Avaliação de Entrevista</p>
    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #ffffff !important; letter-spacing: -0.5px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Parecer Técnico de Entrevista</h1>
    <p style="font-size: 14px; color: #cbd5e1 !important; margin: 0 0 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Avaliação de Perfil & Competências • Gerado em ${dateStr}</p>
    <div style="display: inline-block; background: #0284c7 !important; color: #ffffff !important; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      ${escapeHtml(recomendacao)}
    </div>
  </div>

  <!-- METADADOS -->
  <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:28px; display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Empresa</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.empresa)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Vaga</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.vaga)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Candidato(a)</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.candidato)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Data da Entrevista</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.dataEntrevista)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Entrevistador(es)</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.entrevistadores)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Recomendação Final</span><strong style="color:#0284c7; font-size:14px;">${escapeHtml(recomendacao)}</strong></div>
  </div>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">1. RESUMO EXECUTIVO</h2>
  <p style="margin:0 0 10px 0; color:#334155; line-height:1.6;"><strong>Candidato:</strong> ${escapeHtml(session.candidato)} | <strong>Experiência:</strong> ${escapeHtml(session.experienciaTotalENivel)}</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Síntese da recomendação:</strong> Candidato com trajetória aderente ao contexto da vaga, apresentando evidências observáveis em gestão, comunicação, acompanhamento de rotina, estruturação de processos e interface com indicadores. A análise final aponta coerência entre histórico, repertório apresentado e exigências típicas de uma posição gerencial.</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">2. DADOS PESSOAIS E CONTEXTO</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Local de residência e disponibilidade:</strong> ${escapeHtml(session.residenciaDisponibilidade)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Mobilidade geográfica:</strong> ${escapeHtml(session.mobilidadeGeografica)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Contexto da contratação:</strong> ${escapeHtml(session.contextoContratacao)}</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Motivação para a vaga:</strong> ${escapeHtml(session.motivacao)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">3. FORMAÇÃO ACADÊMICA E DESENVOLVIMENTO</h2>
  <p style="margin:0 0 12px 0; color:#334155; line-height:1.6;"><strong>Educação formal:</strong> ${escapeHtml(session.formacao)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Certificações e desenvolvimento complementar:</strong></p>
  <div style="margin:0 0 16px 0;">${bulletList(session.certificacoes)}</div>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Idiomas:</strong> ${escapeHtml(session.idiomas)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">4. TRAJETÓRIA PROFISSIONAL</h2>
  <table class="parecer-table">
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

  <p style="margin:16px 0 8px 0; color:#334155; line-height:1.6;"><strong>Análise da progressão:</strong></p>
  <ul style="margin:0 0 24px 20px; padding:0; color:#334155; line-height:1.6;">
    <li>${escapeHtml(session.progressaoCarreira)}</li>
    <li>${escapeHtml(session.movimentacoes)}</li>
    <li>A trajetória apresentada indica elementos suficientes para análise técnica, ainda que parte do histórico detalhado não tenha sido formalmente estruturado na coleta.</li>
  </ul>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">5. AVALIAÇÃO DE COMPETÊNCIAS TÉCNICAS PARA LIDERANÇA</h2>
  <table class="parecer-table">
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

  <p style="margin:16px 0 8px 0; color:#334155; line-height:1.6;"><strong>Gaps identificados:</strong></p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;">${escapeHtml(session.pontosDesenvolvimento)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">6. AVALIAÇÃO DE COMPETÊNCIAS COMPORTAMENTAIS / LIDERANÇA</h2>
  <table class="parecer-table">
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

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">7. AVALIAÇÃO DE ESTILO DE LIDERANÇA</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Estilo predominante:</strong> ${escapeHtml(session.estiloLideranca)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Flexibilidade:</strong> Média/Alta</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Descrição do estilo:</strong> O discurso do candidato indica liderança com foco em execução, organização, acompanhamento de equipe, mediação e construção de rotina com direcionamento compatível ao nível gerencial.</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">8. PERFORMANCE EM FERRAMENTAS DE AVALIAÇÃO</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Ferramentas aplicadas na coleta:</strong> ${escapeHtml(session.testes)}</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Observação técnica:</strong> A ausência de instrumentos formais adicionais, quando aplicável, deve ser registrada como limitação metodológica da coleta, e não como evidência negativa automática contra o candidato.</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">9. REFERÊNCIAS PROFISSIONAIS</h2>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;">${escapeHtml(session.referencias)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">10. ADERÊNCIA À CULTURA E EQUIPE</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Alinhamento com valores:</strong> ${escapeHtml(session.aderenciaCultural)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Compatibilidade com equipe:</strong> O conjunto das respostas sugere potencial de integração em ambiente com necessidade de liderança próxima, estruturação, acompanhamento de indicadores e disciplina de execução.</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Visão sobre desafios organizacionais:</strong> ${escapeHtml(session.contextoContratacao)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">11. POTENCIAL E PERSPECTIVA DE DESENVOLVIMENTO</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Potencial para crescimento:</strong> Alto</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Áreas de desenvolvimento prioritárias:</strong></p>
  <div style="margin:0 0 16px 0;">${bulletList(session.pontosDesenvolvimento)}</div>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Plano de desenvolvimento recomendado (primeiros 12 meses):</strong></p>
  <ul style="margin:0 0 24px 20px; padding:0; color:#334155; line-height:1.6;">
    <li>Onboarding estruturado com metas, indicadores e escopo decisório.</li>
    <li>Acompanhamento formal aos 30, 60 e 90 dias.</li>
    <li>Desenvolvimento complementar em finanças, dados ou estratégia, conforme lacunas identificadas.</li>
  </ul>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">12. PONTOS FORTES</h2>
  <div style="margin:0 0 24px 0;">${bulletList(session.evidenciasLideranca || session.competenciasComportamentais)}</div>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">13. PONTOS DE ATENÇÃO / DESAFIOS</h2>
  <table class="parecer-table">
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

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">14. RECOMENDAÇÃO FINAL</h2>
  <p style="margin:0 0 8px 0; color:#0284c7; font-size:16px; font-weight:700;">${escapeHtml(recomendacao)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Parecer:</strong> Com base nos elementos coletados, o candidato apresenta aderência relevante ao escopo da posição, com sinais consistentes de capacidade de liderança, organização, leitura de contexto e sustentação de rotina gerencial.</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Conclusão técnica:</strong> Os elementos observados ao longo da coleta sustentam a recomendação final acima, preservando a necessidade de acompanhamento estruturado nos primeiros meses, quando aplicável.</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">DICAS PARA O GESTOR DIRETO</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Integração inicial:</strong> Apresentar rapidamente o contexto da área, indicadores prioritários e principais gargalos operacionais.</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Estilo de gestão recomendado:</strong> Funciona melhor com metas claras, autonomia progressiva e checkpoints bem definidos.</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Como potencializar performance:</strong> Inserir o profissional cedo nas discussões de indicadores, eficiência, rotina e plano de ação da área.</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Acompanhamento crítico:</strong> Dar suporte específico nos pontos de desenvolvimento mapeados na coleta.</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Desenvolvimento nos primeiros 12 meses:</strong> Priorizar formação complementar alinhada aos gaps técnicos, estratégicos ou financeiros identificados.</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:36px; margin-bottom:24px;">Assinatura e Validação</h2>
  <div style="margin-top:24px; color:#334155; font-size:14px; line-height:2.2;">
    <p style="margin:0 0 24px 0;"><strong>Responsável pela Avaliação (RH/Recrutador):</strong> ${escapeHtml(responsavel)}</p>

    <p style="margin:0 0 24px 0;"><strong>Validação (Gestor Direto/Liderança):</strong> ${escapeHtml(validacaoGestor)}</p>

    <p style="margin:0 0 0 0;"><strong>Aprovação Final (Diretoria/RH):</strong> ${escapeHtml(aprovacaoFinalRh)}</p>
  </div>
</section>
`.trim();
}

function buildFallbackParecer(session: ParecerSession): string {
  const recomendacao = recommendationLabel(session.recomendacaoFinal);
  const responsavel = safe(session.entrevistadores, "Não informado na coleta");
  const validacaoGestor = safe(session.validacaoGestor, "Não informado na coleta");
  const aprovacaoFinalRh = safe(session.aprovacaoFinalRh, "Não informado na coleta");
  const dateStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  return `
<style>
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
</style>

<section style="background:#ffffff; border-radius:16px; padding:32px; color:#334155; margin-bottom:24px; font-family: system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">

  <!-- CAPA / CABEÇALHO DO RELATÓRIO -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; border-radius: 14px; padding: 32px 24px; color: #ffffff !important; text-align: center; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(15,23,42,0.15); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; margin: 0 0 8px; font-weight:600; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Relatório Técnico — Avaliação de Entrevista</p>
    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #ffffff !important; letter-spacing: -0.5px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Parecer Técnico de Entrevista</h1>
    <p style="font-size: 14px; color: #cbd5e1 !important; margin: 0 0 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Avaliação de Perfil & Competências • Gerado em ${dateStr}</p>
    <div style="display: inline-block; background: #0284c7 !important; color: #ffffff !important; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      ${escapeHtml(recomendacao)}
    </div>
  </div>

  <!-- METADADOS -->
  <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:28px; display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Empresa</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.empresa)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Vaga</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.vaga)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Candidato(a)</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.candidato)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Data da Entrevista</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.dataEntrevista)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Entrevistador(es)</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(session.entrevistadores)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Recomendação Final</span><strong style="color:#0284c7; font-size:14px;">${escapeHtml(recomendacao)}</strong></div>
  </div>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">1. RESUMO EXECUTIVO E DADOS PESSOAIS</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Candidato(a):</strong> ${escapeHtml(session.candidato)} | <strong>Experiência acumulada:</strong> ${escapeHtml(session.experienciaTotalENivel)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Residência e disponibilidade:</strong> ${escapeHtml(session.residenciaDisponibilidade)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Contexto da contratação:</strong> ${escapeHtml(session.contextoContratacao)}</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Motivação apresentada:</strong> ${escapeHtml(session.motivacao)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">2. FORMAÇÃO ACADÊMICA E DESENVOLVIMENTO</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Formação acadêmica principal:</strong> ${escapeHtml(session.formacao)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Certificações e cursos complementares:</strong></p>
  <div style="margin:0 0 12px 0;">${bulletList(session.certificacoes)}</div>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Idiomas:</strong> ${escapeHtml(session.idiomas)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">3. TRAJETÓRIA PROFISSIONAL E CONHECIMENTO TÉCNICO</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Resumo da trajetória:</strong> ${escapeHtml(session.trajetoria)}</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Conhecimento do setor e função:</strong> ${escapeHtml(session.conhecimentoNegocioSetor)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">4. AVALIAÇÃO DE COMPETÊNCIAS TÉCNICAS E COMPORTAMENTAIS</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Competências técnicas:</strong> ${escapeHtml(session.competenciasTecnicas)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Competências comportamentais:</strong> ${escapeHtml(session.competenciasComportamentais)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Comunicação observada:</strong> ${escapeHtml(session.comunicacao)}</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Foco em resultados e produtividade:</strong> ${escapeHtml(session.focoResultados)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">5. ADERÊNCIA CULTURAL, TESTES E REFERÊNCIAS</h2>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Ferramentas / testes de avaliação:</strong> ${escapeHtml(session.testes)}</p>
  <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Referências profissionais:</strong> ${escapeHtml(session.referencias)}</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Aderência cultural e ao contexto:</strong> ${escapeHtml(session.aderenciaCultural)}</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">6. PONTOS DE DESENVOLVIMENTO E RECOMENDAÇÃO FINAL</h2>
  <p style="margin:0 0 12px 0; color:#334155; line-height:1.6;"><strong>Pontos de atenção / desenvolvimento:</strong> ${escapeHtml(session.pontosDesenvolvimento)}</p>
  <p style="margin:0 0 8px 0; color:#0284c7; font-size:16px; font-weight:700;">Recomendação: ${escapeHtml(recomendacao)}</p>
  <p style="margin:0 0 24px 0; color:#334155; line-height:1.6;"><strong>Parecer técnico:</strong> O candidato apresentou respostas coerentes com as exigências da função, indicando repertório adequado para o nível avaliado e aderência aos requisitos da vaga.</p>

  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:36px; margin-bottom:24px;">Assinatura e Validação</h2>
  <div style="margin-top:24px; color:#334155; font-size:14px; line-height:2.2;">
    <p style="margin:0 0 24px 0;"><strong>Responsável pela Avaliação (RH/Recrutador):</strong> ${escapeHtml(responsavel)}</p>

    <p style="margin:0 0 24px 0;"><strong>Validação (Gestor Direto/Liderança):</strong> ${escapeHtml(validacaoGestor)}</p>

    <p style="margin:0 0 0 0;"><strong>Aprovação Final (Diretoria/RH):</strong> ${escapeHtml(aprovacaoFinalRh)}</p>
  </div>
</section>
`.trim();
}

export function generateParecer(session: ParecerSession): string {
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
