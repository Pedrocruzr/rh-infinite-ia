import type { MapeamentoSession } from "./flow";

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
    .replace(/\s+\)/g, ")")
    .replace(/\(\s+/g, "(")
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

function splitActivities(text?: string) {
  return String(text ?? "")
    .split(/\n+/)
    .map((item) => item.replace(/^\d+[\).\-\s]*/, "").trim())
    .filter(Boolean)
    .map(normalizeSentence);
}

function unique(items: string[]) {
  return [...new Set(items)];
}

function detectCompetenciasFromActivity(activity: string, conhecimentos: string[], habilidades: string[], orgs: string[]) {
  const lower = activity.toLowerCase();
  const result: string[] = [];

  if (/atendimento|ligaç|ligac|e-mail|email|visitante|informação|informacao|comunica/.test(lower)) {
    result.push("Clareza", "Comunicação", "Escuta", "Responsabilidade");
  }

  if (/relat|planilha|document|contrato|correspond/.test(lower)) {
    result.push("Análise crítica", "Planejamento", "Clareza", "Organização");
  }

  if (/agenda|reuni|viagem|material|almox|compra|organiza/.test(lower)) {
    result.push("Organização", "Disciplina", "Foco em resultados", "Controle");
  }

  if (/arquivo|controle|cadastro|processo/.test(lower)) {
    result.push("Organização", "Atenção", "Disciplina", "Responsabilidade");
  }

  const baseText = [...conhecimentos, ...habilidades, ...orgs].join(" ").toLowerCase();

  if (/excel|planilha|office|word|document/.test(baseText)) {
    result.push("Organização", "Atenção");
  }

  if (/comunicação|comunicacao|redação|redacao|atendimento/.test(baseText)) {
    result.push("Clareza", "Comunicação");
  }

  if (/controle|financeiro|gestão|gestao|rotinas/.test(baseText)) {
    result.push("Responsabilidade", "Planejamento", "Foco em resultados");
  }

  if (result.length === 0) {
    result.push("Organização", "Responsabilidade", "Planejamento");
  }

  return unique(result);
}

function splitCompetenciasPorAtividade(text?: string) {
  const raw = String(text ?? "").trim().toLowerCase();
  if (!raw || raw === "ok" || raw === "sim" || raw === "validado" || raw === "pode seguir") {
    return [];
  }

  return String(text ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const labelMatch = line.match(/^atividade\s*(\d+)\s*:\s*(.*)$/i);
      const atividadeIndex = labelMatch ? Number(labelMatch[1]) : index + 1;
      const content = labelMatch ? labelMatch[2] : line;

      const competencias = content
        .split(/,|;/)
        .map((item) => normalizeItem(item))
        .filter(Boolean);

      return {
        atividadeIndex,
        competencias,
      };
    });
}

function buildCompetenciasPorAtividade(
  atividades: string[],
  conhecimentos: string[],
  habilidades: string[],
  orgs: string[],
  raw?: string
) {
  const manual = splitCompetenciasPorAtividade(raw);
  if (manual.length > 0) return manual;

  return atividades.map((atividade, index) => ({
    atividadeIndex: index + 1,
    competencias: detectCompetenciasFromActivity(atividade, conhecimentos, habilidades, orgs),
  }));
}

function detectGroup(competencia: string, conhecimentos: string[], habilidades: string[], orgs: string[]) {
  const lower = competencia.toLowerCase();
  const baseText = [...conhecimentos, ...habilidades, ...orgs].join(" ").toLowerCase();

  if (
    /agilidade|atenção|atencao|responsabilidade|disciplina|foco|planejamento|execução|execucao|produtividade|eficiência|eficiencia|controle/.test(lower)
  ) {
    return "Eficiência";
  }

  if (
    /comunicação|comunicacao|clareza|escuta|negociação|negociacao|relacionamento|interação|interacao/.test(lower)
  ) {
    return "Comunicação";
  }

  if (
    /análise|analise|crítica|critica|organização|organizacao|método|metodo|padronização|padronizacao/.test(lower)
  ) {
    return "Organização";
  }

  if (/comunicação|comunicacao|redação|redacao|atendimento/.test(baseText)) {
    return "Comunicação";
  }

  if (/excel|planilha|controle|rotinas|processo|gestão|gestao/.test(baseText)) {
    return "Eficiência";
  }

  return "Organização";
}

function splitGroupDistribution(text?: string) {
  const raw = String(text ?? "").trim().toLowerCase();
  if (!raw || raw === "ok" || raw === "sim" || raw === "validado" || raw === "pode seguir") {
    return [];
  }

  return String(text ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(":");
      const grupo = normalizeItem(parts[0] ?? "");
      const competencias = (parts.slice(1).join(":") || "")
        .split(/,|;/)
        .map((item) => normalizeItem(item))
        .filter(Boolean);

      return {
        grupo,
        competencias,
      };
    })
    .filter((item) => item.grupo && item.competencias.length > 0);
}

