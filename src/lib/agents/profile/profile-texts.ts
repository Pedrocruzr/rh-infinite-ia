export type ProfileSubfactor = {
  name: string;
  description: string;
};

export type ProfileText = {
  youAre: string;
  description: string;
  leadership: string;
  professional: string;
  motivators: string[];
  summary: string;
  summaryWords: string[];
  subfactors: ProfileSubfactor[];
};

export const MOTIVATION_LABELS: Record<string, string> = {
  seguranca: "Segurança e boas relações no ambiente de trabalho",
  reconhecimento: "Reconhecimento pelo que entrego",
  crescimento: "Crescimento e evolução profissional",
  autonomia: "Autonomia para executar e decidir",
};

export const PROFILE_TEXTS: Record<string, ProfileText> = {
  D: {
    youAre:
      "Você é uma pessoa de perfil Dominante. Assertiva, direta e orientada a resultados, você age com confiança e toma decisões com agilidade. Assume riscos calculados e não hesita em liderar quando o contexto exige. Seu ritmo é acelerado e sua energia é voltada para conquistas concretas.",

    description:
      "Pessoas com perfil Dominante tendem a ser altamente competitivas, independentes e focadas em superar desafios. Possuem forte necessidade de autonomia e detestam ser controladas ou limitadas. Costumam ser diretas na comunicação, valorizam eficiência e esperam o mesmo dos outros. Podem ser percebidas como impacientes ou autoritárias em situações de pressão, mas essa energia é também o que as torna excelentes em ambientes de alta demanda e mudança rápida.",

    leadership:
      "Como líder, o perfil Dominante tende a ser firme, decisivo e orientado a metas. Estabelece diretrizes claras, delega tarefas com objetividade e cobra resultados com consistência. Prefere liderados autônomos que entreguem sem precisar de supervisão constante. O risco é pressionar demais a equipe sem considerar o estado emocional dos colaboradores — o desenvolvimento da escuta ativa e da empatia fortalece significativamente sua liderança.",

    professional:
      "No ambiente profissional, o perfil D é mais eficaz em funções que exigem tomada de decisão rápida, gestão de projetos sob pressão, liderança de equipes e negociação. Performa bem em cargos de gestão, comercial de alta complexidade, empreendedorismo e áreas operacionais com metas desafiadoras. Tem dificuldade com rotinas repetitivas, burocracia excessiva e ambientes sem desafios claros.",

    motivators: [
      "Autonomia para tomar decisões e agir sem burocracia",
      "Desafios que exijam superação e resultados tangíveis",
      "Reconhecimento por conquistas e impacto gerado",
      "Espaço para liderar e influenciar decisões estratégicas",
      "Ambiente dinâmico com metas claras e progressão rápida",
    ],

    summary:
      "O perfil Dominante é movido por resultados, desafios e autonomia. Age com rapidez, lidera com firmeza e entrega com consistência. Seu maior potencial está em ambientes que demandam iniciativa e decisão. Seu principal ponto de desenvolvimento é a gestão das relações interpessoais e o equilíbrio entre resultado e processo.",

    summaryWords: [
      "Assertivo",
      "Decisivo",
      "Competitivo",
      "Direto",
      "Orientado a resultados",
      "Independente",
      "Proativo",
      "Resiliente",
    ],

    subfactors: [
      {
        name: "Tomada de decisão",
        description:
          "Decide com agilidade e segurança, mesmo com informações incompletas. Prefere agir e corrigir o rumo a aguardar o momento perfeito.",
      },
      {
        name: "Gestão de pressão",
        description:
          "Funciona bem sob pressão e tende a intensificar a performance em momentos de crise ou urgência.",
      },
      {
        name: "Orientação a resultados",
        description:
          "Foco constante no que precisa ser entregue. Prioriza ações com impacto direto nos objetivos e elimina o que considera desperdício de tempo.",
      },
    ],
  },

  I: {
    youAre:
      "Você é uma pessoa de perfil Influente. Comunicativa, entusiasta e naturalmente carismática, você conecta pessoas, inspira equipes e cria ambientes positivos onde estiver. Sua energia é contagiante e sua habilidade de persuasão é um diferencial em situações que exigem engajamento e colaboração.",

    description:
      "Pessoas com perfil Influente são extrovertidas, otimistas e altamente orientadas a relacionamentos. Gostam de trabalhar em grupo, de ser vistas e reconhecidas. Possuem facilidade natural para comunicação verbal, vendas, apresentações e motivação de equipes. Podem ter dificuldade com tarefas solitárias, detalhamento técnico e prazos rígidos — mas sua capacidade de criar conexões genuínas as torna essenciais em qualquer ambiente colaborativo.",

    leadership:
      "Como líder, o perfil Influente é inspirador, acessível e capaz de criar times com alto engajamento. Usa o carisma e a comunicação para mobilizar pessoas em torno de objetivos comuns. Tende a ser empático com as necessidades individuais da equipe. O ponto de atenção é manter o foco nos resultados e na estrutura dos processos — o equilíbrio entre relação e entrega fortalece sua liderança de forma significativa.",

    professional:
      "O perfil I performa melhor em funções que envolvem comunicação, relacionamento, vendas, atendimento ao cliente, treinamentos, apresentações e gestão de pessoas. Ambientes com colaboração constante e visibilidade potencializam sua contribuição. Pode ter dificuldades em funções altamente técnicas, analíticas ou solitárias.",

    motivators: [
      "Interação constante com pessoas e trabalho em equipe",
      "Reconhecimento público por suas contribuições",
      "Ambiente positivo, criativo e com liberdade de expressão",
      "Oportunidades de apresentar ideias e influenciar decisões",
      "Variedade nas tarefas e contato com novidades",
    ],

    summary:
      "O perfil Influente é movido por conexão, reconhecimento e entusiasmo. Sua força está na comunicação e na capacidade de engajar. Ambientes colaborativos e dinâmicos são onde mais se realiza. Seu principal ponto de desenvolvimento é a disciplina nos processos e o foco na entrega com consistência.",

    summaryWords: [
      "Comunicativo",
      "Entusiasta",
      "Carismático",
      "Persuasivo",
      "Otimista",
      "Empático",
      "Criativo",
      "Sociável",
    ],

    subfactors: [
      {
        name: "Comunicação interpessoal",
        description:
          "Comunica com facilidade, clareza e impacto emocional. Adapta o discurso ao público e cria conexão rápida com interlocutores diferentes.",
      },
      {
        name: "Influência e persuasão",
        description:
          "Capacidade de convencer, motivar e mobilizar pessoas para uma causa ou objetivo, usando entusiasmo e argumentação natural.",
      },
      {
        name: "Gestão do clima",
        description:
          "Forte habilidade de manter o ambiente de trabalho positivo e energizado, especialmente em momentos de tensão ou mudança.",
      },
    ],
  },

  S: {
    youAre:
      "Você é uma pessoa de perfil Estável. Calma, confiável e profundamente comprometida com as pessoas ao seu redor, você é o tipo de profissional que sustenta a equipe nos momentos mais difíceis. Valoriza harmonia, consistência e relações genuínas — e entrega com dedicação o que assume.",

    description:
      "Pessoas com perfil Estável são pacientes, leais, colaborativas e excelentes ouvintes. Preferem ambientes previsíveis, com relações de confiança estabelecidas ao longo do tempo. Têm dificuldade com mudanças abruptas e conflitos, mas sua estabilidade emocional e dedicação são ativos valiosos em qualquer time. São o tipo de profissional que raramente abandona o barco e que cuida genuinamente do coletivo.",

    leadership:
      "Como líder, o perfil Estável é acolhedor, justo e constrói times coesos baseados em confiança mútua. Tem escuta ativa apurada e toma decisões considerando o impacto nas pessoas. O ponto de atenção é o excesso de cautela na hora de confrontar questões difíceis ou de impor limites — o desenvolvimento da assertividade e da capacidade de dar feedbacks difíceis potencializa muito sua liderança.",

    professional:
      "O perfil S performa melhor em funções que exigem constância, suporte, atendimento, cuidado com pessoas, processos repetitivos de alta qualidade e trabalho em equipe. Áreas como RH, treinamento, suporte ao cliente, assistência operacional e coordenação são naturais para esse perfil. Ambientes de alta instabilidade ou competição interna podem ser desgastantes.",

    motivators: [
      "Segurança e estabilidade no ambiente de trabalho",
      "Relações de confiança com liderança e colegas",
      "Sentir que seu trabalho tem impacto nas pessoas",
      "Ambiente colaborativo, sem conflitos desnecessários",
      "Reconhecimento pela dedicação e consistência",
    ],

    summary:
      "O perfil Estável é movido por pertencimento, harmonia e propósito coletivo. Sua força está na lealdade, na escuta e na capacidade de sustentar times em momentos difíceis. Seu principal ponto de desenvolvimento é a assertividade e a disposição para iniciar mudanças quando necessário.",

    summaryWords: [
      "Paciente",
      "Leal",
      "Empático",
      "Colaborativo",
      "Confiável",
      "Consistente",
      "Acolhedor",
      "Dedicado",
    ],

    subfactors: [
      {
        name: "Estabilidade emocional",
        description:
          "Mantém equilíbrio em situações de pressão, conflito ou incerteza. Sua presença transmite segurança para a equipe.",
      },
      {
        name: "Lealdade e comprometimento",
        description:
          "Cumpre o que promete, mantém-se fiel à equipe e à organização mesmo em cenários adversos.",
      },
      {
        name: "Escuta ativa",
        description:
          "Capacidade genuína de ouvir, acolher e considerar as perspectivas dos outros antes de agir ou responder.",
      },
    ],
  },

  C: {
    youAre:
      "Você é uma pessoa de perfil Conformidade. Analítica, precisa e altamente criteriosa, você é a pessoa que garante que as coisas sejam feitas do jeito certo. Seu rigor técnico, atenção aos detalhes e capacidade de estruturar problemas complexos são diferenciais valiosos em qualquer ambiente que exija excelência.",

    description:
      "Pessoas com perfil de Conformidade são introvertidas, meticulosas e orientadas a padrões e processos. Preferem trabalhar com dados, análises e procedimentos bem definidos. São críticas consigo mesmas e com os outros, mas essa autocrítica é o que garante a qualidade das suas entregas. Podem ter dificuldade com ambiguidade, decisões rápidas sem dados suficientes e ambientes desorganizados.",

    leadership:
      "Como líder, o perfil C é rigoroso, justo e altamente técnico. Define processos claros, exige qualidade e documenta bem as diretrizes. O ponto de atenção é a tendência ao perfeccionismo excessivo e à dificuldade de delegar — o desenvolvimento da confiança na equipe e da tolerância ao erro como parte do aprendizado fortalece sua gestão.",

    professional:
      "O perfil C performa melhor em funções analíticas, de controle de qualidade, auditoria, planejamento, pesquisa, tecnologia, contabilidade, jurídico e gestão de processos. Ambientes com normas claras, KPIs definidos e espaço para aprofundamento técnico são onde mais se realiza. Funções comerciais de improviso ou ambientes caóticos tendem a ser desgastantes.",

    motivators: [
      "Clareza nos processos e nas expectativas",
      "Espaço para aprofundamento técnico e especialização",
      "Reconhecimento pela qualidade e precisão das entregas",
      "Ambiente organizado, com regras e responsabilidades bem definidas",
      "Acesso a dados e informações para embasar decisões",
    ],

    summary:
      "O perfil de Conformidade é movido por qualidade, precisão e excelência técnica. Sua força está na análise, na organização e na capacidade de estruturar soluções sólidas. Seu principal ponto de desenvolvimento é a flexibilidade diante da imperfeição e a agilidade na tomada de decisão quando os dados são insuficientes.",

    summaryWords: [
      "Analítico",
      "Preciso",
      "Criterioso",
      "Organizado",
      "Técnico",
      "Meticuloso",
      "Sistemático",
      "Qualitativo",
    ],

    subfactors: [
      {
        name: "Atenção aos detalhes",
        description:
          "Identifica inconsistências e erros que passam despercebidos pela maioria. Garante qualidade e precisão nas entregas.",
      },
      {
        name: "Pensamento analítico",
        description:
          "Capacidade de estruturar problemas complexos, analisar dados e chegar a conclusões bem fundamentadas.",
      },
      {
        name: "Gestão de processos",
        description:
          "Habilidade de criar, documentar e otimizar fluxos de trabalho com foco em eficiência e redução de erros.",
      },
    ],
  },
};
