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
  const vagaAlvoRaw = session.vagaAlvo?.trim() || "Não informado";
  const competenciasRaw = session.competenciasDesejadas?.trim() || "Não informado";

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
        .map((question, index) => `${index + 1}. ${escapeHtml(question)}`)
        .join("<br />");

      return `
<tr>
  <td><strong>${escapeHtml(competency.canonical)}</strong></td>
  <td>${escapeHtml(competency.description)}</td>
  <td>${questionsHtml}</td>
  <td>${escapeHtml(competency.whatToLookFor)}</td>
  <td style="text-align:center;">${competency.idealLevel}</td>
</tr>`;
    })
    .join("");

  const gapsRows = uniqueCompetencies
    .map(
      (competency) => `
<tr>
  <td><strong>${escapeHtml(competency.canonical)}</strong></td>
  <td style="text-align:center;">${competency.idealLevel}</td>
  <td style="text-align:center;">Preencher após entrevista</td>
  <td style="text-align:center;">Nota obtida – ${competency.idealLevel}</td>
  <td>Até -1: aceitável | Menor que -1: atenção | Positivo: potencial acima do esperado</td>
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
<h1>Relatório Técnico - Entrevistador Automatizado</h1>

<p><strong>Aviso:</strong> esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.</p>

<h2>Identificação da solicitação</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr><td><strong>Agente</strong></td><td>Entrevistador Automatizado</td></tr>
  <tr><td><strong>Vaga solicitada</strong></td><td>${safe(vagaAlvoRaw)}</td></tr>
  <tr><td><strong>Competências informadas</strong></td><td>${safe(competenciasRaw)}</td></tr>
  <tr><td><strong>Status do relatório</strong></td><td>Gerado e pronto para uso em entrevista</td></tr>
</table>

<h2>Leitura técnica da vaga</h2>
<ul>${roleNotesHtml}</ul>

<h2>Roteiro estruturado para vaga: ${safe(vagaAlvoRaw)}</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr>
    <td><strong>Competência</strong></td>
    <td><strong>Objetivo de avaliação</strong></td>
    <td><strong>Perguntas por competência</strong></td>
    <td><strong>Sinais de boa resposta</strong></td>
    <td><strong>Nível ideal</strong></td>
  </tr>
  ${competencyRows}
</table>

<h2>Scorecard (0-2)</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr><td><strong>Nota</strong></td><td><strong>Interpretação</strong></td></tr>
  <tr><td style="text-align:center;"><strong>0</strong></td><td>Resposta vaga.</td></tr>
  <tr><td style="text-align:center;"><strong>1</strong></td><td>Resposta genérica.</td></tr>
  <tr><td style="text-align:center;"><strong>2</strong></td><td>Resposta com evidência concreta, ações claras e resultado observável.</td></tr>
</table>

<h2>Avaliação por Competências (1-5)</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr><td><strong>Grau</strong></td><td><strong>Significado</strong></td></tr>
  <tr><td style="text-align:center;"><strong>1</strong></td><td>Mínimo</td></tr>
  <tr><td style="text-align:center;"><strong>3</strong></td><td>Médio</td></tr>
  <tr><td style="text-align:center;"><strong>5</strong></td><td>Excelente</td></tr>
</table>

<h2>Análise de Gaps</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr>
    <td><strong>Competência</strong></td>
    <td><strong>Nível ideal</strong></td>
    <td><strong>Nível obtido</strong></td>
    <td><strong>Gap</strong></td>
    <td><strong>Leitura</strong></td>
  </tr>
  ${gapsRows}
</table>

<h2>Resumo Executivo</h2>
<p>Candidato com nível geral [X], com destaque em [competências fortes].</p>

<h2>Pontos Fortes</h2>
<ul>${strengthsList}</ul>

<h2>Gaps Identificados</h2>
<p>Exemplo: Proatividade abaixo do esperado.</p>

<h2>Recomendação</h2>
<p>Aprovar / Aprovar com ressalvas / Não aprovar</p>

<h2>Dicas para o entrevistador</h2>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
  <tr><td>Sempre peça exemplos reais: “me conte uma situação”.</td></tr>
  <tr><td>Busque evidências concretas: números, ações e resultados.</td></tr>
  <tr><td>Aprofunde com: “o que você fez?”, “qual foi o resultado?”.</td></tr>
</table>

<h2>Encerramento técnico</h2>
<p>Este material foi estruturado para apoiar a condução da entrevista e o registro final da avaliação em Avaliações recebidas.</p>

<h2>Assinatura e validação</h2>
<p><strong>Responsável pela Avaliação (RH/Recrutador):</strong> ${safe(session.responsavelAvaliacao, "Não definido")}</p>
<p><strong>Validação (Gestor Direto/Liderança):</strong> ${safe(session.validacaoGestor, "Não definido")}</p>
<p><strong>Aprovação Final (Diretoria/RH):</strong> ${safe(session.aprovacaoFinalRh, "Não definido")}</p>
`.trim();
}
