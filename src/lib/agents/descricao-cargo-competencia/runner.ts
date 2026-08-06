import type { DescricaoCargoSession, ResponsibilityItem } from "./flow";

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeSentence(value: string): string {
  let text = String(value ?? "").trim();

  text = text
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+:/g, ":")
    .replace(/\s+;/g, ";")
    .trim();

  if (!text) return "";
  text = text.charAt(0).toUpperCase() + text.slice(1);

  if (!/[.!?]$/.test(text)) {
    text += ".";
  }

  return text;
}

function normalizeItem(value: string): string {
  return normalizeSentence(value).replace(/[.!?]$/, "");
}

function splitList(text?: string) {
  return String(text ?? "")
    .split(/\n|;|,/)
    .map((item) => item.replace(/^\d+[\).\-\s]*/, "").trim())
    .filter(Boolean)
    .map(normalizeItem);
}

function unique(items: string[]) {
  return [...new Set(items)];
}

function renderList(items: string[]) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function gradeDescription(level: number) {
  const map: Record<number, string> = {
    1: "Básico: conhecimento introdutório ou exposição limitada",
    2: "Intermediário: aplicação com apoio ou em situações limitadas",
    3: "Avançado: aplicação autônoma em situações recorrentes",
    4: "Especialista: domínio completo, orienta outros",
    5: "Referência: estabelece padrão, inova e é referência interna"
  };

  return map[level] ?? map[3];
}

function organizationalConcept(name: string) {
  const lower = name.toLowerCase();

  if (/compromet/.test(lower)) {
    return "Demonstrar responsabilidade, constância e entrega confiável diante dos compromissos assumidos.";
  }
  if (/resultado/.test(lower)) {
    return "Direcionar esforços para entregar atividades com efetividade, produtividade e impacto no funcionamento da empresa.";
  }
  if (/disciplina/.test(lower)) {
    return "Atuar com método, respeito a processos, organização e aderência a padrões definidos.";
  }
  if (/excel/.test(lower)) {
    return "Buscar qualidade elevada, precisão e melhoria contínua na execução das atividades.";
  }
  if (/organiza/.test(lower)) {
    return "Manter ordem, método e consistência no trabalho, assegurando controle e previsibilidade na rotina.";
  }
  if (/ética|etica|integridade/.test(lower)) {
    return "Agir com integridade, responsabilidade e coerência diante das normas, informações e relações profissionais.";
  }

  return "Refletir o padrão cultural esperado pela empresa para sustentar consistência, alinhamento e qualidade na execução do cargo.";
}

function organizationalApplication(name: string, responsibilities: ResponsibilityItem[]) {
  const joined = responsibilities.map((r) => r.atividade).join("; ").toLowerCase();
  const lower = name.toLowerCase();

  if (/compromet/.test(lower)) {
    return "Cumprir prazos, manter regularidade nas rotinas e assumir responsabilidade pela qualidade do trabalho.";
  }
  if (/resultado/.test(lower)) {
    return "Priorizar demandas relevantes, cumprir prazos e sustentar a operação com consistência.";
  }
  if (/disciplina/.test(lower)) {
    return "Seguir procedimentos, manter controles atualizados e executar tarefas com regularidade.";
  }
  if (/excel/.test(lower)) {
    return "Evitar retrabalho, conferir informações e entregar rotinas com alto padrão de confiabilidade.";
  }
  if (/organiza/.test(lower) || /controle|document|planilha|cadastro/.test(joined)) {
    return "Manter controles, registros e informações organizados para garantir fluidez e rastreabilidade.";
  }

  return "Aplicar esse padrão cultural na forma de executar as rotinas, interagir com as pessoas envolvidas e sustentar a qualidade da função.";
}

