import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function extractJsonFromContent(content: string): string {
  const trimmed = content.trim();

  if (!trimmed) return "{}";

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function safeStableStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export async function applyReportAdjustment(rawAnswers: any, instruction: string) {
  const prompt = `
Você é um especialista em RH e análise de dados.

Recebe:
1) Um JSON com respostas originais (raw_answers)
2) Uma instrução do usuário pedindo alteração

Sua função:
- Interpretar a instrução
- Alterar o JSON corretamente
- Manter coerência com o restante dos dados
- Corrigir erros gramaticais
- NÃO inventar dados não solicitados
- Se a instrução pedir alteração de qualquer item, você DEVE refletir essa alteração no JSON
- Preserve toda a estrutura original do objeto
- Retorne SOMENTE JSON puro válido
- Não use markdown
- Não use crases
- Não escreva explicações
- Não resuma
- Não remova campos existentes sem necessidade explícita

RAW:
${JSON.stringify(rawAnswers, null, 2)}

INSTRUÇÃO:
${instruction}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const jsonText = extractJsonFromContent(content);

  try {
    const parsed = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      console.warn("[applyReportAdjustment] retorno inválido da IA; mantendo rawAnswers original");
      console.warn("[applyReportAdjustment] content bruto:", content);
      return rawAnswers;
    }

    const before = safeStableStringify(rawAnswers);
    const after = safeStableStringify(parsed);

    if (before === after) {
      console.warn("[applyReportAdjustment] IA retornou JSON idêntico ao original");
      console.warn("[applyReportAdjustment] instruction:", instruction);
    }

    return parsed;
  } catch (error) {
    console.error("[applyReportAdjustment] falha ao fazer parse do JSON retornado pela IA");
    console.error("[applyReportAdjustment] instruction:", instruction);
    console.error("[applyReportAdjustment] content bruto:", content);
    console.error("[applyReportAdjustment] json extraído:", jsonText);
    console.error(error);
    return rawAnswers;
  }
}
