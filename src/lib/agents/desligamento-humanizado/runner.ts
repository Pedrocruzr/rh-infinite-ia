import type { DesligamentoSession } from "./flow";

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

function normalizeLine(value: string) {
  return normalizeSentence(value).replace(/[.!?]$/, "");
}

function isNo(value?: string) {
  const text = String(value ?? "").trim().toLowerCase();
  return ["não", "nao", "n"].includes(text);
}

function formatDateLong(dateStr?: string) {
  const text = String(dateStr ?? "").trim();
  const m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return normalizeLine(text || "Não informado");

  let day = Number(m[1]);
  let month = Number(m[2]);
  let year = Number(m[3]);

  if (year < 100) year += 2000;

  const meses = [
    "janeiro","fevereiro","março","abril","maio","junho",
    "julho","agosto","setembro","outubro","novembro","dezembro"
  ];

  return `${day} de ${meses[month - 1] ?? "mês"} de ${year}`;
}

function motivoFrase(motivo?: string) {
  const text = String(motivo ?? "").trim();
  const lower = text.toLowerCase();

  if (/desempenho|performance|baixa performance|baixo desempenho/.test(lower)) {
    return "em função de avaliação de desempenho alinhada às necessidades atuais da posição";
  }

  if (/reestrutur/.test(lower)) {
    return "em função de reestruturação organizacional e alinhamento das necessidades atuais da empresa";
  }

  if (/t[eé]rmino|contrato|experi[eê]ncia/.test(lower)) {
    return "em função do encerramento previsto do vínculo contratual";
  }

  return `em função de ${text}`;
}

