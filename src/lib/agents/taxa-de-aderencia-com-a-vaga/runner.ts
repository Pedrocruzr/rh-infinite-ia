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
          <td style="width:40px; text-align:center; font-weight:600;">${index + 1}</td>
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

// ─── SVG VISUAL CHARTS ────────────────────────────────────────────────────────

function generateAderenciaChartSvg(culturalFit: number, jobFit: number, overallFit: number): string {
  const width = 480;
  const height = 170;

  const getBarColor = (val: number) => (val >= 80 ? "#10b981" : val >= 70 ? "#0284c7" : "#f59e0b");

  const cColor = getBarColor(culturalFit);
  const jColor = getBarColor(jobFit);
  const oColor = getBarColor(overallFit);

  const maxW = 300;
  const cWidth = Math.round((culturalFit / 100) * maxW);
  const jWidth = Math.round((jobFit / 100) * maxW);
  const oWidth = Math.round((overallFit / 100) * maxW);

  return `
  <svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:520px; font-family: system-ui, -apple-system, sans-serif;" xmlns="http://www.w3.org/2000/svg">
    <!-- Eixo de Fundo / Grinalda -->
    <line x1="140" y1="15" x2="140" y2="135" stroke="#cbd5e1" stroke-width="1.5" />
    <line x1="215" y1="15" x2="215" y2="135" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="290" y1="15" x2="290" y2="135" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="365" y1="15" x2="365" y2="135" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="440" y1="15" x2="440" y2="135" stroke="#cbd5e1" stroke-width="1.5" />

    <!-- Marcadores Numéricos -->
    <text x="140" y="152" font-size="10" fill="#94a3b8" text-anchor="middle" font-weight="500">0%</text>
    <text x="215" y="152" font-size="10" fill="#94a3b8" text-anchor="middle" font-weight="500">25%</text>
    <text x="290" y="152" font-size="10" fill="#94a3b8" text-anchor="middle" font-weight="500">50%</text>
    <text x="365" y="152" font-size="10" fill="#94a3b8" text-anchor="middle" font-weight="500">75%</text>
    <text x="440" y="152" font-size="10" fill="#94a3b8" text-anchor="middle" font-weight="500">100%</text>

    <!-- Barra 1: Fit Cultural -->
    <text x="130" y="38" font-size="12" font-weight="600" fill="#334155" text-anchor="end">Fit Cultural</text>
    <rect x="140" y="24" width="${maxW}" height="20" rx="6" fill="#f1f5f9" />
    <rect x="140" y="24" width="${cWidth}" height="20" rx="6" fill="${cColor}" />
    <text x="${Math.min(430, 148 + cWidth)}" y="38" font-size="11" font-weight="bold" fill="${cColor}">${culturalFit}%</text>

    <!-- Barra 2: Fit com a Vaga -->
    <text x="130" y="78" font-size="12" font-weight="600" fill="#334155" text-anchor="end">Fit com a Vaga</text>
    <rect x="140" y="64" width="${maxW}" height="20" rx="6" fill="#f1f5f9" />
    <rect x="140" y="64" width="${jWidth}" height="20" rx="6" fill="${jColor}" />
    <text x="${Math.min(430, 148 + jWidth)}" y="78" font-size="11" font-weight="bold" fill="${jColor}">${jobFit}%</text>

    <!-- Barra 3: Aderência Geral -->
    <text x="130" y="118" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="end">Aderência Geral</text>
    <rect x="140" y="104" width="${maxW}" height="22" rx="6" fill="#e2e8f0" />
    <rect x="140" y="104" width="${oWidth}" height="22" rx="6" fill="${oColor}" />
    <text x="${Math.min(430, 148 + oWidth)}" y="119" font-size="12" font-weight="bold" fill="${oColor}">${overallFit}%</text>
  </svg>
  `;
}