function buildGroupDistribution(
  competenciasPorAtividade: Array<{ atividadeIndex: number; competencias: string[] }>,
  conhecimentos: string[],
  habilidades: string[],
  orgs: string[],
  raw?: string
) {
  const manual = splitGroupDistribution(raw);
  if (manual.length > 0) return manual;

  const grouped: Record<string, string[]> = {};

  for (const entry of competenciasPorAtividade) {
    for (const competencia of entry.competencias) {
      const group = detectGroup(competencia, conhecimentos, habilidades, orgs);
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(competencia);
    }
  }

  return Object.entries(grouped).map(([grupo, competencias]) => ({
    grupo,
    competencias: unique(competencias),
  }));
}

function countIncidence(
  groupDistribution: Array<{ grupo: string; competencias: string[] }>,
  competenciasPorAtividade: Array<{ atividadeIndex: number; competencias: string[] }>
) {
  return groupDistribution
    .map((group) => {
      let incidencia = 0;

      for (const atividade of competenciasPorAtividade) {
        const hasMatch = atividade.competencias.some((comp) =>
          group.competencias.includes(comp)
        );
        if (hasMatch) incidencia += 1;
      }

      return {
        grupo: group.grupo,
        incidencia,
      };
    })
    .sort((a, b) => b.incidencia - a.incidencia);
}

function computeGrade(incidencia: number) {
  if (incidencia >= 9) return "Grau 5";
  if (incidencia >= 7) return "Grau 4";
  if (incidencia >= 5) return "Grau 3";
  if (incidencia >= 3) return "Grau 2";
  return "Grau 1";
}

