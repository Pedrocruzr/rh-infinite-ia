import type { OnboardingSession } from "./flow";

type DynamicInfo = {
  nome: string;
  categoria: string;
  objetivo: string;
  comoFunciona: string;
  materiais: string;
  tempo: string;
};

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const DYNAMIC_DETAILS: Record<string, DynamicInfo> = {
  "Pitch de 1 Minuto": {
    nome: "Pitch de 1 Minuto",
    categoria: "Comunicação",
    objetivo: "Estimular clareza, concisão e segurança na fala.",
    comoFunciona: "Cada participante recebe 1 minuto para se apresentar ou defender uma ideia sobre um tema proposto, com foco em objetividade e estrutura.",
    materiais: "Cronômetro e tema orientador.",
    tempo: "15 a 20 minutos.",
  },
  "Telefone sem Fio Profissional": {
    nome: "Telefone sem Fio Profissional",
    categoria: "Comunicação",
    objetivo: "Mostrar ruídos na transmissão de mensagens e reforçar a importância da comunicação clara.",
    comoFunciona: "Uma mensagem é passada entre os participantes e depois comparada com a versão original para análise dos ruídos.",
    materiais: "Mensagem escrita e espaço para discussão.",
    tempo: "15 a 20 minutos.",
  },
  "Explicando um Objeto Misterioso": {
    nome: "Explicando um Objeto Misterioso",
    categoria: "Comunicação",
    objetivo: "Treinar descrição, didática e organização verbal.",
    comoFunciona: "Cada participante explica um objeto ou conceito sem mostrar diretamente o item, exigindo clareza e lógica na exposição.",
    materiais: "Objetos simples ou cartões com conceitos.",
    tempo: "20 a 25 minutos.",
  },
  "Torre de Papel A4": {
    nome: "Torre de Papel A4",
    categoria: "Trabalho em Equipe",
    objetivo: "Estimular cooperação, planejamento e execução em grupo.",
    comoFunciona: "O grupo deve construir a torre mais alta possível com folhas A4 dentro do tempo proposto.",
    materiais: "Folhas A4 e fita adesiva.",
    tempo: "20 a 30 minutos.",
  },
  "Ponte de Palitos": {
    nome: "Ponte de Palitos",
    categoria: "Trabalho em Equipe",
    objetivo: "Desenvolver coordenação, divisão de tarefas e solução coletiva de problemas.",
    comoFunciona: "Os participantes montam uma ponte simples com palitos, respeitando tempo e critérios definidos.",
    materiais: "Palitos, fita e superfície de apoio.",
    tempo: "30 a 40 minutos.",
  },
  "Quebra-Cabeça Misto": {
    nome: "Quebra-Cabeça Misto",
    categoria: "Trabalho em Equipe",
    objetivo: "Reforçar interdependência, comunicação e organização do time.",
    comoFunciona: "O grupo recebe partes misturadas de um quebra-cabeça e precisa se organizar para concluir a atividade em conjunto.",
    materiais: "Peças impressas ou cartões recortados.",
    tempo: "20 a 30 minutos.",
  },
  "Delegação Relâmpago": {
    nome: "Delegação Relâmpago",
    categoria: "Liderança",
    objetivo: "Trabalhar delegação, priorização e condução de equipe.",
    comoFunciona: "Um participante assume a liderança da atividade e precisa distribuir tarefas de forma rápida e coerente.",
    materiais: "Cartões com tarefas ou mini desafio.",
    tempo: "20 a 30 minutos.",
  },
  "Porta-Voz do Grupo": {
    nome: "Porta-Voz do Grupo",
    categoria: "Liderança",
    objetivo: "Estimular liderança situacional e representação de equipe.",
    comoFunciona: "O grupo discute um tema e um participante representa a síntese final diante dos demais.",
    materiais: "Tema ou problema orientador.",
    tempo: "15 a 25 minutos.",
  },
  "Reunião Stand-up Simulada": {
    nome: "Reunião Stand-up Simulada",
    categoria: "Liderança",
    objetivo: "Treinar organização de fala, direção de reunião e foco em entregas.",
    comoFunciona: "Os participantes simulam uma reunião rápida de alinhamento com pauta, prioridades e encaminhamentos.",
    materiais: "Roteiro simples de reunião.",
    tempo: "20 a 30 minutos.",
  },
  "Usos Alternativos": {
    nome: "Usos Alternativos",
    categoria: "Criatividade",
    objetivo: "Estimular pensamento divergente e geração rápida de ideias.",
    comoFunciona: "Os participantes precisam sugerir usos alternativos para um objeto comum dentro de um tempo curto.",
    materiais: "Objeto simples ou imagem.",
    tempo: "15 a 20 minutos.",
  },
  "Slogan Relâmpago": {
    nome: "Slogan Relâmpago",
    categoria: "Criatividade",
    objetivo: "Estimular síntese criativa e construção de mensagem.",
    comoFunciona: "O grupo cria slogans curtos para uma situação ou produto fictício ligado ao contexto do trabalho.",
    materiais: "Tema orientador.",
    tempo: "15 a 20 minutos.",
  },
  "Desenhe um Conceito": {
    nome: "Desenhe um Conceito",
    categoria: "Criatividade",
    objetivo: "Trabalhar criatividade visual e interpretação de ideias.",
    comoFunciona: "Os participantes desenham um conceito abstrato e depois explicam o raciocínio usado.",
    materiais: "Papel e canetas.",
    tempo: "20 a 25 minutos.",
  },
  "Sequência que Falta": {
    nome: "Sequência que Falta",
    categoria: "Raciocínio Lógico",
    objetivo: "Estimular análise, atenção e identificação de padrões.",
    comoFunciona: "Os participantes resolvem sequências lógicas e explicam o raciocínio utilizado.",
    materiais: "Folhas com exercícios.",
    tempo: "15 a 25 minutos.",
  },
  "Problema de Alocação": {
    nome: "Problema de Alocação",
    categoria: "Raciocínio Lógico",
    objetivo: "Treinar organização mental e solução estruturada de problemas.",
    comoFunciona: "O grupo recebe um problema de distribuição de recursos e precisa chegar a uma solução coerente.",
    materiais: "Caso escrito e quadro de apoio.",
    tempo: "25 a 35 minutos.",
  },
  "Caso Analítico": {
    nome: "Caso Analítico",
    categoria: "Raciocínio Lógico",
    objetivo: "Desenvolver interpretação, análise de cenário e tomada de decisão.",
    comoFunciona: "Os participantes analisam um caso curto e propõem uma solução com justificativa lógica.",
    materiais: "Caso impresso.",
    tempo: "30 a 40 minutos.",
  },
  "Quem Se Oferece?": {
    nome: "Quem Se Oferece?",
    categoria: "Proatividade",
    objetivo: "Observar iniciativa e disposição para agir sem depender de comando constante.",
    comoFunciona: "O facilitador apresenta pequenas demandas e observa quem se antecipa para propor ou executar soluções.",
    materiais: "Situações curtas simuladas.",
    tempo: "15 a 20 minutos.",
  },
  "Melhorias em 5 Minutos": {
    nome: "Melhorias em 5 Minutos",
    categoria: "Proatividade",
    objetivo: "Estimular visão de melhoria contínua e atitude prática.",
    comoFunciona: "Os participantes recebem um cenário simples e sugerem melhorias rápidas e viáveis.",
    materiais: "Caso breve ou processo simplificado.",
    tempo: "15 a 20 minutos.",
  },
  "Plano Relâmpago": {
    nome: "Plano Relâmpago",
    categoria: "Proatividade",
    objetivo: "Treinar capacidade de agir rápido com organização.",
    comoFunciona: "Diante de um desafio, o participante propõe um mini plano de ação com etapas imediatas.",
    materiais: "Situação problema.",
    tempo: "15 a 20 minutos.",
  },
  "Meus 3 Valores": {
    nome: "Meus 3 Valores",
    categoria: "Fit Cultural",
    objetivo: "Identificar valores pessoais e comparar com a cultura esperada no ambiente de trabalho.",
    comoFunciona: "Cada participante escolhe 3 valores que considera inegociáveis no trabalho, explica por que os escolheu e relaciona esses valores com a cultura da empresa.",
    materiais: "Lista de valores, papel e caneta.",
    tempo: "20 a 30 minutos.",
  },
  "Orgulho Profissional": {
    nome: "Orgulho Profissional",
    categoria: "Fit Cultural",
    objetivo: "Explorar significados de pertencimento, entrega e conexão com o trabalho.",
    comoFunciona: "Os participantes compartilham uma situação profissional da qual se orgulham e refletem sobre quais comportamentos e valores estavam presentes naquela experiência.",
    materiais: "Roteiro de reflexão e espaço para compartilhamento.",
    tempo: "20 a 30 minutos.",
  },
  "Dilema Ético": {
    nome: "Dilema Ético",
    categoria: "Fit Cultural",
    objetivo: "Observar coerência de decisão, senso ético e aderência à cultura organizacional.",
    comoFunciona: "O grupo analisa um cenário com dilema ético e discute qual decisão seria mais coerente com os valores da organização.",
    materiais: "Caso escrito com dilema e perguntas de apoio.",
    tempo: "25 a 35 minutos.",
  },
  "Tempo Curtíssimo": {
    nome: "Tempo Curtíssimo",
    categoria: "Resiliência e Estresse",
    objetivo: "Observar reação a pressão e capacidade de manter foco sob limite de tempo.",
    comoFunciona: "A atividade impõe prazo muito curto para uma tarefa simples, exigindo equilíbrio, organização e adaptação.",
    materiais: "Desafio rápido e cronômetro.",
    tempo: "15 a 20 minutos.",
  },
  "Interrupções Planejadas": {
    nome: "Interrupções Planejadas",
    categoria: "Resiliência e Estresse",
    objetivo: "Avaliar flexibilidade e estabilidade emocional diante de interrupções.",
    comoFunciona: "Durante a execução de uma tarefa, o facilitador cria interrupções controladas para observar como o participante retoma o foco.",
    materiais: "Atividade simples e roteiro de interrupções.",
    tempo: "20 a 25 minutos.",
  },
  "Erro no Enunciado": {
    nome: "Erro no Enunciado",
    categoria: "Resiliência e Estresse",
    objetivo: "Trabalhar tolerância à frustração e capacidade de reagir de forma construtiva.",
    comoFunciona: "O grupo recebe um enunciado com falha proposital e precisa lidar com o erro sem perder a postura analítica.",
    materiais: "Caso com falha proposital.",
    tempo: "20 a 30 minutos.",
  },
  "Matriz Urgente x Importante": {
    nome: "Matriz Urgente x Importante",
    categoria: "Organização e Tempo",
    objetivo: "Desenvolver priorização e gestão de tempo.",
    comoFunciona: "Os participantes classificam tarefas em urgente/importante e justificam a ordem de priorização.",
    materiais: "Lista de tarefas e matriz impressa.",
    tempo: "20 a 30 minutos.",
  },
  "Planeje Seu Dia": {
    nome: "Planeje Seu Dia",
    categoria: "Organização e Tempo",
    objetivo: "Trabalhar planejamento de rotina e distribuição de esforço.",
    comoFunciona: "O participante organiza uma agenda de trabalho a partir de tarefas, prazos e imprevistos simulados.",
    materiais: "Agenda modelo e lista de demandas.",
    tempo: "20 a 30 minutos.",
  },
  "Priorize o Backlog": {
    nome: "Priorize o Backlog",
    categoria: "Organização e Tempo",
    objetivo: "Treinar análise de prioridade e capacidade de ordenar demandas.",
    comoFunciona: "O grupo recebe várias tarefas e precisa decidir a sequência mais lógica de execução.",
    materiais: "Cartões com tarefas.",
    tempo: "20 a 30 minutos.",
  },
  "Barganha de Mercado": {
    nome: "Barganha de Mercado",
    categoria: "Negociação e Persuasão",
    objetivo: "Treinar argumentação, escuta e construção de acordo.",
    comoFunciona: "Dois participantes negociam condições de uma situação fictícia, buscando equilíbrio entre interesses e limites.",
    materiais: "Roteiro de negociação.",
    tempo: "20 a 30 minutos.",
  },
  "Ganha-Ganha com Limites": {
    nome: "Ganha-Ganha com Limites",
    categoria: "Negociação e Persuasão",
    objetivo: "Estimular negociação equilibrada e pensamento estratégico.",
    comoFunciona: "O grupo trabalha um cenário em que precisa defender interesses sem romper a lógica de colaboração.",
    materiais: "Caso de negociação.",
    tempo: "25 a 35 minutos.",
  },
  "Defenda seu Orçamento": {
    nome: "Defenda seu Orçamento",
    categoria: "Negociação e Persuasão",
    objetivo: "Trabalhar persuasão com base em argumentos e prioridades.",
    comoFunciona: "Cada participante precisa justificar por que determinado orçamento ou recurso deve ser priorizado.",
    materiais: "Situação simulada de decisão.",
    tempo: "20 a 30 minutos.",
  },
  "Escuta Refletida": {
    nome: "Escuta Refletida",
    categoria: "Empatia e Escuta",
    objetivo: "Treinar escuta ativa, compreensão e devolutiva respeitosa.",
    comoFunciona: "Um participante relata uma situação e o outro precisa reformular o que entendeu antes de responder.",
    materiais: "Roteiro de conversa em dupla.",
    tempo: "15 a 25 minutos.",
  },
  "Paráfrase em 3 Passos": {
    nome: "Paráfrase em 3 Passos",
    categoria: "Empatia e Escuta",
    objetivo: "Desenvolver compreensão antes de responder ou argumentar.",
    comoFunciona: "O participante escuta um relato, parafraseia a mensagem e só depois propõe encaminhamento.",
    materiais: "Casos curtos de interação.",
    tempo: "15 a 20 minutos.",
  },
  "Mapa de Empatia": {
    nome: "Mapa de Empatia",
    categoria: "Empatia e Escuta",
    objetivo: "Trabalhar compreensão de perspectiva, contexto e necessidade do outro.",
    comoFunciona: "O grupo constrói um mapa de empatia com foco no perfil de uma pessoa ou situação específica do trabalho.",
    materiais: "Modelo de mapa de empatia, post-its e canetas.",
    tempo: "25 a 35 minutos.",
  },
};

