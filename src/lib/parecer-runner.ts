import {
  classifyRoleLevel,
  type ParecerNivel,
} from "./parecer-metrics";
import {
  getNextParecerQuestion,
  isParecerReady,
  updateParecerSession,
  type ParecerField,
  type ParecerSession,
} from "./parecer-flow";

export function initializeParecerSession(): ParecerSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
    reportMarkdown: null,
  };
}

export function applyParecerAnswer(
  session: ParecerSession,
  field: ParecerField,
  answer: string
): ParecerSession {
  const updated = updateParecerSession(session, field, answer);

  if (field === "vaga" && answer.trim()) {
    updated.nivelVaga = classifyRoleLevel(answer);
  }

  return updated;
}

export function getNextParecerStep(session: ParecerSession): {
  field: ParecerField;
  question: string;
} | null {
  return getNextParecerQuestion(session);
}

function safe(value?: string | null, fallback = "Não informado"): string {
  const text = value?.trim();
  return text && text.length > 0 ? text : fallback;
}

function bulletsFromText(value?: string | null): string[] {
  const text = safe(value, "");
  if (!text) return ["Não informado"];
  return text
    .split(/\n|;|•|- /g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function recommendationLabel(value?: string | null): string {
  const text = safe(value).toLowerCase();
  if (text.includes("restr")) return "Aprovado com Restrições";
  if (text.includes("reprov")) return "Reprovado";
  return "Aprovado";
}

function buildOperationalParecer(session: ParecerSession): string {
  const rec = recommendationLabel(session.recomendacaoFinal);

  return `# Parecer Técnico de Entrevista

**MODELO 1 – Cargo Operacional / Administrativo**

**EMPRESA:** ${safe(session.empresa)}
**VAGA:** ${safe(session.vaga)}
**CANDIDATO(A):** ${safe(session.candidato)}
**DATA DA ENTREVISTA:** ${safe(session.dataEntrevista)}
**ENTREVISTADOR(ES):** ${safe(session.entrevistadores)}
**DATA DO PARECER:** ${safe(session.dataEntrevista)}
**RECOMENDAÇÃO FINAL:** ${rec}

## 1. INFORMAÇÕES GERAIS

**Contexto da contratação:** ${safe(session.contextoContratacao)}
**Motivação principal para a vaga:** ${safe(session.motivacao)}
**Residência e disponibilidade:** ${safe(session.residenciaDisponibilidade)}
**Idiomas:** ${safe(session.idiomas)}

## 2. FORMAÇÃO ACADÊMICA

**Formação principal:** ${safe(session.formacao)}
**Certificações e desenvolvimento complementar:** ${safe(session.certificacoes)}

## 3. EXPERIÊNCIA PROFISSIONAL

| Período | Cargo | Empresa | Principais responsabilidades |
|---|---|---|---|
| Não informado na coleta | ${safe(session.vaga)} | ${safe(session.empresa)} | ${safe(session.trajetoria)} |

**Síntese da trajetória:**
${safe(session.trajetoria)}

## 4. AVALIAÇÃO DE COMPETÊNCIAS TÉCNICAS

| Competência | Nível esperado | Nível apresentado | Evidência |
|---|---|---|---|
| Conhecimento da função | Intermediário | Intermediário | ${safe(session.conhecimentoNegocioSetor)} |
| Execução técnica | Intermediário | Intermediário | ${safe(session.competenciasTecnicas)} |
| Organização de rotina | Intermediário | Intermediário | ${safe(session.planejamentoPriorizacao)} |

## 5. AVALIAÇÃO DE COMPETÊNCIAS COMPORTAMENTAIS

| Competência | Nível | Evidência comportamental |
|---|---|---|
| Comunicação | Médio/Alto | ${safe(session.comunicacao)} |
| Adaptabilidade | Médio | ${safe(session.adaptabilidade)} |
| Foco em resultado | Médio | ${safe(session.focoResultados)} |

## 6. RESULTADOS DE TESTES

${safe(session.testes, "Não informado na coleta")}

## 7. REFERÊNCIAS

${safe(session.referencias, "Não informado na coleta")}

## 8. PONTOS FORTES

${bulletsFromText(session.competenciasComportamentais).map(item => `- ${item}`).join("\n")}

## 9. PONTOS DE ATENÇÃO

| Ponto de atenção | Impacto | Ação sugerida |
|---|---|---|
| ${safe(session.pontosDesenvolvimento)} | Médio | Acompanhamento inicial e validação prática durante integração |

## 10. ADERÊNCIA À CULTURA

${safe(session.aderenciaCultural)}

## 11. RECOMENDAÇÃO FINAL

**Parecer:** ${rec}

**Conclusão técnica:** Com base nas evidências coletadas, o candidato apresenta aderência parcial ou total ao escopo da função, devendo a decisão final considerar a consistência das evidências técnicas, comportamentais e o contexto real da vaga.

## DICAS PARA O GESTOR

- Apresentar claramente rotina, metas e critérios de qualidade.
- Acompanhar os primeiros 30 a 60 dias de adaptação.
- Validar aderência prática às demandas da função.

## 12. ASSINATURA

**Responsável pela Avaliação (RH/Recrutador):** RH Infinite IA  
**Validação (Gestor Direto/Liderança):** Não informado na coleta  
**Aprovação Final (Diretoria/RH):** Não informado na coleta
`;
}

function buildGerencialParecer(session: ParecerSession): string {
  const rec = recommendationLabel(session.recomendacaoFinal);

  return `# Parecer Técnico de Entrevista RH

**Modelo 2 – Cargo Gerencial / Liderança**

**EMPRESA:** ${safe(session.empresa)}
**VAGA:** ${safe(session.vaga)}
**CANDIDATO(A):** ${safe(session.candidato)}
**DATA DA ENTREVISTA:** ${safe(session.dataEntrevista)}
**ENTREVISTADOR(ES):** ${safe(session.entrevistadores)}
**GESTOR SOLICITANTE:** Não informado na coleta
**DATA DO PARECER:** ${safe(session.dataEntrevista)}

**RECOMENDAÇÃO FINAL:** ${rec}

## 1. RESUMO EXECUTIVO

**Candidato:** ${safe(session.candidato)} | **Experiência:** ${safe(session.experienciaTotalENivel)}
**Nível mais alto alcançado:** ${safe(session.experienciaTotalENivel)}

**Síntese da recomendação:**
Candidato com trajetória aderente ao contexto da vaga, apresentando evidências observáveis em gestão, comunicação, acompanhamento de rotina, estruturação de processos e interface com indicadores. A análise final aponta coerência entre histórico, repertório apresentado e exigências típicas de uma posição gerencial.

## 2. DADOS PESSOAIS E CONTEXTO

- **Local de residência:** ${safe(session.residenciaDisponibilidade)}
- **Mobilidade geográfica:** ${safe(session.mobilidadeGeografica)}
- **Contexto da contratação:** ${safe(session.contextoContratacao)}

**Motivação para a vaga:**
${safe(session.motivacao)}

## 3. FORMAÇÃO ACADÊMICA E DESENVOLVIMENTO

**Educação formal:**
- ${safe(session.formacao)}

**Certificações e desenvolvimento complementar:**
${bulletsFromText(session.certificacoes).map(item => `- ${item}`).join("\n")}

**Idiomas:**
- ${safe(session.idiomas)}

## 4. TRAJETÓRIA PROFISSIONAL

| Período | Cargo | Empresa | Setor | Equipe liderada | Responsabilidades-chave |
|---|---|---|---|---|---|
| Não informado na coleta | ${safe(session.vaga)} | ${safe(session.empresa)} | Não informado | Não informado | ${safe(session.trajetoria)} |

**Análise da progressão:**
- ${safe(session.progressaoCarreira, "Não informado na coleta")}
- ${safe(session.movimentacoes, "Não informado na coleta")}
- A trajetória apresentada indica elementos suficientes para análise técnica, ainda que parte do histórico detalhado não tenha sido formalmente estruturado na coleta.

## 5. AVALIAÇÃO DE COMPETÊNCIAS TÉCNICAS PARA LIDERANÇA

| Competência | Nível esperado | Nível apresentado | Evidência |
|---|---|---|---|
| Conhecimento do negócio/setor | Avançado | Intermediário/Avançado | ${safe(session.conhecimentoNegocioSetor)} |
| Gestão de processos | Avançado | Avançado | ${safe(session.gestaoProcessos)} |
| Análise de dados/KPIs | Intermediário | Intermediário | ${safe(session.analiseKpis)} |
| Planejamento estratégico | Intermediário | Intermediário | ${safe(session.planejamentoPriorizacao)} |
| Gestão de orçamento | Intermediário | Básico/Intermediário | ${safe(session.gestaoOrcamento)} |

**Gaps identificados:**
${safe(session.pontosDesenvolvimento)}

## 6. AVALIAÇÃO DE COMPETÊNCIAS COMPORTAMENTAIS / LIDERANÇA

| Competência | Manifesta? | Nível | Comportamentos observados |
|---|---|---|---|
| Liderança e visão | Sim | Médio/Alto | ${safe(session.estiloLideranca)} |
| Comunicação eficaz | Sim | Alto | ${safe(session.comunicacao)} |
| Tomada de decisão | Sim | Médio | ${safe(session.tomadaDecisao)} |
| Gestão de conflitos | Sim | Médio/Alto | ${safe(session.gestaoConflitos)} |
| Desenvolvimento de pessoas | Sim | Alto | ${safe(session.desenvolvimentoPessoas)} |
| Foco em resultados | Sim | Alto | ${safe(session.focoResultados)} |
| Adaptabilidade | Sim | Alto | ${safe(session.adaptabilidade)} |

## 7. AVALIAÇÃO DE ESTILO DE LIDERANÇA

- **Estilo predominante:** ${safe(session.estiloLideranca)}
- **Flexibilidade:** Média/Alta
- **Descrição do estilo:** O discurso do candidato indica liderança com foco em execução, organização, acompanhamento de equipe, mediação e construção de rotina com direcionamento compatível ao nível gerencial.

## 8. PERFORMANCE EM FERRAMENTAS DE AVALIAÇÃO

**Ferramentas aplicadas na coleta:**
${safe(session.testes, "Não informado na coleta")}

**Observação técnica:**
A ausência de instrumentos formais adicionais, quando aplicável, deve ser registrada como limitação metodológica da coleta, e não como evidência negativa automática contra o candidato.

## 9. REFERÊNCIAS PROFISSIONAIS

${safe(session.referencias, "Não informado na coleta")}

## 10. ADERÊNCIA À CULTURA E EQUIPE

**Alinhamento com valores:** ${safe(session.aderenciaCultural)}
**Compatibilidade com equipe:** O conjunto das respostas sugere potencial de integração em ambiente com necessidade de liderança próxima, estruturação, acompanhamento de indicadores e disciplina de execução.
**Visão sobre desafios organizacionais:** ${safe(session.contextoContratacao)}

## 11. POTENCIAL E PERSPECTIVA DE DESENVOLVIMENTO

**Potencial para crescimento:** Alto

**Áreas de desenvolvimento prioritárias:**
${bulletsFromText(session.pontosDesenvolvimento).map(item => `1. ${item}`).join("\n")}

**Plano de desenvolvimento recomendado (primeiros 12 meses):**
- Onboarding estruturado com metas, indicadores e escopo decisório.
- Acompanhamento formal aos 30, 60 e 90 dias.
- Desenvolvimento complementar em finanças, dados ou estratégia, conforme lacunas identificadas.

## 12. PONTOS FORTES

${bulletsFromText(session.evidenciasLideranca || session.competenciasComportamentais).map(item => `- ${item}`).join("\n")}

## 13. PONTOS DE ATENÇÃO / DESAFIOS

| Desafio | Impacto | Mitigação sugerida | Timeline |
|---|---|---|---|
| ${safe(session.pontosDesenvolvimento)} | Médio | Onboarding estruturado, acompanhamento do gestor e plano de desenvolvimento | 90 dias a 6 meses |

## 14. RECOMENDAÇÃO FINAL

**${rec}**

**Parecer:**
Com base nos elementos coletados, o candidato apresenta aderência relevante ao escopo da posição, com sinais consistentes de capacidade de liderança, organização, leitura de contexto e sustentação de rotina gerencial. A recomendação final deve ser lida em conjunto com os gaps técnicos ou estratégicos identificados, que podem demandar plano de integração e desenvolvimento.

**Conclusão técnica:**
Os elementos observados ao longo da coleta sustentam a recomendação final acima, preservando a necessidade de acompanhamento estruturado nos primeiros meses, quando aplicável.

## DICAS PARA O GESTOR DIRETO

**Integração inicial:**  
Apresentar rapidamente o contexto da área, indicadores prioritários e principais gargalos operacionais.

**Estilo de gestão recomendado:**  
Funciona melhor com metas claras, autonomia progressiva e checkpoints bem definidos.

**Como potencializar performance:**  
Inserir o profissional cedo nas discussões de indicadores, eficiência, rotina e plano de ação da área.

**Acompanhamento crítico:**  
Dar suporte específico nos pontos de desenvolvimento mapeados na coleta.

**Desenvolvimento nos primeiros 12 meses:**  
Priorizar formação complementar alinhada aos gaps técnicos, estratégicos ou financeiros identificados.

## 15. ASSINATURA E VALIDAÇÃO

**Responsável pela Avaliação (RH/Recrutador):** RH Infinite IA  
**Validação (Gestor Direto/Liderança):** Não informado na coleta  
**Aprovação Final (Diretoria/RH):** Não informado na coleta
`;
}

function buildStrategicParecer(session: ParecerSession): string {
  const rec = recommendationLabel(session.recomendacaoFinal);

  return `# Parecer Técnico de Entrevista

**MODELO 3 – Cargo Estratégico / Executivo**

**EMPRESA:** ${safe(session.empresa)}
**VAGA:** ${safe(session.vaga)}
**CANDIDATO(A):** ${safe(session.candidato)}
**DATA DA ENTREVISTA:** ${safe(session.dataEntrevista)}
**ENTREVISTADOR(ES):** ${safe(session.entrevistadores)}
**DATA DO PARECER:** ${safe(session.dataEntrevista)}
**RECOMENDAÇÃO FINAL:** ${rec}

## 1. EXECUTIVE SUMMARY

Candidato avaliado para posição estratégica, com análise centrada em escopo, liderança ampliada, visão organizacional, capacidade decisória e aderência ao momento da empresa.

## 2. PERFIL E CONTEXTO

**Contexto da contratação:** ${safe(session.contextoContratacao)}
**Motivação principal:** ${safe(session.motivacao)}
**Mobilidade / disponibilidade:** ${safe(session.residenciaDisponibilidade)} | ${safe(session.mobilidadeGeografica)}

## 3. EXPERTISE E BACKGROUND

| Período | Cargo | Empresa | Escopo | Principais entregas |
|---|---|---|---|---|
| Não informado na coleta | ${safe(session.vaga)} | ${safe(session.empresa)} | Estratégico | ${safe(session.trajetoria)} |

## 4. AVALIAÇÃO DE COMPETÊNCIAS EXECUTIVAS CRÍTICAS

| Competência | Nível esperado | Nível apresentado | Evidência |
|---|---|---|---|
| Visão estratégica | Alto | Alto | ${safe(session.planejamentoPriorizacao)} |
| Leitura de negócio | Alto | Alto | ${safe(session.conhecimentoNegocioSetor)} |
| Gestão financeira | Alto | Intermediário/Alto | ${safe(session.gestaoOrcamento)} |
| Liderança de líderes | Alto | Alto | ${safe(session.evidenciasLideranca)} |
| Tomada de decisão | Alto | Alto | ${safe(session.tomadaDecisao)} |

## 5. AVALIAÇÃO DE FIT PARA A POSIÇÃO ESPECÍFICA

${safe(session.aderenciaCultural)}

## 6. RESULTADO DE AVALIAÇÕES EXECUTIVAS

${safe(session.testes, "Não informado na coleta")}

## 7. REFERÊNCIAS EXECUTIVAS

${safe(session.referencias, "Não informado na coleta")}

## 8. ANÁLISE CRÍTICA DE GAPS E RISCOS

| Gap/Risco | Impacto | Mitigação sugerida | Horizonte |
|---|---|---|---|
| ${safe(session.pontosDesenvolvimento)} | Médio/Alto | Plano de integração, governança e acompanhamento executivo | 90 dias a 12 meses |

## 9. ADERÊNCIA CULTURAL E VALORES

${safe(session.aderenciaCultural)}

## 10. PLANO DE INTEGRAÇÃO (SE APROVADO)

- Definição de agenda de prioridades dos primeiros 90 dias.
- Alinhamento com liderança superior e stakeholders.
- Definição de indicadores críticos e escopo decisório.

## 11. PARECER FINAL

**${rec}**

Conclusão técnica: a análise sustenta a recomendação final acima, considerando aderência estratégica, capacidade de liderança executiva e riscos ou lacunas identificados durante a coleta.

## 12. ASSINATURA E VALIDAÇÃO

**Responsável pela Avaliação (RH/Recrutador):** RH Infinite IA  
**Validação (Gestor Direto/Liderança):** Não informado na coleta  
**Aprovação Final (Diretoria/RH):** Não informado na coleta
`;
}

export async function generateParecer(session: ParecerSession): Promise<string> {
  const level = session.nivelVaga ?? "operacional";

  if (level === "gerencial") {
    return buildGerencialParecer(session);
  }

  if (level === "estrategico") {
    return buildStrategicParecer(session);
  }

  return buildOperationalParecer(session);
}

export async function runParecerStep(params: {
  session: ParecerSession;
  answer?: string;
  currentField?: ParecerField;
}): Promise<{
  session: ParecerSession;
  reply: string;
  nextField?: ParecerField;
  done: boolean;
  reportMarkdown?: string | null;
}> {
  let session = params.session;

  if (params.answer && params.currentField) {
    session = applyParecerAnswer(session, params.currentField, params.answer);
  }

  if (!isParecerReady(session)) {
    const next = getNextParecerStep(session);

    if (!next) {
      return {
        session,
        reply: "Não foi possível determinar a próxima pergunta.",
        done: false,
        reportMarkdown: null,
      };
    }

    return {
      session,
      reply: next.question,
      nextField: next.field,
      done: false,
      reportMarkdown: null,
    };
  }

  const parecer = await generateParecer(session);

  return {
    session: {
      ...session,
      status: "completed",
      reportStatus: "generated",
      reportMarkdown: parecer,
    },
    reply: "Parecer técnico concluído com sucesso.",
    done: true,
    reportMarkdown: parecer,
  };
}
