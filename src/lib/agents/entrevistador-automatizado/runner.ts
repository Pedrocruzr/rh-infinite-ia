import type { EntrevistadorAutomatizadoSession } from "./flow";

type CompetencyPack = {
  canonical: string;
  idealLevel: number;
  description: string;
  questions: string[];
  whatToLookFor: string;
};

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safe(value: string | undefined, fallback = "Não informado"): string {
  const text = value?.trim();
  return escapeHtml(text && text.length > 0 ? text : fallback);
}

function normalize(value: string): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function splitCompetencies(raw: string): string[] {
  return String(raw ?? "")
    .split(/[,\n;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const COMPETENCY_LIBRARY: CompetencyPack[] = [
  {
    canonical: "Comunicação",
    idealLevel: 4,
    description: "Clareza verbal, objetividade, escuta e capacidade de adaptação da mensagem ao público.",
    questions: [
      "Me conte sobre uma situação em que você precisou explicar algo complexo para um cliente de forma simples.",
      "Relate um momento em que sua comunicação evitou um problema maior no atendimento.",
      "Descreva um feedback que recebeu sobre sua comunicação com clientes.",
    ],
    whatToLookFor:
      "Clareza, adaptação da linguagem, precisão, postura e evidências concretas de entendimento gerado.",
  },
  {
    canonical: "Proatividade",
    idealLevel: 4,
    description: "Capacidade de antecipar problemas, agir sem depender de cobrança e propor melhorias.",
    questions: [
      "Conte sobre uma situação em que você antecipou um problema na recepção e evitou impacto.",
      "Dê um exemplo de algo que você melhorou por iniciativa própria.",
      "Relate uma situação em que você fez além do esperado no atendimento.",
    ],
    whatToLookFor:
      "Antecipação, senso de dono, iniciativa prática e resultado gerado sem depender de ordem direta.",
  },
  {
    canonical: "Flexibilidade",
    idealLevel: 4,
    description: "Adaptação a mudanças, múltiplas demandas e contextos variados sem perda de qualidade.",
    questions: [
      "Descreva uma mudança inesperada na rotina e como você reagiu.",
      "Conte sobre um dia em que teve que lidar com múltiplas demandas ao mesmo tempo.",
      "Relate uma situação em que teve que se adaptar a diferentes perfis de clientes.",
    ],
    whatToLookFor:
      "Adaptação rápida, priorização, estabilidade emocional e manutenção da qualidade sob mudança.",
  },
  {
    canonical: "Inteligência Emocional",
    idealLevel: 4,
    description: "Autocontrole, maturidade relacional e manejo de tensão em situações difíceis.",
    questions: [
      "Conte sobre um atendimento difícil com cliente estressado e como você lidou.",
      "Relate uma situação em que precisou controlar suas emoções no trabalho.",
      "Dê um exemplo de como você ajudou a acalmar um cliente ou colega.",
    ],
    whatToLookFor:
      "Autocontrole, empatia, regulação emocional, postura profissional e capacidade de desescalar conflitos.",
  },
  {
    canonical: "Cultura Orientada a Resultados",
    idealLevel: 4,
    description: "Foco em meta, produtividade, padrão de entrega e percepção de impacto do trabalho.",
    questions: [
      "Como você mede se fez um bom atendimento?",
      "Conte sobre um resultado positivo que você gerou no atendimento ao cliente.",
      "Relate uma situação em que você melhorou indicadores de tempo, satisfação ou organização.",
    ],
    whatToLookFor:
      "Mentalidade de resultado, uso de indicadores, responsabilidade por performance e melhoria contínua.",
  },
  {
    canonical: "Empatia",
    idealLevel: 4,
    description: "Capacidade de compreender o outro e ajustar a atuação com sensibilidade e firmeza.",
    questions: [
      "Conte uma situação em que sua compreensão do cliente foi decisiva para resolver um problema.",
      "Descreva a reação de uma pessoa que foi atendida por você em um momento difícil.",
      "Relate um caso em que um cliente muito estressado conseguiu se acalmar com seu atendimento.",
    ],
    whatToLookFor:
      "Leitura emocional, escuta ativa, acolhimento com objetividade e impacto positivo na relação.",
  },
  {
    canonical: "Organização",
    idealLevel: 4,
    description: "Capacidade de estruturar prioridades, controlar fluxo e manter ordem operacional.",
    questions: [
      "Relate um dia de intensa sobrecarga e como você fez para realizar todas as suas atividades.",
      "Descreva uma situação em que a organização evitou retrabalho ou atraso no atendimento.",
      "Conte como você mantém controle sobre demandas simultâneas no dia a dia.",
    ],
    whatToLookFor:
      "Método, disciplina, priorização, controle de fluxo e consistência operacional.",
  },
];

function competencyAliases(value: string): string {
  const item = normalize(value);

  if (item.includes("comunic")) return "Comunicação";
  if (item.includes("proativ") || item.includes("iniciativa")) return "Proatividade";
  if (item.includes("flexib") || item.includes("adapt")) return "Flexibilidade";
  if (item.includes("inteligencia emocional") || item.includes("emocional")) return "Inteligência Emocional";
  if (item.includes("resultado") || item.includes("cultura orientada a resultados")) return "Cultura Orientada a Resultados";
  if (item.includes("empatia")) return "Empatia";
  if (item.includes("organiz")) return "Organização";

  return titleCase(String(value || "").trim());
}

function resolvePack(name: string): CompetencyPack {
  const canonical = competencyAliases(name);
  const found = COMPETENCY_LIBRARY.find((item) => item.canonical === canonical);

  if (found) return found;

  return {
    canonical,
    idealLevel: 4,
    description:
      "Competência informada pelo recrutador e tratada como requisito relevante para a entrevista.",
    questions: [
      `Me conte uma situação real em que você precisou demonstrar ${canonical.toLowerCase()} no trabalho.`,
      `Descreva um caso em que ${canonical.toLowerCase()} foi decisiva para entregar um resultado melhor.`,
      `Que evidências concretas mostram que você tem ${canonical.toLowerCase()} em nível consistente?`,
    ],
    whatToLookFor:
      "Exemplos reais, ações específicas, resultados observáveis, aprendizados e repetibilidade do comportamento.",
  };
}

function buildRoleNotes(role: string): string[] {
  const normalizedRole = normalize(role);

  if (normalizedRole.includes("recep")) {
    return [
      "Ser o rosto e a voz da empresa no primeiro contato com clientes, visitantes e fornecedores.",
      "Recepcionar, direcionar, registrar recados e controlar o fluxo de pessoas com cordialidade e agilidade.",
      "Manter recepção, comunicação e agenda organizadas, preservando boa impressão e fluidez operacional.",
    ];
  }

  return [
    "Executar a função com consistência, alinhamento ao contexto da vaga e boa resposta às exigências da operação.",
    "Demonstrar competências comportamentais e organizacionais compatíveis com o ambiente e as entregas esperadas.",
    "Gerar evidências objetivas que apoiem a comparação entre candidatos de forma técnica e padronizada.",
  ];
}

export function buildEntrevistadorAutomatizadoReport(
  session: EntrevistadorAutomatizadoSession
): string {
  const candidatoNomeRaw = session.candidatoNome?.trim() || "Não informado";
  const vagaAlvoRaw = session.vagaAlvo?.trim() || "Não informado";
  const nivelSenioridadeRaw = session.nivelSenioridade?.trim() || "Não informado";
  const competenciasRaw = session.competenciasDesejadas?.trim() || "Não informado";
  const principaisDesafiosRaw = session.principaisDesafios?.trim() || "Não informado";
  const estiloCulturaRaw = session.estiloCultura?.trim() || "Não informado";

  const dateStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const uniqueCompetencies = Array.from(
    new Map(
      splitCompetencies(competenciasRaw)
        .map(resolvePack)
        .map((item) => [item.canonical, item] as const)
    ).values()
  );

  const roleNotes = buildRoleNotes(vagaAlvoRaw);

  const competencyRows = uniqueCompetencies
    .map((competency) => {
      const questionsHtml = competency.questions
        .map((question, index) => `<div style="margin-bottom:4px;"><strong>${index + 1}.</strong> ${escapeHtml(question)}</div>`)
        .join("");

      return `
<tr style="border-bottom:1px solid #f1f5f9;">
  <td style="padding:12px 10px; font-weight:700; color:#0f172a;">${escapeHtml(competency.canonical)}</td>
  <td style="padding:12px 10px; color:#475569; font-size:13px;">${escapeHtml(competency.description)}</td>
  <td style="padding:12px 10px; font-size:13px;">${questionsHtml}</td>
  <td style="padding:12px 10px; color:#475569; font-size:13px;">${escapeHtml(competency.whatToLookFor)}</td>
  <td style="padding:12px 10px; text-align:center; font-weight:700; color:#0284c7;">${competency.idealLevel}</td>
</tr>`;
    })
    .join("");

  const gapsRows = uniqueCompetencies
    .map(
      (competency) => `
<tr style="border-bottom:1px solid #f1f5f9;">
  <td style="padding:10px; font-weight:600; color:#0f172a;">${escapeHtml(competency.canonical)}</td>
  <td style="padding:10px; text-align:center; font-weight:700; color:#0284c7;">${competency.idealLevel}</td>
  <td style="padding:10px; text-align:center; color:#94a3b8; font-style:italic;">Preencher após entrevista</td>
  <td style="padding:10px; text-align:center; font-weight:600;">Nota obtida – ${competency.idealLevel}</td>
  <td style="padding:10px; font-size:12px; color:#64748b;">Até -1: aceitável | Menor que -1: atenção | Positivo: potencial acima do esperado</td>
</tr>`
    )
    .join("");

  const strengthsList = uniqueCompetencies.length
    ? uniqueCompetencies
        .slice(0, 3)
        .map((item) => `<li>${escapeHtml(item.canonical)}</li>`)
        .join("")
    : "<li>Preencher após entrevista</li>";

  const roleNotesHtml = roleNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

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
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; margin: 0 0 8px; font-weight:600; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Relatório Técnico - Entrevistador Automatizado</p>
    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #ffffff !important; letter-spacing: -0.5px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">${safe(candidatoNomeRaw)}</h1>
    <p style="font-size: 14px; color: #cbd5e1 !important; margin: 0 0 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Vaga Alvo: <strong style="color:#ffffff !important;">${safe(vagaAlvoRaw)}</strong> • Gerado em ${dateStr}</p>
    <div style="display: inline-block; background: #0284c7 !important; color: #ffffff !important; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      Roteiro de Entrevista Estruturado
    </div>
  </div>

  <p style="font-size:11px; color:#94a3b8; border-left:3px solid #0284c7; padding-left:12px; margin: 0 0 28px;">
    Aviso: esta avaliação ficará disponível em <strong>"Relatórios Stackers"</strong> para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.
  </p>

  <!-- IDENTIFICAÇÃO DA SOLICITAÇÃO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">Identificação da solicitação</h2>
  <table style="width:100%; border-collapse:collapse; margin-bottom:28px;">
    <thead>
      <tr style="background:#f8fafc !important; border-bottom:2px solid #e2e8f0; text-align:left; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
        <th style="padding:10px; width:220px;">Campo</th>
        <th style="padding:10px;">Informação</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:600;">Agente</td><td style="padding:10px;">Entrevistador Automatizado</td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:600;">Candidato</td><td style="padding:10px;">${safe(candidatoNomeRaw)}</td></tr>
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:600;">Vaga solicitada</td><td style="padding:10px;">${safe(vagaAlvoRaw)}</td></tr>
      ${session.nivelSenioridade ? `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:600;">Nível de senioridade</td><td style="padding:10px;">${safe(nivelSenioridadeRaw)}</td></tr>` : ""}
      <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:600;">Competências informadas</td><td style="padding:10px;">${safe(competenciasRaw)}</td></tr>
      ${session.principaisDesafios ? `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:600;">Desafios e entregas da vaga</td><td style="padding:10px;">${safe(principaisDesafiosRaw)}</td></tr>` : ""}
      ${session.estiloCultura ? `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:600;">Cultura e ambiente</td><td style="padding:10px;">${safe(estiloCulturaRaw)}</td></tr>` : ""}
      <tr><td style="padding:10px; font-weight:600;">Status do relatório</td><td style="padding:10px; color:#10b981; font-weight:700;">Gerado e pronto para uso em entrevista</td></tr>
    </tbody>
  </table>

  <!-- LEITURA TÉCNICA DA VAGA -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">Leitura técnica da vaga</h2>
  <div style="background:#f8fafc !important; border-left:4px solid #0284c7; padding:18px; border-radius:0 12px 12px 0; margin-bottom:28px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <ul style="margin:0; padding-left:18px; font-size:14px; color:#334155; line-height:1.7;">${roleNotesHtml}</ul>
  </div>

  <!-- ROTEIRO ESTRUTURADO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">Roteiro estruturado para vaga: ${safe(vagaAlvoRaw)}</h2>
  <table style="width:100%; border-collapse:collapse; margin-bottom:28px;">
    <thead>
      <tr style="background:#f8fafc !important; border-bottom:2px solid #e2e8f0; text-align:left; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
        <th style="padding:10px; width:140px;">Competência</th>
        <th style="padding:10px; width:200px;">Objetivo de avaliação</th>
        <th style="padding:10px;">Perguntas por competência</th>
        <th style="padding:10px; width:200px;">Sinais de boa resposta</th>
        <th style="padding:10px; width:90px; text-align:center;">Nível ideal</th>
      </tr>
    </thead>
    <tbody>
      ${competencyRows}
    </tbody>
  </table>

  <!-- SCORECARD E AVALIAÇÃO POR COMPETÊNCIAS -->
  <div style="display:flex; gap:16px; margin-bottom:28px; flex-wrap:wrap;">
    <div style="flex:1; min-width:260px; background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      <h3 style="font-size:15px; margin:0 0 12px; color:#0f172a; font-weight:700;">Scorecard (0-2)</h3>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #e2e8f0; text-align:left;">
            <th style="padding:6px; width:50px; text-align:center;">Nota</th>
            <th style="padding:6px;">Interpretação</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:6px; text-align:center; font-weight:700;">0</td><td style="padding:6px;">Resposta vaga ou ausente.</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:6px; text-align:center; font-weight:700;">1</td><td style="padding:6px;">Resposta genérica sem detalhes.</td></tr>
          <tr><td style="padding:6px; text-align:center; font-weight:700;">2</td><td style="padding:6px;">Evidência concreta e resultado observável.</td></tr>
        </tbody>
      </table>
    </div>

    <div style="flex:1; min-width:260px; background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      <h3 style="font-size:15px; margin:0 0 12px; color:#0f172a; font-weight:700;">Grau de Avaliação (1-5)</h3>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #e2e8f0; text-align:left;">
            <th style="padding:6px; width:50px; text-align:center;">Grau</th>
            <th style="padding:6px;">Significado</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:6px; text-align:center; font-weight:700;">1</td><td style="padding:6px;">Mínimo / Não atende.</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:6px; text-align:center; font-weight:700;">3</td><td style="padding:6px;">Médio / Atende parcialmente.</td></tr>
          <tr><td style="padding:6px; text-align:center; font-weight:700;">5</td><td style="padding:6px;">Excelente / Atende plenamente.</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ANÁLISE DE GAPS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">Análise de Gaps</h2>
  <table style="width:100%; border-collapse:collapse; margin-bottom:28px;">
    <thead>
      <tr style="background:#f8fafc !important; border-bottom:2px solid #e2e8f0; text-align:left; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
        <th style="padding:10px;">Competência</th>
        <th style="padding:10px; width:90px; text-align:center;">Nível ideal</th>
        <th style="padding:10px; width:160px; text-align:center;">Nível obtido</th>
        <th style="padding:10px; width:120px; text-align:center;">Gap</th>
        <th style="padding:10px;">Critério de leitura</th>
      </tr>
    </thead>
    <tbody>
      ${gapsRows}
    </tbody>
  </table>

  <!-- RESUMO EXECUTIVO E DICAS -->
  <div style="display:flex; gap:16px; margin-bottom:28px; flex-wrap:wrap;">
    <div style="flex:1; min-width:260px; background:#f0fdf4 !important; border:1px solid #bbf7d0; border-radius:12px; padding:18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      <h4 style="margin:0 0 10px; color:#166534; font-size:14px; font-weight:700;">Pontos Fortes Mapeados</h4>
      <ul style="margin:0; padding-left:18px; font-size:13px; color:#15803d; line-height:1.6;">
        ${strengthsList}
      </ul>
    </div>

    <div style="flex:1; min-width:260px; background:#fffbeb !important; border:1px solid #fde68a; border-radius:12px; padding:18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      <h4 style="margin:0 0 10px; color:#92400e; font-size:14px; font-weight:700;">Dicas para o Entrevistador</h4>
      <ul style="margin:0; padding-left:18px; font-size:13px; color:#b45309; line-height:1.6;">
        <li>Sempre peça exemplos reais: “me conte uma situação”.</li>
        <li>Busque evidências concretas: números, ações e resultados.</li>
        <li>Aprofunde com: “o que você fez?”, “qual foi o resultado?”.</li>
      </ul>
    </div>
  </div>

  <!-- ENCERRAMENTO TÉCNICO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">Encerramento Técnico</h2>
  <p style="line-height:1.6; color:#475569; margin-bottom:28px;">Este material foi estruturado para apoiar a condução da entrevista e o registro final da avaliação em <strong>"Relatórios Stackers"</strong>.</p>

</section>
  `.trim();
}