const SYSTEM_LABELS: Record<string, string> = {
  "crm": "CRM",
  "crm corporativo": "CRM Corporativo",
  "power bi": "Planilhas Power BI",
  "planilhas power bi": "Planilhas Power BI",
  "sistema de atendimento": "Sistema de Atendimento",
  "e-mail corporativo": "E-mail corporativo",
  "email corporativo": "E-mail corporativo",
  "portal rh": "Portal RH",
  "sistema erp": "Sistema ERP",
  "intranet corporativa": "Intranet Corporativa",
  "plataforma de treinamentos": "Plataforma de Treinamentos",
};

const MATERIALS_BASE: Record<string, string> = {
  "Manual do Colaborador": "Manual do Colaborador — PDF com informações essenciais sobre empresa, benefícios e políticas.",
  "Guia Rápido de Sistemas": "Guia Rápido de Sistemas — PDF interativo com instruções básicas dos principais sistemas corporativos.",
  "Glossário Técnico": "Glossário Técnico — documento com termos e conceitos utilizados nas rotinas da empresa.",
  "Fluxogramas de Processos": "Fluxogramas de Processos — apresentação com visualização dos principais fluxos de trabalho da empresa.",
};

function applyPortugueseCorrections(text: string) {
  let value = String(text ?? "").trim().replace(/\s+/g, " ");

  const replacements: Array<[RegExp, string]> = [
    [/\bmanha\b/gi, "manhã"],
    [/\btarde\b/gi, "tarde"],
    [/\bvisao\b/gi, "visão"],
    [/\bmissao\b/gi, "missão"],
    [/\betica\b/gi, "ética"],
    [/\bexcelencia\b/gi, "excelência"],
    [/\binovacao\b/gi, "inovação"],
    [/\bpublico\b/gi, "público"],
    [/\btelefonico\b/gi, "telefônico"],
    [/\brelatorios\b/gi, "relatórios"],
    [/\bcontabeis\b/gi, "contábeis"],
    [/\bservicos\b/gi, "serviços"],
    [/\btecnico\b/gi, "técnico"],
    [/\bgestao\b/gi, "gestão"],
    [/\borganizacao\b/gi, "organização"],
    [/\bcodigo\b/gi, "código"],
    [/\bconduta\b/gi, "conduta"],
    [/\bbenvidos\b/gi, "bem-vindos"],
    [/\bbem vindos\b/gi, "bem-vindos"],
    [/\bcomunicacao\b/gi, "comunicação"],
    [/\bboas vindas\b/gi, "boas-vindas"],
    [/\bemail\b/gi, "e-mail"],
    [/\bchefe administrativo\b/gi, "chefe administrativo"],
    [/\bchefe de vendas\b/gi, "chefe de vendas"],
  ];

  for (const [pattern, replacement] of replacements) {
    value = value.replace(pattern, replacement);
  }

  value = value.replace(/\s+\./g, ".").replace(/\s+,/g, ",").replace(/\.\./g, ".");
  return value.trim();
}

