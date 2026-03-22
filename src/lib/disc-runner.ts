import { buildMasterAgentReport } from "@/lib/reports/build-master-agent-report";
import {
  initializeDiscSession,
  runDiscStep,
  type DiscField,
  type DiscSession,
} from "@/lib/disc-flow";

export type { DiscField, DiscSession } from "@/lib/disc-flow";
export { initializeDiscSession, runDiscStep } from "@/lib/disc-flow";

type DiscScoreKey = "D" | "I" | "S" | "C";

const LETTER_TO_PROFILE: Record<string, DiscScoreKey> = {
  A: "D",
  B: "I",
  C: "S",
  D: "C",
};

const PROFILE_NAMES: Record<DiscScoreKey, string> = {
  D: "Dominância (D)",
  I: "Influência (I)",
  S: "Estabilidade (S)",
  C: "Conformidade (C)",
};

const PROFILE_SHORT_NAMES: Record<DiscScoreKey, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade",
};

const PROFILE_ANALYSIS: Record<DiscScoreKey, string> = {
  D: "Seu perfil demonstra forte orientação para resultados, ação e tomada de decisão. Você tende a agir com rapidez, assumir o controle quando necessário e buscar avanço com objetividade.",
  I: "Seu perfil demonstra forte orientação para pessoas, comunicação e influência. Você tende a criar conexões com facilidade, engajar ambientes ao seu redor e gerar energia nas interações.",
  S: "Seu perfil demonstra forte orientação para estabilidade, cooperação e constância. Você tende a valorizar ambientes previsíveis, relações harmoniosas e apoio consistente ao time.",
  C: "Seu perfil demonstra forte orientação para qualidade, organização e análise. Você tende a observar detalhes, seguir critérios e buscar alto padrão nas entregas.",
};

const PROFILE_EVIDENCES: Record<DiscScoreKey, string[]> = {
  D: [
    "Tendência a agir com rapidez diante de desafios",
    "Foco em resultado, resolução e objetividade",
    "Baixa tolerância à lentidão e à ineficiência",
  ],
  I: [
    "Tendência a valorizar interação, comunicação e troca com pessoas",
    "Facilidade para engajar, influenciar e motivar",
    "Busca por ambientes dinâmicos e socialmente ativos",
  ],
  S: [
    "Tendência a valorizar estabilidade, cooperação e ritmo consistente",
    "Postura de apoio, escuta e colaboração",
    "Busca por ambientes previsíveis e harmoniosos",
  ],
  C: [
    "Tendência a valorizar organização, lógica e qualidade",
    "Postura mais analítica e criteriosa antes de agir",
    "Busca por clareza, método e padrão nas entregas",
  ],
};

const PROFILE_STRENGTHS: Record<DiscScoreKey, string[]> = {
  D: [
    "Rapidez para agir",
    "Foco em metas e resultados",
    "Capacidade de decisão",
    "Energia para enfrentar desafios",
  ],
  I: [
    "Excelente comunicação e persuasão",
    "Capacidade de motivar e engajar pessoas",
    "Energia e entusiasmo em projetos",
    "Facilidade em criar conexões e networking",
  ],
  S: [
    "Constância e confiabilidade",
    "Capacidade de apoiar a equipe",
    "Boa escuta e cooperação",
    "Estabilidade no relacionamento com pessoas",
  ],
  C: [
    "Organização e método",
    "Atenção aos detalhes",
    "Qualidade nas entregas",
    "Capacidade analítica",
  ],
};

const PROFILE_ATTENTION: Record<DiscScoreKey, string[]> = {
  D: [
    "Pode agir rápido demais sem aprofundar análise",
    "Pode soar impaciente em contextos mais lentos",
    "Pode ter baixa tolerância a processos burocráticos",
  ],
  I: [
    "Pode agir por impulso sem analisar todos os detalhes",
    "Tendência a perder foco em tarefas mais analíticas ou repetitivas",
    "Pode evitar conflitos diretos em algumas situações",
    "Impaciência com processos lentos ou burocráticos",
  ],
  S: [
    "Pode resistir a mudanças bruscas",
    "Pode demorar mais para reagir em cenários muito rápidos",
    "Pode evitar confronto mesmo quando necessário",
  ],
  C: [
    "Pode ser perfeccionista em excesso",
    "Pode demorar mais para decidir",
    "Pode exigir dados demais antes de agir",
  ],
};

const PROFILE_WORKSTYLE: Record<DiscScoreKey, string[]> = {
  D: [
    "Ofereçam autonomia e espaço para decisão",
    "Sejam dinâmicos e desafiadores",
    "Tenham metas claras e foco em resultado",
  ],
  I: [
    "Tenham interação constante com pessoas",
    "Ofereçam liberdade e autonomia",
    "Sejam dinâmicos e desafiadores",
    "Valorizem comunicação e criatividade",
  ],
  S: [
    "Tenham estabilidade e previsibilidade",
    "Valorizem cooperação e bom relacionamento",
    "Ofereçam ritmo consistente e clareza de expectativas",
  ],
  C: [
    "Tenham processos definidos",
    "Valorizem qualidade e precisão",
    "Ofereçam estrutura, lógica e organização",
  ],
};

