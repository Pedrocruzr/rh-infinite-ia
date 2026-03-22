export type ReportSection = {
  titulo: string;
  descricao?: string;
  itens?: string[];
  passos?: string[];
  nota?: string;
};

export type MasterReportInput = {
  tituloAgente: string;
  subtitulo?: string;
  contexto?: string;
  resumoExecutivo?: string;
  classificacaoFinal?: string;
  nivelRisco?: string;
  recomendacaoFinal?: string;
  secoes?: ReportSection[];
  observacoesGerais?: string;
};

export function buildMasterAgentReport(data: MasterReportInput): string {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderList = (items?: string[]) => {
    if (!items || items.length === 0) return "";
    return `
      <ul style="margin:0 0 16px 22px; padding:0;">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  };

  const renderSteps = (steps?: string[]) => {
    if (!steps || steps.length === 0) return "";
    return `
      <ol style="margin:0 0 16px 22px; padding:0;">
        ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
    `;
  };

  const renderSections = (sections?: ReportSection[]) => {
    if (!sections || sections.length === 0) return "";

    return sections
      .map((secao, index) => {
        return `
<section style="margin-top:32px;">
  <h2 style="font-size:24px; font-weight:700; margin:0 0 16px 0;">
    ${index + 1}. ${escapeHtml(secao.titulo)}
  </h2>

  ${
    secao.descricao
      ? `<p style="margin:0 0 16px 0;">${escapeHtml(secao.descricao)}</p>`
      : ""
  }

  ${
    secao.itens && secao.itens.length > 0
      ? `
  <h3 style="font-size:18px; font-weight:700; margin:20px 0 10px 0;">Pontos principais</h3>
  ${renderList(secao.itens)}
  `
      : ""
  }

  ${
    secao.passos && secao.passos.length > 0
      ? `
  <h3 style="font-size:18px; font-weight:700; margin:20px 0 10px 0;">Passo a passo</h3>
  ${renderSteps(secao.passos)}
  `
      : ""
  }

  ${
    secao.nota
      ? `
  <h3 style="font-size:18px; font-weight:700; margin:20px 0 10px 0;">Nota técnica</h3>
  <p style="margin:0;">${escapeHtml(secao.nota)}</p>
  `
      : ""
  }
</section>
        `.trim();
      })
      .join("");
  };

  return `
<section>
  <h1 style="font-size:32px; font-weight:800; margin:0 0 20px 0;">
    ${escapeHtml(data.tituloAgente)}
  </h1>

  ${
    data.subtitulo
      ? `<p style="margin:0 0 20px 0;"><strong>${escapeHtml(data.subtitulo)}</strong></p>`
      : ""
  }

  ${
    data.contexto
      ? `
  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Contexto</h2>
  <p style="margin:0 0 20px 0;">${escapeHtml(data.contexto)}</p>
  `
      : ""
  }

  ${
    data.resumoExecutivo
      ? `
  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Resumo executivo</h2>
  <p style="margin:0 0 20px 0;">${escapeHtml(data.resumoExecutivo)}</p>
  `
      : ""
  }

  ${
    data.classificacaoFinal || data.nivelRisco || data.recomendacaoFinal
      ? `
  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Síntese final</h2>
  <div style="margin:0 0 24px 0;">
    ${
      data.classificacaoFinal
        ? `<p style="margin:0 0 8px 0;"><strong>Classificação final:</strong> ${escapeHtml(data.classificacaoFinal)}</p>`
        : ""
    }
    ${
      data.nivelRisco
        ? `<p style="margin:0 0 8px 0;"><strong>Nível de risco:</strong> ${escapeHtml(data.nivelRisco)}</p>`
        : ""
    }
    ${
      data.recomendacaoFinal
        ? `<p style="margin:0;"><strong>Recomendação final:</strong> ${escapeHtml(data.recomendacaoFinal)}</p>`
        : ""
    }
  </div>
  `
      : ""
  }

  ${renderSections(data.secoes)}

  ${
    data.observacoesGerais
      ? `
  <section style="margin-top:32px;">
    <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Observações gerais</h2>
    <p style="margin:0;">${escapeHtml(data.observacoesGerais)}</p>
  </section>
  `
      : ""
  }
</section>
  `.trim();
}