function normalizeSentence(value: string) {
  let text = applyPortugueseCorrections(value);
  if (!text) return "";
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!/[.!?]$/.test(text)) text += ".";
  return text;
}

function normalizeLine(value: string) {
  return normalizeSentence(value).replace(/[.!?]$/, "");
}

function splitList(text?: string) {
  return String(text ?? "")
    .split(/\n|;|,/)
    .map((item) => item.replace(/^\d+[\).\-\s]*/, "").trim())
    .filter(Boolean)
    .map((item) => normalizeLine(item));
}

function unique(items: string[]) {
  return [...new Set(items)];
}

function renderList(items: string[]) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function parseDurationInfo(text?: string) {
  const raw = applyPortugueseCorrections(String(text ?? "").toLowerCase());

  const morning = raw.match(/(\d+)\s*(hora|horas)?\s*(de\s*)?manhã/);
  const afternoon = raw.match(/(\d+)\s*(hora|horas)?\s*(a\s*)?tarde/);
  const total = raw.match(/(\d+)\s*(hora|horas)/);

  if (morning || afternoon) {
    const morningHours = morning ? Number(morning[1]) : 0;
    const afternoonHours = afternoon ? Number(afternoon[1]) : 0;
    const phraseParts: string[] = [];
    if (morningHours) phraseParts.push(`${morningHours} hora${morningHours > 1 ? "s" : ""} de manhã`);
    if (afternoonHours) phraseParts.push(`${afternoonHours} hora${afternoonHours > 1 ? "s" : ""} à tarde`);
    return {
      display: phraseParts.join(" e "),
      morningHours,
      afternoonHours,
      totalHours: morningHours + afternoonHours,
    };
  }

  const totalHours = total ? Number(total[1]) : 5;
  if (totalHours >= 6) {
    return {
      display: "3 horas de manhã e 3 horas à tarde",
      morningHours: 3,
      afternoonHours: 3,
      totalHours: 6,
    };
  }

  if (totalHours >= 5) {
    return {
      display: "3 horas de manhã e 2 horas à tarde",
      morningHours: 3,
      afternoonHours: 2,
      totalHours: 5,
    };
  }

  return {
    display: `${totalHours} hora${totalHours > 1 ? "s" : ""}`,
    morningHours: totalHours,
    afternoonHours: 0,
    totalHours,
  };
}

