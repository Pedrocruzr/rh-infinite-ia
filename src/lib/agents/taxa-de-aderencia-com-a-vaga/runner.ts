type Answers = {
  culturalMission?: string;
  culturalVision?: string;
  culturalValues?: string;
  culturalContext?: string;
  targetRole?: string;
  recruiterName?: string;
  validatorName?: string;
  approverName?: string;
  candidateName?: string;
  candidateExperience?: string;
  behavioralTestInput?: string;
};

type RoleProfile = {
  title: string;
  responsibilities: string[];
  technicalSkills: string[];
  behavioralSkills: string[];
};

function safe(value: unknown, fallback = "Não informado"): string {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function splitItems(value: string): string[] {
  return value
    .split(/\n|,|;|•/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function tableRows(items: string[], emptyLabel = "Não informado"): string {
  const normalized = items.length ? items : [emptyLabel];
  return normalized
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item)}</td>
        </tr>
      `,
    )
    .join("");
}

function normalizeRoleInput(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getRoleProfile(targetRole: string): RoleProfile {
  const role = normalizeRoleInput(targetRole);

  if (
    role.includes("auxiliar administrativo") ||
    role.includes("assistente administrativo") ||
    role.includes("administrativo") ||
    role.includes("assist adm") ||
    role.includes("aux adm") ||
    role.includes("adm")
  ) {
    return {
      title: "Auxiliar Administrativo / Assistente Administrativo",
      responsibilities: [
        "Controle de contas a pagar e a receber",
        "Emissão de notas fiscais, boletos e orçamentos",
        "Conciliação bancária",
        "Atendimento a clientes e fornecedores",
        "Organização e gestão de documentos",
        "Apoio à gestão com relatórios simples e rotinas administrativas",
      ],
      technicalSkills: [
        "Pacote Office, especialmente Excel e Word",
        "Noções de rotinas financeiras e administrativas",
        "Organização documental",
        "Desejável familiaridade com ERP",
      ],
      behavioralSkills: [
        "Organização",
        "Proatividade",
        "Atenção aos detalhes",
        "Responsabilidade",
        "Boa comunicação",
      ],
    };
  }

  if (
    role.includes("recepcionista") ||
    role.includes("recepcao") ||
    role.includes("recepção") ||
    role.includes("recepc")
  ) {
    return {
      title: "Recepcionista",
      responsibilities: [
        "Recepcionar clientes, visitantes e fornecedores",
        "Atender e direcionar ligações",
        "Gerenciar entrada e saída de pessoas",
        "Receber e distribuir correspondências",
        "Manter recepção e sala de espera organizadas",
        "Controlar agenda de salas de reunião",
      ],
      technicalSkills: [
        "Conhecimento básico de Pacote Office",
        "Atendimento telefônico",
        "Desejável experiência com PABX",
      ],
      behavioralSkills: [
        "Excelente comunicação verbal",
        "Simpatia",
        "Cordialidade",
        "Postura profissional",
        "Paciência",
      ],
    };
  }

  if (
    role.includes("vendedor") ||
    role.includes("vendas") ||
    role.includes("comercial") ||
    role.includes("atendente comercial") ||
    role.includes("consultor comercial")
  ) {
    return {
      title: "Vendedor / Atendente Comercial",
      responsibilities: [
        "Prospecção de clientes",
        "Atendimento e negociação comercial",
        "Fechamento de vendas",
        "Pós-venda",
        "Gestão de carteira de clientes",
        "Registros e relatórios de vendas",
      ],
      technicalSkills: [
        "Desejável experiência com CRM",
        "Rotina comercial",
        "Técnicas de negociação",
      ],
      behavioralSkills: [
        "Comunicação",
        "Persuasão",
        "Foco em resultados",
        "Resiliência",
        "Empatia",
        "Proatividade",
      ],
    };
  }

  return {
    title: targetRole,
    responsibilities: [
      "Responsabilidades não padronizadas na base atual",
      "Validar entregas, rotina e escopo da função com o recrutador",
      "Confirmar critérios técnicos e comportamentais específicos do cargo",
    ],
    technicalSkills: [
      "Competências técnicas dependem do cargo informado",
      "Validar ferramentas, processos e nível esperado para a função",
    ],
    behavioralSkills: [
      "Organização",
      "Responsabilidade",
      "Comunicação",
      "Capacidade de adaptação",
    ],
  };
}

function evidenceList(candidateExperience: string): string[] {
  return splitItems(candidateExperience).slice(0, 10);
}

function calculateCulturalFit(
  mission: string,
  vision: string,
  values: string,
  context: string,
  experience: string,
  behavior: string,
): number {
  const culture = `${mission} ${vision} ${values} ${context}`.toLowerCase();
  const candidate = `${experience} ${behavior}`.toLowerCase();
  let score = 74;

  const keywords = [
    "organiz",
    "disciplina",
    "respons",
    "foco no cliente",
    "transpar",
    "proativ",
    "melhoria",
    "autonomia",
    "agilidade",
    "compromet",
  ];

  for (const keyword of keywords) {
    if (culture.includes(keyword) && candidate.includes(keyword)) score += 2;
  }

  if (candidate.includes("cs")) score += 2;
  if (candidate.includes("tipo 6")) score += 2;
  if (candidate.includes("organizado")) score += 2;
  if (candidate.includes("responsavel") || candidate.includes("responsável")) score += 2;
  if (candidate.includes("atencao aos detalhes") || candidate.includes("atenção aos detalhes")) score += 2;

  if ((context.toLowerCase().includes("execução rápida") || context.toLowerCase().includes("mudanças constantes")) && (candidate.includes("inseg") || candidate.includes("pressão"))) {
    score -= 4;
  }

  return Math.max(0, Math.min(95, score));
}

function calculateJobFit(roleProfile: RoleProfile, experience: string, behavior: string): number {
  const combined = `${experience} ${behavior}`.toLowerCase();
  let score = 76;

  if (combined.includes("contas a pagar")) score += 3;
  if (combined.includes("contas a receber")) score += 3;
  if (combined.includes("notas fiscais")) score += 3;
  if (combined.includes("boletos")) score += 2;
  if (combined.includes("atendimento")) score += 2;
  if (combined.includes("documentos")) score += 2;
  if (combined.includes("excel")) score += 2;
  if (combined.includes("word")) score += 2;
  if (combined.includes("erp")) score += 2;
  if (combined.includes("crm")) score += 2;
  if (combined.includes("negocia")) score += 2;

  for (const item of roleProfile.behavioralSkills) {
    const token = item.toLowerCase().slice(0, 8);
    if (combined.includes(token)) score += 1;
  }

  if (combined.includes("inseg")) score -= 3;
  if (combined.includes("mudancas muito rapidas") || combined.includes("mudanças muito rápidas")) score -= 2;

  return Math.max(0, Math.min(95, score));
}

function buildFitCulturalStrengths(experience: string, behavior: string): string[] {
  const combined = `${experience} ${behavior}`.toLowerCase();
  const items: string[] = [];

  if (combined.includes("organ")) items.push("Alta tendência à organização e controle");
  if (combined.includes("process")) items.push("Boa aderência a rotinas e processos");
  if (combined.includes("respons")) items.push("Senso de responsabilidade");
  if (combined.includes("detal")) items.push("Atenção aos detalhes");
  if (combined.includes("colabor")) items.push("Postura colaborativa e estável");
  items.push("Boa chance de adaptação a funções de suporte e apoio à gestão");

  return Array.from(new Set(items)).slice(0, 6);
}

function buildFitCulturalAttention(context: string, behavior: string): string[] {
  const combined = `${context} ${behavior}`.toLowerCase();
  const items: string[] = [];

  if (combined.includes("execução rápida") || combined.includes("dinâmico")) {
    items.push("Pode apresentar limitação se o cenário for muito acelerado ou com mudanças constantes");
  }
  if (combined.includes("autonomia")) {
    items.push("Vale validar autonomia prática na resolução de problemas");
  }
  if (combined.includes("inseg")) {
    items.push("Pode demonstrar desconforto em ambientes com pressão intensa");
  }
  items.push("Tende a performar melhor com prioridades claras e processos mínimos bem definidos");

  return Array.from(new Set(items)).slice(0, 4);
}

function buildJobStrengths(experience: string): string[] {
  const combined = experience.toLowerCase();
  const items: string[] = [];

  if (combined.includes("rotinas administrativas")) items.push("Vivência prática na área administrativa");
  if (combined.includes("contas a pagar") || combined.includes("contas a receber")) items.push("Familiaridade com tarefas financeiras básicas");
  if (combined.includes("documentos")) items.push("Capacidade de organização documental");
  if (combined.includes("atenção") || combined.includes("atencao")) items.push("Atenção operacional compatível com a função");
  items.push("Experiência anterior semelhante à vaga");

  return Array.from(new Set(items)).slice(0, 5);
}

function buildJobRisks(experience: string, context: string): string[] {
  const combined = `${experience} ${context}`.toLowerCase();
  const items: string[] = [];

  if (combined.includes("pressão") || combined.includes("pressao")) items.push("Pode precisar de apoio inicial em situações de alta pressão");
  items.push("Pode demorar um pouco mais para tomar decisões em cenários muito urgentes");
  if (combined.includes("execução rápida") || combined.includes("improvis")) {
    items.push("Pode ter menor adaptação se o ambiente exigir improvisação constante");
  }

  return Array.from(new Set(items)).slice(0, 3);
}

function buildInterviewQuestions(targetRole: string): string[] {
  return [
    "Me conte sobre uma situação em que você precisou organizar um processo que estava desorganizado. O que você fez?",
    "Como você reage quando recebe várias demandas ao mesmo tempo?",
    "Fale sobre uma situação em que precisou resolver um problema sem ter o gestor por perto.",
    "O que é mais importante para você em um ambiente de trabalho saudável?",
    "Como você costuma lidar com mudanças de prioridade durante a rotina?",
    `Quais experiências anteriores mais preparam você para o cargo de ${targetRole}?`,
  ];
}

export function generateTaxaAderenciaReport(answers: Answers): string {
  const culturalMission = safe(answers.culturalMission);
  const culturalVision = safe(answers.culturalVision);
  const culturalValues = safe(answers.culturalValues);
  const culturalContext = safe(answers.culturalContext);
  const targetRole = safe(answers.targetRole);
  const recruiterName = safe(answers.recruiterName);
  const validatorName = safe(answers.validatorName);
  const approverName = safe(answers.approverName);
  const candidateName = safe(answers.candidateName);
  const candidateExperience = safe(answers.candidateExperience);
  const behavioralTestInput = safe(answers.behavioralTestInput);

  const roleProfile = getRoleProfile(targetRole);
  const valuesList = splitItems(culturalValues);
  const candidateEvidence = evidenceList(candidateExperience);
  const culturalFit = calculateCulturalFit(
    culturalMission,
    culturalVision,
    culturalValues,
    culturalContext,
    candidateExperience,
    behavioralTestInput,
  );
  const jobFit = calculateJobFit(roleProfile, candidateExperience, behavioralTestInput);
  const overallFit = Math.round((culturalFit + jobFit) / 2);

  const fitCulturalStrengths = buildFitCulturalStrengths(
    candidateExperience,
    behavioralTestInput,
  );
  const fitCulturalAttention = buildFitCulturalAttention(
    culturalContext,
    behavioralTestInput,
  );
  const jobStrengths = buildJobStrengths(candidateExperience);
  const jobRisks = buildJobRisks(candidateExperience, culturalContext);
  const interviewQuestions = buildInterviewQuestions(targetRole);

  const finalRecommendation =
    overallFit >= 80
      ? "O candidato é recomendado para avanço no processo seletivo, pois apresenta perfil compatível tanto com a vaga quanto com a cultura da empresa."
      : overallFit >= 70
      ? "O candidato apresenta aderência satisfatória à oportunidade, porém recomenda-se validação complementar em entrevista final."
      : "O candidato apresenta aderência parcial à oportunidade. Recomenda-se aprofundar evidências antes de decidir pelo avanço.";

  return `
<section>
  <h1>Relatório de Taxa de Aderência com a Vaga</h1>

  <p>Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.</p>

  <h2>1. Resumo da Cultura da Empresa</h2>
  <p>A empresa apresenta uma cultura orientada para organização, proatividade, responsabilidade e foco em resultados, dentro do contexto informado pelo recrutador.</p>
  <p>Missão: ${escapeHtml(culturalMission)}</p>
  <p>Visão: ${escapeHtml(culturalVision)}</p>

  <table>
    <thead>
      <tr>
        <th>Nº</th>
        <th>Valores declarados</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows(valuesList)}
    </tbody>
  </table>

  <h2>2. Resumo do Perfil da Vaga — ${escapeHtml(roleProfile.title)}</h2>
  <table>
    <thead>
      <tr>
        <th>Categoria</th>
        <th>Detalhamento</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Principais responsabilidades</td>
        <td>${escapeHtml(roleProfile.responsibilities.join("; "))}</td>
      </tr>
      <tr>
        <td>Competências técnicas esperadas</td>
        <td>${escapeHtml(roleProfile.technicalSkills.join("; "))}</td>
      </tr>
      <tr>
        <td>Competências comportamentais esperadas</td>
        <td>${escapeHtml(roleProfile.behavioralSkills.join("; "))}</td>
      </tr>
    </tbody>
  </table>

  <h2>3. Análise do Candidato — Fit Cultural</h2>
  <p>O candidato ${escapeHtml(candidateName)} demonstra aderência cultural compatível com o contexto informado pela empresa, especialmente ao cruzarmos os traços comportamentais enviados com os valores e o estilo de trabalho descritos.</p>

  <table>
    <thead>
      <tr>
        <th>Pontos fortes de fit cultural</th>
      </tr>
    </thead>
    <tbody>
      ${fitCulturalStrengths.map((item) => `<tr><td>${escapeHtml(item)}</td></tr>`).join("")}
    </tbody>
  </table>

  <table>
    <thead>
      <tr>
        <th>Pontos de atenção</th>
      </tr>
    </thead>
    <tbody>
      ${fitCulturalAttention.map((item) => `<tr><td>${escapeHtml(item)}</td></tr>`).join("")}
    </tbody>
  </table>

  <h2>4. Análise do Candidato — Job Fit</h2>
  <p>Em relação ao cargo, o candidato apresenta compatibilidade funcional com os requisitos centrais da função. As evidências enviadas mostram conexão com responsabilidades e competências exigidas pela vaga.</p>

  <table>
    <thead>
      <tr>
        <th>Nº</th>
        <th>Evidências observadas</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows(candidateEvidence)}
    </tbody>
  </table>

  <table>
    <thead>
      <tr>
        <th>Forças no Job Fit</th>
      </tr>
    </thead>
    <tbody>
      ${jobStrengths.map((item) => `<tr><td>${escapeHtml(item)}</td></tr>`).join("")}
    </tbody>
  </table>

  <table>
    <thead>
      <tr>
        <th>Riscos no Job Fit</th>
      </tr>
    </thead>
    <tbody>
      ${jobRisks.map((item) => `<tr><td>${escapeHtml(item)}</td></tr>`).join("")}
    </tbody>
  </table>

  <h2>5. Taxa de Aderência Estimada</h2>
  <table>
    <thead>
      <tr>
        <th>Indicador</th>
        <th>Percentual</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Fit Cultural</td>
        <td>${culturalFit}%</td>
      </tr>
      <tr>
        <td>Fit com a Vaga</td>
        <td>${jobFit}%</td>
      </tr>
      <tr>
        <td>Taxa de Aderência Geral</td>
        <td>${overallFit}%</td>
      </tr>
    </tbody>
  </table>

  <h2>6. Parecer Final</h2>
  <p>${escapeHtml(finalRecommendation)}</p>
  <p>Seu maior potencial tende a aparecer em funções que exigem organização, controle, responsabilidade e suporte operacional consistente.</p>
  <p>Como ponto de atenção, recomenda-se validar em entrevista a capacidade do candidato de lidar com cobrança, mudanças de prioridade e autonomia em dias mais corridos.</p>

  <h2>7. Perguntas recomendadas para entrevista final</h2>
  <table>
    <thead>
      <tr>
        <th>Nº</th>
        <th>Pergunta</th>
      </tr>
    </thead>
    <tbody>
      ${interviewQuestions.map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item)}</td></tr>`).join("")}
    </tbody>
  </table>

  <h2>8. Encerramento técnico</h2>
  <p>Para aumentar a precisão da análise, recomenda-se que o recrutador envie o teste de perfil comportamental do candidato sempre que disponível. Esse material complementa a leitura de fit cultural e fortalece a tomada de decisão final.</p>

  <h2>Assinatura e validação</h2>
  <p><strong>Responsável pela Avaliação (RH/Recrutador):</strong> ${escapeHtml(recruiterName)}</p>
  <p><strong>Validação (Gestor Direto/Liderança):</strong> ${escapeHtml(validatorName)}</p>
  <p><strong>Aprovação Final (Diretoria/RH):</strong> ${escapeHtml(approverName)}</p>
</section>
  `.trim();
}
