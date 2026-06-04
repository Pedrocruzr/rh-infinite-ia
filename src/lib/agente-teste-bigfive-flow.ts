export type BigFiveField =
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
  | `q${number}`;

const PERSONAL_FIELDS: ReadonlySet<string> = new Set([
  "nome",
  "sobrenome",
  "sexo",
  "telefone",
  "email",
  "estado",
  "cidade",
  "empresa",
  "statusProfissional",
  "area",
  "cargo",
]);

export function isPersonalBigFiveField(field: string): boolean {
  return PERSONAL_FIELDS.has(field);
}

export type BigFiveSession = {
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
  [key: `q${number}`]: string | undefined;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
};

type FlowQuestion = {
  field: BigFiveField;
  question: string;
};

// Gerador estático das perguntas do Big Five IPIP-NEO-120
export const BIG_FIVE_FLOW: FlowQuestion[] = [
  { field: "nome", question: "Para começarmos, qual é o seu nome?" },
  { field: "sobrenome", question: "Qual é o seu sobrenome?" },
  {
    field: "sexo",
    question: `Qual o seu sexo?

1) Masculino
2) Feminino
3) Prefiro não informar

👉 Responda com 1, 2 ou 3.`,
  },
  { field: "telefone", question: "Qual é o seu telefone? (com DDD)" },
  { field: "email", question: "Qual é o seu e-mail?" },
  { field: "estado", question: "Em qual estado você mora? (ex: SP, RJ, MG)" },
  { field: "cidade", question: "Em qual cidade você mora?" },
  { field: "empresa", question: "Qual é a empresa do processo seletivo?" },
  {
    field: "statusProfissional",
    question: `Qual é o seu status profissional atual?

1) Candidato (em processo seletivo)
2) Colaborador (já trabalha na empresa)

👉 Responda com 1 ou 2.`,
  },
  { field: "area", question: "Qual é a sua área de atuação?" },
  { field: "cargo", question: "Qual é o seu cargo atual ou pretendido?" },
];