function normalizeSystems(items: string[]) {
  return items.map((item) => {
    const key = applyPortugueseCorrections(item).toLowerCase();
    return SYSTEM_LABELS[key] ?? normalizeLine(item);
  });
}

function dynamicInfo(name: string): DynamicInfo {
  return DYNAMIC_DETAILS[name] ?? {
    nome: normalizeLine(name),
    categoria: "Dinâmica",
    objetivo: "Estimular integração, participação e alinhamento entre os participantes.",
    comoFunciona: "A dinâmica é aplicada em grupo, com orientação do facilitador e foco em participação ativa.",
    materiais: "Conforme necessidade do facilitador.",
    tempo: "20 a 30 minutos.",
  };
}

function buildDynamicsSection(names: string[]) {
  return names
    .map((name, index) => {
      const info = dynamicInfo(name);
      return `
        <div style="margin:0 0 22px 0;">
          <p style="margin:0 0 8px 0;"><strong>${index + 1}. ${escapeHtml(info.nome)}</strong></p>
          <p style="margin:0 0 4px 0;"><strong>Categoria:</strong> ${escapeHtml(info.categoria)}</p>
          <p style="margin:0 0 4px 0;"><strong>Objetivo:</strong> ${escapeHtml(info.objetivo)}</p>
          <p style="margin:0 0 4px 0;"><strong>Como funciona:</strong> ${escapeHtml(info.comoFunciona)}</p>
          <p style="margin:0 0 4px 0;"><strong>Materiais:</strong> ${escapeHtml(info.materiais)}</p>
          <p style="margin:0 0 0 0;"><strong>Tempo estimado:</strong> ${escapeHtml(info.tempo)}</p>
        </div>
      `;
    })
    .join("");
}

