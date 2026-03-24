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

function buildMissionVisionValues(session: FitCulturalSession) {
  const cultura = String(session.culturaAtual ?? "").toLowerCase();
  const valores = String(session.valoresDecisoes ?? "").toLowerCase();
  const recompensas = String(session.comportamentosRecompensados ?? "").toLowerCase();
  const evolucao = String(session.evolucaoDesejada ?? "").toLowerCase();
  const proposito = String(session.proposito ?? "").toLowerCase();
  const sucesso = String(session.sucesso ?? "").toLowerCase();
  const lideranca = String(session.lideranca ?? "").toLowerCase();

  const base = [cultura, valores, recompensas, evolucao, proposito, sucesso, lideranca].join(" ");

  const sugestoes = [];

  if (
    /resultado|performance|meta|entrega|execução|execucao|alta performance|crescimento/.test(base)
  ) {
    sugestoes.push({
      mission:
        "Impulsionar resultados sustentáveis por meio de pessoas comprometidas, processos consistentes e cultura de alta performance.",
      vision:
        "Ser reconhecida como uma organização de referência em performance, coerência cultural e excelência na execução.",
      values:
        "Comprometimento, Foco em resultados, Disciplina, Excelência.",
      explanation:
        "Esta sugestão foi construída porque suas respostas indicam forte valorização de entrega, consistência, responsabilidade e desempenho organizacional."
    });
  }

  if (
    /colaboração|colaboracao|equipe|pessoas|desenvolvimento|aprendizado|escuta|comunicação|comunicacao/.test(base)
  ) {
    sugestoes.push({
      mission:
        "Desenvolver pessoas e fortalecer relações de trabalho por meio de uma cultura colaborativa, ética e orientada ao crescimento.",
      vision:
        "Ser referência em ambiente de trabalho saudável, desenvolvimento humano e colaboração com propósito.",
      values:
        "Colaboração, Comunicação, Desenvolvimento, Respeito.",
      explanation:
        "Esta sugestão foi gerada porque suas respostas destacam interação entre pessoas, desenvolvimento, comunicação e fortalecimento do ambiente interno."
    });
  }

  if (
    /cliente|inovação|inovacao|adapt|mudança|mudanca|agilidade|mercado|diferencial/.test(base)
  ) {
    sugestoes.push({
      mission:
        "Gerar valor com agilidade, inovação e alinhamento cultural, promovendo evolução contínua e foco no cliente.",
      vision:
        "Ser uma empresa admirada pela capacidade de evoluir, se adaptar e manter coerência entre cultura e estratégia.",
      values:
        "Inovação, Agilidade, Adaptabilidade, Foco no cliente.",
      explanation:
        "Esta sugestão foi construída porque suas respostas mostram preocupação com evolução cultural, diferenciação e capacidade de adaptação ao contexto."
    });
  }

  while (sugestoes.length < 3) {
    const fallback = [
      {
        mission:
          "Construir um ambiente organizacional coerente, sustentável e orientado por valores claros.",
        vision:
          "Ser reconhecida por uma cultura forte, consistente e alinhada à sua identidade organizacional.",
        values:
          "Coerência, Responsabilidade, Clareza, Integridade.",
        explanation:
          "Esta sugestão reforça a necessidade de coerência entre discurso, prática e identidade cultural."
      },
      {
        mission:
          "Promover resultados com equilíbrio entre pessoas, cultura e estratégia organizacional.",
        vision:
          "Ser uma empresa que cresce sem perder a essência cultural que sustenta suas decisões.",
        values:
          "Equilíbrio, Confiança, Comprometimento, Sustentabilidade.",
        explanation:
          "Esta sugestão foi incluída para representar uma direção cultural estável e sustentável no longo prazo."
      },
      {
        mission:
          "Fortalecer a cultura organizacional como base para decisões, relacionamentos e crescimento consistente.",
        vision:
          "Ser referência em clareza cultural, alinhamento interno e evolução organizacional.",
        values:
          "Clareza, Alinhamento, Evolução, Ética.",
        explanation:
          "Esta sugestão foi incluída para apoiar empresas que precisam consolidar identidade cultural e direcionamento interno."
      }
    ];

    for (const item of fallback) {
      if (sugestoes.length < 3) {
        sugestoes.push(item);
      }
    }
  }

  return sugestoes.slice(0, 3);
}

export function buildFitCulturalReport(session: FitCulturalSession): string {
  const suggestions = buildMissionVisionValues(session);

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
    Com base nas informações fornecidas, o sistema gerou três direções estratégicas possíveis para estruturar ou evoluir a identidade cultural da empresa.
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