const RAW_ITEMS = [
  // Abertura (O)
  { id: 1, texto: "Tenho uma imaginação vívida.", fator: "O", faceta: "O1", chave: "+" },
  { id: 2, texto: "Quase nunca sonho acordado ou imagino cenários diferentes para minha vida.", fator: "O", faceta: "O1", chave: "-" },
  { id: 3, texto: "Costumo imaginar cenários e possibilidades que outras pessoas nem consideram.", fator: "O", faceta: "O1", chave: "+" },
  { id: 4, texto: "Prefiro manter meus pensamentos na realidade prática e imediata.", fator: "O", faceta: "O1", chave: "-" },
  { id: 5, texto: "Valorizo muito arte, música e cultura em geral.", fator: "O", faceta: "O2", chave: "+" },
  { id: 6, texto: "Raramente me interesso por obras de arte ou manifestações culturais.", fator: "O", faceta: "O2", chave: "-" },
  { id: 7, texto: "Sinto-me profundamente tocado por belas músicas ou poemas.", fator: "O", faceta: "O2", chave: "+" },
  { id: 8, texto: "Acho museus e galerias de arte lugares entediantes.", fator: "O", faceta: "O2", chave: "-" },
  { id: 9, texto: "Gosto de refletir sobre ideias complexas.", fator: "O", faceta: "O3", chave: "+" },
  { id: 10, texto: "Assuntos abstratos me entediam facilmente.", fator: "O", faceta: "O3", chave: "-" },
  { id: 11, texto: "Acho fascinante discutir teorias filosóficas ou científicas.", fator: "O", faceta: "O3", chave: "+" },
  { id: 12, texto: "Evito conversas sobre temas muito intelectuais ou profundos.", fator: "O", faceta: "O3", chave: "-" },
  { id: 13, texto: "Acredito que as normas sociais devem ser questionadas e evoluir.", fator: "O", faceta: "O4", chave: "+" },
  { id: 14, texto: "Prefiro seguir tradições estabelecidas do que tentar novas formas.", fator: "O", faceta: "O4", chave: "-" },
  { id: 15, texto: "Gosto de conviver com pessoas que têm estilos de vida muito diferentes do meu.", fator: "O", faceta: "O4", chave: "+" },
  { id: 16, texto: "Acho que a sociedade funciona melhor quando todos seguem os mesmos valores tradicionais.", fator: "O", faceta: "O4", chave: "-" },
  { id: 17, texto: "Gosto de aprender sobre coisas novas e variadas.", fator: "O", faceta: "O5", chave: "+" },
  { id: 18, texto: "Sinto pouca necessidade de explorar assuntos fora do meu trabalho.", fator: "O", faceta: "O5", chave: "-" },
  { id: 19, texto: "Sempre busco saber o 'porquê' das coisas funcionarem de certa forma.", fator: "O", faceta: "O5", chave: "+" },
  { id: 20, texto: "Fico satisfeito com explicações simples e não busco me aprofundar.", fator: "O", faceta: "O5", chave: "-" },
  { id: 21, texto: "Adapto-me facilmente a novas maneiras de fazer as coisas.", fator: "O", faceta: "O6", chave: "+" },
  { id: 22, texto: "Sinto grande desconforto quando preciso mudar minha rotina.", fator: "O", faceta: "O6", chave: "-" },
  { id: 23, texto: "Gosto de experimentar novos caminhos ou métodos no dia a dia.", fator: "O", faceta: "O6", chave: "+" },
  { id: 24, texto: "Prefiro fazer as tarefas do jeito que sempre fiz.", fator: "O", faceta: "O6", chave: "-" },

  // Conscienciosidade (C)
  { id: 25, texto: "Gosto de ter tudo planejado e organizado.", fator: "C", faceta: "C1", chave: "+" },
  { id: 26, texto: "Frequentemente deixo minhas coisas espalhadas e desorganizadas.", fator: "C", faceta: "C1", chave: "-" },
  { id: 27, texto: "Mantenho meus arquivos e pertences bem estruturados e fáceis de encontrar.", fator: "C", faceta: "C1", chave: "+" },
  { id: 28, texto: "Costumo trabalhar em meio a uma bagunça e não me importo com isso.", fator: "C", faceta: "C1", chave: "-" },
  { id: 29, texto: "Cumpro meus compromissos mesmo quando dá trabalho.", fator: "C", faceta: "C2", chave: "+" },
  { id: 30, texto: "Costumo adiar tarefas importantes até o último momento.", fator: "C", faceta: "C2", chave: "-" },
  { id: 31, texto: "As pessoas sabem que podem contar comigo para entregar o que prometi.", fator: "C", faceta: "C2", chave: "+" },
  { id: 32, texto: "Às vezes evito assumir responsabilidades para não ter obrigações adicionais.", fator: "C", faceta: "C2", chave: "-" },
  { id: 33, texto: "Continuo trabalhando em uma tarefa mesmo quando ela se torna difícil.", fator: "C", faceta: "C3", chave: "+" },
  { id: 34, texto: "Desisto facilmente quando encontro obstáculos.", fator: "C", faceta: "C3", chave: "-" },
  { id: 35, texto: "Tenho persistência para terminar tudo aquilo que começo.", fator: "C", faceta: "C3", chave: "+" },
  { id: 36, texto: "Costumo desanimar e abandonar projetos pela metade.", fator: "C", faceta: "C3", chave: "-" },
  { id: 37, texto: "Tenho facilidade para manter o foco e evitar distrações.", fator: "C", faceta: "C4", chave: "+" },
  { id: 38, texto: "Acho muito difícil me concentrar em tarefas tediosas.", fator: "C", faceta: "C4", chave: "-" },
  { id: 39, texto: "Começo a trabalhar imediatamente nas minhas obrigações, sem hesitar.", fator: "C", faceta: "C4", chave: "+" },
  { id: 40, texto: "Perco muito tempo procrastinando antes de começar a trabalhar.", fator: "C", faceta: "C4", chave: "-" },
  { id: 41, texto: "Faço questão de chegar pontualmente aos meus compromissos.", fator: "C", faceta: "C5", chave: "+" },
  { id: 42, texto: "Costumo me atrasar um pouco para reuniões e compromissos sociais.", fator: "C", faceta: "C5", chave: "-" },
  { id: 43, texto: "Planejo meu tempo para garantir que nunca deixarei ninguém esperando.", fator: "C", faceta: "C5", chave: "+" },
  { id: 44, texto: "Raramente me preocupo com horários exatos e levo a vida com mais flexibilidade.", fator: "C", faceta: "C5", chave: "-" },
  { id: 45, texto: "Preparar listas de tarefas me ajuda a ter um dia mais produtivo.", fator: "C", faceta: "C6", chave: "+" },
  { id: 46, texto: "Prefiro agir por impulso em vez de fazer planos detalhados.", fator: "C", faceta: "C6", chave: "-" },
  { id: 47, texto: "Traço metas claras de curto e longo prazo para minha vida.", fator: "C", faceta: "C6", chave: "+" },
  { id: 48, texto: "Levo a vida conforme as coisas acontecem, sem planejar muito o futuro.", fator: "C", faceta: "C6", chave: "-" },

  // Extroversão (E)
  { id: 49, texto: "Costumo expressar minha alegria e entusiasmo de forma aberta.", fator: "E", faceta: "E1", chave: "+" },
  { id: 50, texto: "Raramente demonstro muita empolgação, mesmo quando estou feliz.", fator: "E", faceta: "E1", chave: "-" },
  { id: 51, texto: "Tenho facilidade para contagiar os outros com minha energia positiva.", fator: "E", faceta: "E1", chave: "+" },
  { id: 52, texto: "Prefiro manter uma postura mais reservada e séria no dia a dia.", fator: "E", faceta: "E1", chave: "-" },
  { id: 53, texto: "Faço amigos com facilidade.", fator: "E", faceta: "E2", chave: "+" },
  { id: 54, texto: "Prefiro ficar na minha e quase não inicio conversas.", fator: "E", faceta: "E2", chave: "-" },
  { id: 55, texto: "Gosto de estar rodeado de pessoas e participar de eventos sociais.", fator: "E", faceta: "E2", chave: "+" },
  { id: 56, texto: "Sinto que interagir com muitas pessoas consome rapidamente minha energia.", fator: "E", faceta: "E2", chave: "-" },
  { id: 57, texto: "Costumo me posicionar e defender minhas opiniões em grupo.", fator: "E", faceta: "E3", chave: "+" },
  { id: 58, texto: "Evito me impor, mesmo quando tenho uma opinião forte.", fator: "E", faceta: "E3", chave: "-" },
  { id: 59, texto: "Fico confortável em assumir a liderança e direcionar outras pessoas.", fator: "E", faceta: "E3", chave: "+" },
  { id: 60, texto: "Prefiro que outras pessoas tomem as decisões e digam o que devo fazer.", fator: "E", faceta: "E3", chave: "-" },
  { id: 61, texto: "Gosto de viver em um ritmo acelerado e cheio de atividades.", fator: "E", faceta: "E4", chave: "+" },
  { id: 62, texto: "Prefiro um estilo de vida calmo, silencioso e sem grandes agitações.", fator: "E", faceta: "E4", chave: "-" },
  { id: 63, texto: "Procuro constantemente novas aventuras e emoções fortes.", fator: "E", faceta: "E4", chave: "+" },
  { id: 64, texto: "Ambientes muito barulhentos ou movimentados me incomodam.", fator: "E", faceta: "E4", chave: "-" },
  { id: 65, texto: "Costumo encarar a vida com muito otimismo e bom humor.", fator: "E", faceta: "E5", chave: "+" },
  { id: 66, texto: "Frequentemente me pego pensando nos aspectos negativos das situações.", fator: "E", faceta: "E5", chave: "-" },
  { id: 67, texto: "Sinto-me feliz e satisfeito na maior parte do tempo.", fator: "E", faceta: "E5", chave: "+" },
  { id: 68, texto: "Raramente dou risada ou me sinto extremamente alegre.", fator: "E", faceta: "E5", chave: "-" },
  { id: 69, texto: "Sou uma pessoa cheia de energia na maior parte do tempo.", fator: "E", faceta: "E6", chave: "+" },
  { id: 70, texto: "Costumo me sentir sem energia e desanimado.", fator: "E", faceta: "E6", chave: "-" },
  { id: 71, texto: "Mantenho um ritmo ativo e dinâmico de trabalho e lazer.", fator: "E", faceta: "E6", chave: "+" },
  { id: 72, texto: "Prefiro fazer as coisas de forma lenta e pausada.", fator: "E", faceta: "E6", chave: "-" },

  // Agradabilidade (A)
  { id: 73, texto: "Acredito que a maioria das pessoas tem boas intenções.", fator: "A", faceta: "A1", chave: "+" },
  { id: 74, texto: "Costumo desconfiar das reais intenções por trás da ajuda dos outros.", fator: "A", faceta: "A1", chave: "-" },
  { id: 75, texto: "Confio facilmente na honestidade das pessoas com quem convivo.", fator: "A", faceta: "A1", chave: "+" },
  { id: 76, texto: "Acho que é preciso ter cuidado, pois muitas pessoas agem apenas por interesse próprio.", fator: "A", faceta: "A1", chave: "-" },
  { id: 77, texto: "Costumo me importar genuinamente com o que os outros sentem.", fator: "A", faceta: "A2", chave: "+" },
  { id: 78, texto: "Raramente me interesso pelos problemas dos outros.", fator: "A", faceta: "A2", chave: "-" },
  { id: 79, texto: "Sinto satisfação em ajudar as pessoas sem esperar nada em troca.", fator: "A", faceta: "A2", chave: "+" },
  { id: 80, texto: "Acho que cada um deve resolver seus próprios problemas sem depender dos outros.", fator: "A", faceta: "A2", chave: "-" },
  { id: 81, texto: "Gosto de trabalhar em equipe e colaborar com os colegas.", fator: "A", faceta: "A3", chave: "+" },
  { id: 82, texto: "Prefiro fazer tudo sozinho e não gosto de depender dos outros.", fator: "A", faceta: "A3", chave: "-" },
  { id: 83, texto: "Faço concessões para evitar discussões e manter a harmonia no grupo.", fator: "A", faceta: "A3", chave: "+" },
  { id: 84, texto: "Não hesito em entrar em conflito se for necessário para defender o que acho certo.", fator: "A", faceta: "A3", chave: "-" },
  { id: 85, texto: "Não gosto de ficar chamando atenção para minhas próprias qualidades ou conquistas.", fator: "A", faceta: "A4", chave: "+" },
  { id: 86, texto: "Considero-me superior ou mais capaz do que a maioria das pessoas que conheço.", fator: "A", faceta: "A4", chave: "-" },
  { id: 87, texto: "Fico confortável quando elogiam o grupo, dividindo os méritos com os outros.", fator: "A", faceta: "A4", chave: "+" },
  { id: 88, texto: "Gosto de deixar claro o quanto fui essencial para o sucesso de um projeto.", fator: "A", faceta: "A4", chave: "-" },
  { id: 89, texto: "Fico comovido ao ver pessoas passando por dificuldades.", fator: "A", faceta: "A5", chave: "+" },
  { id: 90, texto: "Consigo manter o distanciamento emocional mesmo diante do sofrimento alheio.", fator: "A", faceta: "A5", chave: "-" },
  { id: 91, texto: "Costumo agir com compaixão e apoiar quem está vulnerável.", fator: "A", faceta: "A5", chave: "+" },
  { id: 92, texto: "Acho que as pessoas costumam exagerar em suas lamentações dramáticas.", fator: "A", faceta: "A5", chave: "-" },
  { id: 93, texto: "Sou paciente com pessoas que pensam diferente de mim.", fator: "A", faceta: "A6", chave: "+" },
  { id: 94, texto: "Fico facilmente irritado com opiniões contrárias às minhas.", fator: "A", faceta: "A6", chave: "-" },
  { id: 95, texto: "Consigo perdoar erros dos outros com facilidade e seguir em frente.", fator: "A", faceta: "A6", chave: "+" },
  { id: 96, texto: "Costumo guardar ressentimento de quem agiu de forma errada comigo.", fator: "A", faceta: "A6", chave: "-" },

  // Neuroticismo (N)
  { id: 97, texto: "Costumo me preocupar muito com as coisas.", fator: "N", faceta: "N1", chave: "+" },
  { id: 98, texto: "Raramente me sinto ansioso ou preocupado.", fator: "N", faceta: "N1", chave: "-" },
  { id: 99, texto: "Frequentemente sinto apreensão sobre o que pode acontecer no futuro.", fator: "N", faceta: "N1", chave: "+" },
  { id: 100, texto: "Tenho uma mente tranquila e encaro os problemas do dia a dia com calma.", fator: "N", faceta: "N1", chave: "-" },
  { id: 101, texto: "Fico facilmente chateado ou irritado com pequenos contratempos.", fator: "N", faceta: "N2", chave: "+" },
  { id: 102, texto: "É muito difícil me tirar do sério ou me fazer perder a paciência.", fator: "N", faceta: "N2", chave: "-" },
  { id: 103, texto: "Costumo perder a calma e reagir de forma estressada quando as coisas dão errado.", fator: "N", faceta: "N2", chave: "+" },
  { id: 104, texto: "Consigo engolir a frustração e manter uma postura calma em discussões.", fator: "N", faceta: "N2", chave: "-" },
  { id: 105, texto: "Fico facilmente estressado em situações de pressão.", fator: "N", faceta: "N3", chave: "+" },
  { id: 106, texto: "Mesmo em situações difíceis, consigo manter a calma.", fator: "N", faceta: "N3", chave: "-" },
  { id: 107, texto: "Sinto-me sobrecarregado quando preciso lidar com muitos prazos ou tarefas.", fator: "N", faceta: "N3", chave: "+" },
  { id: 108, texto: "Lido muito bem com crises e consigo pensar com clareza sob extrema cobrança.", fator: "N", faceta: "N3", chave: "-" },
  { id: 109, texto: "Sinto-me muito desconfortável ou envergonhado quando sou o centro das atenções.", fator: "N", faceta: "N4", chave: "+" },
  { id: 110, texto: "Raramente me importo com o que os outros pensam sobre minha aparência ou atitudes.", fator: "N", faceta: "N4", chave: "-" },
  { id: 111, texto: "Preocupo-me excessivamente em cometer erros sociais ou passar vergonha em público.", fator: "N", faceta: "N4", chave: "+" },
  { id: 112, texto: "Tenho segurança de mim mesmo e me sinto à vontade em qualquer ambiente social.", fator: "N", faceta: "N4", chave: "-" },
  { id: 113, texto: "Às vezes sinto uma tristeza profunda sem um motivo muito claro.", fator: "N", faceta: "N5", chave: "+" },
  { id: 114, texto: "Dificilmente me sinto deprimido ou desanimado por muito tempo.", fator: "N", faceta: "N5", chave: "-" },
  { id: 115, texto: "Frequentemente sinto desânimo em relação ao rumo das minhas coisas.", fator: "N", faceta: "N5", chave: "+" },
  { id: 116, texto: "Encaro o futuro com esperança e me sinto entusiasmado com a vida.", fator: "N", faceta: "N5", chave: "-" },
  { id: 117, texto: "Meu humor muda com facilidade ao longo do dia.", fator: "N", faceta: "N6", chave: "+" },
  { id: 118, texto: "Meu humor é estável e dificilmente oscila muito.", fator: "N", faceta: "N6", chave: "-" },
  { id: 119, texto: "Coisas simples podem mudar drasticamente meu estado de espírito.", fator: "N", faceta: "N6", chave: "+" },
  { id: 120, texto: "Consigo manter o mesmo nível de ânimo e humor do início ao fim do dia.", fator: "N", faceta: "N6", chave: "-" },
];