function buildDepartmentModules(departments: string[], themes: string[]) {
  const modules: string[] = [];

  const hasComercial = departments.some((dep) => /comercial|vendas/.test(dep.toLowerCase()));
  const hasAdministrativo = departments.some((dep) => /administr|adm/.test(dep.toLowerCase()));

  if (hasComercial) {
    const comercialThemes = unique(
      themes.filter((item) => /atendimento|telef|cliente|meta|crm|comunica/.test(item.toLowerCase()))
    );

    const finalThemes = comercialThemes.length
      ? comercialThemes
      : [
          "Atendimento telefônico",
          "Atendimento ao público",
          "Metas mensais",
          "Uso do CRM no fluxo comercial",
          "Padrão de comunicação com cliente",
        ];

    modules.push(`
      <h3 style="font-size:20px; font-weight:700; margin:0 0 10px 0;">Módulo Comercial / Vendas</h3>
      <p style="margin:0 0 10px 0;">Baseei este bloco no departamento Comercial da base, que destaca produtos e serviços, técnicas de vendas, metas e indicadores, atendimento ao cliente e relaciona CRM Corporativo.</p>
      <p style="margin:0 0 8px 0;"><strong>Temas do módulo:</strong></p>
      <ul style="margin:0 0 16px 22px; padding:0;">
        ${renderList(finalThemes)}
      </ul>
      <p style="margin:0 0 8px 0;"><strong>Vídeo recomendado da base:</strong></p>
      <p style="margin:0 0 24px 0;">Atendimento ao Cliente: Nosso Diferencial — cobre empatia, resolução de problemas e comunicação eficaz; indicado para Operacional e Técnico.</p>
    `);
  }

  if (hasAdministrativo) {
    const administrativoThemes = unique(
      themes.filter((item) => /e-mail|email|relat|organiz|demanda|registro|controle|contáb|contabil|obriga/.test(item.toLowerCase()))
    );

    const finalThemes = administrativoThemes.length
      ? administrativoThemes
      : [
          "Checagem de e-mail",
          "Confecção de relatórios administrativos",
          "Rotina de organização de demandas",
          "Boas práticas de registro e controle",
          "Interface com processos contábeis e obrigações internas",
        ];

    modules.push(`
      <h3 style="font-size:20px; font-weight:700; margin:0 0 10px 0;">Módulo Administrativo</h3>
      <p style="margin:0 0 10px 0;">A base não traz um departamento “Administrativo”, então este bloco foi estruturado com seus temas e com proximidade ao departamento Financeiro, que na base cobre processos contábeis, controles internos, orçamento e compliance.</p>
      <p style="margin:0 0 8px 0;"><strong>Temas do módulo:</strong></p>
      <ul style="margin:0 0 24px 22px; padding:0;">
        ${renderList(finalThemes)}
      </ul>
    `);
  }

  if (!modules.length) {
    modules.push(`<p style="margin:0 0 24px 0;">Os módulos departamentais foram distribuídos com base nos departamentos informados e nos temas priorizados para a integração.</p>`);
  }

  return modules.join("");
}