const PROFILE_DEVELOPMENT: Record<DiscScoreKey, string[]> = {
  D: [
    "Desenvolver mais escuta ativa",
    "Equilibrar velocidade com análise",
    "Refinar abordagem em contextos sensíveis",
  ],
  I: [
    "Desenvolver mais organização e atenção aos detalhes",
    "Equilibrar entusiasmo com planejamento",
    "Trabalhar escuta ativa em momentos de pressão",
    "Aprender a lidar melhor com processos e rotinas",
  ],
  S: [
    "Ganhar mais assertividade em decisões difíceis",
    "Desenvolver adaptação mais rápida à mudança",
    "Lidar melhor com conflito e pressão",
  ],
  C: [
    "Tomar decisões com mais agilidade",
    "Reduzir excesso de perfeccionismo",
    "Desenvolver mais flexibilidade em cenários ambíguos",
  ],
};

type DiscReportSession = DiscSession & Record<string, unknown>;

function getLetter(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

function buildScores(session: DiscReportSession) {
  const answers = [
    getLetter(session.q1),
    getLetter(session.q2),
    getLetter(session.q3),
    getLetter(session.q4),
    getLetter(session.q5),
    getLetter(session.q6),
  ];

  const scores: Record<DiscScoreKey, number> = {
    D: 0,
    I: 0,
    S: 0,
    C: 0,
  };

  for (const answer of answers) {
    const profile = LETTER_TO_PROFILE[answer];
    if (profile) {
      scores[profile] += 1;
    }
  }

  return scores;
}

function getRankedProfiles(scores: Record<DiscScoreKey, number>) {
  return (Object.entries(scores) as Array<[DiscScoreKey, number]>)
    .sort((a, b) => b[1] - a[1]);
}

function unique(items: string[]) {
  return [...new Set(items)];
}

export function generateDiscReport(session: DiscReportSession): string {
  const scores = buildScores(session);
  const ranked = getRankedProfiles(scores);

  const dominant = ranked[0]?.[0] ?? "I";
  const secondary = ranked[1]?.[0] ?? "D";

  const dominantName = PROFILE_NAMES[dominant];
  const secondaryName = PROFILE_NAMES[secondary];
  const nome = String(session.nome ?? "Não informado");

  const analysisText = `${nome}, ${PROFILE_ANALYSIS[dominant]} Combinado a isso, seu perfil secundário de ${PROFILE_SHORT_NAMES[secondary]} reforça características complementares importantes no seu modo de agir e trabalhar.`;

  const evidences = [
    `🔹 ${dominantName} – Predominante`,
    ...PROFILE_EVIDENCES[dominant],
    "",
    `🔹 ${secondaryName} – Secundário`,
    ...PROFILE_EVIDENCES[secondary],
  ];

  const strengths = unique([
    ...PROFILE_STRENGTHS[dominant],
    ...PROFILE_STRENGTHS[secondary].slice(0, 2),
  ]);

  const attention = unique([
    ...PROFILE_ATTENTION[dominant],
    ...PROFILE_ATTENTION[secondary].slice(0, 2),
  ]);

  const workstyle = unique([
    ...PROFILE_WORKSTYLE[dominant],
    ...PROFILE_WORKSTYLE[secondary].slice(0, 2),
  ]);

  const development = unique([
    ...PROFILE_DEVELOPMENT[dominant],
    ...PROFILE_DEVELOPMENT[secondary].slice(0, 2),
  ]);

  const finalSummary = `${nome}, você apresenta um perfil ${PROFILE_SHORT_NAMES[dominant].toLowerCase()} com apoio secundário de ${PROFILE_SHORT_NAMES[secondary].toLowerCase()}. Essa combinação indica potencial para gerar impacto de forma coerente com seu estilo predominante, especialmente quando inserido em contextos compatíveis com suas forças naturais.`;

  return buildMasterAgentReport({
    tituloAgente: "📊 Relatório de Perfil Comportamental DISC",
    subtitulo: `👤 Nome: ${nome}`,
    contexto: "🔎 Resultado Geral",
    resumoExecutivo: `Com base nas suas respostas, você apresenta um perfil:\n\n🔹 Dominante: ${dominantName}\n🔹 Secundário: ${secondaryName}`,
    classificacaoFinal: "",
    nivelRisco: "",
    recomendacaoFinal: "",
    secoes: [
      {
        titulo: "🧠 Análise do Perfil",
        descricao: analysisText,
      },
      {
        titulo: "📌 Evidências Comportamentais",
        itens: evidences,
      },
      {
        titulo: "💪 Pontos Fortes",
        itens: strengths,
      },
      {
        titulo: "⚠️ Pontos de Atenção",
        itens: attention,
      },
      {
        titulo: "🚀 Estilo de Trabalho",
        itens: workstyle,
      },
      {
        titulo: "🧩 Sugestões de Desenvolvimento",
        itens: development,
      },
      {
        titulo: "🏁 Resumo Final",
        descricao: finalSummary,
      },
    ],
    observacoesGerais: "",
  });
}

export { generateDiscReport as buildDiscReport };
export { generateDiscReport as buildDiscRunnerReport };
export default generateDiscReport;