function technicalDescription(name: string) {
  const lower = name.toLowerCase();

  if (/rotina.*administr|administra/.test(lower)) {
    return "Domínio das atividades de apoio administrativo, controles internos, registros e suporte operacional.";
  }
  if (/document|arquivo|gestão documental|gestao documental/.test(lower)) {
    return "Capacidade de classificar, arquivar, localizar e manter documentos atualizados.";
  }
  if (/office|excel|word|planilha|ferramenta digital|ferramentas digitais|e-mail|email/.test(lower)) {
    return "Utilização funcional de planilhas, editores de texto, e-mail e sistemas digitais de apoio.";
  }
  if (/financeir|contas a pagar|contas a receber|concilia|lançamento|lancamento/.test(lower)) {
    return "Noções práticas de contas a pagar, contas a receber, lançamentos, conferências e controles financeiros básicos.";
  }
  if (/atendimento/.test(lower)) {
    return "Capacidade de registrar, encaminhar e responder demandas administrativas com clareza.";
  }
  if (/relatório|relatorio|controle/.test(lower)) {
    return "Compilar dados, atualizar planilhas e gerar informações de suporte à gestão.";
  }
  if (/suprimento|compras|cotação|cotacao/.test(lower)) {
    return "Acompanhar estoques administrativos, solicitar reposições e apoiar cotações.";
  }

  return "Conhecimento ou habilidade técnica necessária para executar com segurança e consistência as rotinas do cargo.";
}

function technicalImportance(name: string, responsibilities: ResponsibilityItem[]) {
  const lower = name.toLowerCase();
  const joined = responsibilities
    .map((r) => `${r.atividade} ${r.oQue} ${r.como} ${r.paraQue} ${r.quando}`)
    .join(" ")
    .toLowerCase();

  if (/rotina.*administr|administra/.test(lower)) {
    return "É a base do cargo e impacta diretamente a fluidez da operação.";
  }
  if (/document|arquivo|gestão documental|gestao documental/.test(lower)) {
    return "Garante segurança, rastreabilidade e acesso rápido à informação.";
  }
  if (/office|excel|word|planilha|ferramenta digital|ferramentas digitais|e-mail|email/.test(lower)) {
    return "Sustenta controles, comunicações e relatórios do dia a dia.";
  }
  if (/financeir|contas a pagar|contas a receber|concilia|lançamento|lancamento/.test(lower)) {
    return "Apoia a saúde administrativa e a confiabilidade das informações financeiras.";
  }
  if (/atendimento/.test(lower)) {
    return "Melhora a experiência de clientes internos e externos e reduz ruídos operacionais.";
  }
  if (/relatório|relatorio|controle/.test(lower) || /planilha|controle|relatório|relatorio/.test(joined)) {
    return "Apoia decisões e acompanhamento da rotina.";
  }
  if (/suprimento|compras|cotação|cotacao/.test(lower)) {
    return "Evita rupturas em atividades de apoio.";
  }

  return "É importante porque sustenta a execução prática das responsabilidades principais do cargo.";
}

function behavioralDescription(name: string) {
  const lower = name.toLowerCase();

  if (/organiza/.test(lower)) {
    return "Capacidade de manter controle sobre atividades, prioridades e fluxos de trabalho.";
  }
  if (/atenção|atencao|detalhe/.test(lower)) {
    return "Capacidade de atuar com cuidado e precisão, reduzindo erros.";
  }
  if (/comunica|clareza/.test(lower)) {
    return "Capacidade de transmitir informações de forma objetiva, compreensível e adequada.";
  }
  if (/tempo|prioridade|prazo/.test(lower)) {
    return "Capacidade de organizar o tempo conforme prioridades e prazos.";
  }
  if (/responsab|ético|etico|integridade/.test(lower)) {
    return "Atuar com integridade, zelo por informações e seriedade na execução das atividades.";
  }
  if (/proativ/.test(lower)) {
    return "Antecipar necessidades, agir antes que problemas cresçam e apoiar a operação com iniciativa.";
  }
  if (/coopera|colabora/.test(lower)) {
    return "Disponibilidade para apoiar colegas e contribuir para o fluxo de trabalho coletivo.";
  }
  if (/flexib|adapt/.test(lower)) {
    return "Adaptar-se a mudanças de prioridade, volume e tipo de demanda.";
  }
  if (/cortesia|relacionamento|interpessoal/.test(lower)) {
    return "Relacionar-se com respeito, cordialidade e postura profissional.";
  }

  return "Comportamento necessário para sustentar a execução do cargo com qualidade, consistência e aderência ao contexto da função.";
}

