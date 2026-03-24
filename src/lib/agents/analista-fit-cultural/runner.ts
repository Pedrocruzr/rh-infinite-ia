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

  return `
<section>
  <h1 style="font-size:32px; font-weight:800; margin:0 0 20px 0;">Análise de Fit Cultural</h1>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">1. Objetivo da análise</h2>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.objetivo ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">2. Cultura atual da organização</h2>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.culturaAtual ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">3. Valores que guiam as decisões</h2>
  <p style="margin:0 0 12px 0;">Os valores compartilhados representam os princípios que orientam decisões, prioridades e escolhas no dia a dia da empresa.</p>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.valoresDecisoes ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">4. Discrepâncias entre cultura declarada e praticada</h2>
  <p style="margin:0 0 12px 0;">Esta etapa identifica diferenças entre o discurso institucional e os comportamentos realmente vividos na prática.</p>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.discrepancia ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">5. Comportamentos recompensados</h2>
  <p style="margin:0 0 12px 0;">Os comportamentos recompensados mostram quais atitudes a organização reforça, valoriza e tende a perpetuar culturalmente.</p>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.comportamentosRecompensados ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">6. Evolução cultural desejada</h2>
  <p style="margin:0 0 12px 0;">Aqui se registra como a cultura deve amadurecer para sustentar estratégia, crescimento e coerência organizacional.</p>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.evolucaoDesejada ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">7. Diferenciais culturais da empresa</h2>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.diferenciaisCulturais ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">8. Propósito organizacional</h2>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.proposito ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">9. Definição de sucesso além do resultado financeiro</h2>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.sucesso ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">10. Comportamentos inaceitáveis</h2>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.comportamentosInaceitaveis ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">11. Papel da liderança na cultura</h2>
  <p style="margin:0 0 20px 0;">${escapeHtml(normalizeSentence(session.lideranca ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:20px 0 12px 0;">12. Sugestões de Missão, Visão e Valores</h2>
  <p style="margin:0 0 16px 0;">
    Com base no padrão das respostas fornecidas, o sistema gerou três direções estratégicas possíveis para estruturar ou evoluir a identidade cultural da empresa.
  </p>

  ${suggestions.map((s, i) => `
    <div style="margin:0 0 20px 0; padding:16px; border:1px solid #e5e7eb; border-radius:8px;">
      <p style="margin:0 0 10px 0;"><strong>Opção ${i + 1}</strong></p>

      <p style="margin:0 0 8px 0;"><strong>Missão:</strong></p>
      <p style="margin:0 0 12px 0;">${escapeHtml(s.mission)}</p>

      <p style="margin:0 0 8px 0;"><strong>Visão:</strong></p>
      <p style="margin:0 0 12px 0;">${escapeHtml(s.vision)}</p>

      <p style="margin:0 0 8px 0;"><strong>Valores:</strong></p>
      <p style="margin:0 0 12px 0;">${escapeHtml(s.values)}</p>

      <p style="margin:0 0 8px 0;"><strong>Por que essa sugestão:</strong></p>
      <p style="margin:0;">${escapeHtml(s.explanation)}</p>
    </div>
  `).join("")}

  <h2 style="font-size:22px; font-weight:700; margin:20px 0 12px 0;">Resumo executivo</h2>
  <p style="margin:0;">
    A análise de fit cultural considera o alinhamento entre valores, crenças e comportamentos da organização, buscando compatibilidade com seus valores centrais e não homogeneidade. A leitura deve considerar artefatos, valores compartilhados e pressupostos básicos da cultura, além dos impactos esperados em engajamento, clima e retenção.
  </p>
</section>
  `.trim();
}
