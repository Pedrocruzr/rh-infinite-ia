export const MENTOR_DINAMICAS_AGENT = {
  name: "Mentor de Dinâmicas",
  slug: "mentor-dinamicas",
} as const;

export const DYNAMIC_CATEGORIES = [
  "Comunicação",
  "Trabalho em Equipe",
  "Liderança",
  "Criatividade",
  "Raciocínio Lógico",
  "Proatividade",
  "Fit Cultural",
  "Resiliência e Estresse",
  "Organização e Tempo",
  "Negociação e Persuasão",
  "Empatia e Escuta",
] as const;

export type DynamicCategory = (typeof DYNAMIC_CATEGORIES)[number];

export type MentorDinamicasSession = {
  assessmentId?: string;
  categoria?: DynamicCategory;
  status?: "in_progress" | "completed";
  reportStatus?: "pending" | "generated";
  reportMarkdown?: string | null;
};

type ApplyAnswerResult =
  | {
      ok: true;
      session: MentorDinamicasSession;
      completed: true;
      categoria: DynamicCategory;
    }
  | {
      ok: false;
      session: MentorDinamicasSession;
      error: string;
    };

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBlockedAnswer(value: string): boolean {
  const normalized = normalizeText(value);
  const blocked = new Set([
    "oi",
    "ola",
    "ok",
    "sim",
    "teste",
    "aaa",
    "bbb",
    "123",
    "asd",
    "qwe",
    "kkk",
  ]);
  return blocked.has(normalized);
}

function looksLikeGibberish(value: string): boolean {
  const normalized = normalizeText(value);

  if (!normalized) return true;

  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 0) return true;

  const weirdTokens = tokens.filter((token) => {
    if (/^\d+$/.test(token)) return false;
    if (token.length <= 2) return false;

    const vowels = (token.match(/[aeiou]/g) ?? []).length;

    if (token.length >= 4 && vowels === 0) return true;
    if (token.length >= 5 && vowels <= 1) return true;
    if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(token)) return true;

    return false;
  });

  if (tokens.length === 1) {
    const token = tokens[0];
    if (token.length >= 5 && !/[aeiou]/.test(token)) return true;
  }

  return weirdTokens.length === tokens.length;
}

function resolveCategory(value: string): DynamicCategory | null {
  const normalized = normalizeText(value);

  const exactMap: Record<string, DynamicCategory> = {
    "comunicacao": "Comunicação",
    "comunicação": "Comunicação",
    "trabalho em equipe": "Trabalho em Equipe",
    "equipe": "Trabalho em Equipe",
    "lideranca": "Liderança",
    "liderança": "Liderança",
    "criatividade": "Criatividade",
    "raciocinio logico": "Raciocínio Lógico",
    "raciocínio lógico": "Raciocínio Lógico",
    "logica": "Raciocínio Lógico",
    "lógica": "Raciocínio Lógico",
    "proatividade": "Proatividade",
    "fit cultural": "Fit Cultural",
    "cultura": "Fit Cultural",
    "cultura organizacional": "Fit Cultural",
    "resiliencia e estresse": "Resiliência e Estresse",
    "resiliência e estresse": "Resiliência e Estresse",
    "resiliencia": "Resiliência e Estresse",
    "resiliência": "Resiliência e Estresse",
    "organizacao e tempo": "Organização e Tempo",
    "organização e tempo": "Organização e Tempo",
    "organizacao": "Organização e Tempo",
    "organização": "Organização e Tempo",
    "tempo": "Organização e Tempo",
    "negociacao e persuasao": "Negociação e Persuasão",
    "negociação e persuasão": "Negociação e Persuasão",
    "negociacao": "Negociação e Persuasão",
    "negociação": "Negociação e Persuasão",
    "persuasao": "Negociação e Persuasão",
    "persuasão": "Negociação e Persuasão",
    "empatia e escuta": "Empatia e Escuta",
    "empatia": "Empatia e Escuta",
    "escuta": "Empatia e Escuta",
  };

  if (exactMap[normalized]) return exactMap[normalized];
  if (normalized.includes("comunic")) return "Comunicação";
  if (normalized.includes("equipe") || normalized.includes("colabor")) return "Trabalho em Equipe";
  if (normalized.includes("lider")) return "Liderança";
  if (normalized.includes("criativ")) return "Criatividade";
  if (normalized.includes("log") || normalized.includes("racioc")) return "Raciocínio Lógico";
  if (normalized.includes("proativ")) return "Proatividade";
  if (normalized.includes("fit") || normalized.includes("cultura")) return "Fit Cultural";
  if (normalized.includes("resilien") || normalized.includes("estresse") || normalized.includes("stress")) {
    return "Resiliência e Estresse";
  }
  if (normalized.includes("organiz") || normalized.includes("tempo") || normalized.includes("planej")) {
    return "Organização e Tempo";
  }
  if (normalized.includes("negoci") || normalized.includes("persuas") || normalized.includes("convenc")) {
    return "Negociação e Persuasão";
  }
  if (normalized.includes("empatia") || normalized.includes("escuta")) return "Empatia e Escuta";

  return null;
}

export function getInitialQuestion(): string {
  return [
    "Escolha a competência que deseja avaliar: Comunicação, Trabalho em Equipe, Liderança, Criatividade, Raciocínio Lógico, Proatividade, Fit Cultural, Resiliência e Estresse, Organização e Tempo, Negociação e Persuasão ou Empatia e Escuta."
  ].join("\n");
}

export function applyAnswer(
  session: Partial<MentorDinamicasSession>,
  rawAnswer: string
): ApplyAnswerResult {
  const answer = rawAnswer.trim();

  if (!answer) {
    return {
      ok: false,
      session: {
        ...session,
        status: "in_progress",
        reportStatus: "pending",
      },
      error: "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?",
    };
  }

  if (isBlockedAnswer(answer) || looksLikeGibberish(answer)) {
    return {
      ok: false,
      session: {
        ...session,
        status: "in_progress",
        reportStatus: "pending",
      },
      error: "Sua resposta ficou curta e ainda não consigo analisar com segurança. Pode detalhar um pouco mais?",
    };
  }

  const categoria = resolveCategory(answer);

  if (!categoria) {
    return {
      ok: false,
      session: {
        ...session,
        status: "in_progress",
        reportStatus: "pending",
      },
      error:
        "Não consegui identificar a categoria com segurança. Escolha uma das categorias listadas, por exemplo: Comunicação, Liderança, Proatividade ou Fit Cultural.",
    };
  }

  return {
    ok: true,
    completed: true,
    categoria,
    session: {
      ...session,
      categoria,
      status: "completed",
      reportStatus: "generated",
    },
  };
}