function behavioralApplication(name: string, responsibilities: ResponsibilityItem[]) {
  const joined = responsibilities.map((r) => r.atividade).join("; ").toLowerCase();
  const lower = name.toLowerCase();

  if (/organiza/.test(lower)) {
    return "Fundamental para lidar com múltiplas demandas e rotinas simultâneas.";
  }
  if (/atenção|atencao|detalhe/.test(lower)) {
    return "Essencial para lançamentos, conferências, documentos e controles.";
  }
  if (/comunica|clareza/.test(lower)) {
    return "Importante no atendimento, repasse de informações e alinhamentos internos.";
  }
  if (/tempo|prioridade|prazo/.test(lower)) {
    return "Relevante para manter a rotina em dia e responder às prioridades da operação.";
  }
  if (/responsab|ético|etico|integridade/.test(lower)) {
    return "Importante pelo contato com dados, documentos, prazos e controles sensíveis.";
  }
  if (/proativ/.test(lower)) {
    return "Ajuda a prevenir atrasos, falhas e gargalos da rotina.";
  }
  if (/coopera|colabora/.test(lower)) {
    return "O cargo atua como suporte para diferentes áreas e pessoas.";
  }
  if (/flexib|adapt/.test(lower) || /demanda|prioridade/.test(joined)) {
    return "Importante em ambientes dinâmicos e com múltiplas solicitações.";
  }
  if (/cortesia|relacionamento|interpessoal/.test(lower)) {
    return "Relevante no contato com clientes, fornecedores, equipe e liderança.";
  }

  return "Aplicação no cargo: sustenta a forma como a função é executada no dia a dia.";
}

function indicatorsForBehavior(name: string) {
  const lower = name.toLowerCase();

  if (/organiza/.test(lower)) {
    return [
      "Mantém controles atualizados sem necessidade de cobrança constante",
      "Prioriza tarefas conforme urgência e impacto",
      "Localiza documentos e informações com rapidez"
    ];
  }

  if (/atenção|atencao|detalhe/.test(lower)) {
    return [
      "Confere dados antes de enviar ou registrar",
      "Reduz retrabalho por erro de digitação, lançamento ou arquivamento",
      "Identifica inconsistências em documentos e controles"
    ];
  }

  if (/comunica|clareza/.test(lower)) {
    return [
      "Responde com clareza e objetividade",
      "Direciona demandas corretamente",
      "Registra recados e orientações sem ruídos"
    ];
  }

  if (/proativ/.test(lower)) {
    return [
      "Antecipra necessidades de reposição, prazo ou pendência",
      "Sinaliza riscos e problemas antes que se agravem",
      "Propõe melhorias simples de rotina"
    ];
  }

  if (/tempo|prioridade|prazo/.test(lower)) {
    return [
      "Organiza a sequência das entregas conforme prioridade",
      "Mantém prazos sob controle",
      "Evita acúmulo de pendências na rotina"
    ];
  }

  if (/responsab|ético|etico|integridade/.test(lower)) {
    return [
      "Trata informações com sigilo e cuidado",
      "Assume responsabilidade pelos registros e entregas",
      "Demonstra postura confiável diante de documentos e controles"
    ];
  }

  return [
    "Demonstra o comportamento de forma observável na rotina",
    "Mantém consistência nas entregas relacionadas à competência",
    "Aplica a competência em situações recorrentes do cargo"
  ];
}

function buildTechnicalCompetencies(conhecimentos: string[], habilidades: string[]) {
  return unique([...conhecimentos, ...habilidades]).map((item, index) => ({
    nome: item,
    grau: index <= 1 ? 4 : index <= 5 ? 3 : 2
  }));
}

function buildBehavioralCompetencies(items: string[]) {
  return unique(items).map((item, index) => ({
    nome: item,
    grau: index === 0 ? 5 : index <= 5 ? 4 : 3
  }));
}

function buildOrganizationalCompetencies(items: string[]) {
  return unique(items).map((item) => ({
    nome: item,
    grau: 5
  }));
}

