export type ClosedOption = {
  id: string;
  label: string;
  value: string;
};

export type QuestionKind = "text" | "single_choice";

export type ProfileField =
  | "nome"
  | "sobrenome"
  | "sexo"
  | "telefone"
  | "email"
  | "estado"
  | "cidade"
  | "empresa"
  | "statusProfissional"
  | "area"
  | "cargo"
  | "vaga"
  | "disc1"
  | "disc2"
  | "disc3"
  | "disc4"
  | "disc5"
  | "disc6"
  | "motivacao"
  | "competenciaExemplo1"
  | "competenciaExemplo2"
  | "competenciaExemplo3"
  | "ea"
  | "eb"
  | "ec"
  | "ed"
  | "ee"
  | "el1"
  | "el2"
  | "el3"
  | "el4"
  | "el5"
  | "el6"
  | "el7"
  | "el8"
  | "el9"
  | "el10"
  | "eq1"
  | "eq2"
  | "eq3";

export type DiscScores = {
  D: number;
  I: number;
  S: number;
  C: number;
};

export type ProfileSession = {
  assessmentId?: string;
  nome?: string;
  sobrenome?: string;
  sexo?: string;
  telefone?: string;
  email?: string;
  estado?: string;
  cidade?: string;
  empresa?: string;
  statusProfissional?: string;
  area?: string;
  cargo?: string;
  vaga?: string;
  competenciasPrincipais?: string[];
  disc1?: string;
  disc2?: string;
  disc3?: string;
  disc4?: string;
  disc5?: string;
  disc6?: string;
  discScores?: DiscScores;
  motivacao?: string;
  competenciaExemplo1?: string;
  competenciaExemplo2?: string;
  competenciaExemplo3?: string;
  // Eneagrama — escolha forçada
  ea?: string;
  eb?: string;
  ec?: string;
  ed?: string;
  ee?: string;
  // Eneagrama — Likert
  el1?: string;
  el2?: string;
  el3?: string;
  el4?: string;
  el5?: string;
  el6?: string;
  el7?: string;
  el8?: string;
  el9?: string;
  el10?: string;
  // Eneagrama — qualitativas
  eq1?: string;
  eq2?: string;
  eq3?: string;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

export type FlowQuestion = {
  field: ProfileField;
  kind: QuestionKind;
  question: string;
  options?: ClosedOption[];
};

const LETTER_TO_DISC: Record<string, keyof DiscScores> = {
  A: "D",
  B: "I",
  C: "S",
  D: "C",
};

function discOpts(labels: [string, string, string, string]): ClosedOption[] {
  return [
    { id: "a", label: labels[0], value: "A" },
    { id: "b", label: labels[1], value: "B" },
    { id: "c", label: labels[2], value: "C" },
    { id: "d", label: labels[3], value: "D" },
  ];
}

export const DISC_Q1_OPTIONS = discOpts([
  "Assumo o controle rapidamente e foco em resolver o problema.",
  "Busco envolver outras pessoas e manter todos motivados.",
  "Procuro manter a calma, entender a situação e ajudar a equipe.",
  "Analiso cuidadosamente o problema antes de agir.",
]);

export const DISC_Q2_OPTIONS = discOpts([
  "Ter autonomia para tomar decisões e alcançar metas desafiadoras.",
  "Interagir com pessoas, trocar ideias e ser reconhecido.",
  "Trabalhar em um ambiente estável, colaborativo e harmonioso.",
  "Ter processos bem definidos e garantir qualidade em tudo.",
]);

export const DISC_Q3_OPTIONS = discOpts([
  "Decido rapidamente com base no que já sei e sigo em frente.",
  "Converso com outras pessoas para ouvir opiniões antes de decidir.",
  "Tento ganhar mais tempo para entender melhor a situação.",
  "Fico desconfortável e busco o máximo de dados possível.",
]);

export const DISC_Q4_OPTIONS = discOpts([
  "Assumo a liderança e direciono as pessoas para o objetivo.",
  "Engajo todos, mantenho o clima positivo e incentivo a participação.",
  "Colaboro de forma consistente, apoiando os colegas.",
  "Contribuo garantindo organização, qualidade e atenção aos detalhes.",
]);

export const DISC_Q5_OPTIONS = discOpts([
  "Vejo como um desafio e ajo rapidamente para me adaptar.",
  "Tento manter todos positivos e motivados durante a mudança.",
  "Busco entender bem a mudança e me adapto gradualmente.",
  "Analiso o impacto da mudança e procuro seguir da forma mais correta.",
]);

export const DISC_Q6_OPTIONS = discOpts([
  "Lentidão, falta de resultados e ineficiência.",
  "Falta de comunicação, clima negativo ou pessoas desmotivadas.",
  "Conflitos constantes e falta de harmonia na equipe.",
  "Falta de organização, erros e baixa qualidade nas entregas.",
]);

export const MOTIVATION_OPTIONS: ClosedOption[] = [
  { id: "a", label: "Segurança e boas relações no ambiente de trabalho.", value: "seguranca" },
  { id: "b", label: "Reconhecimento pelo que entrego.", value: "reconhecimento" },
  { id: "c", label: "Crescimento e evolução profissional.", value: "crescimento" },
  { id: "d", label: "Autonomia para executar e decidir.", value: "autonomia" },
];

// Perguntas STAR específicas por competência
const COMPETENCY_QUESTIONS: Record<string, string> = {
  "Organização": "Descreva uma situação em que você precisou gerenciar múltiplas tarefas, prazos ou documentos ao mesmo tempo. Como organizou o trabalho e qual foi o resultado?",
  "Comunicação": "Conte uma situação em que você precisou transmitir uma informação importante ou complexa para outra pessoa ou grupo. Como fez isso e qual foi o impacto?",
  "Proatividade": "Dê um exemplo em que você identificou um problema ou oportunidade sem que ninguém pedisse. O que você fez e qual foi o resultado?",
  "Empatia": "Descreva uma situação em que você precisou apoiar um colega, cliente ou fornecedor em dificuldade. Como agiu e qual foi o desfecho?",
  "Resolução de Problemas": "Conte um problema complexo que você enfrentou no trabalho. Como analisou a situação, que alternativas considerou e qual solução adotou?",
  "Atenção aos Detalhes": "Descreva um momento em que sua atenção aos detalhes fez diferença em uma entrega, processo ou decisão. O que você identificou e como isso impactou o resultado?",
  "Responsabilidade": "Dê um exemplo em que você assumiu total responsabilidade por uma entrega ou erro e o que fez para garantir o melhor resultado possível.",
  "Dinamismo": "Conte uma situação em que você precisou lidar com várias demandas ao mesmo tempo ou se adaptar rapidamente a uma mudança. Como gerenciou e qual foi o resultado?",
  "Persuasão": "Descreva uma situação em que você precisou convencer alguém — cliente, colega ou gestor — de uma ideia ou mudança. Como argumentou e qual foi o resultado?",
  "Foco em Resultados": "Conte uma situação em que você precisou alcançar uma meta desafiadora. Quais ações tomou, quais obstáculos enfrentou e qual foi o resultado final?",
  "Resiliência": "Descreva um fracasso, rejeição ou grande dificuldade que você enfrentou no trabalho. Como reagiu e o que fez para superar e seguir em frente?",
  "Agilidade": "Conte uma situação em que você precisou executar uma tarefa com rapidez, prazo curto ou recursos limitados, mantendo a qualidade. O que fez e qual foi o resultado?",
  "Criatividade": "Descreva um momento em que você criou uma solução inovadora ou diferente para um problema no trabalho. O que você fez e qual foi o impacto?",
  "Disciplina": "Dê um exemplo de como você manteve consistência e foco em uma tarefa ou meta ao longo do tempo, mesmo diante de dificuldades ou distrações.",
  "Trabalho em Equipe": "Descreva uma situação em que você colaborou com uma equipe para atingir um objetivo comum. Qual foi o seu papel, que desafios surgiram e qual foi o resultado?",
  "Liderança": "Descreva uma situação em que você liderou uma equipe ou um projeto. Como conduziu as pessoas, quais desafios enfrentou e qual foi o resultado alcançado?",
  "Tomada de Decisão": "Dê um exemplo de uma decisão difícil que você precisou tomar, com pouco tempo ou informação limitada. Como avaliou as opções e qual foi o resultado?",
  "Planejamento": "Conte uma situação em que você planejou um projeto, processo ou evento do início ao fim. Como estruturou as etapas, quais desafios surgiram e qual foi o resultado?",
  "Relacionamento Interpessoal": "Dê um exemplo de como você construiu ou manteve um bom relacionamento com pessoas difíceis ou em um contexto desafiador. O que você fez e qual foi o impacto?",
  "Negociação": "Descreva uma situação em que você negociou com clientes, fornecedores ou internamente. Quais argumentos usou e qual foi o resultado da negociação?",
  "Análise de Dados": "Conte uma situação em que você utilizou dados ou indicadores para embasar uma decisão ou resolver um problema. O que analisou, como interpretou e qual foi o resultado?",
  "Visão Estratégica": "Dê um exemplo em que você analisou o cenário e propôs ou implementou uma estratégia que trouxe resultado significativo para a equipe ou empresa.",
  "Empreendedorismo": "Conte uma situação em que você identificou uma oportunidade e tomou a iniciativa de criar algo novo ou melhorar um processo sem que ninguém solicitasse. Qual foi o resultado?",
  "Equilíbrio Emocional": "Descreva uma situação de alta pressão, conflito ou estresse no trabalho. Como você gerenciou suas emoções e qual foi o impacto no resultado?",
  "Inovação": "Dê um exemplo em que você propôs ou implementou algo inovador no trabalho. Como surgiu a ideia, como a implementou e qual foi o resultado?",
  "Cortesia": "Dê um exemplo de como você tratou um cliente ou colega em uma situação tensa, mantendo profissionalismo e respeito. Qual foi o desfecho?",
  "Comprometimento": "Conte uma situação em que você foi além do esperado para cumprir um compromisso ou entrega importante. O que você fez e qual foi o reconhecimento ou resultado?",
  "Flexibilidade": "Conte uma situação em que você precisou mudar de planos ou de abordagem por uma mudança inesperada. Como se adaptou e qual foi o resultado?",
  "Discrição": "Descreva uma situação em que você precisou lidar com informações confidenciais ou sensíveis. Como agiu para preservar a confiança e a imagem da empresa?",
  "Integridade": "Dê um exemplo de uma situação em que você precisou agir com honestidade ou transparência mesmo quando era difícil ou inconveniente. O que fez e qual foi o impacto?",
  "Espírito de Equipe": "Conte uma situação em que você colaborou ativamente para o sucesso coletivo da equipe, mesmo que isso exigisse abrir mão de algo seu. Qual foi o resultado?",
};

function getCompetencyQuestion(competencia: string, position: number): string {
  const question = COMPETENCY_QUESTIONS[competencia];
  if (question) return question;
  const prefix = position === 0 ? "Conte" : position === 1 ? "Agora conte" : "Por fim, conte";
  return `${prefix} uma situação real em que você demonstrou ${competencia}. Descreva o contexto, as ações que tomou e o resultado obtido.`;
}

export function suggestCompetenciasByRole(role: string): string[] {
  const n = role.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Liderança / gestão
  if (n.match(/diretor|ceo|presidente|vp |vice-presidente/)) return ["Visão Estratégica", "Liderança", "Tomada de Decisão"];
  if (n.match(/gerente|manager/)) return ["Liderança", "Foco em Resultados", "Planejamento"];
  if (n.match(/coordenador|supervisor/)) return ["Planejamento", "Comunicação", "Foco em Resultados"];
  if (n.match(/lider|líder/)) return ["Liderança", "Comunicação", "Trabalho em Equipe"];

  // RH / Pessoas
  if (n.match(/recrutador|selecao|selecção|talent/)) return ["Comunicação", "Empatia", "Análise de Dados"];
  if (n.match(/rh|recursos humanos|people|gestao de pessoas/)) return ["Comunicação", "Relacionamento Interpessoal", "Empatia"];
  if (n.match(/treinamento|desenvolvimento|t&d|td /)) return ["Comunicação", "Empatia", "Planejamento"];
  if (n.match(/dhso|saude ocupacional/)) return ["Empatia", "Organização", "Comunicação"];

  // Comercial / Vendas
  if (n.match(/vendas|comercial|sales|hunter|closer/)) return ["Persuasão", "Foco em Resultados", "Resiliência"];
  if (n.match(/atendimento ao cliente|customer success|cs |sdr|pré-venda|pre-venda/)) return ["Empatia", "Comunicação", "Resolução de Problemas"];
  if (n.match(/negociador|compras|suprimentos|procurement|buyer/)) return ["Negociação", "Organização", "Análise de Dados"];
  if (n.match(/account|key account|executivo de contas/)) return ["Relacionamento Interpessoal", "Persuasão", "Foco em Resultados"];

  // Financeiro / Contábil
  if (n.match(/contabil|contábil|contador|contabilidade/)) return ["Atenção aos Detalhes", "Organização", "Análise de Dados"];
  if (n.match(/financeiro|financeira|finance|tesoureiro|tesouraria/)) return ["Análise de Dados", "Organização", "Responsabilidade"];
  if (n.match(/controladoria|controller|fiscal/)) return ["Análise de Dados", "Atenção aos Detalhes", "Foco em Resultados"];
  if (n.match(/auditor|auditoria/)) return ["Atenção aos Detalhes", "Integridade", "Organização"];

  // Jurídico
  if (n.match(/juridico|jurídico|advogado|direito|legal|compliance/)) return ["Atenção aos Detalhes", "Discrição", "Comunicação"];

  // Tecnologia / TI
  if (n.match(/desenvolvedor|developer|programador|engenheiro de software|front.?end|back.?end|full.?stack/)) return ["Resolução de Problemas", "Atenção aos Detalhes", "Trabalho em Equipe"];
  if (n.match(/dados|data|bi |analytics|cientista/)) return ["Análise de Dados", "Resolução de Problemas", "Proatividade"];
  if (n.match(/infra|infraestrutura|devops|sre|cloud|redes|suporte ti|suporte tecnico/)) return ["Resolução de Problemas", "Organização", "Trabalho em Equipe"];
  if (n.match(/ti |tecnologia da informacao|tecnologia da informação|sistemas/)) return ["Resolução de Problemas", "Organização", "Comunicação"];
  if (n.match(/ux|ui|designer|design/)) return ["Criatividade", "Comunicação", "Empatia"];
  if (n.match(/produto|product manager|product owner|po |pm |scrum|agile/)) return ["Visão Estratégica", "Comunicação", "Tomada de Decisão"];

  // Operações / Logística / Produção
  if (n.match(/logistica|logística|supply chain|expedicao|expedição|almoxarife|estoque/)) return ["Organização", "Atenção aos Detalhes", "Agilidade"];
  if (n.match(/producao|produção|operacional|operador|auxiliar de producao/)) return ["Disciplina", "Trabalho em Equipe", "Atenção aos Detalhes"];
  if (n.match(/qualidade|quality|inspetor/)) return ["Atenção aos Detalhes", "Organização", "Proatividade"];
  if (n.match(/engenheiro|engenharia/)) return ["Planejamento", "Resolução de Problemas", "Atenção aos Detalhes"];

  // Administrativo / Assistente
  if (n.match(/administr/)) return ["Organização", "Proatividade", "Atenção aos Detalhes"];
  if (n.match(/secretar|assistente executivo/)) return ["Organização", "Discrição", "Comunicação"];
  if (n.match(/recepcion/)) return ["Comunicação", "Cortesia", "Relacionamento Interpessoal"];
  if (n.match(/assistente|auxiliar|analista jr/)) return ["Organização", "Proatividade", "Comunicação"];

  // Atendimento / Call Center
  if (n.match(/atendimento|call center|telemarketing|sac|suporte|help.?desk/)) return ["Empatia", "Comunicação", "Resolução de Problemas"];
  if (n.match(/operador de caixa|caixa|frente de caixa/)) return ["Agilidade", "Atenção aos Detalhes", "Cortesia"];

  // Marketing / Comunicação
  if (n.match(/marketing|mkt|growth|inbound|outbound/)) return ["Criatividade", "Análise de Dados", "Comunicação"];
  if (n.match(/social media|midia|mídia|conteudo|conteúdo|redator|copywriter/)) return ["Criatividade", "Comunicação", "Organização"];
  if (n.match(/relacoes publicas|relações públicas|assessoria/)) return ["Comunicação", "Relacionamento Interpessoal", "Proatividade"];

  // Saúde
  if (n.match(/medico|médico|enfermeiro|enfermagem|farmaceutico|fisioterapeuta|psicologo|nutricionista|saude|saúde/)) return ["Empatia", "Equilíbrio Emocional", "Atenção aos Detalhes"];

  // Educação
  if (n.match(/professor|educador|pedagogia|instrutor|tutor/)) return ["Comunicação", "Empatia", "Planejamento"];

  // Padrão
  return ["Comunicação", "Organização", "Proatividade"];
}

const DISC_OPTIONS_MAP: Record<string, ClosedOption[]> = {
  disc1: DISC_Q1_OPTIONS,
  disc2: DISC_Q2_OPTIONS,
  disc3: DISC_Q3_OPTIONS,
  disc4: DISC_Q4_OPTIONS,
  disc5: DISC_Q5_OPTIONS,
  disc6: DISC_Q6_OPTIONS,
};

export function buildProfileFlow(session: ProfileSession): FlowQuestion[] {
  const competencias =
    session.competenciasPrincipais && session.competenciasPrincipais.length === 3
      ? session.competenciasPrincipais
      : ["competência 1", "competência 2", "competência 3"];

  return [
    { field: "nome", kind: "text", question: "Qual é o seu nome?" },
    { field: "sobrenome", kind: "text", question: "Qual é o seu sobrenome?" },
    {
      field: "sexo",
      kind: "single_choice",
      question: "Qual o seu sexo?",
      options: [
        { id: "M", label: "Masculino", value: "Masculino" },
        { id: "F", label: "Feminino", value: "Feminino" },
        { id: "O", label: "Prefiro não informar", value: "Prefiro não informar" },
      ],
    },
    { field: "telefone", kind: "text", question: "Qual é o seu telefone / WhatsApp?" },
    { field: "email", kind: "text", question: "Qual é o seu e-mail?" },
    { field: "estado", kind: "text", question: "Em qual estado você mora? (Ex: SP, RJ, MG)" },
    { field: "cidade", kind: "text", question: "Em qual cidade você mora?" },
    { field: "empresa", kind: "text", question: "Qual é a empresa do processo seletivo?" },
    {
      field: "statusProfissional",
      kind: "single_choice",
      question: "Qual é o seu status profissional atual?",
      options: [
        { id: "candidato", label: "Candidato", value: "Candidato" },
        { id: "colaborador", label: "Colaborador", value: "Colaborador" },
      ],
    },
    { field: "area", kind: "text", question: "Qual é a sua área de atuação? (Ex: Tecnologia, RH, Comercial, Financeiro)" },
    { field: "cargo", kind: "text", question: "Qual é o seu cargo?" },
    {
      field: "disc1",
      kind: "single_choice",
      question: "Quando você precisa lidar com um desafio importante no trabalho, qual dessas atitudes mais te representa?",
      options: DISC_Q1_OPTIONS,
    },
    {
      field: "disc2",
      kind: "single_choice",
      question: "Em um ambiente de trabalho ideal, o que mais te motiva?",
      options: DISC_Q2_OPTIONS,
    },
    {
      field: "disc3",
      kind: "single_choice",
      question: "Como você reage quando precisa tomar uma decisão com pouco tempo e poucas informações?",
      options: DISC_Q3_OPTIONS,
    },
    {
      field: "disc4",
      kind: "single_choice",
      question: "Como você se comporta ao trabalhar em equipe?",
      options: DISC_Q4_OPTIONS,
    },
    {
      field: "disc5",
      kind: "single_choice",
      question: "Quando há mudanças inesperadas no trabalho, como você costuma reagir?",
      options: DISC_Q5_OPTIONS,
    },
    {
      field: "disc6",
      kind: "single_choice",
      question: "O que mais te incomoda no ambiente de trabalho?",
      options: DISC_Q6_OPTIONS,
    },
    {
      field: "motivacao",
      kind: "single_choice",
      question: "O que mais tende a te motivar no trabalho hoje?",
      options: MOTIVATION_OPTIONS,
    },
    {
      field: "competenciaExemplo1",
      kind: "text",
      question: getCompetencyQuestion(competencias[0], 0),
    },
    {
      field: "competenciaExemplo2",
      kind: "text",
      question: getCompetencyQuestion(competencias[1], 1),
    },
    {
      field: "competenciaExemplo3",
      kind: "text",
      question: getCompetencyQuestion(competencias[2], 2),
    },

    // ── ENEAGRAMA — Parte 2 ──────────────────────────────────────────────────
    {
      field: "ea",
      kind: "text",
      question: `Escolha a afirmação que descreve melhor você:

1. Eu costumo focar em fazer as coisas da maneira certa, mesmo que demore mais.
2. Eu costumo focar em manter o clima leve e ter novas experiências interessantes.

👉 Responda com 1 ou 2.`,
    },
    {
      field: "eb",
      kind: "text",
      question: `Escolha a afirmação que descreve melhor você:

1. É muito importante para mim ser útil e apoiar as pessoas ao meu redor.
2. É muito importante para mim ser competente e ter conhecimento sólido.

👉 Responda com 1 ou 2.`,
    },
    {
      field: "ec",
      kind: "text",
      question: `Escolha a afirmação que descreve melhor você:

1. Quando surge um problema, tomo iniciativa rapidamente e assumo o controle.
2. Quando surge um problema, busco conciliar as pessoas e evitar conflitos.

👉 Responda com 1 ou 2.`,
    },
    {
      field: "ed",
      kind: "text",
      question: `Escolha a afirmação que descreve melhor você:

1. Prefiro arriscar em algo novo do que ficar planejando demais.
2. Prefiro analisar bem os cenários antes de dar um passo importante.

👉 Responda com 1 ou 2.`,
    },
    {
      field: "ee",
      kind: "text",
      question: `Escolha a afirmação que descreve melhor você:

1. É mais fácil para mim assumir responsabilidades do que pedir ajuda.
2. É mais fácil para mim pedir ajuda do que assumir tudo sozinho(a).

👉 Responda com 1 ou 2.`,
    },
    {
      field: "el1",
      kind: "text",
      question: `Eu me cobro muito para ser correto e evitar erros.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "el2",
      kind: "text",
      question: `Eu me sinto valioso quando as pessoas reconhecem meus resultados.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "el3",
      kind: "text",
      question: `Eu prefiro evitar conflitos, mesmo quando tenho opinião diferente.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "el4",
      kind: "text",
      question: `Eu gosto de ter muitas opções e planejar coisas interessantes para o futuro.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "el5",
      kind: "text",
      question: `Eu penso bastante nos cenários de risco antes de tomar uma decisão.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "el6",
      kind: "text",
      question: `Eu preciso de bastante tempo sozinho para recarregar e organizar minhas ideias.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "el7",
      kind: "text",
      question: `Eu costumo assumir naturalmente a liderança quando o grupo está sem direção.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "el8",
      kind: "text",
      question: `Eu tenho dificuldade em mostrar vulnerabilidade no trabalho.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "el9",
      kind: "text",
      question: `Eu me envolvo tanto no trabalho que às vezes esqueço de descansar.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "el10",
      kind: "text",
      question: `Receber críticas mexe bastante comigo, mesmo quando sei que são construtivas.

1 = Discordo totalmente
2 = Discordo parcialmente
3 = Neutro
4 = Concordo parcialmente
5 = Concordo totalmente`,
    },
    {
      field: "eq1",
      kind: "text",
      question: `Quando você está sob pressão no trabalho, o que mais te incomoda? Descreva com um exemplo recente.`,
    },
    {
      field: "eq2",
      kind: "text",
      question: `O que geralmente te motiva a aceitar um novo projeto, mesmo com a agenda cheia?`,
    },
    {
      field: "eq3",
      kind: "text",
      question: `Em conflitos, você tende mais a evitar, enfrentar diretamente, mediar ou se afastar? Conte um caso brevemente.`,
    },
  ];
}

function resolveChoice(answer: string, options: ClosedOption[]): string | null {
  const raw = answer.trim().toLowerCase();
  if (!raw) return null;

  // número: "1" → primeira opção
  const num = parseInt(raw, 10);
  if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
    return options[num - 1].value;
  }

  // id exato (case-insensitive)
  const byId = options.find((o) => o.id.toLowerCase() === raw);
  if (byId) return byId.value;

  // value exato (case-insensitive)
  const byValue = options.find((o) => o.value.toLowerCase() === raw);
  if (byValue) return byValue.value;

  // palavra da label
  const byKeyword = options.find((o) =>
    o.label.toLowerCase().split(/[\s.,]+/).some((word) => word.startsWith(raw) || raw.startsWith(word))
  );
  if (byKeyword) return byKeyword.value;

  return null;
}

export function calculateDiscScores(session: ProfileSession): DiscScores {
  const scores: DiscScores = { D: 0, I: 0, S: 0, C: 0 };
  const fields = ["disc1", "disc2", "disc3", "disc4", "disc5", "disc6"] as const;

  for (const field of fields) {
    const letter = session[field]?.toUpperCase();
    if (letter && letter in LETTER_TO_DISC) {
      scores[LETTER_TO_DISC[letter]] += 1;
    }
  }

  return scores;
}

export function getDiscPercentages(scores: DiscScores): Record<keyof DiscScores, number> {
  return {
    D: Math.round((scores.D / 6) * 100),
    I: Math.round((scores.I / 6) * 100),
    S: Math.round((scores.S / 6) * 100),
    C: Math.round((scores.C / 6) * 100),
  };
}

export function getDominantProfile(scores: DiscScores): keyof DiscScores {
  const entries = Object.entries(scores) as Array<[keyof DiscScores, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function getSecondaryProfile(scores: DiscScores): keyof DiscScores {
  const entries = Object.entries(scores) as Array<[keyof DiscScores, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[1][0];
}

export const PROFILE_NAMES: Record<string, string> = {
  D: "Dominância (D)",
  I: "Influência (I)",
  S: "eStabilidade (S)",
  C: "Conformidade (C)",
};

function isEnneagramForcedField(field: string): boolean {
  return /^e[abcde]$/.test(field);
}

function isEnneagramLikertField(field: string): boolean {
  return /^el([1-9]|10)$/.test(field);
}

function isEnneagramQualitativeField(field: string): boolean {
  return /^eq[1-3]$/.test(field);
}

export function updateProfileSession(
  session: ProfileSession,
  field: ProfileField,
  answer: string
): ProfileSession {
  let resolved = answer;

  if (field === "motivacao") {
    resolved = resolveChoice(answer, MOTIVATION_OPTIONS) ?? answer;
  } else if (field in DISC_OPTIONS_MAP) {
    resolved = resolveChoice(answer, DISC_OPTIONS_MAP[field]) ?? answer;
  } else if (field === "sexo") {
    const SEXO_OPTIONS: ClosedOption[] = [
      { id: "M", label: "Masculino", value: "Masculino" },
      { id: "F", label: "Feminino", value: "Feminino" },
      { id: "O", label: "Prefiro não informar", value: "Prefiro não informar" },
    ];
    resolved = resolveChoice(answer, SEXO_OPTIONS) ?? answer;
  } else if (field === "statusProfissional") {
    const STATUS_OPTIONS: ClosedOption[] = [
      { id: "candidato", label: "Candidato", value: "Candidato" },
      { id: "colaborador", label: "Colaborador", value: "Colaborador" },
    ];
    resolved = resolveChoice(answer, STATUS_OPTIONS) ?? answer;
  } else if (isEnneagramForcedField(field)) {
    const v = answer.trim();
    if (v === "1") resolved = "A";
    else if (v === "2") resolved = "B";
    else resolved = v.toUpperCase().startsWith("A") ? "A" : v.toUpperCase().startsWith("B") ? "B" : v.toUpperCase();
  } else if (isEnneagramLikertField(field) || isEnneagramQualitativeField(field)) {
    resolved = answer.trim();
  }

  const next: ProfileSession = {
    ...session,
    [field]: resolved,
  };

  if ((field === "vaga" || field === "cargo") && resolved.trim() && !next.competenciasPrincipais?.length) {
    next.competenciasPrincipais = suggestCompetenciasByRole(resolved.trim());
    // Garante que vaga seja preenchida com cargo caso vaga não exista
    if (!next.vaga) next.vaga = resolved.trim();
  }

  if (field.startsWith("disc")) {
    next.discScores = calculateDiscScores(next);
  }

  return next;
}

export function getNextProfileQuestion(session: ProfileSession): FlowQuestion | null {
  const flow = buildProfileFlow(session);
  const s = session as Record<string, unknown>;

  for (const item of flow) {
    const value = s[item.field];

    if (typeof value === "undefined") {
      return item;
    }

    if (typeof value === "string" && !value.trim()) {
      return item;
    }
  }

  return null;
}

export function isProfileReady(session: ProfileSession): boolean {
  return getNextProfileQuestion(session) === null;
}
