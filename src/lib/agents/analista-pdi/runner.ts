import type { PdiSession } from "./flow";

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

function normalizeItem(value: string) {
  return normalizeSentence(value).replace(/[.!?]$/, "");
}

function splitItems(text?: string) {
  return String(text ?? "")
    .split(/\n|;|,/)
    .map((item) => item.replace(/^\d+[\).\-\s]*/, "").trim())
    .filter(Boolean)
    .map(normalizeItem);
}

function unique(items: string[]) {
  return [...new Set(items)];
}

function parsePrazoToMonths(prazo?: string) {
  const text = String(prazo ?? "").toLowerCase();
  const num = Number((text.match(/\d+/) || [0])[0]);

  if (!num) return 6;
  if (/ano/.test(text)) return num * 12;
  if (/m[eê]s/.test(text)) return num;
  return num;
}

function prazoDistribuido(totalMeses: number, indice: number, totalObjetivos: number) {
  if (totalObjetivos <= 1) return `${totalMeses} meses`;
  const passo = Math.max(1, Math.round((totalMeses / totalObjetivos) * (indice + 1)));
  return `${passo} meses`;
}

function objectiveForGap(gap: string, prazo: string) {
  const lower = gap.toLowerCase();

  if (/contabil|financeir/.test(lower)) {
    return {
      meta: "Desenvolver conhecimentos básicos em contabilidade aplicados à rotina de trabalho",
      indicador: "Conclusão de curso + aplicação prática em controles ou análises simples",
      recurso: "Curso online de contabilidade básica, planilhas, apoio do gestor",
    };
  }

  if (/projeto|trello|asana|notion|kanban|scrum/.test(lower)) {
    return {
      meta: "Aprender a utilizar ferramentas de gestão de projetos e aplicá-las em demandas reais",
      indicador: "Gerenciar pelo menos 1 projeto interno ou rotina estruturada",
      recurso: "Trello, Asana, Notion, materiais práticos e acompanhamento do gestor",
    };
  }

  if (/canva|photoshop|edição|edicao|imagem|visual/.test(lower)) {
    return {
      meta: "Adquirir habilidades básicas de edição e produção de materiais visuais",
      indicador: "Criar materiais internos ou apresentações com uso prático da ferramenta",
      recurso: "Canva, tutoriais, curso básico e prática com demandas internas",
    };
  }

  if (/lideran|coordena|gest[aã]o de pessoas|gestão de pessoas|influ[eê]ncia/.test(lower)) {
    return {
      meta: "Desenvolver competências de liderança e coordenação alinhadas ao cargo almejado",
      indicador: "Conduzir pequenas iniciativas, reuniões ou acompanhamentos com apoio da liderança",
      recurso: "Mentoria com gestor, leitura guiada, feedback estruturado e prática supervisionada",
    };
  }

  if (/comunica|apresenta/.test(lower)) {
    return {
      meta: "Aprimorar a comunicação profissional para contextos de alinhamento, apresentação e liderança",
      indicador: "Realizar apresentações ou alinhamentos com maior clareza e consistência",
      recurso: "Treinamentos práticos, feedback do gestor e exercícios de comunicação",
    };
  }

  return {
    meta: `Desenvolver a competência: ${gap}`,
    indicador: `Evidenciar evolução prática na competência "${gap}" dentro do período definido`,
    recurso: "Curso, prática no trabalho, apoio do gestor e acompanhamento periódico",
  };
}

function actionForGap(gap: string) {
  const lower = gap.toLowerCase();

  if (/contabil|financeir/.test(lower)) {
    return {
      acao: "Realizar curso introdutório e praticar controles financeiros ou contábeis simples",
      recursos: "Cursos online, planilhas, acompanhamento do gestor",
    };
  }

  if (/projeto|trello|asana|notion|kanban|scrum/.test(lower)) {
    return {
      acao: "Estudar ferramenta de gestão de projetos e aplicar em uma demanda real",
      recursos: "Trello / Asana / Notion, tutoriais e apoio do gestor",
    };
  }

  if (/canva|photoshop|edição|edicao|imagem|visual/.test(lower)) {
    return {
      acao: "Fazer curso básico e criar materiais internos com uso prático da ferramenta",
      recursos: "Canva / Photoshop básico, vídeos e prática guiada",
    };
  }

  if (/lideran|coordena|gest[aã]o de pessoas|gestão de pessoas/.test(lower)) {
    return {
      acao: "Assumir pequenas frentes de coordenação com feedback estruturado",
      recursos: "Mentoria do gestor, reuniões de alinhamento, feedback contínuo",
    };
  }

  return {
    acao: `Executar ações práticas para desenvolver "${gap}"`,
    recursos: "Curso, prática no trabalho e apoio do gestor",
  };
}

function recommendedResources(gap: string) {
  const lower = gap.toLowerCase();

  if (/contabil|financeir/.test(lower)) {
    return ["Contabilidade básica para não contadores", "Planilhas financeiras", "Mentoria com gestor"];
  }

  if (/projeto|trello|asana|notion|kanban|scrum/.test(lower)) {
    return ["Trello / Asana / Notion", "Curso de gestão de projetos", "Aplicação em projeto interno"];
  }

  if (/canva|photoshop|edição|edicao|imagem|visual/.test(lower)) {
    return ["Canva", "Curso básico de design", "Tutoriais práticos"];
  }

  if (/lideran|coordena|gest[aã]o de pessoas|gestão de pessoas/.test(lower)) {
    return ["Mentoria com gestor", "Conteúdo sobre liderança", "Projetos interdepartamentais"];
  }

  return ["Curso técnico", "Prática guiada", "Feedback contínuo"];
}