function buildSystemsSection(systems: string[]) {
  return `
    <ul style="margin:0 0 24px 22px; padding:0;">
      ${renderList(systems)}
    </ul>
  `;
}

function buildMaterialsSection(documents: string[]) {
  return documents
    .map((doc) => {
      const normalized = normalizeLine(doc);
      const mapped = MATERIALS_BASE[normalized] ?? MATERIALS_BASE[doc];
      if (mapped) {
        return `<li>${escapeHtml(mapped)}</li>`;
      }
      return `<li><strong>${escapeHtml(normalized)}</strong> — material informado pelo usuário para apoio à integração.</li>`;
    })
    .join("");
}

function buildMorningSchedule(selectedDynamic: string, hasComercial: boolean, includeCRM: boolean) {
  return `
    <h3 style="font-size:20px; font-weight:700; margin:0 0 10px 0;">Manhã — 3 horas</h3>

    <p style="margin:0 0 4px 0;"><strong>08:00–08:15 | Abertura com RH</strong></p>
    <p style="margin:0 0 12px 0;">Boas-vindas<br />Apresentação da agenda<br />Contextualização da integração</p>

    <p style="margin:0 0 4px 0;"><strong>08:15–08:35 | Alinhamento Cultural</strong></p>
    <p style="margin:0 0 12px 0;">Missão<br />Visão<br />Valores<br />Papel de cada colaborador na cultura da empresa</p>

    <p style="margin:0 0 4px 0;"><strong>08:35–08:55 | Dinâmica da Base</strong></p>
    <p style="margin:0 0 12px 0;">${escapeHtml(selectedDynamic)}</p>

    <p style="margin:0 0 4px 0;"><strong>08:55–09:00 | Pausa rápida</strong></p>
    <p style="margin:0 0 12px 0;"></p>

    <p style="margin:0 0 4px 0;"><strong>09:00–09:20 | Vídeo institucional</strong></p>
    <p style="margin:0 0 12px 0;">Boas-vindas do CEO</p>

    ${
      hasComercial
        ? `
          <p style="margin:0 0 4px 0;"><strong>09:20–10:10 | Módulo Comercial com chefe de vendas</strong></p>
          <p style="margin:0 0 12px 0;">Atendimento telefônico<br />Atendimento ao público<br />Metas mensais<br />Introdução ao CRM</p>

          <p style="margin:0 0 4px 0;"><strong>10:10–10:25 | Vídeo de apoio</strong></p>
          <p style="margin:0 0 12px 0;">Atendimento ao Cliente: Nosso Diferencial</p>
        `
        : ""
    }

    ${
      includeCRM
        ? `
          <p style="margin:0 0 4px 0;"><strong>10:25–11:00 | Apresentação do CRM</strong></p>
          <p style="margin:0 0 0 0;">Acesso<br />Uso básico<br />Fluxo de registro comercial<br />A base prevê 60 minutos, mas aqui foi ajustado para caber no tempo total disponível.</p>
        `
        : ""
    }
  `;
}

