import type { FitCulturalSession } from "./flow";

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeSentence(value: string) {
  let text = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!/[.!?]$/.test(text)) text += ".";
  return text;
}

function collectContext(session: FitCulturalSession) {
  const parts = [
    session.objetivo,
    session.culturaAtual,
    session.valoresDecisoes,
    session.discrepancia,
    session.comportamentosRecompensados,
    session.evolucaoDesejada,
    session.diferenciaisCulturais,
    session.proposito,
    session.sucesso,
    session.comportamentosInaceitaveis,
    session.lideranca,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return parts;
}

function containsAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

function inferSignals(session: FitCulturalSession) {
  const base = collectContext(session);

  return {
    performance: containsAny(base, [
      "resultado",
      "resultados",
      "meta",
      "metas",
      "performance",
      "entrega",
      "entregas",
      "execução",
      "execucao",
      "alta performance",
      "produtividade",
      "eficiência",
      "eficiencia",
      "disciplina",
    ]),
    collaboration: containsAny(base, [
      "colaboração",
      "colaboracao",
      "equipe",
      "times",
      "pessoas",
      "cooperação",
      "cooperacao",
      "escuta",
      "parceria",
      "relacionamento",
      "comunicação",
      "comunicacao",
    ]),
    development: containsAny(base, [
      "desenvolvimento",
      "crescimento",
      "aprendizado",
      "aprendizagem",
      "evolução",
      "evolucao",
      "capacitação",
      "capacitacao",
      "talentos",
    ]),
    innovation: containsAny(base, [
      "inovação",
      "inovacao",
      "mudança",
      "mudanca",
      "adaptabilidade",
      "agilidade",
      "evoluir",
      "transformação",
      "transformacao",
      "criatividade",
    ]),
    client: containsAny(base, [
      "cliente",
      "clientes",
      "experiência",
      "experiencia",
      "atendimento",
      "valor",
      "mercado",
    ]),
    ethics: containsAny(base, [
      "ética",
      "etica",
      "integridade",
      "respeito",
      "transparência",
      "transparencia",
      "confiança",
      "confianca",
    ]),
    organization: containsAny(base, [
      "organização",
      "organizacao",
      "clareza",
      "padronização",
      "padronizacao",
      "processo",
      "processos",
      "consistência",
      "consistencia",
      "estrutura",
    ]),
    leadership: containsAny(base, [
      "liderança",
      "lideranca",
      "líder",
      "lider",
      "exemplo",
      "referência",
      "referencia",
      "influência",
      "influencia",
    ]),
  };
}

function buildValueSet(signals: ReturnType<typeof inferSignals>) {
  const values: string[] = [];

  if (signals.performance) values.push("Foco em resultados", "Excelência");
  if (signals.collaboration) values.push("Colaboração", "Comunicação");
  if (signals.development) values.push("Desenvolvimento", "Aprendizado contínuo");
  if (signals.innovation) values.push("Inovação", "Adaptabilidade");
  if (signals.client) values.push("Foco no cliente");
  if (signals.ethics) values.push("Ética", "Integridade");
  if (signals.organization) values.push("Clareza", "Consistência");
  if (signals.leadership) values.push("Responsabilidade", "Exemplo");

  if (values.length === 0) {
    values.push("Clareza", "Responsabilidade", "Coerência", "Respeito");
  }

  return [...new Set(values)].slice(0, 5);
}

function buildDynamicSuggestions(session: FitCulturalSession) {
  const signals = inferSignals(session);
  const values = buildValueSet(signals);

  const suggestions = [];

  suggestions.push({
    mission: normalizeSentence(
      [
        "Fortalecer uma cultura",
        signals.collaboration ? "colaborativa" : "coerente",
        signals.performance ? "orientada a resultados" : "orientada a consistência",
        signals.client ? "e centrada na geração de valor para clientes" : "e alinhada à identidade da organização",
        "por meio de pessoas, liderança e práticas que sustentem o crescimento do negócio",
      ].join(" ")
    ),
    vision: normalizeSentence(
      [
        "Ser reconhecida como uma organização",
        signals.performance ? "de alta performance" : "culturalmente consistente",
        signals.organization ? "com clareza, estrutura e coerência nas decisões" : "com forte alinhamento entre discurso e prática",
        signals.client ? "e referência na experiência entregue ao cliente" : "e referência em cultura e alinhamento interno",
      ].join(" ")
    ),
    values: values.join(", "),
    explanation: normalizeSentence(
      [
        "Esta sugestão foi construída com base no padrão predominante das respostas,",
        signals.performance ? "que valorizam entrega, resultado e disciplina," : "que reforçam coerência e estabilidade cultural,",
        signals.collaboration ? "além de destacar colaboração e comunicação," : "",
        signals.organization ? "com necessidade de maior clareza e organização." : "com foco em alinhamento e consistência.",
      ].join(" ")
    ),
  });

  suggestions.push({
    mission: normalizeSentence(
      [
        "Desenvolver um ambiente de trabalho",
        signals.collaboration ? "humano, colaborativo e confiável" : "maduro, ético e sustentável",
        signals.development ? "que estimule aprendizado, evolução e crescimento contínuo" : "que fortaleça vínculos, cultura e responsabilidade coletiva",
        signals.client ? "sem perder o foco no impacto gerado ao cliente" : "",
      ].join(" ")
    ),
    vision: normalizeSentence(
      [
        "Ser uma empresa lembrada por",
        signals.collaboration ? "unir performance e relações saudáveis de trabalho" : "sua solidez cultural e confiança nas relações",
        signals.development ? "com forte desenvolvimento das pessoas" : "com forte coerência entre valores e comportamento",
      ].join(" ")
    ),
    values: [...new Set([
      ...(signals.collaboration ? ["Colaboração", "Respeito", "Comunicação"] : ["Confiança", "Respeito"]),
      ...(signals.development ? ["Desenvolvimento", "Aprendizado contínuo"] : ["Comprometimento"]),
      ...(signals.ethics ? ["Ética"] : ["Responsabilidade"]),
    ])].slice(0, 5).join(", "),
    explanation: normalizeSentence(
      [
        "Esta sugestão enfatiza o lado relacional da cultura,",
        signals.development ? "porque as respostas apontam para evolução, aprendizado e fortalecimento das pessoas," : "porque as respostas reforçam vínculo, respeito e confiança,",
        signals.ethics ? "além de indicar preocupação com ética e integridade." : "mantendo coerência com a cultura desejada.",
      ].join(" ")
    ),
  });

  suggestions.push({
    mission: normalizeSentence(
      [
        "Construir uma organização",
        signals.innovation ? "adaptável, inovadora e preparada para evoluir continuamente" : "consistente, responsável e preparada para crescer com coerência",
        signals.performance ? "sem perder disciplina na execução" : "sem perder a identidade cultural",
        signals.client ? "e foco no valor percebido pelo cliente" : "",
      ].join(" ")
    ),
    vision: normalizeSentence(
      [
        "Ser referência em",
        signals.innovation ? "evolução cultural, capacidade de adaptação e alinhamento estratégico" : "cultura forte, clareza de propósito e alinhamento organizacional",
        signals.leadership ? "com liderança que inspira pelo exemplo" : "",
      ].join(" ")
    ),
    values: [...new Set([
      ...(signals.innovation ? ["Inovação", "Adaptabilidade"] : ["Coerência", "Clareza"]),
      ...(signals.leadership ? ["Exemplo", "Responsabilidade"] : ["Comprometimento"]),
      ...(signals.client ? ["Foco no cliente"] : ["Consistência"]),
    ])].slice(0, 5).join(", "),
    explanation: normalizeSentence(
      [
        "Esta sugestão foi criada para traduzir respostas que apontam",
        signals.innovation ? "necessidade de evolução, adaptação e movimento cultural," : "necessidade de consolidação e fortalecimento da identidade cultural,",
        signals.leadership ? "com papel importante da liderança como referência prática." : "mantendo a coerência entre propósito e execução.",
      ].join(" ")
    ),
  });

  return suggestions;
}

export function buildFitCulturalReport(session: FitCulturalSession): string {
  const suggestions = buildDynamicSuggestions(session);
  const signals = inferSignals(session);
  const dateStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const scorePerformance = signals.performance ? 90 : 70;
  const scoreCollaboration = signals.collaboration ? 92 : 75;
  const scoreDevelopment = signals.development ? 88 : 65;
  const scoreInnovation = signals.innovation ? 85 : 60;
  const scoreOrganization = signals.organization ? 86 : 70;

  return `
<style>
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
  .bar-container {
    background: #e2e8f0;
    border-radius: 8px;
    height: 10px;
    overflow: hidden;
    margin-top: 6px;
  }
  .bar-fill {
    height: 100%;
    border-radius: 8px;
    background: linear-gradient(90deg, #0284c7 0%, #06b6d4 100%) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
</style>

<section style="background:#ffffff; border-radius:16px; padding:32px; color:#334155; margin-bottom:24px; font-family: system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">

  <!-- CAPA / CABEÇALHO DO RELATÓRIO -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; border-radius: 14px; padding: 32px 24px; color: #ffffff !important; text-align: center; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(15,23,42,0.15); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; margin: 0 0 8px; font-weight:600; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Diagnóstico & Identidade Organizacional</p>
    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #ffffff !important; letter-spacing: -0.5px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Relatório de Fit Cultural</h1>
    <p style="font-size: 14px; color: #cbd5e1 !important; margin: 0 0 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Análise Estratégica de Valores & Comportamentos • Gerado em ${dateStr}</p>
    <div style="display: inline-block; background: #0284c7 !important; color: #ffffff !important; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      Objetivo: ${escapeHtml(normalizeSentence(session.objetivo ?? "Mapeamento Cultural"))}
    </div>
  </div>

  <!-- INDICADORES / PILARES CULTURAIS MAPEADOS -->
  <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:28px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin:0 0 16px 0; text-transform:uppercase; letter-spacing:0.5px;">Pilares Culturais Observados (Intensidade das Evidências)</h3>
    
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
      <div>
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:#334155;">
          <span>Colaboração & Pessoas</span>
          <span>${scoreCollaboration}%</span>
        </div>
        <div class="bar-container"><div class="bar-fill" style="width:${scoreCollaboration}%;"></div></div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:#334155;">
          <span>Performance & Entregas</span>
          <span>${scorePerformance}%</span>
        </div>
        <div class="bar-container"><div class="bar-fill" style="width:${scorePerformance}%;"></div></div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:#334155;">
          <span>Desenvolvimento & Aprendizado</span>
          <span>${scoreDevelopment}%</span>
        </div>
        <div class="bar-container"><div class="bar-fill" style="width:${scoreDevelopment}%;"></div></div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:#334155;">
          <span>Inovação & Adaptabilidade</span>
          <span>${scoreInnovation}%</span>
        </div>
        <div class="bar-container"><div class="bar-fill" style="width:${scoreInnovation}%;"></div></div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:#334155;">
          <span>Clareza & Estrutura</span>
          <span>${scoreOrganization}%</span>
        </div>
        <div class="bar-container"><div class="bar-fill" style="width:${scoreOrganization}%;"></div></div>
      </div>
    </div>
  </div>

  <!-- SEÇÃO 1: DIAGNÓSTICO COMPARATIVO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">1. DIAGNÓSTICO E EVOLUÇÃO DA CULTURA</h2>
  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-top:16px; margin-bottom:24px;">
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
      <h3 style="font-size:14px; color:#0f172a; margin:0 0 10px 0; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Cultura Atual Mapeada</h3>
      <p style="margin:0; color:#334155; line-height:1.6; font-size:14px;">${escapeHtml(normalizeSentence(session.culturaAtual ?? "Não informado"))}</p>
    </div>
    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:20px;">
      <h3 style="font-size:14px; color:#0284c7; margin:0 0 10px 0; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Evolução Desejada (Visão de Futuro)</h3>
      <p style="margin:0; color:#0369a1; line-height:1.6; font-size:14px;">${escapeHtml(normalizeSentence(session.evolucaoDesejada ?? "Não informado"))}</p>
    </div>
  </div>

  <!-- SEÇÃO 2: VALORES E RECOMPENSAS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">2. PRINCÍPIOS GUIA E COMPORTAMENTOS RECOMPENSADOS</h2>
  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:16px; margin-bottom:24px;">
    <p style="margin:0 0 12px 0; color:#334155; line-height:1.6;"><strong>Valores que guiam decisões:</strong> ${escapeHtml(normalizeSentence(session.valoresDecisoes ?? "Não informado"))}</p>
    <p style="margin:0 0 12px 0; color:#334155; line-height:1.6;"><strong>Comportamentos recompensados na prática:</strong> ${escapeHtml(normalizeSentence(session.comportamentosRecompensados ?? "Não informado"))}</p>
    <p style="margin:0; color:#334155; line-height:1.6;"><strong>Discrepâncias identificadas (Discurso vs. Prática):</strong> ${escapeHtml(normalizeSentence(session.discrepancia ?? "Não informado"))}</p>
  </div>

  <!-- SEÇÃO 3: PROPÓSITO, SUCESSO E LIMITES INEGOCIÁVEIS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">3. PROPÓSITO, CONCEITO DE SUCESSO E LIMITES CULTURAIS</h2>
  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-top:16px; margin-bottom:24px;">
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
      <h4 style="font-size:12px; color:#64748b; font-weight:700; text-transform:uppercase; margin:0 0 8px 0;">Propósito Fundamental</h4>
      <p style="margin:0; color:#0f172a; font-weight:600; font-size:14px; line-height:1.5;">${escapeHtml(normalizeSentence(session.proposito ?? "Não informado"))}</p>
    </div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
      <h4 style="font-size:12px; color:#64748b; font-weight:700; text-transform:uppercase; margin:0 0 8px 0;">Sucesso além dos Números</h4>
      <p style="margin:0; color:#0f172a; font-weight:600; font-size:14px; line-height:1.5;">${escapeHtml(normalizeSentence(session.sucesso ?? "Não informado"))}</p>
    </div>
    <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:12px; padding:18px;">
      <h4 style="font-size:12px; color:#991b1b; font-weight:700; text-transform:uppercase; margin:0 0 8px 0;">Comportamentos Inaceitáveis</h4>
      <p style="margin:0; color:#7f1d1d; font-weight:600; font-size:14px; line-height:1.5;">${escapeHtml(normalizeSentence(session.comportamentosInaceitaveis ?? "Não informado"))}</p>
    </div>
  </div>

  <!-- SEÇÃO 4: LIDERANÇA E DIFERENCIAIS CULTURAIS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">4. PAPEL DA LIDERANÇA E DIFERENCIAIS COMPETITIVOS</h2>
  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:16px; margin-bottom:24px;">
    <p style="margin:0 0 12px 0; color:#334155; line-height:1.6;"><strong>Papel da liderança no exemplo diário:</strong> ${escapeHtml(normalizeSentence(session.lideranca ?? "Não informado"))}</p>
    <p style="margin:0; color:#334155; line-height:1.6;"><strong>Diferenciais culturais em relação ao mercado:</strong> ${escapeHtml(normalizeSentence(session.diferenciaisCulturais ?? "Não informado"))}</p>
  </div>

  <!-- SEÇÃO 5: SUGESTÕES ESTRATÉGICAS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">5. DIRETRIZES RECOMENDADAS PARA MISSÃO, VISÃO E VALORES</h2>
  <p style="margin:8px 0 20px 0; color:#64748b; font-size:14px;">Com base nas declarações coletadas, foram estruturadas três propostas estratégicas para consolidar a identidade cultural da empresa:</p>

  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-bottom:28px;">
    ${suggestions.map((s, i) => {
      const themes = [
        { bg: "#f0f9ff", border: "#0284c7", badgeBg: "#0284c7", badgeColor: "#ffffff", title: "Opção 1: Alta Performance & Execução" },
        { bg: "#f0fdf4", border: "#10b981", badgeBg: "#10b981", badgeColor: "#ffffff", title: "Opção 2: Relações Humanas & Aprendizado" },
        { bg: "#fffbeb", border: "#d97706", badgeBg: "#d97706", badgeColor: "#ffffff", title: "Opção 3: Inovação & Agilidade Cultural" }
      ];
      const t = themes[i % 3];
      return `
        <div style="background:${t.bg} !important; border:1.5px solid ${t.border} !important; border-radius:14px; padding:20px; display:flex; flex-direction:column; justify-content:space-between; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
          <div>
            <div style="display:inline-block; background:${t.badgeBg} !important; color:${t.badgeColor} !important; padding:4px 12px; border-radius:12px; font-size:11px; font-weight:700; text-transform:uppercase; margin-bottom:12px;">
              ${t.title}
            </div>
            
            <p style="margin:0 0 4px 0; font-size:11px; text-transform:uppercase; font-weight:700; color:#64748b;">Missão Sugerida</p>
            <p style="margin:0 0 12px 0; font-size:13px; font-weight:600; color:#0f172a; line-height:1.5;">${escapeHtml(s.mission)}</p>

            <p style="margin:0 0 4px 0; font-size:11px; text-transform:uppercase; font-weight:700; color:#64748b;">Visão Sugerida</p>
            <p style="margin:0 0 12px 0; font-size:13px; font-weight:600; color:#0f172a; line-height:1.5;">${escapeHtml(s.vision)}</p>

            <p style="margin:0 0 4px 0; font-size:11px; text-transform:uppercase; font-weight:700; color:#64748b;">Valores-Chave</p>
            <p style="margin:0 0 12px 0; font-size:13px; font-weight:700; color:${t.border}; line-height:1.5;">${escapeHtml(s.values)}</p>
          </div>
          <div style="border-top:1px solid rgba(0,0,0,0.08); padding-top:10px; margin-top:8px;">
            <p style="margin:0; font-size:12px; color:#475569; line-height:1.4;"><strong>Racional:</strong> ${escapeHtml(s.explanation)}</p>
          </div>
        </div>
      `;
    }).join("")}
  </div>

  <!-- SÍNTESE FINAL -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">6. SÍNTESE DA ANÁLISE CULTURAL</h2>
  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:16px;">
    <p style="margin:0; color:#334155; line-height:1.6; font-size:14px;">
      O mapeamento de fit cultural evidencia uma organização consciente da importância de alinhar discurso e prática. A transição da cultura atual para a visão de futuro exige reforçar rituais de liderança pelo exemplo, comunicação clara de expectativas e mensuração contínua de indicadores de clima, engajamento e bem-estar, garantindo sustentabilidade ao longo do crescimento da equipe.
    </p>
  </div>
</section>
  `.trim();
}