export function buildPdiReport(session: PdiSession) {
  const nome = normalizeItem(session.colaboradorNome ?? "Colaborador");
  const cargoAtual = normalizeItem(session.cargoAtual ?? "Não informado");
  const cargoDesejado = normalizeItem(session.cargoDesejado ?? "Não informado");
  const prazo = normalizeItem(session.prazoEstimado ?? "Não informado");
  const totalMeses = parsePrazoToMonths(session.prazoEstimado);

  const fortes = unique(splitItems(session.competenciasFortes));
  const gaps = unique(splitItems(session.competenciasDesenvolver));

  const objectives = gaps.map((gap, idx) => {
    const base = objectiveForGap(gap, prazo);
    return {
      gap,
      meta: base.meta,
      prazo: prazoDistribuido(totalMeses, idx, Math.max(gaps.length, 1)),
      indicador: base.indicador,
      recurso: base.recurso,
    };
  });

  const actionPlan = gaps.map((gap, idx) => {
    const act = actionForGap(gap);
    return {
      acao: act.acao,
      recursos: act.recursos,
      prazo: prazoDistribuido(totalMeses, idx, Math.max(gaps.length, 1)),
      responsavel: `${nome} + gestor`,
    };
  });

  const recursos = unique(gaps.flatMap(recommendedResources));

  const strengthsHtml = fortes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const gapsHtml = gaps.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">PDI – ${escapeHtml(nome)}</h1>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">1. Análise das Competências</h2>
  <p style="margin:0 0 12px 0;">${escapeHtml(nome)} atualmente ocupa o cargo de <strong>${escapeHtml(cargoAtual)}</strong> e demonstra competências relevantes para sua atuação atual.</p>
  <p style="margin:0 0 8px 0;"><strong>Competências fortes identificadas:</strong></p>
  <ul style="margin:0 0 16px 22px; padding:0;">${strengthsHtml}</ul>

  <p style="margin:0 0 8px 0;"><strong>Competências a desenvolver:</strong></p>
  <ul style="margin:0 0 16px 22px; padding:0;">${gapsHtml}</ul>

  <p style="margin:0 0 24px 0;">Comparando o perfil atual com as exigências típicas do cargo de <strong>${escapeHtml(cargoDesejado)}</strong>, há necessidade de evolução técnica e comportamental para ampliar prontidão, autonomia e capacidade de entrega em um novo nível de responsabilidade.</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">2. Objetivos de Desenvolvimento (SMART)</h2>
  ${objectives.map((obj) => `
    <div style="margin:0 0 18px 0;">
      <p style="margin:0 0 6px 0;"><strong>${escapeHtml(obj.meta)}</strong></p>
      <p style="margin:0 0 4px 0;"><strong>Prazo:</strong> ${escapeHtml(obj.prazo)}</p>
      <p style="margin:0 0 0 0;"><strong>Indicador:</strong> ${escapeHtml(obj.indicador)}</p>
    </div>
  `).join("")}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 12px 0;">3. Plano de Ação</h2>
  <table style="width:100%; border-collapse:collapse; margin:0 0 12px 0;">
    <thead>
      <tr>
        <th style="text-align:left; border:1px solid #ddd; padding:8px;">Ação</th>
        <th style="text-align:left; border:1px solid #ddd; padding:8px;">Recursos</th>
        <th style="text-align:left; border:1px solid #ddd; padding:8px;">Prazo</th>
        <th style="text-align:left; border:1px solid #ddd; padding:8px;">Responsável</th>
      </tr>
    </thead>
    <tbody>
      ${actionPlan.map((row) => `
        <tr>
          <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(row.acao)}</td>
          <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(row.recursos)}</td>
          <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(row.prazo)}</td>
          <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(row.responsavel)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <p style="margin:0 0 24px 0;">O plano segue a lógica do modelo 70-20-10, combinando experiência prática, troca com gestor e aprendizado formal.</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">4. Acompanhamento</h2>
  <ul style="margin:0 0 16px 22px; padding:0;">
    <li>Check-ins mensais com gestor</li>
    <li>Avaliação trimestral da evolução</li>
    <li>Uso de indicadores práticos de aplicação no trabalho</li>
    <li>Feedback 360° quando fizer sentido</li>
    <li>Metas acompanhadas por OKRs e feedback contínuo</li>
  </ul>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">5. Recursos Recomendados</h2>
  <ul style="margin:0 0 24px 22px; padding:0;">
    ${recursos.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Conclusão</h2>
  <p style="margin:0 0 0 0;">${escapeHtml(nome)} já possui competências úteis para sustentar seu desenvolvimento. Com evolução consistente nas competências priorizadas e execução do plano dentro do prazo estimado de ${escapeHtml(prazo)}, sua prontidão para o cargo de ${escapeHtml(cargoDesejado)} tende a aumentar de forma concreta e observável.</p>
</section>
`;
}