// Carrega os 120 itens no fluxo
for (const item of RAW_ITEMS) {
  BIG_FIVE_FLOW.push({
    field: `q${item.id}` as BigFiveField,
    question: `Questão ${item.id} de 120

"${item.texto}"

Como você se avalia em relação a essa frase?
1 — Muito inadequado (ou "Muito impreciso sobre mim")
2 — Inadequado
3 — Neutro
4 — Adequado
5 — Muito adequado

👉 Responda com um número de 1 a 5.`,
  });
}

export function getNextBigFiveQuestion(session: BigFiveSession): FlowQuestion | null {
  for (const item of BIG_FIVE_FLOW) {
    const value = session[item.field];
    if (!value || !value.trim()) {
      return item;
    }
  }
  return null;
}

function resolveSexo(value: string): string {
  const v = value.trim();
  if (v === "1" || /^masc/i.test(v)) return "Masculino";
  if (v === "2" || /^fem/i.test(v)) return "Feminino";
  if (v === "3" || /^pref/i.test(v)) return "Prefiro não informar";
  return v;
}

function resolveStatusProfissional(value: string): string {
  const v = value.trim();
  if (v === "1" || /^cand/i.test(v)) return "Candidato";
  if (v === "2" || /^colab/i.test(v)) return "Colaborador";
  return v;
}