function buildObservation(session: DescricaoCargoSession, tecnicas: { nome: string; grau: number }[], comportamentais: { nome: string; grau: number }[]) {
  const nivel = normalizeSentence(session.nivelHierarquico ?? "Não informado");
  const area = normalizeSentence(session.area ?? "Não informada");
  const cargo = normalizeSentence(session.tituloCargo ?? "Cargo não informado").replace(/[.!?]$/, "");
  const topBehaviors = comportamentais
    .filter((item) => item.grau >= 4)
    .slice(0, 4)
    .map((item) => item.nome);

  const topTechnical = tecnicas
    .filter((item) => item.grau >= 3)
    .slice(0, 4)
    .map((item) => item.nome);

  const base = `Este cargo foi estruturado como ${nivel.toLowerCase()}, com foco em execução, controle, apoio e organização das rotinas em ${area.toLowerCase()}.`;

  const technicalDepth = topTechnical.length > 0
    ? `A profundidade técnica exigida é moderada, com destaque para ${topTechnical.join(", ")}.`
    : "A profundidade técnica exigida é moderada, considerando as rotinas operacionais e os controles da função.";

  const behaviorDepth = topBehaviors.length > 0
    ? `Já a exigência comportamental é mais alta em ${topBehaviors.join(", ")}, por serem competências que sustentam regularidade, precisão e confiabilidade na execução do ${cargo}.`
    : `Já a exigência comportamental é mais alta nas competências que sustentam regularidade, precisão e confiabilidade na execução do ${cargo}.`;

  return `${base} ${technicalDepth} ${behaviorDepth}`;
}

