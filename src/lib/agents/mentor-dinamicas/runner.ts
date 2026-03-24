import type { DynamicCategory, MentorDinamicasSession } from "./flow";

type DynamicBlock = {
  titulo: string;
  objetivo: string;
  participantes: string;
  tempo: string;
  materiais: string[];
  passos: string[];
  criterios: string[];
  erros: string[];
  variacoes: string[];
  nota: string;
};

const DYNAMICS_BY_CATEGORY: Record<DynamicCategory, DynamicBlock[]> = {
  "Comunicação": [
    {
      titulo: "Pitch de 1 Minuto",
      objetivo: "Avaliar clareza, síntese e organização da fala.",
      participantes: "Individual ou grupo.",
      tempo: "10 a 15 minutos.",
      materiais: ["Cronômetro", "Papel para anotações"],
      passos: [
        "Explique o objetivo da atividade em linguagem simples.",
        "Peça que cada participante apresente, em até 1 minuto, quem é, no que é bom e um exemplo de resultado.",
        "Dê 2 minutos de preparação antes da fala.",
        "Observe clareza, sequência lógica, objetividade e contato visual.",
        "Faça uma pergunta final para verificar capacidade de sustentar a comunicação.",
      ],
      criterios: [
        "Clareza ao falar",
        "Organização da fala",
        "Capacidade de síntese",
        "Escuta na etapa de perguntas",
      ],
      erros: [
        "Falar sem estrutura",
        "Responder de forma vaga",
        "Não sustentar a própria ideia",
      ],
      variacoes: [
        "Permitir resposta escrita antes da apresentação",
        "Autorizar apoio por tópicos em papel",
      ],
      nota: "Registre exemplos concretos do que a pessoa disse, como organizou a resposta e como reagiu à pergunta final.",
    },
    {
      titulo: "Explicando um Objeto Misterioso",
      objetivo: "Avaliar didática e capacidade de explicar algo com clareza.",
      participantes: "Individual.",
      tempo: "8 a 12 minutos.",
      materiais: ["Objeto simples ou imagem impressa"],
      passos: [
        "Mostre um objeto ou imagem.",
        "Peça que a pessoa explique como funciona ou para que serve.",
        "Solicite que adapte a explicação para alguém sem familiaridade com o tema.",
        "Observe clareza, didática e conexão entre ideias.",
      ],
      criterios: ["Didática", "Sequência lógica", "Adequação da linguagem", "Confiança"],
      erros: ["Falar de forma técnica demais", "Pular etapas da explicação", "Não adaptar a linguagem"],
      variacoes: ["Aceitar explicação com desenho de apoio", "Dar 1 minuto extra de preparação"],
      nota: "Procure evidências de linguagem simples, começo-meio-fim e preocupação em ser entendido.",
    },
  ],
  "Trabalho em Equipe": [
    {
      titulo: "Construção em Grupo com Regras Limitadas",
      objetivo: "Avaliar colaboração, divisão de tarefas e coordenação.",
      participantes: "Grupo de 4 a 6.",
      tempo: "20 minutos.",
      materiais: ["Papel", "Fita", "Canetas"],
      passos: [
        "Apresente uma tarefa prática com prazo curto.",
        "Defina uma restrição simples, como limitação de material.",
        "Observe como o grupo se organiza, escuta e distribui papéis.",
        "Peça uma breve reflexão final sobre como trabalharam juntos.",
      ],
      criterios: ["Cooperação", "Escuta", "Divisão de responsabilidades", "Apoio ao grupo"],
      erros: ["Competição interna", "Centralização", "Desorganização"],
      variacoes: ["Permitir um relator no grupo", "Aceitar planejamento visual antes da execução"],
      nota: "Observe quem integra o grupo e quem dificulta a cooperação.",
    },
    {
      titulo: "Problema Compartilhado",
      objetivo: "Avaliar construção coletiva de solução.",
      participantes: "Grupo.",
      tempo: "15 a 20 minutos.",
      materiais: ["Cenário impresso", "Papel"],
      passos: [
        "Entregue um problema organizacional simples.",
        "Peça que o grupo construa uma solução em conjunto.",
        "Observe quem escuta, complementa, organiza e concilia opiniões.",
      ],
      criterios: ["Escuta ativa", "Construção conjunta", "Flexibilidade", "Compromisso com o resultado"],
      erros: ["Interromper colegas", "Ignorar ideias úteis", "Forçar decisão sem consenso mínimo"],
      variacoes: ["Resposta falada ou escrita", "Tempo extra de alinhamento inicial"],
      nota: "Valorize colaboração efetiva, não apenas participação alta.",
    },
  ],
  "Liderança": [
    {
      titulo: "Delegação com Prazo Curto",
      objetivo: "Avaliar priorização, direcionamento e coordenação do grupo.",
      participantes: "Grupo.",
      tempo: "20 minutos.",
      materiais: ["Caso impresso", "Quadro ou papel"],
      passos: [
        "Apresente uma situação com várias tarefas urgentes.",
        "Peça que uma pessoa assuma a condução do grupo.",
        "Observe como distribui tarefas, orienta e acompanha.",
      ],
      criterios: ["Direcionamento", "Clareza", "Tomada de decisão", "Acompanhamento"],
      erros: ["Mandar sem escutar", "Não priorizar", "Centralizar tudo"],
      variacoes: ["Rodízio de liderança", "Registro escrito da divisão de tarefas"],
      nota: "Liderança saudável combina direção com escuta e responsabilidade.",
    },
    {
      titulo: "Condução de Reunião Simulada",
      objetivo: "Avaliar capacidade de organizar fala, decidir e manter foco.",
      participantes: "Individual ou grupo.",
      tempo: "15 minutos.",
      materiais: ["Tema de reunião", "Cronômetro"],
      passos: [
        "Peça que a pessoa conduza uma reunião curta sobre um problema.",
        "Observe abertura, objetivo, organização da conversa e fechamento.",
      ],
      criterios: ["Condução", "Foco", "Síntese", "Tomada de decisão"],
      erros: ["Perder o foco", "Não concluir", "Ignorar contribuições"],
      variacoes: ["Aceitar roteiro em tópicos", "Permitir tempo de preparo"],
      nota: "Observe se a pessoa consegue conduzir sem atropelar.",
    },
  ],
  "Criatividade": [
    {
      titulo: "Usos Inusitados",
      objetivo: "Avaliar geração de ideias e flexibilidade mental.",
      participantes: "Individual ou grupo.",
      tempo: "10 minutos.",
      materiais: ["Objeto comum", "Papel"],
      passos: [
        "Mostre um objeto simples.",
        "Peça que a pessoa proponha novos usos para ele.",
        "Observe variedade, originalidade e coerência.",
      ],
      criterios: ["Fluidez de ideias", "Originalidade", "Aplicabilidade", "Flexibilidade"],
      erros: ["Repetir ideias óbvias", "Ficar travado sem explorar", "Propor ideias sem sentido"],
      variacoes: ["Resposta oral ou escrita", "Trabalho em dupla"],
      nota: "Criatividade útil combina novidade e conexão com a realidade.",
    },
    {
      titulo: "Campanha Relâmpago",
      objetivo: "Avaliar criação rápida de solução ou proposta.",
      participantes: "Individual ou grupo.",
      tempo: "15 a 20 minutos.",
      materiais: ["Desafio prático", "Papel"],
      passos: [
        "Apresente um desafio de comunicação ou produto.",
        "Peça uma proposta rápida com ideia central, público e mensagem.",
      ],
      criterios: ["Ideia central", "Coerência", "Clareza", "Originalidade"],
      erros: ["Ideias soltas", "Falta de foco", "Sem conexão com o objetivo"],
      variacoes: ["Entrega em mapa mental", "Apresentação curta com apoio visual"],
      nota: "Observe criatividade com direção, não apenas imaginação livre.",
    },
  ],
  "Raciocínio Lógico": [
    {
      titulo: "Sequência de Prioridades",
      objetivo: "Avaliar organização lógica e justificativa de decisões.",
      participantes: "Individual.",
      tempo: "10 a 15 minutos.",
      materiais: ["Lista de tarefas ou problemas"],
      passos: [
        "Entregue várias tarefas com urgência e impacto diferentes.",
        "Peça que a pessoa organize a ordem de ação e justifique.",
      ],
      criterios: ["Critério lógico", "Coerência", "Justificativa", "Clareza"],
      erros: ["Escolher sem explicar", "Ignorar impacto", "Misturar urgência com preferência"],
      variacoes: ["Permitir resposta por escrito", "Usar cartões para ordenar"],
      nota: "O mais importante é a lógica usada, não apenas a resposta final.",
    },
    {
      titulo: "Resolução de Caso com Dados Simples",
      objetivo: "Avaliar análise e interpretação de informações.",
      participantes: "Individual ou dupla.",
      tempo: "15 minutos.",
      materiais: ["Tabela simples ou cenário com números"],
      passos: [
        "Apresente um caso com poucos dados.",
        "Peça conclusão e justificativa objetiva.",
      ],
      criterios: ["Leitura correta dos dados", "Inferência", "Consistência", "Objetividade"],
      erros: ["Tirar conclusão sem base", "Ignorar dado relevante", "Se perder na explicação"],
      variacoes: ["Uso de rascunho", "Apresentação em tópicos"],
      nota: "Procure raciocínio estruturado e não apenas velocidade.",
    },
  ],
  "Proatividade": [
    {
      titulo: "O Problema Não Avisado",
      objetivo: "Avaliar iniciativa, leitura de contexto e ação responsável sem depender de ordens detalhadas.",
      participantes: "Individual ou grupo.",
      tempo: "20 a 30 minutos.",
      materiais: ["Cenário-problema impresso", "Caneta", "Quadro ou papel"],
      passos: [
        "Explique que a atividade simula uma situação real de trabalho.",
        "Entregue um cenário com problema implícito e poucas instruções.",
        "Pergunte apenas: como você lidaria com isso?",
        "Dê de 5 a 8 minutos para análise.",
        "Peça apresentação em ordem de prioridade.",
        "Faça perguntas complementares sobre urgência, risco e autonomia.",
      ],
      criterios: ["Identificação do problema", "Iniciativa", "Priorização", "Responsabilidade"],
      erros: ["Esperar instruções detalhadas", "Agir sem critério", "Focar no secundário"],
      variacoes: ["Resposta falada, escrita ou visual", "Tempo extra de organização"],
      nota: "Observe equilíbrio entre autonomia, prudência e foco no que realmente importa.",
    },
    {
      titulo: "Melhoria de Processo em 15 Minutos",
      objetivo: "Avaliar percepção de melhoria e ação prática.",
      participantes: "Individual ou grupo.",
      tempo: "25 a 35 minutos.",
      materiais: ["Descrição de um processo com falhas", "Papel", "Caneta"],
      passos: [
        "Apresente um processo simples com falhas visíveis.",
        "Peça sugestões práticas de melhoria.",
        "Pergunte o que pode ser melhorado agora, o que depende de alinhamento e como medir resultado.",
        "Reserve tempo para apresentação e perguntas finais.",
      ],
      criterios: ["Percepção de oportunidades", "Ação prática", "Visão de dono", "Acompanhamento"],
      erros: ["Reclamar sem propor", "Sugerir mudança irreal", "Ignorar medição"],
      variacoes: ["Entrega em tópicos escritos", "Fluxograma em vez de apresentação oral"],
      nota: "Procure evidências de atitude concreta e pensamento de implementação.",
    },
  ],
  "Fit Cultural": [
    {
      titulo: "Decisões em Cenários de Valores",
      objetivo: "Avaliar aderência comportamental ao ambiente e aos valores da empresa.",
      participantes: "Individual.",
      tempo: "15 minutos.",
      materiais: ["Cenários com dilemas simples"],
      passos: [
        "Apresente situações que exigem decisão entre caminhos diferentes.",
        "Peça que a pessoa diga o que faria e por quê.",
        "Compare com os valores e comportamentos desejados pela empresa.",
      ],
      criterios: ["Coerência com valores", "Critério de decisão", "Maturidade", "Consistência"],
      erros: ["Responder só para agradar", "Ficar genérico", "Não sustentar a justificativa"],
      variacoes: ["Resposta oral ou escrita", "Tempo breve de reflexão antes de responder"],
      nota: "Aderência cultural não é parecer igual a todos, e sim agir de forma compatível com o ambiente.",
    },
    {
      titulo: "Rituais e Ambiente de Trabalho",
      objetivo: "Avaliar compatibilidade com estilo de trabalho e convivência.",
      participantes: "Individual.",
      tempo: "10 a 15 minutos.",
      materiais: ["Descrição do contexto da equipe"],
      passos: [
        "Descreva o ambiente da equipe e os rituais mais comuns.",
        "Pergunte como a pessoa se sentiria nesse contexto e como se adaptaria.",
      ],
      criterios: ["Autopercepção", "Compatibilidade", "Flexibilidade", "Sinceridade"],
      erros: ["Responder no automático", "Não demonstrar reflexão", "Fingir aderência total sem coerência"],
      variacoes: ["Formato de conversa guiada", "Resposta em tópicos"],
      nota: "Observe alinhamento realista entre perfil e cultura.",
    },
  ],
  "Resiliência e Estresse": [
    {
      titulo: "Pressão com Mudança de Cenário",
      objetivo: "Avaliar reação diante de pressão e imprevisto.",
      participantes: "Individual ou grupo.",
      tempo: "15 a 20 minutos.",
      materiais: ["Caso com mudança repentina"],
      passos: [
        "Apresente uma tarefa em andamento.",
        "No meio da atividade, mude uma condição importante.",
        "Observe reação, reorganização e estabilidade emocional.",
      ],
      criterios: ["Controle emocional", "Adaptação", "Priorização", "Persistência"],
      erros: ["Travamento total", "Irritação sem controle", "Perda completa de foco"],
      variacoes: ["Aviso prévio de que haverá mudança", "Tempo curto de reorganização"],
      nota: "Procure equilíbrio entre emoção, ação e recuperação.",
    },
    {
      titulo: "Fila de Prioridades sob Pressão",
      objetivo: "Avaliar organização em ambiente exigente.",
      participantes: "Individual.",
      tempo: "10 minutos.",
      materiais: ["Lista de demandas simultâneas"],
      passos: [
        "Entregue várias demandas urgentes ao mesmo tempo.",
        "Peça ordem de ação com justificativa.",
      ],
      criterios: ["Calma", "Lógica", "Foco", "Capacidade de resposta"],
      erros: ["Agir no impulso", "Perder visão do todo", "Não justificar"],
      variacoes: ["Resposta em tópicos", "Uso de quadro visual"],
      nota: "Resiliência aparece na forma como a pessoa reorganiza o raciocínio sob tensão.",
    },
  ],
  "Organização e Tempo": [
    {
      titulo: "Planejamento de Semana Crítica",
      objetivo: "Avaliar organização, priorização e gestão do tempo.",
      participantes: "Individual.",
      tempo: "15 minutos.",
      materiais: ["Lista de tarefas", "Agenda fictícia"],
      passos: [
        "Entregue uma semana com várias demandas e conflitos de horário.",
        "Peça um plano de execução com justificativa.",
      ],
      criterios: ["Priorização", "Planejamento", "Sequência lógica", "Viabilidade"],
      erros: ["Agenda impossível", "Ignorar urgência", "Não prever acompanhamento"],
      variacoes: ["Resposta em grade visual", "Rascunho livre antes da resposta final"],
      nota: "Observe se a pessoa organiza pensando em prazo, impacto e capacidade real.",
    },
    {
      titulo: "Rotina com Interrupções",
      objetivo: "Avaliar capacidade de manter organização com imprevistos.",
      participantes: "Individual.",
      tempo: "10 a 15 minutos.",
      materiais: ["Cenário com interrupções"],
      passos: [
        "Descreva uma rotina com interrupções e prioridades concorrentes.",
        "Peça que a pessoa diga como estruturaria o dia.",
      ],
      criterios: ["Organização", "Flexibilidade", "Critério", "Controle"],
      erros: ["Responder de forma caótica", "Ignorar pausas e acompanhamento", "Não priorizar"],
      variacoes: ["Mapa do dia em tópicos", "Resposta oral com apoio escrito"],
      nota: "Boa organização combina estrutura e adaptação.",
    },
  ],
  "Negociação e Persuasão": [
    {
      titulo: "Conversa de Alinhamento Difícil",
      objetivo: "Avaliar influência, escuta e construção de acordo.",
      participantes: "Dupla ou individual com avaliador.",
      tempo: "15 minutos.",
      materiais: ["Cenário de conflito leve"],
      passos: [
        "Apresente uma situação em que a pessoa precisa alinhar expectativas com alguém resistente.",
        "Observe escuta, argumentação e busca de acordo viável.",
      ],
      criterios: ["Escuta", "Argumentação", "Flexibilidade", "Construção de acordo"],
      erros: ["Forçar", "Interromper", "Não considerar o outro lado"],
      variacoes: ["Papel invertido", "Resposta escrita com estratégia antes da simulação"],
      nota: "Negociação forte equilibra firmeza com leitura do outro.",
    },
    {
      titulo: "Venda de Ideia Interna",
      objetivo: "Avaliar capacidade de convencer com clareza e lógica.",
      participantes: "Individual.",
      tempo: "10 minutos.",
      materiais: ["Tema ou proposta simples"],
      passos: [
        "Peça que a pessoa apresente uma ideia e tente convencer o avaliador.",
        "Observe clareza, estrutura e adaptação da fala.",
      ],
      criterios: ["Clareza", "Persuasão", "Leitura do interlocutor", "Sustentação da ideia"],
      erros: ["Falar sem estrutura", "Ignorar objeção", "Ser agressivo ou passivo demais"],
      variacoes: ["Apresentação com tópicos", "Objeções progressivas do avaliador"],
      nota: "Persuasão boa não é pressão; é construção de entendimento.",
    },
  ],
  "Empatia e Escuta": [
    {
      titulo: "Escuta com Reenquadramento",
      objetivo: "Avaliar capacidade de ouvir, compreender e responder com sensibilidade.",
      participantes: "Dupla ou individual com avaliador.",
      tempo: "10 a 15 minutos.",
      materiais: ["Situação de conversa"],
      passos: [
        "Apresente uma situação em que alguém expõe dificuldade.",
        "Peça que a pessoa escute e responda.",
        "Observe se ela compreende antes de propor solução.",
      ],
      criterios: ["Escuta ativa", "Empatia", "Clareza", "Adequação da resposta"],
      erros: ["Interromper", "Responder no automático", "Julgar cedo demais"],
      variacoes: ["Resposta escrita primeiro", "Tempo curto de reflexão"],
      nota: "Empatia aparece na forma de ouvir, validar e responder com respeito.",
    },
    {
      titulo: "Leitura de Necessidade do Cliente Interno",
      objetivo: "Avaliar compreensão da necessidade antes da ação.",
      participantes: "Individual.",
      tempo: "10 minutos.",
      materiais: ["Caso simples"],
      passos: [
        "Descreva uma demanda trazida por outra área.",
        "Peça que a pessoa diga como entenderia a real necessidade antes de agir.",
      ],
      criterios: ["Escuta", "Perguntas de aprofundamento", "Compreensão", "Postura colaborativa"],
      erros: ["Supor demais", "Não investigar", "Responder sem entender"],
      variacoes: ["Formato oral ou em tópicos", "Checklist de perguntas"],
      nota: "Escuta qualificada reduz ruído e melhora a decisão.",
    },
  ],
};