export function updateBigFiveSession(
  session: BigFiveSession,
  field: BigFiveField,
  value: string
): BigFiveSession {
  if (isPersonalBigFiveField(field)) {
    let resolved = value.trim();
    if (field === "sexo") resolved = resolveSexo(resolved);
    if (field === "statusProfissional") resolved = resolveStatusProfissional(resolved);
    return { ...session, [field]: resolved };
  }
  return { ...session, [field]: value.trim() };
}

export function isBigFiveReady(session: BigFiveSession): boolean {
  return getNextBigFiveQuestion(session) === null;
}

export function initializeBigFiveSession(): BigFiveSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export function runBigFiveStep(
  session: BigFiveSession,
  answer?: string,
  currentField?: BigFiveField | string
) {
  if (!currentField) {
    const next = getNextBigFiveQuestion(session);
    return {
      session,
      completed: false,
      currentField: next?.field ?? null,
      nextField: next?.field ?? null,
      question: next?.question ?? null,
      reply: next?.question ?? null,
    };
  }

  const raw = String(answer ?? "").trim();
  const isPersonal = isPersonalBigFiveField(currentField);

  if (!raw) {
    const current = BIG_FIVE_FLOW.find((item) => item.field === currentField);
    return {
      session,
      completed: false,
      currentField,
      nextField: currentField,
      question: current?.question ?? null,
      reply: isPersonal
        ? "Por favor, informe sua resposta."
        : "Resposta inválida. Por favor, digite um número de 1 a 5.",
    };
  }

  if (isPersonal) {
    const fieldLower = String(currentField).toLowerCase();
    
    if (fieldLower === "telefone") {
      const digits = raw.replace(/\D/g, "");
      if (digits.length !== 10 && digits.length !== 11) {
        const current = BIG_FIVE_FLOW.find((item) => item.field === currentField);
        return {
          session,
          completed: false,
          currentField,
          nextField: currentField,
          question: current?.question ?? null,
          reply: "Telefone inválido. Por favor, insira um telefone válido com DDD (10 ou 11 números).",
        };
      }
    }
    
    if (fieldLower === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(raw)) {
        const current = BIG_FIVE_FLOW.find((item) => item.field === currentField);
        return {
          session,
          completed: false,
          currentField,
          nextField: currentField,
          question: current?.question ?? null,
          reply: "E-mail inválido. Por favor, insira um e-mail no formato correto (exemplo@email.com).",
        };
      }
    }
    
    if (fieldLower === "statusprofissional") {
      if (raw !== "1" && raw !== "2") {
        const current = BIG_FIVE_FLOW.find((item) => item.field === currentField);
        return {
          session,
          completed: false,
          currentField,
          nextField: currentField,
          question: current?.question ?? null,
          reply: "Opção inválida. Responda apenas 1 para Candidato ou 2 para Colaborador.",
        };
      }
    }
    
    if (fieldLower === "sexo") {
      if (raw !== "1" && raw !== "2" && raw !== "3") {
        const current = BIG_FIVE_FLOW.find((item) => item.field === currentField);
        return {
          session,
          completed: false,
          currentField,
          nextField: currentField,
          question: current?.question ?? null,
          reply: "Opção inválida. Responda apenas 1, 2 ou 3.",
        };
      }
    }
  } else {
    const num = parseInt(raw, 10);
    if (Number.isNaN(num) || num < 1 || num > 5) {
      const current = BIG_FIVE_FLOW.find((item) => item.field === currentField);
      return {
        session,
        completed: false,
        currentField,
        nextField: currentField,
        question: current?.question ?? null,
        reply: "Resposta inválida. Responda apenas com um número de 1 a 5.",
      };
    }
  }

  const updated = updateBigFiveSession(
    session,
    currentField as BigFiveField,
    raw
  );

  const next = getNextBigFiveQuestion(updated);
  const completed = isBigFiveReady(updated);

  return {
    session: {
      ...updated,
      status: completed ? "completed" : "in_progress",
      reportStatus: completed ? "generated" : "pending",
    },
    completed,
    currentField: next?.field ?? null,
    nextField: next?.field ?? null,
    question: next?.question ?? null,
    reply: completed ? null : next?.question ?? null,
  };
}
