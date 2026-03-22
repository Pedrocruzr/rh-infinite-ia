import type { MapeamentoSession } from "./flow";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toBullets(text?: string) {
  return String(text ?? "")
    .split(/\n|;|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildMapeamentoCompetenciasReport(
  session: MapeamentoSession
): string {
  const cargo = session.cargo ?? "Não informado";
  const atividades = toBullets(session.atividades);
  const competencias = toBullets(session.competencias);

  return `
<section>
  <h1 style="font-size:32px; font-weight:800; margin:0 0 20px 0;">Mapeamento de Competências</h1>

  <p style="margin:0 0 20px 0;"><strong>Cargo analisado:</strong> ${escapeHtml(cargo)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Explicação dos critérios do relatório</h2>
  <ul style="margin:0 0 24px 22px; padding:0;">
    <li><strong>Incidências por grupo:</strong> quantas vezes um grupo de competência aparece nas atividades e exigências do cargo.</li>
    <li><strong>Grau atribuído a cada grupo:</strong> intensidade ou peso dado ao grupo com base na frequência e importância no contexto do cargo.</li>
    <li><strong>Nível de relevância no mapeamento:</strong> prioridade daquele grupo para o desempenho do cargo, do mais crítico ao mais complementar.</li>
  </ul>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Atividades principais do cargo</h2>
  <ul style="margin:0 0 24px 22px; padding:0;">
    ${atividades.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Competências informadas</h2>
  <ul style="margin:0 0 24px 22px; padding:0;">
    ${competencias.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Leitura inicial do mapeamento</h2>
  <p style="margin:0 0 16px 0;">
    O mapeamento consolida as atividades do cargo e as competências informadas para organizar os grupos mais relevantes.
    A interpretação final deve considerar a frequência com que cada grupo aparece, o grau atribuído a esse grupo e sua relevância prática no desempenho da função.
  </p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Resumo técnico</h2>
  <p style="margin:0;">
    Este relatório serve como base para organização das competências do cargo em grupos, leitura de incidências e definição de prioridade no processo de seleção, desenvolvimento ou estruturação da função.
  </p>
</section>
  `.trim();
}
