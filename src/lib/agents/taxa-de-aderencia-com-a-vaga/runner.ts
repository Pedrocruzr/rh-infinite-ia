type Answers = {
  recruiterName?: string;
  validatorName?: string;
  approverName?: string;
  targetRole?: string;
  culturalMission?: string;
  culturalVision?: string;
  culturalValues?: string;
  culturalContext?: string;
  candidateName?: string;
  candidateDisc?: string;
  candidateEnneagram?: string;
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

function rowsFromList(items: string[], emptyLabel = "Não informado"): string {
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

function getRoleProfile(targetRole: string): RoleProfile {
  const role = targetRole.toLowerCase();

  if (role.includes("auxiliar administrativo") || role.includes("assistente administrativo")) {
    return {
      title: "Auxiliar Administrativo / Assistente Administrativo",
      responsibilities: [
        "Controle de contas a pagar e a receber",
        "Emissão de notas fiscais, boletos e orçamentos",
        "Conciliação bancária",
        "Atendimento a clientes e fornecedores",
        "Organização de documentos físicos e digitais",
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

  if (role.includes("recepcionista")) {
    return {
      title: "Recepcionista",
      responsibilities: [
        "Recepcionar clientes, visitantes e fornecedores",
        "Atender e direcionar ligações",
        "Controlar agenda e fluxo de atendimento",
        "Registrar recados e informações com clareza",
        "Organizar recepção e documentos de apoio",
      ],
      technicalSkills: [
        "Atendimento telefônico e presencial",
        "Pacote Office básico",
        "Organização de agenda e registros",
      ],
      behavioralSkills: [
        "Comunicação",
        "Cordialidade",
        "Postura profissional",
        "Organização",
        "Atenção",
      ],
    };
  }

  if (role.includes("vendedor") || role.includes("atendente comercial")) {
    return {
      title: "Vendedor / Atendente Comercial",
      responsibilities: [
        "Prospecção e atendimento de clientes",
        "Negociação comercial",
        "Apresentação de produtos e serviços",
        "Acompanhamento de propostas e fechamento",
        "Pós-venda e manutenção de relacionamento",
      ],
      technicalSkills: [
        "Técnicas de vendas",
        "Atendimento comercial",
        "Uso básico de CRM ou controle de pipeline",
      ],
      behavioralSkills: [
        "Comunicação",
        "Persuasão",
        "Proatividade",
        "Resiliência",
        "Foco em resultados",
      ],
    };
  }

  return {
    title: targetRole,
    responsibilities: [
      "Validar responsabilidades exatas do cargo com o recrutador",
      "Conferir entregas esperadas e rotina operacional",
      "Cruzar experiência do candidato com a necessidade real da função",
    ],
    technicalSkills: [
      "Competências técnicas dependem do cargo informado",
      "Validar ferramentas, rotina e nível de domínio esperado",
    ],
    behavioralSkills: [
      "Organização",
      "Responsabilidade",
      "Comunicação",
      "Capacidade de adaptação",
    ],
  };
}

function calculateKeywordScore(sourceText: string, keywords: string[], base: number, max: number): number {
  const text = sourceText.toLowerCase();
  let score = base;

  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 4;
    }
  }

  return Math.max(0, Math.min(max, score));
}

function normalizeDisc(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function buildBehavioralScore(
  disc: string,
  enneagram: string,
  candidateExperience: string,
  behavioralTestInput: string,
  roleProfile: RoleProfile,
): number {
  const combined = `${disc} ${enneagram} ${candidateExperience} ${behavioralTestInput}`.toLowerCase();
  let score = 68;

  for (const item of roleProfile.behavioralSkills) {
    if (combined.includes(item.toLowerCase())) {
      score += 5;
    }
  }

  const discNormalized = normalizeDisc(disc);

  if (discNormalized.includes("c")) score += 4;
  if (discNormalized.includes("s")) score += 4;
  if (discNormalized.includes("d")) score += 3;
  if (discNormalized.includes("i")) score += 3;

  if (combined.includes("respons")) score += 4;
  if (combined.includes("organ")) score += 4;
  if (combined.includes("comun")) score += 4;
  if (combined.includes("proativ")) score += 4;
  if (combined.includes("detal")) score += 4;

  if (combined.includes("inseg")) score -= 4;
  if (combined.includes("pressão")) score -= 2;
  if (combined.includes("mudanças rápidas")) score -= 2;

  return Math.max(0, Math.min(95, score));
}

function buildCulturalScore(
  mission: string,
  vision: string,
  values: string,
  context: string,
  candidateExperience: string,
  behavioralTestInput: string,
): number {
  const companyCulture = `${mission} ${vision} ${values} ${context}`.toLowerCase();
  const candidate = `${candidateExperience} ${behavioralTestInput}`.toLowerCase();

  let score = 64;

  const cultureKeywords = [
    "organização",
    "disciplina",
    "foco no cliente",
    "proatividade",
    "responsabilidade",
    "transparência",
    "melhoria contínua",
    "autonomia",
    "agilidade",
    "comprometimento",
  ];

  for (const keyword of cultureKeywords) {
    if (companyCulture.includes(keyword) && candidate.includes(keyword)) {
      score += 5;
    }
  }

  if (companyCulture.includes("equipe enxuta") && candidate.includes("colabor")) score += 4;
  if (companyCulture.includes("autonomia") && candidate.includes("resolve")) score += 4;
  if (companyCulture.includes("organização") && candidate.includes("organ")) score += 4;
  if (companyCulture.includes("pouca burocracia") && candidate.includes("prático")) score += 3;

  if (companyCulture.includes("execução rápida") && candidate.includes("inseg")) score -= 3;
  if (companyCulture.includes("baixa tolerância") && candidate.includes("precisa de supervisão")) score -= 4;

  return Math.max(0, Math.min(95, score));
}

function buildTechnicalScore(roleProfile: RoleProfile, candidateExperience: string): number {
  const technicalKeywords = [
    ...roleProfile.responsibilities,
    ...roleProfile.technicalSkills,
  ];

  return calculateKeywordScore(candidateExperience, technicalKeywords, 70, 96);
}

function listCandidateEvidence(candidateExperience: string): string[] {
  return splitItems(candidateExperience).slice(0, 8);
}

function buildStrengths(roleProfile: RoleProfile, candidateExperience: string, behavioralTestInput: string): string[] {
  const combined = `${candidateExperience} ${behavioralTestInput}`.toLowerCase();
  const strengths: string[] = [];

  if (combined.includes("organ")) strengths.push("Boa aderência a rotinas que exigem organização e controle");
  if (combined.includes("respons")) strengths.push("Senso de responsabilidade compatível com atividades críticas");
  if (combined.includes("detal")) strengths.push("Atenção aos detalhes para reduzir falhas operacionais");
  if (combined.includes("comun")) strengths.push("Comunicação funcional para relação com equipe, cliente e liderança");
  if (combined.includes("excel") || combined.includes("word")) strengths.push("Base técnica compatível com rotinas administrativas e registros");
  if (combined.includes("atendimento")) strengths.push("Vivência prática com atendimento e interação profissional");

  for (const skill of roleProfile.behavioralSkills) {
    if (combined.includes(skill.toLowerCase()) && strengths.length < 6) {
      strengths.push(`Evidência de ${skill.toLowerCase()} alinhada à exigência da função`);
    }
  }

  if (!strengths.length) {
    strengths.push("Experiência e comportamento com aderência geral à vaga informada");
    strengths.push("Há compatibilidade funcional entre o histórico apresentado e o escopo da posição");
  }

  return strengths.slice(0, 6);
}

function buildGaps(
  roleProfile: RoleProfile,
  culturalContext: string,
  candidateExperience: string,
  behavioralTestInput: string,
): string[] {
  const combined = `${candidateExperience} ${behavioralTestInput}`.toLowerCase();
  const culture = culturalContext.toLowerCase();
  const gaps: string[] = [];

  if (culture.includes("execução rápida") || culture.includes("dinâmico")) {
    gaps.push("Validar capacidade de resposta em ambiente de maior velocidade e mudança de prioridade");
  }

  if (culture.includes("autonomia")) {
    gaps.push("Confirmar capacidade de tomar decisão sem dependência excessiva de supervisão");
  }

  if (combined.includes("inseg")) {
    gaps.push("Investigar reação a cobrança, pressão e necessidade de iniciativa em cenários críticos");
  }

  if (!combined.includes("erp") && roleProfile.technicalSkills.some((skill) => skill.toLowerCase().includes("erp"))) {
    gaps.push("Verificar familiaridade com ERP ou sistema equivalente, caso seja exigência do processo");
  }

  if (!combined.includes("excel") && !combined.includes("word")) {
    gaps.push("Confirmar domínio prático das ferramentas básicas exigidas para a execução da função");
  }

  if (!gaps.length) {
    gaps.push("Não há lacunas críticas declaradas, mas recomenda-se validação final por entrevista estruturada");
  }

  return gaps.slice(0, 5);
}

function buildInterviewQuestions(targetRole: string, culturalContext: string): string[] {
  const questions = [
    `Quais experiências anteriores mais preparam você para o cargo de ${targetRole}?`,
    "Conte uma situação em que você precisou lidar com várias demandas ao mesmo tempo. Como priorizou?",
    "Fale sobre um problema que você resolveu sem depender do gestor para cada etapa.",
    "Como você reage quando recebe mudança de prioridade no meio da rotina?",
    "Que tipo de ambiente de trabalho ajuda você a entregar seu melhor desempenho?",
  ];

  if (culturalContext.toLowerCase().includes("contato direto com o dono") || culturalContext.toLowerCase().includes("liderança")) {
    questions.push("Como você lida com feedback direto e correções rápidas feitas pela liderança?");
  }

  return questions.slice(0, 6);
}

export function generateTaxaAderenciaReport(answers: Answers): string {
  const recruiterName = safe(answers.recruiterName);
  const validatorName = safe(answers.validatorName);
  const approverName = safe(answers.approverName);
  const targetRole = safe(answers.targetRole);
  const culturalMission = safe(answers.culturalMission);
  const culturalVision = safe(answers.culturalVision);
  const culturalValues = safe(answers.culturalValues);
  const culturalContext = safe(answers.culturalContext);
  const candidateName = safe(answers.candidateName);
  const candidateDisc = safe(answers.candidateDisc);
  const candidateEnneagram = safe(answers.candidateEnneagram);
  const candidateExperience = safe(answers.candidateExperience);
  const behavioralTestInput = safe(answers.behavioralTestInput);

  const roleProfile = getRoleProfile(targetRole);
  const technicalFit = buildTechnicalScore(roleProfile, candidateExperience);
  const behavioralFit = buildBehavioralScore(
    candidateDisc,
    candidateEnneagram,
    candidateExperience,
    behavioralTestInput,
    roleProfile,
  );
  const culturalFit = buildCulturalScore(
    culturalMission,
    culturalVision,
    culturalValues,
    culturalContext,
    candidateExperience,
    behavioralTestInput,
  );

  const overallFit = Math.round((technicalFit * 0.5) + (behavioralFit * 0.3) + (culturalFit * 0.2));

  const valuesList = splitItems(culturalValues);
  const candidateEvidence = listCandidateEvidence(candidateExperience);
  const strengths = buildStrengths(roleProfile, candidateExperience, behavioralTestInput);
  const gaps = buildGaps(roleProfile, culturalContext, candidateExperience, behavioralTestInput);
  const interviewQuestions = buildInterviewQuestions(targetRole, culturalContext);

  const finalDecision =
    overallFit >= 85
      ? "Recomendado para avanço no processo seletivo. O candidato apresenta aderência forte à vaga, com apoio cultural complementar consistente."
      : overallFit >= 70
      ? "Aderência satisfatória, com necessidade de validação complementar em entrevista final para confirmar estabilidade da decisão."
      : "Aderência parcial à vaga. Recomenda-se aprofundar evidências técnicas e comportamentais antes de avanço no processo.";

  return `
<section>
  <h1>Relatório de Taxa de Aderência com a Vaga</h1>

  <p>Aviso: esta avaliação ficará disponível por 3 dias para consulta do recrutador. Recomendamos salvar ou copiar o relatório depois que ele for gerado.</p>

  <h2>1. Identificação da avaliação</h2>
  <table>
    <thead>
      <tr>
        <th>Campo</th>
        <th>Informação</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Candidato avaliado</td>
        <td>${escapeHtml(candidateName)}</td>
      </tr>
      <tr>
        <td>Cargo analisado</td>
        <td>${escapeHtml(targetRole)}</td>
      </tr>
      <tr>
        <td>Recrutador responsável</td>
        <td>${escapeHtml(recruiterName)}</td>
      </tr>
      <tr>
        <td>Validação</td>
        <td>${escapeHtml(validatorName)}</td>
      </tr>
      <tr>
        <td>Aprovação final</td>
        <td>${escapeHtml(approverName)}</td>
      </tr>
    </tbody>
  </table>

  <h2>2. Resumo da vaga</h2>
  <table>
    <thead>
      <tr>
        <th>Categoria</th>
        <th>Detalhamento</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Cargo base utilizado</td>
        <td>${escapeHtml(roleProfile.title)}</td>
      </tr>
      <tr>
        <td>Responsabilidades principais</td>
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

  <h2>3. Resumo da cultura da empresa</h2>
  <table>
    <thead>
      <tr>
        <th>Dimensão</th>
        <th>Descrição</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Missão</td>
        <td>${escapeHtml(culturalMission)}</td>
      </tr>
      <tr>
        <td>Visão</td>
        <td>${escapeHtml(culturalVision)}</td>
      </tr>
      <tr>
        <td>Contexto cultural</td>
        <td>${escapeHtml(culturalContext)}</td>
      </tr>
    </tbody>
  </table>

  <h2>4. Valores declarados</h2>
  <table>
    <thead>
      <tr>
        <th>Nº</th>
        <th>Valor</th>
      </tr>
    </thead>
    <tbody>
      ${rowsFromList(valuesList)}
    </tbody>
  </table>

  <h2>5. Dados do candidato</h2>
  <table>
    <thead>
      <tr>
        <th>Campo</th>
        <th>Informação</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Perfil DISC</td>
        <td>${escapeHtml(candidateDisc)}</td>
      </tr>
      <tr>
        <td>Eneagrama</td>
        <td>${escapeHtml(candidateEnneagram)}</td>
      </tr>
      <tr>
        <td>Resumo de competências e experiências</td>
        <td>${escapeHtml(candidateExperience)}</td>
      </tr>
      <tr>
        <td>Teste de perfil comportamental</td>
        <td>${escapeHtml(behavioralTestInput)}</td>
      </tr>
    </tbody>
  </table>

  <h2>6. Evidências observadas</h2>
  <table>
    <thead>
      <tr>
        <th>Nº</th>
        <th>Evidência</th>
      </tr>
    </thead>
    <tbody>
      ${rowsFromList(candidateEvidence)}
    </tbody>
  </table>

  <h2>7. Análise de aderência técnica</h2>
  <p>A aderência técnica foi calculada a partir do cruzamento entre as exigências da vaga, as responsabilidades principais do cargo e as evidências práticas apresentadas no histórico profissional do candidato.</p>

  <h2>8. Análise de aderência comportamental</h2>
  <p>A aderência comportamental considera as competências exigidas pela função, os dados do perfil DISC, o Eneagrama e os traços descritos no material comportamental enviado pelo recrutador.</p>

  <h2>9. Análise de aderência cultural complementar</h2>
  <p>A análise cultural atua como camada complementar à decisão final, considerando missão, visão, valores e contexto da empresa, sem substituir o foco principal na compatibilidade do candidato com a vaga.</p>

  <h2>10. Pontos fortes identificados</h2>
  <table>
    <thead>
      <tr>
        <th>Ponto forte</th>
      </tr>
    </thead>
    <tbody>
      ${strengths
        .map(
          (item) => `
        <tr>
          <td>${escapeHtml(item)}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <h2>11. Gaps e riscos</h2>
  <table>
    <thead>
      <tr>
        <th>Ponto de atenção</th>
      </tr>
    </thead>
    <tbody>
      ${gaps
        .map(
          (item) => `
        <tr>
          <td>${escapeHtml(item)}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <h2>12. Taxa de aderência por dimensão</h2>
  <table>
    <thead>
      <tr>
        <th>Indicador</th>
        <th>Percentual</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Aderência técnica</td>
        <td>${technicalFit}%</td>
      </tr>
      <tr>
        <td>Aderência comportamental</td>
        <td>${behavioralFit}%</td>
      </tr>
      <tr>
        <td>Aderência cultural complementar</td>
        <td>${culturalFit}%</td>
      </tr>
      <tr>
        <td>Taxa de aderência geral</td>
        <td>${overallFit}%</td>
      </tr>
    </tbody>
  </table>

  <h2>13. Parecer final</h2>
  <p>${escapeHtml(finalDecision)}</p>

  <h2>14. Plano de ação e validação recomendada</h2>
  <table>
    <thead>
      <tr>
        <th>Ação</th>
        <th>Objetivo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Realizar entrevista final estruturada</td>
        <td>Validar evidências práticas de execução e aderência real à rotina do cargo</td>
      </tr>
      <tr>
        <td>Testar aderência à pressão e autonomia</td>
        <td>Confirmar resposta do candidato a urgência, cobrança e mudança de prioridade</td>
      </tr>
      <tr>
        <td>Conferir alinhamento cultural complementar</td>
        <td>Verificar compatibilidade com valores, estilo de liderança e ambiente da empresa</td>
      </tr>
      <tr>
        <td>Revisar material comportamental</td>
        <td>Reduzir risco de decisão com base apenas em autodeclaração ou resumo descritivo</td>
      </tr>
    </tbody>
  </table>

  <h2>15. Perguntas recomendadas para entrevista final</h2>
  <table>
    <thead>
      <tr>
        <th>Nº</th>
        <th>Pergunta</th>
      </tr>
    </thead>
    <tbody>
      ${interviewQuestions
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item)}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <h2>16. Orientação final ao recrutador</h2>
  <p>Para aumentar a precisão deste relatório, envie o teste de perfil comportamental do candidato sempre que disponível. Esse material fortalece a leitura de aderência comportamental e melhora a consistência da decisão final.</p>

  <h2>Assinatura e validação</h2>
  <p><strong>Responsável pela Avaliação (RH/Recrutador):</strong> ${escapeHtml(recruiterName)}</p>
  <p><strong>Validação (Gestor Direto/Liderança):</strong> ${escapeHtml(validatorName)}</p>
  <p><strong>Aprovação Final (Diretoria/RH):</strong> ${escapeHtml(approverName)}</p>
</section>
  `.trim();
}