export function buildDescricaoCargoCompetenciaReport(
  session: DescricaoCargoSession
): string {
  const dateStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const tituloCargo = normalizeSentence(session.tituloCargo ?? "Não informado").replace(/[.!?]$/, "");
  const area = normalizeSentence(session.area ?? "Não informada").replace(/[.!?]$/, "");
  const nivelHierarquico = normalizeSentence(session.nivelHierarquico ?? "Não informado").replace(/[.!?]$/, "");
  const reportaSeA = normalizeSentence(session.reportaSeA ?? "Não informado").replace(/[.!?]$/, "");
  const interacoesPrincipais = normalizeSentence(session.interacoesPrincipais ?? "Não informadas").replace(/[.!?]$/, "");

  const responsabilidades = session.responsabilidades ?? [];
  const organizacionais = buildOrganizationalCompetencies(splitList(session.competenciasOrganizacionais));
  const conhecimentos = splitList(session.conhecimentosTecnicos);
  const habilidades = splitList(session.habilidadesTecnicas);
  const tecnicas = buildTechnicalCompetencies(conhecimentos, habilidades);
  const comportamentais = buildBehavioralCompetencies(splitList(session.competenciasComportamentais));
  const conhecimentosDesejaveis = splitList(session.conhecimentosDesejaveis);

  const observation = buildObservation(session, tecnicas, comportamentais);
  const observacaoExtra =
    String(session.observacoes ?? "").trim().toLowerCase() === "não" ||
    String(session.observacoes ?? "").trim().toLowerCase() === "nao"
      ? ""
      : normalizeSentence(session.observacoes ?? "");

  const matrixRows = [
    ...organizacionais.map((item) => ({
      competencia: item.nome,
      categoria: "Organizacional",
      grau: item.grau,
      descricao: gradeDescription(item.grau)
    })),
    ...tecnicas.map((item) => ({
      competencia: item.nome,
      categoria: "Técnica",
      grau: item.grau,
      descricao: gradeDescription(item.grau)
    })),
    ...comportamentais.map((item) => ({
      competencia: item.nome,
      categoria: "Comportamental",
      grau: item.grau,
      descricao: gradeDescription(item.grau)
    }))
  ];

  const sinteseCriticas = unique([
    ...organizacionais.filter((item) => item.grau >= 5).slice(0, 4).map((item) => item.nome),
    ...comportamentais.filter((item) => item.grau >= 4).slice(0, 4).map((item) => item.nome)
  ]);

  return `
<style>
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
  .cargo-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
  }
  .cargo-table th, .cargo-table td {
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    text-align: left;
    font-size: 13px;
  }
  .cargo-table th {
    background-color: #f8fafc !important;
    color: #0f172a;
    font-weight: 700;
  }
</style>

<section style="background:#ffffff; border-radius:16px; padding:32px; color:#334155; margin-bottom:24px; font-family: system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">

  <!-- CAPA / CABEÇALHO DO RELATÓRIO -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; border-radius: 14px; padding: 32px 24px; color: #ffffff !important; text-align: center; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(15,23,42,0.15); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; margin: 0 0 8px; font-weight:600; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Engenharia de Cargos & Mapeamento por Competências</p>
    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #ffffff !important; letter-spacing: -0.5px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Descrição de Cargo por Competência</h1>
    <p style="font-size: 14px; color: #cbd5e1 !important; margin: 0 0 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Cargo: ${escapeHtml(tituloCargo)} • Nível: ${escapeHtml(nivelHierarquico)} • Gerado em ${dateStr}</p>
    <div style="display: inline-block; background: #0284c7 !important; color: #ffffff !important; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      Documento Oficial de Engenharia de Cargos
    </div>
  </div>

  <!-- METADADOS E IDENTIFICAÇÃO DO CARGO -->
  <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:28px; display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Título do Cargo</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(tituloCargo)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Área</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(area)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Nível Hierárquico</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(nivelHierarquico)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Reporta-se a</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(reportaSeA)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Interações Principais</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(interacoesPrincipais)}</strong></div>
  </div>

  <!-- SEÇÃO 1: RESPONSABILIDADES PRINCIPAIS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">1. RESPONSABILIDADES PRINCIPAIS (O QUE / COMO / PARA QUE / QUANDO)</h2>
  <p style="margin:8px 0 16px 0; color:#64748b; font-size:14px;">Abaixo, a estruturação metodológica das atribuições do cargo:</p>

  <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:28px;">
    ${responsabilidades
      .map(
        (item, index) => `
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
            <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 12px 0;">1.${index + 1} ${escapeHtml(normalizeSentence(item.atividade).replace(/[.!?]$/, ""))}</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px; font-size:13px; color:#334155;">
              <div><strong>O que:</strong> ${escapeHtml(normalizeSentence(item.oQue ?? "Não informado"))}</div>
              <div><strong>Como:</strong> ${escapeHtml(normalizeSentence(item.como ?? "Não informado"))}</div>
              <div><strong>Para que:</strong> ${escapeHtml(normalizeSentence(item.paraQue ?? "Não informado"))}</div>
              <div><strong>Quando:</strong> ${escapeHtml(normalizeSentence(item.quando ?? "Não informado"))}</div>
            </div>
          </div>
        `
      )
      .join("")}
  </div>

  <!-- SEÇÃO 2: COMPETÊNCIAS ORGANIZACIONAIS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">2. COMPETÊNCIAS ORGANIZACIONAIS (CULTURA DA EMPRESA)</h2>
  <p style="margin:8px 0 16px 0; color:#64748b; font-size:14px;">Competências de grau máximo (5) derivadas da identidade cultural da organização:</p>
  <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:28px;">
    ${organizacionais
      .map(
        (item, index) => `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
            <p style="margin:0 0 6px 0; color:#0f172a; font-weight:700; font-size:14px;">${index + 1}. ${escapeHtml(item.nome)} <span style="background:#0284c7; color:#fff; font-size:11px; padding:2px 8px; border-radius:10px; margin-left:8px;">Grau ${item.grau} — Referência</span></p>
            <p style="margin:0 0 4px 0; color:#334155; font-size:13px;"><strong>Conceito:</strong> ${escapeHtml(organizationalConcept(item.nome))}</p>
            <p style="margin:0; color:#334155; font-size:13px;"><strong>Aplicação no cargo:</strong> ${escapeHtml(organizationalApplication(item.nome, responsabilidades))}</p>
          </div>
        `
      )
      .join("")}
  </div>

  <!-- SEÇÃO 3: COMPETÊNCIAS TÉCNICAS E COMPORTAMENTAIS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">3. COMPETÊNCIAS TÉCNICAS E COMPORTAMENTAIS</h2>
  
  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-top:16px; margin-bottom:28px;">
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
      <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 14px 0; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">Competências Técnicas</h3>
      ${tecnicas
        .map(
          (item) => `
            <div style="margin-bottom:14px;">
              <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#0f172a;">${escapeHtml(item.nome)} <span style="color:#64748b; font-weight:500;">(Grau ${item.grau})</span></p>
              <p style="margin:0; font-size:12px; color:#475569; line-height:1.4;">${escapeHtml(technicalDescription(item.nome))}</p>
            </div>
          `
        )
        .join("")}
    </div>

    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
      <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 14px 0; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">Competências Comportamentais</h3>
      ${comportamentais
        .map(
          (item) => `
            <div style="margin-bottom:14px;">
              <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#0f172a;">${escapeHtml(item.nome)} <span style="color:#64748b; font-weight:500;">(Grau ${item.grau})</span></p>
              <p style="margin:0; font-size:12px; color:#475569; line-height:1.4;">${escapeHtml(behavioralDescription(item.nome))}</p>
            </div>
          `
        )
        .join("")}
    </div>
  </div>

  <!-- SEÇÃO 4: REQUISITOS DO CARGO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">4. REQUISITOS E ESCOLARIDADE</h2>
  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:16px; margin-bottom:28px;">
    <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Escolaridade mínima:</strong> ${escapeHtml(normalizeSentence(session.escolaridadeMinima ?? "Não informado").replace(/[.!?]$/, ""))}</p>
    <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Formação desejável:</strong> ${escapeHtml(normalizeSentence(session.formacaoDesejavel ?? "Não informado").replace(/[.!?]$/, ""))}</p>
    <p style="margin:0 0 8px 0; color:#334155; line-height:1.6;"><strong>Experiência desejável:</strong> ${escapeHtml(normalizeSentence(session.experienciaDesejavel ?? "Não informado").replace(/[.!?]$/, ""))}</p>
    <p style="margin:0 0 6px 0; color:#334155; line-height:1.6;"><strong>Conhecimentos desejáveis:</strong></p>
    <ul style="margin:0 0 0 20px; padding:0; color:#334155; line-height:1.6;">
      ${renderList(conhecimentosDesejaveis)}
    </ul>
  </div>

  <!-- SEÇÃO 5: MATRIZ DE COMPETÊNCIAS COMPLETA -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">5. MATRIZ DE COMPETÊNCIAS DO CARGO</h2>
  <table class="cargo-table">
    <thead>
      <tr>
        <th>Competência</th>
        <th>Categoria</th>
        <th>Grau Esperado (1-5)</th>
        <th>Descrição do Nível</th>
      </tr>
    </thead>
    <tbody>
      ${matrixRows
        .map(
          (row) => `
            <tr>
              <td><strong>${escapeHtml(row.competencia)}</strong></td>
              <td>${escapeHtml(row.categoria)}</td>
              <td><strong>${row.grau}</strong></td>
              <td>${escapeHtml(row.descricao)}</td>
            </tr>
          `
        )
        .join("")}
    </tbody>
  </table>

  <!-- SEÇÃO 6: OBSERVAÇÕES E SÍNTESE DE ENQUADRAMENTO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">6. OBSERVAÇÕES E SÍNTESE DE ENQUADRAMENTO</h2>
  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:16px;">
    <p style="margin:0 0 10px 0; color:#334155; line-height:1.6; font-size:14px;">${escapeHtml(observation)}</p>
    ${
      observacaoExtra
        ? `<p style="margin:0 0 10px 0; color:#334155; line-height:1.6; font-size:14px;">${escapeHtml(observacaoExtra)}</p>`
        : ""
    }
    <p style="margin:0; color:#0f172a; font-weight:700; font-size:14px;">Competências Críticas do Cargo: ${escapeHtml(sinteseCriticas.join(", "))}.</p>
  </div>
</section>
  `.trim();
}