export function buildMentorDinamicasReport(
  session: MentorDinamicasSession
): string {
  const categoria = session.categoria ?? "Categoria não identificada";
  const dynamics = session.categoria
    ? DYNAMICS_BY_CATEGORY[session.categoria]
    : [];

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderList = (items: string[]) =>
    items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const renderSteps = (items: string[]) =>
    items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const blocks = dynamics
    .map((item, index) => {
      return `
<section style="margin-top:32px;">
  <h2 style="font-size:24px; font-weight:700; margin:0 0 16px 0;">
    Dinâmica ${index + 1}: ${escapeHtml(item.titulo)}
  </h2>

  <p style="margin:0 0 12px 0;"><strong>Objetivo:</strong> ${escapeHtml(item.objetivo)}</p>
  <p style="margin:0 0 12px 0;"><strong>Participantes:</strong> ${escapeHtml(item.participantes)}</p>
  <p style="margin:0 0 16px 0;"><strong>Tempo estimado:</strong> ${escapeHtml(item.tempo)}</p>

  <h3 style="font-size:18px; font-weight:700; margin:20px 0 10px 0;">Materiais necessários</h3>
  <ul style="margin:0 0 16px 22px; padding:0;">
    ${renderList(item.materiais)}
  </ul>

  <h3 style="font-size:18px; font-weight:700; margin:20px 0 10px 0;">Passo a passo</h3>
  <ol style="margin:0 0 16px 22px; padding:0;">
    ${renderSteps(item.passos)}
  </ol>

  <h3 style="font-size:18px; font-weight:700; margin:20px 0 10px 0;">Critérios de avaliação (1 a 5)</h3>
  <ul style="margin:0 0 16px 22px; padding:0;">
    ${renderList(item.criterios)}
  </ul>

  <h3 style="font-size:18px; font-weight:700; margin:20px 0 10px 0;">Erros comuns a observar</h3>
  <ul style="margin:0 0 16px 22px; padding:0;">
    ${renderList(item.erros)}
  </ul>

  <h3 style="font-size:18px; font-weight:700; margin:20px 0 10px 0;">Variações inclusivas</h3>
  <ul style="margin:0 0 16px 22px; padding:0;">
    ${renderList(item.variacoes)}
  </ul>

  <h3 style="font-size:18px; font-weight:700; margin:20px 0 10px 0;">Notas para o avaliador</h3>
  <p style="margin:0 0 8px 0;">${escapeHtml(item.nota)}</p>
</section>
      `.trim();
    })
    .join("");

  return `
<section>
  <h1 style="font-size:32px; font-weight:800; margin:0 0 20px 0;">Mentor de Dinâmicas</h1>

  <p style="margin:0 0 20px 0;"><strong>Categoria selecionada:</strong> ${escapeHtml(categoria)}</p>

  <h2 style="font-size:22px; font-weight:700; margin:0 0 12px 0;">Orientações gerais</h2>
  <ul style="margin:0 0 24px 22px; padding:0;">
    <li>Explique o propósito da dinâmica antes de iniciar.</li>
    <li>Evite constrangimentos e preserve o respeito ao participante.</li>
    <li>Permita alternativas de participação: falar, escrever ou desenhar.</li>
    <li>Registre comportamentos observáveis: o que a pessoa diz, faz e decide.</li>
    <li>Use escala de 1 a 5: 1 = não demonstra, 3 = mediano/aceitável, 5 = excelente e consistente.</li>
  </ul>

  ${blocks}
</section>
  `.trim();
}