export function buildDesligamentoReport(session: DesligamentoSession) {
  const dateStr = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const empresa = normalizeLine(session.empresaNome ?? "Empresa não informada");
  const cnpj = normalizeLine(session.cnpj ?? "");
  const endereco = normalizeLine(session.endereco ?? "");
  const colaborador = normalizeLine(session.colaboradorNome ?? "Colaborador não informado");
  const cargo = normalizeLine(session.cargoAtual ?? "Cargo não informado");
  const departamento = normalizeLine(session.departamento ?? "Departamento não informado");
  const tempoEmpresa = normalizeLine(session.tempoEmpresa ?? "Tempo não informado");
  const contribuicoes = normalizeLine(session.contribuicoes ?? "Contribuições não informadas");
  const motivo = normalizeLine(session.motivoDesligamento ?? "Motivo não informado");
  const motivoCarta = motivoFrase(session.motivoDesligamento);
  const data = normalizeLine(session.dataDesligamento ?? "Data não informada");
  const dataLonga = formatDateLong(session.dataDesligamento);
  const avisoPrevio = normalizeLine(session.avisoPrevio ?? "Não informado");
  const beneficios = normalizeLine(session.beneficiosEstendidos ?? "Não informado");
  const ondeQuando = normalizeLine(session.ondeQuando ?? "Não informado");
  const recolocacao = normalizeLine(session.programaRecolocacao ?? "Não informado");

  const temRecolocacao = !isNo(session.programaRecolocacao) && recolocacao !== "Não informado";
  const temBeneficios = !isNo(session.beneficiosEstendidos) && beneficios !== "Não informado";

  let suporteTexto = "No momento, não haverá programa formal de recolocação nem benefícios adicionais estendidos, mas a empresa seguirá disponível para os esclarecimentos necessários durante todo o período de transição.";
  if (temRecolocacao && temBeneficios) {
    suporteTexto = `A empresa oferecerá suporte de recolocação profissional (${recolocacao}) e extensão de benefícios (${beneficios}) durante a transição.`;
  } else if (temRecolocacao) {
    suporteTexto = `A empresa disponibilizará suporte de recolocação profissional: ${recolocacao}.`;
  } else if (temBeneficios) {
    suporteTexto = `A empresa disponibilizará suporte adicional com extensão de benefícios: ${beneficios}.`;
  }

  const orientacaoLocal = /audit[oó]rio/i.test(ondeQuando)
    ? "Ambiente: evitar locais abertos ou auditórios. Priorize sala privativa e fechada para resguardar a dignidade, a confidencialidade e o acolhimento do profissional."
    : "Ambiente: conduzir em espaço privativo, neutro e confortável, garantindo total ausência de interrupções, telefonemas ou interferências externas.";

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
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; margin: 0 0 8px; font-weight:600; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Stacker de Encerramento • Protocolo e Governança Corporativa</p>
    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #ffffff !important; letter-spacing: -0.5px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Plano de Desligamento Humanizado &amp; Transição</h1>
    <p style="font-size: 14px; color: #cbd5e1 !important; margin: 0 0 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">Colaborador: ${escapeHtml(colaborador)} • Cargo: ${escapeHtml(cargo)} • ${escapeHtml(empresa)} • Emitido em ${dateStr}</p>
    <div style="display: inline-block; background: #0284c7 !important; color: #ffffff !important; padding: 8px 24px; border-radius: 20px; font-size: 13px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.2); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
      Protocolo Oficial de Condução e Documentação
    </div>
  </div>

  <!-- AVISO DE GOVERNANÇA / BOAS PRÁTICAS -->
  <div style="background: #f0f9ff !important; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 12px; padding: 14px 18px; margin-bottom: 28px; color: #0369a1; font-size: 13px; line-height: 1.6; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <strong>Diretriz Institucional:</strong> Este documento foi estruturado pelo Stacker de Encerramento para apoiar a liderança e o time de Recursos Humanos na condução de um processo de desligamento transparente, empático e juridicamente seguro, preservando o respeito à trajetória do profissional e a reputação da marca empregadora.
  </div>

  <!-- METADADOS E IDENTIFICAÇÃO DO PROCESSO -->
  <div style="background:#f8fafc !important; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:32px; display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
    <div>
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Colaborador</span>
      <strong style="color:#0f172a; font-size:14px;">${escapeHtml(colaborador)}</strong>
    </div>
    <div>
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Cargo &amp; Departamento</span>
      <strong style="color:#0f172a; font-size:14px;">${escapeHtml(cargo)} — ${escapeHtml(departamento)}</strong>
    </div>
    <div>
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Tempo de Empresa</span>
      <strong style="color:#0f172a; font-size:14px;">${escapeHtml(tempoEmpresa)}</strong>
    </div>
    <div>
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Data de Efetivação</span>
      <strong style="color:#0f172a; font-size:14px;">${escapeHtml(dataLonga)}</strong>
    </div>
    <div>
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Modalidade do Aviso</span>
      <strong style="color:#0f172a; font-size:14px;">${escapeHtml(avisoPrevio)}</strong>
    </div>
    <div>
      <span style="font-size:11px; text-transform:uppercase; color:#64748b; font-weight:600; display:block;">Organização</span>
      <strong style="color:#0f172a; font-size:14px;">${escapeHtml(empresa)}${cnpj ? ` (${escapeHtml(cnpj)})` : ""}</strong>
    </div>
  </div>

  <!-- SEÇÃO 1: ROTEIRO ESTRUTURADO DE CONVERSA -->
  <h2 style="font-size:18px; font-weight:700; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:36px; margin-bottom:12px;">1. Roteiro Estruturado para Condução da Conversa</h2>
  <p style="margin:0 0 20px 0; color:#64748b; font-size:14px; line-height:1.6;">Roteiro em 7 etapas progressivas para guiar o condutor com clareza, empatia e assertividade, minimizando desgastes e ruídos de comunicação:</p>

  <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:32px;">

    <!-- 1.1 Abertura -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #0284c7; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">1.1 Abertura Direta e Transparente</h3>
        <span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 10px; border-radius:12px; text-transform:uppercase;">Etapa 1</span>
      </div>
      <p style="margin:0 0 10px 0; font-size:13px; color:#64748b; line-height:1.5;">Vá direto ao ponto nos primeiros 60 segundos com tom tranquilo e respeitoso, sem rodeios desnecessários.</p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; font-size:13.5px; color:#1e293b; line-height:1.6; font-style:italic;">
        “${escapeHtml(colaborador)}, obrigado por reservar este momento. Esta não é uma conversa fácil, mas precisamos comunicar que a empresa decidiu encerrar seu vínculo de trabalho, com efetivação prevista para ${escapeHtml(dataLonga)}.”
      </div>
    </div>

    <!-- 1.2 Explicação -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #0284c7; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">1.2 Motivo e Alinhamento Estratégico</h3>
        <span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 10px; border-radius:12px; text-transform:uppercase;">Etapa 2</span>
      </div>
      <p style="margin:0 0 10px 0; font-size:13px; color:#64748b; line-height:1.5;">Apresente a justificativa com sobriedade corporativa. Não transforme a reunião em uma sessão de avaliação de desempenho.</p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; font-size:13.5px; color:#1e293b; line-height:1.6; font-style:italic;">
        “Esta decisão está relacionada a ${escapeHtml(motivo.toLowerCase())}, levando em conta o atual ciclo da organização e as diretrizes estratégicas estabelecidas para a área.”
      </div>
    </div>

    <!-- 1.3 Reconhecimento -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #0284c7; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">1.3 Reconhecimento e Gratidão</h3>
        <span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 10px; border-radius:12px; text-transform:uppercase;">Etapa 3</span>
      </div>
      <p style="margin:0 0 10px 0; font-size:13px; color:#64748b; line-height:1.5;">Destaque as entregas reais e a dedicação do colaborador ao longo do período em que fez parte da organização.</p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; font-size:13.5px; color:#1e293b; line-height:1.6; font-style:italic;">
        “Queremos registrar e agradecer formalmente pela sua dedicação ao longo dos ${escapeHtml(tempoEmpresa)} em que esteve conosco, especialmente pelo trabalho desenvolvido em ${escapeHtml(contribuicoes.toLowerCase())}. Sua atuação foi fundamental para a história da nossa equipe.”
      </div>
    </div>

    <!-- 1.4 Informações Práticas -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #0284c7; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">1.4 Informações Práticas e Trâmites Rescisórios</h3>
        <span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 10px; border-radius:12px; text-transform:uppercase;">Etapa 4</span>
      </div>
      <p style="margin:0 0 10px 0; font-size:13px; color:#64748b; line-height:1.5;">Forneça clareza imediata sobre aviso prévio, prazos legais e suporte operacional do time de Recursos Humanos.</p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; font-size:13.5px; color:#1e293b; line-height:1.6; font-style:italic;">
        “Em relação aos procedimentos formais, o aviso prévio será ${escapeHtml(avisoPrevio.toLowerCase())}. O setor de Recursos Humanos entrará em contato detalhando o cronograma rescisório, cálculo de verbas, documentação, homologação e instruções sobre devolução de equipamentos.”
      </div>
    </div>

    <!-- 1.5 Suporte e Acolhimento -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #0284c7; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">1.5 Suporte, Benefícios e Acolhimento</h3>
        <span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 10px; border-radius:12px; text-transform:uppercase;">Etapa 5</span>
      </div>
      <p style="margin:0 0 10px 0; font-size:13px; color:#64748b; line-height:1.5;">Apresente os apoios complementares acordados pela empresa para suavizar o período de transição de carreira.</p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; font-size:13.5px; color:#1e293b; line-height:1.6; font-style:italic;">
        “${escapeHtml(suporteTexto)}”
      </div>
    </div>

    <!-- 1.6 Espaço para Escuta -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #0284c7; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">1.6 Espaço para Escuta e Validação Emocional</h3>
        <span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 10px; border-radius:12px; text-transform:uppercase;">Etapa 6</span>
      </div>
      <p style="margin:0 0 10px 0; font-size:13px; color:#64748b; line-height:1.5;">Permita que o profissional assimile a informação, fale ou faça perguntas. Pratique a escuta ativa sem contra-argumentar.</p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; font-size:13.5px; color:#1e293b; line-height:1.6; font-style:italic;">
        “Gostaria de abrir um espaço para você caso queira fazer alguma colocação ou tirar dúvidas imediatas. Compreendemos que este é um momento delicado e respeitamos seus sentimentos.”
      </div>
    </div>

    <!-- 1.7 Encerramento -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #0284c7; border-radius:12px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h3 style="font-size:15px; font-weight:700; color:#0f172a; margin:0;">1.7 Encerramento e Encaminhamento ao RH</h3>
        <span style="font-size:11px; font-weight:700; color:#0284c7; background:#e0f2fe; padding:2px 10px; border-radius:12px; text-transform:uppercase;">Etapa 7</span>
      </div>
      <p style="margin:0 0 10px 0; font-size:13px; color:#64748b; line-height:1.5;">Finalize o encontro com votos sinceros de sucesso e oriente o encaminhamento ao ponto de apoio interno.</p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; font-size:13.5px; color:#1e293b; line-height:1.6; font-style:italic;">
        “Mais uma vez, nosso muito obrigado por tudo o que construímos juntos. Desejamos pleno sucesso nos seus próximos desafios profissionais e permanecemos à disposição.”
      </div>
    </div>

  </div>

  <!-- SEÇÃO 2: CARTA FORMAL DE DESLIGAMENTO -->
  <h2 style="font-size:18px; font-weight:700; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:36px; margin-bottom:12px;">2. Carta Formal de Comunicação de Desligamento</h2>
  <p style="margin:0 0 20px 0; color:#64748b; font-size:14px; line-height:1.6;">Minuta oficial para emissão em papel timbrado ou via canal corporativo, em conformidade com as exigências formais trabalhistas:</p>

  <div style="background:#fafafa !important; border:1px solid #cbd5e1; border-radius:14px; padding:32px 28px; margin-bottom:32px; font-size:14px; line-height:1.8; color:#1e293b; box-shadow:0 2px 8px rgba(0,0,0,0.04); -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">

    <!-- Cabeçalho da Carta -->
    <div style="border-bottom:1px solid #e2e8f0; padding-bottom:18px; margin-bottom:22px;">
      <p style="margin:0 0 4px 0; font-size:16px; font-weight:700; color:#0f172a; text-transform:uppercase;">${escapeHtml(empresa)}</p>
      ${cnpj ? `<p style="margin:0 0 4px 0; font-size:13px; color:#475569;">CNPJ: ${escapeHtml(cnpj)}</p>` : ""}
      ${endereco ? `<p style="margin:0 0 4px 0; font-size:13px; color:#475569;">Endereço: ${escapeHtml(endereco)}</p>` : ""}
      <p style="margin:12px 0 0 0; font-size:13px; color:#64748b;">Data de Emissão: ${escapeHtml(dataLonga)}</p>
    </div>

    <!-- Destinatário -->
    <div style="margin-bottom:22px;">
      <p style="margin:0; font-size:13px; color:#64748b; text-transform:uppercase; font-weight:600;">Destinatário:</p>
      <p style="margin:4px 0 0 0; font-size:15px; font-weight:700; color:#0f172a;">${escapeHtml(colaborador)}</p>
      <p style="margin:2px 0 0 0; font-size:13px; color:#475569;">${escapeHtml(cargo)} — Departamento de ${escapeHtml(departamento)}</p>
    </div>

    <!-- Assunto -->
    <div style="background:#f1f5f9; border-left:3px solid #0f172a; padding:10px 14px; margin-bottom:22px; font-weight:700; color:#0f172a;">
      Assunto: Comunicação Formal de Encerramento de Contrato de Trabalho
    </div>

    <!-- Corpo do Texto -->
    <p style="margin:0 0 14px 0;">Prezado(a) <strong>${escapeHtml(colaborador)}</strong>,</p>

    <p style="margin:0 0 14px 0; text-align:justify;">
      Comunicamos, por meio deste instrumento, a decisão de rescindir o contrato de trabalho mantido com esta organização, com término efetivo previsto para o dia <strong>${escapeHtml(dataLonga)}</strong>, ${escapeHtml(motivoCarta)}.
    </p>

    <p style="margin:0 0 14px 0; text-align:justify;">
      Agradecemos expressamente por todo o profissionalismo, colaboração e dedicação demonstrados ao longo dos <strong>${escapeHtml(tempoEmpresa)}</strong> em que você integrou nossa equipe. Reconhecemos com distinção sua contribuição para o desenvolvimento dos projetos e rotinas da área, em especial no tocante a <strong>${escapeHtml(contribuicoes.toLowerCase())}</strong>.
    </p>

    <p style="margin:0 0 14px 0; text-align:justify;">
      Informamos que a modalidade do aviso prévio será <strong>${escapeHtml(avisoPrevio.toLowerCase())}</strong>, conforme os parâmetros previstos pela legislação trabalhista vigente. O setor de Recursos Humanos prestará todo o suporte necessário quanto à homologação, detalhamento de haveres rescisórios, guias documentais e agendamento de exame demissional.
    </p>

    <p style="margin:0 0 18px 0; text-align:justify;">
      ${escapeHtml(isNo(session.programaRecolocacao) && isNo(session.beneficiosEstendidos)
        ? "Reiteramos nossos canais de Recursos Humanos abertos para esclarecer quaisquer dúvidas durante este período de transição."
        : `A empresa também disponibilizará suporte complementar durante esta fase: ${temRecolocacao ? recolocacao : ""} ${temBeneficios ? beneficios : ""}.`)}
    </p>

    <p style="margin:0 0 32px 0;">
      Desejamos pleno sucesso e realizações na continuidade de sua trajetória profissional.
    </p>

    <!-- Linhas de Assinatura -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:32px; margin-top:40px; padding-top:20px; border-top:1px solid #e2e8f0;">
      <div>
        <div style="border-top:1px solid #0f172a; margin-top:40px; padding-top:8px;">
          <p style="margin:0; font-size:13px; font-weight:700; color:#0f172a;">${escapeHtml(empresa)}</p>
          <p style="margin:2px 0 0 0; font-size:12px; color:#64748b;">Representante Legal / Recursos Humanos</p>
        </div>
      </div>

      <div>
        <div style="border-top:1px solid #0f172a; margin-top:40px; padding-top:8px;">
          <p style="margin:0; font-size:13px; font-weight:700; color:#0f172a;">Ciente em: ____ / ____ / ________</p>
          <p style="margin:2px 0 0 0; font-size:12px; color:#64748b;">Assinatura do(a) Colaborador(a): ${escapeHtml(colaborador)}</p>
        </div>
      </div>
    </div>

  </div>

  <!-- SEÇÃO 3: PROTOCOLO E ORIENTAÇÕES COMPLEMENTARES -->
  <h2 style="font-size:18px; font-weight:700; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-top:36px; margin-bottom:12px;">3. Protocolo de Condução e Recomendações Estratégicas</h2>
  <p style="margin:0 0 20px 0; color:#64748b; font-size:14px; line-height:1.6;">Orientações executivas para os líderes e profissionais responsáveis pela condução do processo:</p>

  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-bottom:28px;">

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
      <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:0.5px;">Ambiente &amp; Privacidade</h3>
      <p style="margin:0; font-size:13px; color:#475569; line-height:1.6;">${escapeHtml(orientacaoLocal)}</p>
    </div>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
      <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:0.5px;">Agendamento Estratégico</h3>
      <p style="margin:0; font-size:13px; color:#475569; line-height:1.6;">Momento previsto: <strong>${escapeHtml(ondeQuando)}</strong>. Recomenda-se realizar reuniões de desligamento no início do dia e entre terça e quinta-feira, evitando finais de expediente ou vésperas de fins de semana.</p>
    </div>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
      <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:0.5px;">Gestão Emocional</h3>
      <p style="margin:0; font-size:13px; color:#475569; line-height:1.6;">Mantenha uma postura neutra, empática e acolhedora. Valide sentimentos sem entrar em justificativas extensas ou debates defensivos.</p>
    </div>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
      <h3 style="font-size:14px; font-weight:700; color:#0f172a; margin:0 0 8px 0; text-transform:uppercase; letter-spacing:0.5px;">Comunicação com a Equipe</h3>
      <p style="margin:0; font-size:13px; color:#475569; line-height:1.6;">Comunique o time logo após a conversa de forma breve e transparente, agradecendo o profissional publicamente e alinhando os pontos de contato temporários.</p>
    </div>

  </div>

  <!-- RODAPÉ INSTITUCIONAL -->
  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px 20px; font-size:11px; color:#64748b; text-align:center; margin-top:36px;">
    Stackers System • Protocolo de Encerramento Humanizado • Documento Estritamente Confidencial
  </div>

</section>
`;
}