function generateMapaAderenciaSvg(culturalFit: number, jobFit: number): string {
  const width = 280;
  const height = 210;
  const padding = 35;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const x = padding + Math.round((jobFit / 100) * chartW);
  const y = height - padding - Math.round((culturalFit / 100) * chartH);

  return `
  <svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:290px; font-family: system-ui, -apple-system, sans-serif;" xmlns="http://www.w3.org/2000/svg">
    <!-- Quadrantes Coloridos -->
    <rect x="${padding}" y="${padding}" width="${chartW / 2}" height="${chartH / 2}" fill="#fef3c7" opacity="0.4" />
    <rect x="${padding + chartW / 2}" y="${padding}" width="${chartW / 2}" height="${chartH / 2}" fill="#d1fae5" opacity="0.6" />
    <rect x="${padding}" y="${padding + chartH / 2}" width="${chartW / 2}" height="${chartH / 2}" fill="#fee2e2" opacity="0.4" />
    <rect x="${padding + chartW / 2}" y="${padding + chartH / 2}" width="${chartW / 2}" height="${chartH / 2}" fill="#e0f2fe" opacity="0.5" />

    <!-- Bordas e Eixos -->
    <rect x="${padding}" y="${padding}" width="${chartW}" height="${chartH}" stroke="#cbd5e1" stroke-width="1.5" fill="none" rx="4" />
    <line x1="${padding + chartW / 2}" y1="${padding}" x2="${padding + chartW / 2}" y2="${height - padding}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />
    <line x1="${padding}" y1="${padding + chartH / 2}" x2="${width - padding}" y2="${padding + chartH / 2}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3" />

    <!-- Rótulos dos Quadrantes -->
    <text x="${padding + 6}" y="${padding + 14}" font-size="8" fill="#b45309" font-weight="bold">Potencial Cultural</text>
    <text x="${width - padding - 6}" y="${padding + 14}" font-size="8" fill="#047857" font-weight="bold" text-anchor="end">Match Ideal ★</text>
    <text x="${padding + 6}" y="${height - padding - 8}" font-size="8" fill="#b91c1c" font-weight="bold">Baixa Aderência</text>
    <text x="${width - padding - 6}" y="${height - padding - 8}" font-size="8" fill="#0369a1" font-weight="bold" text-anchor="end">Técnico Funcional</text>

    <!-- Ponto do Candidato -->
    <circle cx="${x}" cy="${y}" r="7" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
    <circle cx="${x}" cy="${y}" r="13" fill="#0284c7" opacity="0.2" />
  </svg>
  `;
}

