const CLEAR_MESSAGE =
  "Não consegui entender sua resposta com segurança. Pode escrever novamente de forma mais clara?";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function lettersOnly(value: string) {
  return normalize(value).replace(/[^a-z]/g, "");
}

function hasEnoughLetters(text: string) {
  const letters = text.match(/[a-zà-ú]/gi) ?? [];
  return letters.length >= 3;
}

function hasVowel(text: string) {
  return /[aeiouáéíóúâêôãõà]/i.test(text);
}

function looksLikeGarbage(text: string) {
  const raw = normalize(text);
  const letters = lettersOnly(text);

  if (letters.length < 4) return false;

  if (!hasVowel(letters)) return true;

  const vowelCount = (letters.match(/[aeiou]/g) ?? []).length;
  if (vowelCount / letters.length < 0.2) return true;

  if (/^(qwer|asdf|zxcv|qwr|rwq|dsaf|qfrrg|reafg|rw3qgr|qwr4tw)/i.test(raw)) {
    return true;
  }

  if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(letters)) {
    return true;
  }

  if (/[a-z]+\d+[a-z\d]*$/i.test(raw) && !raw.includes(" ")) {
    return true;
  }

  return false;
}

function isLikelyQuickOption(text: string) {
  const raw = normalize(text);
  return ["sim", "nao", "não", "ok", "1", "2", "3", "4", "5"].includes(raw);
}

function isMeaningfulName(text: string) {
  const raw = text.trim();
  if (raw.length < 3) return false;
  if (!hasEnoughLetters(raw)) return false;
  if (looksLikeGarbage(raw)) return false;

  const words = raw
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (!words.length) return false;

  const validWords = words.filter((word) =>
    /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’.-]*$/.test(word)
  );

  return validWords.length / words.length >= 0.6;
}

function isComprehensibleText(text: string) {
  const raw = text.trim();
  if (raw.length < 3) return false;
  if (!hasEnoughLetters(raw)) return false;
  if (looksLikeGarbage(raw)) return false;

  const tokens = normalize(raw)
    .split(/[^a-z0-9à-ú]+/i)
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens.length) return false;

  let valid = 0;

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      valid += 1;
      continue;
    }

    if (
      ["de", "da", "do", "das", "dos", "e", "em", "no", "na", "rh", "ti"].includes(token)
    ) {
      valid += 1;
      continue;
    }

    if (token.length >= 3 && hasVowel(token)) {
      valid += 1;
    }
  }

  return valid / tokens.length >= 0.6;
}

export function validateClientAgentInput(
  agentSlug: string,
  currentField: string | null | undefined,
  answer: string
) {
  const raw = answer.trim();
  if (!raw) return "Digite uma resposta para continuar.";

  const field = normalize(currentField ?? "");

  if (isLikelyQuickOption(raw)) {
    if (
      /nome|empresa|cargo|area|área|lider|líder|responsavel|responsável|gestor|validador|validator/.test(
        field
      )
    ) {
      return CLEAR_MESSAGE;
    }

    return null;
  }

  const isNameField =
    /nome|empresa|cargo|area|área|lider|líder|responsavel|responsável|gestor|validador|validator/.test(
      field
    );

  // Allow short professional abbreviations for area/cargo fields (rh, dp, ti, etc.)
  if (isNameField && /area|área|cargo/.test(field) && raw.length <= 5 && /^[a-zA-ZÀ-ÿ.\/ ]+$/i.test(raw)) {
    return null;
  }

  if (isNameField && !isMeaningfulName(raw)) {
    return CLEAR_MESSAGE;
  }

  const strictAgents = new Set([
    "taxa-aderencia-vaga",
    "onboarding-estrategico",
    "analista-pdi",
  ]);

  if (strictAgents.has(agentSlug) && !isComprehensibleText(raw)) {
    return CLEAR_MESSAGE;
  }

  if (agentSlug === "agente-teste-bigfive") {
    const fieldLower = field.toLowerCase();
    
    if (fieldLower === "telefone") {
      const digits = raw.replace(/\D/g, "");
      if (digits.length !== 10 && digits.length !== 11) {
        return "Telefone inválido. Por favor, insira um telefone válido com DDD (10 ou 11 números).";
      }
    }
    
    if (fieldLower === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(raw)) {
        return "E-mail inválido. Por favor, insira um e-mail no formato correto (exemplo@email.com).";
      }
    }
    
    if (fieldLower === "statusprofissional") {
      if (raw !== "1" && raw !== "2") {
        return "Opção inválida. Responda apenas 1 para Candidato ou 2 para Colaborador.";
      }
    }
    
    if (fieldLower === "sexo") {
      if (raw !== "1" && raw !== "2" && raw !== "3") {
        return "Opção inválida. Responda apenas 1, 2 ou 3.";
      }
    }
    
    if (/^q\d+$/.test(fieldLower)) {
      const num = parseInt(raw, 10);
      if (Number.isNaN(num) || num < 1 || num > 5) {
        return "Resposta inválida. Por favor, digite um número de 1 a 5.";
      }
    }
  }

  return null;
}