function buildAfternoonSchedule(hasAdministrativo: boolean, documents: string[]) {
  const docsBlock = documents.length ? documents.join("<br />") : "Documentos selecionados para apoio da integração";

  return `
    <h3 style="font-size:20px; font-weight:700; margin:24px 0 10px 0;">Tarde — 3 horas</h3>

    ${
      hasAdministrativo
        ? `
          <p style="margin:0 0 4px 0;"><strong>13:00–13:50 | Módulo Administrativo com chefe administrativo</strong></p>
          <p style="margin:0 0 12px 0;">Checagem de e-mail<br />Organização de demandas<br />Confecção de relatórios administrativos<br />Boas práticas de comunicação interna</p>
        `
        : `
          <p style="margin:0 0 4px 0;"><strong>13:00–13:50 | Módulo Departamental</strong></p>
          <p style="margin:0 0 12px 0;">Apresentação das rotinas e dos temas prioritários definidos para a integração.</p>
        `
    }

    <p style="margin:0 0 4px 0;"><strong>13:50–14:20 | Documentação de apoio</strong></p>
    <p style="margin:0 0 12px 0;">${docsBlock}</p>

    <p style="margin:0 0 4px 0;"><strong>14:20–14:45 | Aplicação prática orientada</strong></p>
    <p style="margin:0 0 12px 0;">Simulação simples de rotina:<br />receber demanda<br />registrar no fluxo correto<br />responder e-mail de forma adequada<br />encaminhar ou reportar status</p>

    <p style="margin:0 0 4px 0;"><strong>14:45–15:00 | Fechamento com RH</strong></p>
    <p style="margin:0 0 0 0;">Recapitulação dos pontos principais<br />Espaço para dúvidas<br />Próximos passos<br />Reforço de cultura e expectativas</p>
  `;
}

