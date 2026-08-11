import type { OnboardingSession } from "./flow";

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
    .trim();

  if (!text) return "";
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!/[.!?]$/.test(text)) {
    text += ".";
  }
  return text;
}

function normalizeLine(value: string): string {
  return normalizeSentence(value).replace(/[.!?]$/, "");
}

function splitList(text?: string): string[] {
  return String(text ?? "")
    .split(/\n|;|,/)
    .map((item) => item.replace(/^\d+[\).\-\s]*/, "").trim())
    .filter(Boolean)
    .map(normalizeLine);
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function parseDurationInfo(tempo?: string) {
  const raw = String(tempo ?? "").toLowerCase();
  let morningHours = 0;
  let afternoonHours = 0;

  const morningMatch = raw.match(/(\d+)\s*(?:h|hora|horas)?\s*(?:de\s+)?manh[ãa]/i);
  const afternoonMatch = raw.match(/(\d+)\s*(?:h|hora|horas)?\s*(?:à|a|de\s+)?tarde/i);

  if (morningMatch) {
    morningHours = parseInt(morningMatch[1], 10) || 0;
  }
  if (afternoonMatch) {
    afternoonHours = parseInt(afternoonMatch[1], 10) || 0;
  }

  if (!morningMatch && !afternoonMatch) {
    const generalMatch = raw.match(/(\d+)\s*(?:h|hora|horas)/i);
    const total = generalMatch ? parseInt(generalMatch[1], 10) : 6;
    if (total >= 6) {
      morningHours = Math.ceil(total / 2);
      afternoonHours = Math.floor(total / 2);
    } else {
      morningHours = total;
      afternoonHours = 0;
    }
  }

  const totalHours = morningHours + afternoonHours || 6;
  const morningText = morningHours > 0 ? `${morningHours} ${morningHours === 1 ? "hora" : "horas"}` : null;
  const afternoonText = afternoonHours > 0 ? `${afternoonHours} ${afternoonHours === 1 ? "hora" : "horas"}` : null;

  let display = `${totalHours} horas`;
  if (morningText && afternoonText) {
    display = `${totalHours} horas (Manhã: ${morningText} | Tarde: ${afternoonText})`;
  } else if (morningText) {
    display = `${morningText} de manhã`;
  } else if (afternoonText) {
    display = `${afternoonText} à tarde`;
  }

  return {
    totalHours,
    morningHours,
    afternoonHours,
    display,
    morningText,
    afternoonText,
  };
}