export function buildMapeamentoCompetenciasReport(
  session: MapeamentoSession
): string {
  const cargo = normalizeSentence(session.cargo ?? "Não informado");
  const atividades = splitActivities(session.atividades);
  const conhecimentos = splitList(session.conhecimentos);
  const habilidades = splitList(session.habilidades);
  const competenciasOrganizacionais = splitList(session.competenciasOrganizacionais);

  const competenciasPorAtividade = buildCompetenciasPorAtividade(
    atividades,
    conhecimentos,
    habilidades,
    competenciasOrganizacionais,
    session.competenciasPorAtividade
  );

  const groupDistribution = buildGroupDistribution(
    competenciasPorAtividade,
    conhecimentos,
    habilidades,
    competenciasOrganizacionais,
    session.gruposSimilaridade
  );

  const gruposConsolidados = groupDistribution.map((item) => item.grupo);

  const incidencias = countIncidence(groupDistribution, competenciasPorAtividade).map(
    (item) => ({
      ...item,
      grau: computeGrade(item.incidencia),
    })
  );

  const grupoPrincipal = incidencias[0]?.grupo ?? "Não informado";

  const resumo = `O cargo de ${cargo} exige um perfil predominantemente alinhado ao grupo ${grupoPrincipal}, indicando maior necessidade de comportamentos coerentes com esse eixo no desempenho da função. Os demais grupos aparecem como complementares e ajudam a sustentar a organização, a qualidade da execução e a comunicação no cargo.`;

  return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">RELATÓRIO DE MAPEAMENTO DE COMPETÊNCIAS COMPORTAMENTAIS</h1>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">1. Identificação do Cargo</h2>
  <p style="margin:0 0 24px 0;"><strong>Cargo:</strong> ${escapeHtml(cargo)}</p>

  <hr style="margin:0 0 24px 0; border:none; border-top:1px solid #ddd;" />

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">2. Atividades do Cargo (Sinalizadores)</h2>
  <ol style="margin:0 0 24px 22px; padding:0;">
    ${atividades.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ol>

  <hr style="margin:0 0 24px 0; border:none; border-top:1px solid #ddd;" />

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">3. Competências Técnicas</h2>
  <p style="margin:0 0 16px 0;">Nesta etapa são registradas as competências técnicas exigidas pelo cargo, separando o que o profissional precisa saber e o que ele precisa saber fazer para executar a função com consistência.</p>

  <h3 style="font-size:18px; font-weight:700; margin:0 0 10px 0;">3.1 Conhecimentos (Saber)</h3>
  <ul style="margin:0 0 20px 22px; padding:0;">
    ${conhecimentos.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <h3 style="font-size:18px; font-weight:700; margin:0 0 10px 0;">3.2 Habilidades (Saber fazer)</h3>
  <ul style="margin:0 0 24px 22px; padding:0;">
    ${habilidades.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <hr style="margin:0 0 24px 0; border:none; border-top:1px solid #ddd;" />

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">4. Competências Comportamentais (Atitudes)</h2>
  <p style="margin:0 0 16px 0;">Aqui o relatório mostra quais competências comportamentais são necessárias para cada atividade do cargo, conectando comportamento esperado à execução prática da função.</p>

  ${competenciasPorAtividade
    .map(
      (entry) => `
      <div style="margin:0 0 22px 0;">
        <p style="margin:0 0 8px 0;"><strong>Atividade ${entry.atividadeIndex}:</strong> ${escapeHtml(atividades[entry.atividadeIndex - 1] ?? `Atividade ${entry.atividadeIndex}`)}</p>
        <ul style="margin:0 0 0 22px; padding:0;">
          ${entry.competencias.map((comp) => `<li>${escapeHtml(comp)}</li>`).join("")}
        </ul>
      </div>
    `
    )
    .join("")}

  <hr style="margin:0 0 24px 0; border:none; border-top:1px solid #ddd;" />

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">5. Grupos de Competências Comportamentais</h2>
  <p style="margin:0 0 16px 0;">Nesta fase, competências com significados próximos são reunidas em grupos consolidados. Isso facilita a leitura estratégica e reduz duplicidades semânticas no mapeamento.</p>

  <h3 style="font-size:18px; font-weight:700; margin:0 0 10px 0;">Grupos consolidados</h3>
  <ul style="margin:0 0 20px 22px; padding:0;">
    ${gruposConsolidados.map((grupo) => `<li>${escapeHtml(grupo)}</li>`).join("")}
  </ul>

  <h3 style="font-size:18px; font-weight:700; margin:0 0 10px 0;">Distribuição</h3>
  ${groupDistribution
    .map(
      (group) => `
      <div style="margin:0 0 22px 0;">
        <p style="margin:0 0 8px 0;"><strong>${escapeHtml(group.grupo)}</strong></p>
        <ul style="margin:0 0 0 22px; padding:0;">
          ${group.competencias.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    `
    )
    .join("")}

  <hr style="margin:0 0 24px 0; border:none; border-top:1px solid #ddd;" />

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">6. Incidência e Grau das Competências</h2>
  <p style="margin:0 0 16px 0;">A incidência mostra em quantas atividades cada grupo aparece. O grau traduz essa frequência em prioridade, ajudando a identificar o peso relativo de cada grupo no mapeamento.</p>
  <table style="width:100%; border-collapse:collapse; margin:0 0 24px 0;">
    <thead>
      <tr>
        <th style="text-align:left; border:1px solid #ddd; padding:8px;">Grupo</th>
        <th style="text-align:left; border:1px solid #ddd; padding:8px;">Incidência</th>
        <th style="text-align:left; border:1px solid #ddd; padding:8px;">Grau</th>
      </tr>
    </thead>
    <tbody>
      ${incidencias
        .map(
          (item) => `
          <tr>
            <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(item.grupo)}</td>
            <td style="border:1px solid #ddd; padding:8px;">${item.incidencia}</td>
            <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(item.grau)}</td>
          </tr>
        `
        )
        .join("")}
    </tbody>
  </table>

  <hr style="margin:0 0 24px 0; border:none; border-top:1px solid #ddd;" />

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">7. Competências Organizacionais</h2>
  <p style="margin:0 0 16px 0;">As competências organizacionais representam o que a empresa espera de todos os colaboradores, independentemente do cargo, considerando cultura, postura e forma de atuação esperada.</p>
  <ul style="margin:0 0 24px 22px; padding:0;">
    ${competenciasOrganizacionais.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <hr style="margin:0 0 24px 0; border:none; border-top:1px solid #ddd;" />

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">8. Resumo Executivo do Perfil do Cargo</h2>
  <p style="margin:0 0 16px 0;">O resumo executivo sintetiza o perfil técnico, comportamental e organizacional esperado para a função, destacando os elementos mais críticos para seleção, avaliação e desenvolvimento.</p>
  <p style="margin:0 0 16px 0;">${escapeHtml(resumo)}</p>
  <p style="margin:0;">Além disso, o cargo exige alinhamento com as competências organizacionais da empresa, favorecendo atuação consistente, comprometida e coerente com a cultura esperada.</p>

  <hr style="margin:0 0 24px 0; border:none; border-top:1px solid #ddd;" />

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">9. Aplicações do Modelo no RH</h2>
  <p style="margin:0 0 16px 0;">Este mapeamento pode ser utilizado para:</p>
  <ul style="margin:0 0 0 22px; padding:0;">
    <li>Recrutamento e seleção</li>
    <li>Avaliação de desempenho</li>
    <li>Plano de desenvolvimento individual (PDI)</li>
    <li>Treinamentos e capacitação</li>
    <li>Estruturação de cargos e salários</li>
  </ul>
</section>
  `.trim();
}