export function buildOnboardingReport(session: OnboardingSession) {
  const duration = parseDurationInfo(session.tempoIntegracao);
  const departments = unique(splitList(session.departamentos));
  const themes = unique(splitList(session.temasDepartamentos));
  const documents = unique(splitList(session.documentosBase));
  const systems = normalizeSystems(unique(splitList(session.sistemasApresentados)));
  const dynamicNames = unique(splitList(session.dinamicaPropria));

  const selectedDynamicNames = dynamicNames.length ? dynamicNames : ["Dinâmica não informada"];
  const hasComercial = departments.some((dep) => /comercial|vendas/.test(dep.toLowerCase()));
  const hasAdministrativo = departments.some((dep) => /administr|adm/.test(dep.toLowerCase()));
  const includeCRM = systems.some((item) => /crm/i.test(item));

  return `
<section>
  <h1 style="font-size:30px; font-weight:800; margin:0 0 24px 0;">ROTEIRO DE INTEGRAÇÃO PERSONALIZADO PRONTO</h1>

  <p style="margin:0 0 8px 0;"><strong>Quantidade de colaboradores:</strong> ${escapeHtml(normalizeLine(session.quantidadeColaboradores ?? "Não informado"))}</p>
  <p style="margin:0 0 8px 0;"><strong>Nível hierárquico:</strong> ${escapeHtml(normalizeLine(session.nivelHierarquico ?? "Não informado"))}</p>
  <p style="margin:0 0 8px 0;"><strong>Departamentos:</strong> ${escapeHtml(departments.join(", "))}</p>
  <p style="margin:0 0 8px 0;"><strong>Facilitadores disponíveis:</strong> ${escapeHtml(normalizeLine(session.facilitadoresDisponiveis ?? "Não informado"))}</p>
  <p style="margin:0 0 24px 0;"><strong>Tempo total da integração:</strong> ${escapeHtml(duration.display || normalizeLine(session.tempoIntegracao ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">1. Alinhamento Cultural</h2>
  <p style="margin:0 0 8px 0;"><strong>Missão:</strong> ${escapeHtml(normalizeLine(session.missaoEmpresa ?? "Não informado"))}</p>
  <p style="margin:0 0 8px 0;"><strong>Visão:</strong> ${escapeHtml(normalizeLine(session.visaoEmpresa ?? "Não informado"))}</p>
  <p style="margin:0 0 24px 0;"><strong>Valores:</strong> ${escapeHtml(normalizeLine(session.valoresEmpresa ?? "Não informado"))}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">2. Dinâmica Selecionada</h2>
  ${buildDynamicsSection(selectedDynamicNames)}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">3. Módulos Departamentais</h2>
  ${buildDepartmentModules(departments, themes)}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">4. Apresentação de Sistemas</h2>
  ${buildSystemsSection(systems)}

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">5. Documentação de Apoio</h2>
  <ul style="margin:0 0 24px 22px; padding:0;">
    ${buildMaterialsSection(documents)}
  </ul>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 10px 0;">6. Cronograma Integrado</h2>
  ${
    duration.morningHours >= 3 && duration.afternoonHours >= 2
      ? buildMorningSchedule(selectedDynamicNames[0], hasComercial, includeCRM) + buildAfternoonSchedule(hasAdministrativo, documents)
      : `
        <p style="margin:0 0 8px 0;"><strong>Abertura:</strong> boas-vindas, agenda e contexto da integração.</p>
        <p style="margin:0 0 8px 0;"><strong>Alinhamento cultural:</strong> missão, visão, valores e papel esperado de cada colaborador.</p>
        <p style="margin:0 0 8px 0;"><strong>Dinâmica:</strong> ${escapeHtml(selectedDynamicNames.join(", "))}.</p>
        <p style="margin:0 0 8px 0;"><strong>Módulos departamentais:</strong> apresentação dos temas e das rotinas das áreas envolvidas.</p>
        <p style="margin:0 0 8px 0;"><strong>Sistemas:</strong> ${escapeHtml(systems.join(", "))}.</p>
        <p style="margin:0 0 0 0;"><strong>Fechamento:</strong> documentos, dúvidas e próximos passos.</p>
      `
  }

  <h2 style="font-size:22px; font-weight:700; margin:24px 0 10px 0;">Resumo de compatibilidade da base</h2>
  <p style="margin:0 0 8px 0;">Dinâmicas escolhidas: ${escapeHtml(selectedDynamicNames.join(", "))}.</p>
  <p style="margin:0 0 8px 0;">Vídeos usados: compatíveis com integração geral e, quando aplicável, com o módulo comercial.</p>
  <p style="margin:0 0 8px 0;">Materiais usados: ${escapeHtml(documents.join(", "))}.</p>
  <p style="margin:0 0 0 0;">Sistema oficial usado: ${escapeHtml(systems.join(", "))}.</p>
</section>
`;
}