export function buildOnboardingReport(session: OnboardingSession): string {
  const dateStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const duration = parseDurationInfo(session.tempoIntegracao);
  const quantidade = normalizeLine(session.quantidadeColaboradores ?? "Não informado");
  const nivel = normalizeLine(session.nivelHierarquico ?? "Não informado");
  const departamentosList = unique(splitList(session.departamentos));
  const departamentosStr = departamentosList.length ? departamentosList.join(", ") : "Geral / Não informado";
  const facilitadores = normalizeLine(session.facilitadoresDisponiveis ?? "Coordenador / Facilitador de Integração");
  const missao = normalizeSentence(session.missaoEmpresa ?? "Não informada");
  const visao = normalizeSentence(session.visaoEmpresa ?? "Não informada");
  const valoresList = unique(splitList(session.valoresEmpresa));
  const temasList = unique(splitList(session.temasDepartamentos));
  const documentosList = unique(splitList(session.documentosBase));
  const sistemasList = unique(splitList(session.sistemasApresentados)).filter(
    (s) => !["nenhum", "nao", "não", "não haverá", "nao havera"].includes(s.toLowerCase())
  );

  const hasComercialOuVendas = departamentosList.some((dep) => /comercial|vendas|venda/i.test(dep));
  const hasAtendimento = departamentosList.some((dep) => /atendimento|suporte|cliente|relacionamento/i.test(dep));
  const hasAdministrativo = departamentosList.some((dep) => /administr|adm|financeir|contab/i.test(dep));

  // Build Schedule Table Items
  type ScheduleRow = {
    horario: string;
    atividade: string;
    responsavel: string;
  };

  const scheduleRows: ScheduleRow[] = [];

  // Morning Block
  scheduleRows.push({
    horario: "08h00–08h15",
    atividade: "Boas-vindas institucionais + Apresentação de Missão, Visão e Valores",
    responsavel: facilitadores,
  });

  scheduleRows.push({
    horario: "08h15–08h20",
    atividade: "Vídeo Institucional: Boas-vindas da Liderança / CEO",
    responsavel: facilitadores,
  });

  if (hasAtendimento || (!hasComercialOuVendas && !hasAdministrativo)) {
    scheduleRows.push({
      horario: "08h20–08h50",
      atividade: "Módulo Atendimento: Jornada do Cliente / Aluno & Encantamento",
      responsavel: facilitadores,
    });
    scheduleRows.push({
      horario: "08h50–09h30",
      atividade: "Comunicação Eficaz: Escuta Ativa, Empatia e Resolução de Problemas",
      responsavel: facilitadores,
    });
    scheduleRows.push({
      horario: "09h30–10h00",
      atividade: "Gestão de Objeções: Técnica LAER (Listar, Acolher, Explicar, Resolver)",
      responsavel: facilitadores,
    });
  }

  if (hasComercialOuVendas) {
    scheduleRows.push({
      horario: "10h00–10h15",
      atividade: "Vídeo de Apoio: Atendimento e Vendas com Foco em Excelência",
      responsavel: facilitadores,
    });
    scheduleRows.push({
      horario: "10h15–11h00",
      atividade: "Módulo Vendas: Venda Consultiva (Método SPIN Selling)",
      responsavel: facilitadores,
    });
    scheduleRows.push({
      horario: "11h00–11h45",
      atividade: "Gatilhos Mentais e Argumentação Estratégica",
      responsavel: facilitadores,
    });
  } else if (!hasAtendimento) {
    scheduleRows.push({
      horario: "09h00–10h30",
      atividade: `Módulo Departamental: Rotinas e Processos Chave (${temasList.slice(0, 3).join(", ") || departamentosStr})`,
      responsavel: facilitadores,
    });
    scheduleRows.push({
      horario: "10h30–11h45",
      atividade: "Boas Práticas de Trabalho, Qualidade e Fluxos Internos",
      responsavel: facilitadores,
    });
  }

  scheduleRows.push({
    horario: "11h45–12h00",
    atividade: "Síntese do Período da Manhã e Alinhamento de Aprendizados",
    responsavel: facilitadores,
  });

  // Afternoon Block (if duration has afternoon)
  if (duration.afternoonHours > 0 || duration.totalHours >= 4) {
    if (hasComercialOuVendas || hasAtendimento) {
      scheduleRows.push({
        horario: "13h00–13h45",
        atividade: "Prática de Fechamento, Apresentação de Valor e Tratamento de Objeções",
        responsavel: facilitadores,
      });
      scheduleRows.push({
        horario: "13h45–14h30",
        atividade: "Integração Interdepartamental: Alinhamento entre Áreas e Experiência do Cliente",
        responsavel: facilitadores,
      });
    } else {
      scheduleRows.push({
        horario: "13h00–14h00",
        atividade: "Aplicação Prática Orientada e Simulação de Rotinas Operacionais",
        responsavel: facilitadores,
      });
      scheduleRows.push({
        horario: "14h00–14h30",
        atividade: "Fluxos de Comunicação e Resolução de Demandas",
        responsavel: facilitadores,
      });
    }

    if (sistemasList.length > 0) {
      scheduleRows.push({
        horario: "14h30–15h00",
        atividade: `Treinamento de Sistemas: ${sistemasList.join(", ")}`,
        responsavel: facilitadores,
      });
    }

    scheduleRows.push({
      horario: "15h00–15h30",
      atividade: `Apresentação dos Documentos Oficiais: ${documentosList.join(", ") || "Manuais e Políticas"}`,
      responsavel: facilitadores,
    });

    scheduleRows.push({
      horario: "15h30–16h00",
      atividade: "Fechamento, Esclarecimento de Dúvidas, Próximos Passos e Avaliação",
      responsavel: facilitadores,
    });
  } else {
    scheduleRows.push({
      horario: "12h00–12h30",
      atividade: "Fechamento, Documentação de Apoio e Próximos Passos",
      responsavel: facilitadores,
    });
  }

  return `
<style>
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
  .onboarding-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
  }
  .onboarding-table th, .onboarding-table td {
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    text-align: left;
    font-size: 13px;
  }
  .onboarding-table th {
    background-color: #f8fafc !important;
    color: #0f172a;
    font-weight: 700;
  }
</style>

<section style="background:#ffffff; border-radius:16px; padding:32px; color:#334155; margin-bottom:24px; font-family: system-ui, -apple-system, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">

  <!-- CAPA / CABEÇALHO DO RELATÓRIO -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; border-radius: 14px; padding: 32px 24px; color: #ffffff !important; text-align: center; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(15,23,42,0.15); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; margin: 0 0 8px; font-weight:600; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Onboarding Estratégico & Integração Corporativa</p>
    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #ffffff !important; letter-spacing: -0.5px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Roteiro de Integração Personalizado</h1>
    <p style="font-size: 14px; color: #cbd5e1 !important; margin: 0 0 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Perfil: ${escapeHtml(nivel)} (${escapeHtml(quantidade)} participantes) • Departamentos: ${escapeHtml(departamentosStr)} • Gerado em ${dateStr}</p>
    <div style="display: inline-block; background: #0284c7 !important; color: #ffffff !important; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      Documento Oficial de Integração Estratégica
    </div>
  </div>

  <!-- METADADOS E IDENTIFICAÇÃO DO PROGRAMA -->
  <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:28px; display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Público-Alvo</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(nivel)} — ${escapeHtml(quantidade)} pessoas</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Departamentos</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(departamentosStr)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Duração Total</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(duration.display)}</strong></div>
    <div><span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Facilitadores</span><strong style="color:#0f172a; font-size:14px;">${escapeHtml(facilitadores)}</strong></div>
  </div>

  <!-- SEÇÃO 1: ALINHAMENTO CULTURAL -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">1. ALINHAMENTO CULTURAL</h2>
  <p style="margin:8px 0 16px 0; color:#64748b; font-size:14px;">Apresentação dos pilares estratégicos e da identidade da empresa para os novos colaboradores:</p>

  <div style="display:flex; flex-direction:column; gap:14px; margin-bottom:24px;">
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 8px 0;">08h00–08h15 | Boas-Vindas & Abertura Institucional</h3>
      <p style="margin:0 0 6px 0; font-size:13px; color:#64748b;"><strong>Facilitador(es):</strong> ${escapeHtml(facilitadores)}</p>
      <ul style="margin:6px 0 0 20px; padding:0; font-size:13px; color:#334155; line-height:1.6;">
        <li>Recepção e acolhimento dos ${escapeHtml(quantidade)} novos colaboradores.</li>
        <li>Apresentação dos facilitadores e agenda do dia.</li>
        <li><strong>Missão:</strong> “${escapeHtml(missao.replace(/[.!?]$/, ""))}”</li>
        <li><strong>Visão:</strong> “${escapeHtml(visao.replace(/[.!?]$/, ""))}”</li>
        <li><strong>Valores:</strong> ${valoresList.length ? valoresList.join(", ") : "Valores organizacionais da empresa"}.</li>
      </ul>
    </div>

    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 8px 0;">08h15–08h20 | Vídeo Institucional de Boas-Vindas</h3>
      <p style="margin:0; font-size:13px; color:#334155; line-height:1.5;">Exibição de vídeo oficial com mensagem da diretoria/CEO, contextualizando a história, conquistas e visão de futuro da empresa.</p>
    </div>
  </div>

  <!-- SEÇÃO 2: MÓDULOS DE CONTEÚDO E DEPARTAMENTOS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">2. MÓDULOS DE CONTEÚDO & CAPACITAÇÃO DEPARTAMENTAL</h2>
  <p style="margin:8px 0 16px 0; color:#64748b; font-size:14px;">Treinamento prático estruturado conforme os departamentos e temas priorizados:</p>

  <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:28px;">
    ${
      hasAtendimento || (!hasComercialOuVendas && !hasAdministrativo)
        ? `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
            <h3 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 12px 0;">Módulo de Atendimento & Experiência do Cliente</h3>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:13px; color:#334155;">
              <div>
                <strong style="color:#0f172a;">Jornada do Cliente / Aluno:</strong>
                <p style="margin:4px 0 0 0; line-height:1.5;">Apresentação dos 5 passos essenciais: <em>Atração ➔ Interesse ➔ Matrícula/Compra ➔ Experiência ➔ Indicação</em>. Mensagem central: <strong>Cada contato é uma oportunidade de encantar.</strong></p>
              </div>
              <div>
                <strong style="color:#0f172a;">Escuta Ativa e Empatia:</strong>
                <p style="margin:4px 0 0 0; line-height:1.5;">Metodologia: <em>Ouvir ➔ Validar ➔ Perguntar ➔ Resolver</em>. Foco em clareza, paciência e eliminação de ruídos de comunicação.</p>
              </div>
              <div>
                <strong style="color:#0f172a;">Gestão de Objeções (Técnica LAER):</strong>
                <p style="margin:4px 0 0 0; line-height:1.5;">Estrutura: <em>Listar ➔ Acolher ➔ Explicar ➔ Resolver</em>. Transformando dúvidas em segurança e fidelização.</p>
              </div>
            </div>
          </div>
        `
        : ""
    }

    ${
      hasComercialOuVendas
        ? `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
            <h3 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 12px 0;">Módulo de Vendas & Abordagem Consultiva</h3>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:13px; color:#334155;">
              <div>
                <strong style="color:#0f172a;">Venda Consultiva (Método SPIN):</strong>
                <p style="margin:4px 0 0 0; line-height:1.5;">Diagnóstico estruturado: <em>Situação ➔ Problema ➔ Implicação ➔ Necessidade de Solução</em>. Atuando como consultor de confiança e gerador de valor.</p>
              </div>
              <div>
                <strong style="color:#0f172a;">Gatilhos Mentais e Decisão de Compra:</strong>
                <p style="margin:4px 0 0 0; line-height:1.5;">Aplicação ética dos pilares: <em>Urgência, Escassez, Prova Social e Autoridade</em> para acelerar a decisão do cliente.</p>
              </div>
              <div>
                <strong style="color:#0f172a;">Apresentação de Preço e Fechamento:</strong>
                <p style="margin:4px 0 0 0; line-height:1.5;">Ancoragem de valor, fechamento alternativo (“Segunda ou quarta?”) e reversão de hesitações.</p>
              </div>
            </div>
          </div>
        `
        : ""
    }

    ${
      temasList.length && !hasComercialOuVendas && !hasAtendimento
        ? `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
            <h3 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 12px 0;">Temas Específicos Priorizados</h3>
            <ul style="margin:0 0 0 20px; padding:0; font-size:13px; color:#334155; line-height:1.6;">
              ${temasList.map((tema) => `<li>${escapeHtml(tema)}</li>`).join("")}
            </ul>
          </div>
        `
        : ""
    }
  </div>

  <!-- SEÇÃO 3: DOCUMENTAÇÃO DE APOIO & SISTEMAS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">3. DOCUMENTAÇÃO DE APOIO & SISTEMAS</h2>
  
  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-top:16px; margin-bottom:28px;">
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
      <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 12px 0; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">Documentos e Manuais de Apoio</h3>
      <ul style="margin:0 0 0 18px; padding:0; font-size:13px; color:#334155; line-height:1.6;">
        ${
          documentosList.length
            ? documentosList.map((doc) => `<li><strong>${escapeHtml(doc)}</strong></li>`).join("")
            : "<li>Código de Conduta do Colaborador</li><li>Manual de Integração</li>"
        }
      </ul>
    </div>

    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
      <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0 0 12px 0; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">Apresentação de Sistemas</h3>
      <p style="margin:0; font-size:13px; color:#334155; line-height:1.6;">
        ${
          sistemasList.length
            ? `Serão apresentados e treinados os seguintes sistemas: <strong>${escapeHtml(sistemasList.join(", "))}</strong>.`
            : "Não haverá apresentação de sistemas operacionais específicos durante esta integração presencial."
        }
      </p>
    </div>
  </div>

  <!-- SEÇÃO 4: CRONOGRAMA INTEGRADO -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">4. CRONOGRAMA INTEGRADO HORÁRIO A HORÁRIO</h2>
  <p style="margin:8px 0 16px 0; color:#64748b; font-size:14px;">Planejamento detalhado das atividades, horários e facilitadores responsáveis:</p>

  <table class="onboarding-table">
    <thead>
      <tr>
        <th style="width: 140px;">Horário</th>
        <th>Atividade / Módulo</th>
        <th style="width: 220px;">Responsável</th>
      </tr>
    </thead>
    <tbody>
      ${scheduleRows
        .map(
          (row) => `
            <tr>
              <td><strong style="color:#0284c7;">${escapeHtml(row.horario)}</strong></td>
              <td>${escapeHtml(row.atividade)}</td>
              <td>${escapeHtml(row.responsavel)}</td>
            </tr>
          `
        )
        .join("")}
    </tbody>
  </table>

  <!-- SEÇÃO 5: SÍNTESE DE RESULTADOS ESPERADOS -->
  <h2 style="font-size:18px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:32px;">5. RESULTADOS ESPERADOS AO FINAL DA INTEGRAÇÃO</h2>
  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:16px;">
    <p style="margin:0 0 10px 0; color:#0f172a; font-weight:700; font-size:14px;">Ao final deste programa, os novos colaboradores estarão preparados para:</p>
    <ul style="margin:0 0 0 20px; padding:0; font-size:13px; color:#334155; line-height:1.6;">
      <li>Compreender e vivenciar no dia a dia a <strong>Missão, Visão e Valores</strong> da empresa;</li>
      <li>Executar suas atividades com clareza quanto ao papel do seu departamento na jornada do cliente;</li>
      <li>Aplicar os padrões de qualidade, comunicação transparente e respeito às normas internas;</li>
      <li>Consultar e utilizar os manuais e documentações oficiais da organização (${documentosList.join(", ") || "Código de Conduta e Manuais"});</li>
      <li>Atuar com alinhamento operacional, integração com os colegas de equipe e foco em excelência de entrega.</li>
    </ul>
  </div>
</section>
  `.trim();
}