// ─── RELATÓRIO PRINCIPAL ──────────────────────────────────────────────────────

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
      ? "O candidato é recomendado para avanço no processo seletivo, pois apresenta perfil altamente compatível tanto com a vaga quanto com a cultura da empresa."
      : overallFit >= 70
      ? "O candidato apresenta aderência satisfatória à oportunidade, porém recomenda-se validação complementar em entrevista final."
      : "O candidato apresenta aderência parcial à oportunidade. Recomenda-se aprofundar evidências antes de decidir pelo avanço.";

  const statusColor = overallFit >= 80 ? "#10b981" : overallFit >= 70 ? "#0284c7" : "#f59e0b";
  const dateStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const chartSvg = generateAderenciaChartSvg(culturalFit, jobFit, overallFit);
  const mapaSvg = generateMapaAderenciaSvg(culturalFit, jobFit);

  return `
<section style="background:#ffffff; border-radius:16px; padding:32px; color:#334155; margin-bottom:24px; font-family: system-ui, -apple-system, sans-serif;">

  <!-- CAPA / CABEÇALHO DO RELATÓRIO -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 14px; padding: 32px 24px; color: #ffffff; text-align: center; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(15,23,42,0.15);">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin: 0 0 8px; font-weight:600;">Relatório de Taxa de Aderência com a Vaga</p>
    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #ffffff; letter-spacing: -0.5px;">${escapeHtml(candidateName)}</h1>
    <p style="font-size: 14px; color: #cbd5e1; margin: 0 0 18px;">Vaga Alvo: <strong style="color:#ffffff;">${escapeHtml(roleProfile.title)}</strong> • Gerado em ${dateStr}</p>
    <div style="display: inline-block; background: ${statusColor}; color: #ffffff; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
      Taxa de Aderência Geral: ${overallFit}%
    </div>
  </div>

  <p style="font-size:11px; color:#94a3b8; border-left:3px solid #0284c7; padding-left:12px; margin: 0 0 28px;">
    Aviso: esta avaliação ficará disponível em <strong>"Relatórios Stackers"</strong> para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.
  </p>

  <!-- CARDS DE METRICAS (KPIS) -->
  <div style="display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: center;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Fit Cultural</span>
      <div style="font-size: 32px; font-weight: 800; color: ${culturalFit >= 80 ? '#10b981' : culturalFit >= 70 ? '#0284c7' : '#f59e0b'}; margin: 6px 0;">${culturalFit}%</div>
      <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden; margin-top: 8px;">
        <div style="background: ${culturalFit >= 80 ? '#10b981' : culturalFit >= 70 ? '#0284c7' : '#f59e0b'}; width: ${culturalFit}%; height: 100%;"></div>
      </div>
    </div>

    <div style="flex: 1; min-width: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: center;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Fit com a Vaga</span>
      <div style="font-size: 32px; font-weight: 800; color: ${jobFit >= 80 ? '#10b981' : jobFit >= 70 ? '#0284c7' : '#f59e0b'}; margin: 6px 0;">${jobFit}%</div>
      <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden; margin-top: 8px;">
        <div style="background: ${jobFit >= 80 ? '#10b981' : jobFit >= 70 ? '#0284c7' : '#f59e0b'}; width: ${jobFit}%; height: 100%;"></div>
      </div>
    </div>

    <div style="flex: 1; min-width: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: center;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Aderência Geral</span>
      <div style="font-size: 32px; font-weight: 800; color: ${statusColor}; margin: 6px 0;">${overallFit}%</div>
      <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden; margin-top: 8px;">
        <div style="background: ${statusColor}; width: ${overallFit}%; height: 100%;"></div>
      </div>
    </div>
  </div>

  <!-- GRÁFICOS VISUAIS E MAPA DE ADERÊNCIA -->
  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:24px; margin-bottom:32px;">
    <h3 style="font-size:16px; margin:0 0 18px; color:#0f172a; font-weight:700;">📊 Mapa Visual e Gráfico de Aderência</h3>
    <div style="display:flex; gap:24px; align-items:center; justify-content:space-around; flex-wrap:wrap;">
      <div style="flex:1; min-width:280px; text-align:center;">
        <p style="font-size:12px; font-weight:600; color:#64748b; margin-bottom:12px;">Comparativo dos Indicadores de Aderência</p>
        ${chartSvg}
      </div>
      <div style="flex:1; min-width:260px; text-align:center;">
        <p style="font-size:12px; font-weight:600; color:#64748b; margin-bottom:12px;">Matriz de Posicionamento (Quadrante 2D)</p>
        ${mapaSvg}
      </div>
    </div>
  </div>

  <!-- 1. CULTURA DA EMPRESA -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">🏢 1. Resumo da Cultura da Empresa</h2>
  <p style="line-height:1.6;">A empresa apresenta uma cultura orientada para organização, proatividade, responsabilidade e foco em resultados, dentro do contexto informado pelo recrutador.</p>
  <p style="margin: 6px 0;"><strong>Missão:</strong> ${escapeHtml(culturalMission)}</p>
  <p style="margin: 6px 0 16px;"><strong>Visão:</strong> ${escapeHtml(culturalVision)}</p>

  <table style="width:100%; border-collapse:collapse; margin-bottom:28px;">
    <thead>
      <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
        <th style="padding:10px; width:50px;">Nº</th>
        <th style="padding:10px;">Valores declarados</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows(valuesList)}
    </tbody>
  </table>

  <!-- 2. PERFIL DA VAGA -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">🎯 2. Resumo do Perfil da Vaga — ${escapeHtml(roleProfile.title)}</h2>
  <table style="width:100%; border-collapse:collapse; margin-bottom:28px;">
    <thead>
      <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
        <th style="padding:10px; width:220px;">Categoria</th>
        <th style="padding:10px;">Detalhamento</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:10px; font-weight:600;">Principais responsabilidades</td>
        <td style="padding:10px;">${escapeHtml(roleProfile.responsibilities.join("; "))}</td>
      </tr>
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:10px; font-weight:600;">Competências técnicas esperadas</td>
        <td style="padding:10px;">${escapeHtml(roleProfile.technicalSkills.join("; "))}</td>
      </tr>
      <tr>
        <td style="padding:10px; font-weight:600;">Competências comportamentais esperadas</td>
        <td style="padding:10px;">${escapeHtml(roleProfile.behavioralSkills.join("; "))}</td>
      </tr>
    </tbody>
  </table>

  <!-- 3. FIT CULTURAL -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">🌿 3. Análise do Candidato — Fit Cultural</h2>
  <p style="line-height:1.6;">O candidato <strong>${escapeHtml(candidateName)}</strong> demonstra aderência cultural compatível com o contexto informado pela empresa, especialmente ao cruzarmos os traços comportamentais enviados com os valores e o estilo de trabalho descritos.</p>

  <div style="display:flex; gap:16px; margin-bottom:28px; flex-wrap:wrap;">
    <div style="flex:1; min-width:260px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:18px;">
      <h4 style="margin:0 0 10px; color:#166534; font-size:14px; font-weight:700;">✓ Pontos Fortes de Fit Cultural</h4>
      <ul style="margin:0; padding-left:18px; font-size:13px; color:#15803d; line-height:1.6;">
        ${fitCulturalStrengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>

    <div style="flex:1; min-width:260px; background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:18px;">
      <h4 style="margin:0 0 10px; color:#92400e; font-size:14px; font-weight:700;">⚠️ Pontos de Atenção</h4>
      <ul style="margin:0; padding-left:18px; font-size:13px; color:#b45309; line-height:1.6;">
        ${fitCulturalAttention.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  </div>

  <!-- 4. JOB FIT -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">💼 4. Análise do Candidato — Job Fit</h2>
  <p style="line-height:1.6;">Em relação ao cargo, o candidato apresenta compatibilidade funcional com os requisitos centrais da função. As evidências enviadas mostram conexão com responsabilidades e competências exigidas pela vaga.</p>

  <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
    <thead>
      <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
        <th style="padding:10px; width:50px;">Nº</th>
        <th style="padding:10px;">Evidências observadas na trajetória do candidato</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows(candidateEvidence)}
    </tbody>
  </table>

  <div style="display:flex; gap:16px; margin-bottom:28px; flex-wrap:wrap;">
    <div style="flex:1; min-width:260px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:18px;">
      <h4 style="margin:0 0 10px; color:#166534; font-size:14px; font-weight:700;">✓ Forças no Job Fit</h4>
      <ul style="margin:0; padding-left:18px; font-size:13px; color:#15803d; line-height:1.6;">
        ${jobStrengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>

    <div style="flex:1; min-width:260px; background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:18px;">
      <h4 style="margin:0 0 10px; color:#92400e; font-size:14px; font-weight:700;">⚠️ Riscos no Job Fit</h4>
      <ul style="margin:0; padding-left:18px; font-size:13px; color:#b45309; line-height:1.6;">
        ${jobRisks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  </div>

  <!-- 5. TAXA DE ADERÊNCIA ESTIMADA (TABELA DETALHADA) -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">📈 5. Taxa de Aderência Estimada (Detalhamento)</h2>
  <table style="width:100%; border-collapse:collapse; margin-bottom:28px;">
    <thead>
      <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
        <th style="padding:10px;">Indicador de Aderência</th>
        <th style="padding:10px; text-align:center; width:120px;">Percentual</th>
        <th style="padding:10px; width:200px;">Barra Visual</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:10px; font-weight:600;">Fit Cultural</td>
        <td style="padding:10px; text-align:center; font-weight:700; color:${culturalFit >= 80 ? '#10b981' : culturalFit >= 70 ? '#0284c7' : '#f59e0b'};">${culturalFit}%</td>
        <td style="padding:10px;">
          <div style="background:#e2e8f0; height:8px; border-radius:4px; overflow:hidden;">
            <div style="background:${culturalFit >= 80 ? '#10b981' : culturalFit >= 70 ? '#0284c7' : '#f59e0b'}; width:${culturalFit}%; height:100%;"></div>
          </div>
        </td>
      </tr>
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:10px; font-weight:600;">Fit com a Vaga</td>
        <td style="padding:10px; text-align:center; font-weight:700; color:${jobFit >= 80 ? '#10b981' : jobFit >= 70 ? '#0284c7' : '#f59e0b'};">${jobFit}%</td>
        <td style="padding:10px;">
          <div style="background:#e2e8f0; height:8px; border-radius:4px; overflow:hidden;">
            <div style="background:${jobFit >= 80 ? '#10b981' : jobFit >= 70 ? '#0284c7' : '#f59e0b'}; width:${jobFit}%; height:100%;"></div>
          </div>
        </td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px; font-weight:700; color:#0f172a;">Taxa de Aderência Geral</td>
        <td style="padding:10px; text-align:center; font-weight:800; font-size:16px; color:${statusColor};">${overallFit}%</td>
        <td style="padding:10px;">
          <div style="background:#cbd5e1; height:10px; border-radius:5px; overflow:hidden;">
            <div style="background:${statusColor}; width:${overallFit}%; height:100%;"></div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- 6. PARECER FINAL -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">📝 6. Parecer Final e Recomendação</h2>
  <div style="background:#f8fafc; border-left:4px solid ${statusColor}; padding:18px; border-radius:0 12px 12px 0; margin-bottom:28px;">
    <p style="font-weight:600; font-size:15px; margin:0 0 10px; color:#0f172a;">${escapeHtml(finalRecommendation)}</p>
    <p style="margin:0 0 8px; font-size:13px; color:#475569;">Seu maior potencial tende a aparecer em funções que exigem organização, controle, responsabilidade e suporte operacional consistente.</p>
    <p style="margin:0; font-size:13px; color:#475569;">Como ponto de atenção, recomenda-se validar em entrevista a capacidade do candidato de lidar com cobrança, mudanças de prioridade e autonomia em dias mais corridos.</p>
  </div>

  <!-- 7. PERGUNTAS DE ENTREVISTA -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">💬 7. Perguntas Recomendadas para Entrevista Final</h2>
  <table style="width:100%; border-collapse:collapse; margin-bottom:28px;">
    <thead>
      <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
        <th style="padding:10px; width:50px;">Nº</th>
        <th style="padding:10px;">Pergunta de Investigação</th>
      </tr>
    </thead>
    <tbody>
      ${interviewQuestions.map((item, index) => `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; text-align:center; font-weight:600;">${index + 1}</td><td style="padding:10px;">${escapeHtml(item)}</td></tr>`).join("")}
    </tbody>
  </table>

  <!-- 8. ENCERRAMENTO TÉCNICO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">⚙️ 8. Encerramento Técnico</h2>
  <p style="line-height:1.6; color:#475569; margin-bottom:28px;">Para aumentar a precisão da análise, recomenda-se que o recrutador envie o teste de perfil comportamental do candidato sempre que disponível. Esse material complementa a leitura de fit cultural e fortalece a tomada de decisão final.</p>

  <!-- ASSINATURA E VALIDAÇÃO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">✍️ Assinatura e validação</h2>
  <p style="margin-bottom:32px;"><strong>Responsável pela Avaliação (RH/Recrutador):</strong> ${escapeHtml(recruiterName)}</p>
  <p style="margin-bottom:32px;"><strong>Validação (Gestor Direto/Liderança):</strong> ${escapeHtml(validatorName)}</p>
  <p style="margin-bottom:32px;"><strong>Aprovação Final (Diretoria/RH):</strong> ${escapeHtml(approverName)}</p>

</section>
  `.trim();
}
