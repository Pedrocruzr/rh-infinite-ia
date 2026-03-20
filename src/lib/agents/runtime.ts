import OpenAI from "openai";

type ExecuteAgentInput = {
  agentName: string;
  context: string;
  objective: string;
};

export async function executeAgentRuntime({
  agentName,
  context,
  objective,
}: ExecuteAgentInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemPrompt = [
    "Você é um agente de RH especializado.",
    `Nome do agente: ${agentName}.`,
    "Responda em português do Brasil.",
    "Seja objetivo, útil, estruturado e profissional.",
    "Entregue uma resposta prática, clara e diretamente aplicável.",
  ].join(" ");

  const userPrompt = [
    `Contexto: ${context || "não informado"}`,
    `Objetivo: ${objective || "não informado"}`,
    "",
    "Gere a melhor resposta possível para esse agente.",
  ].join("\n");

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const output =
    response.output_text?.trim() ||
    "Não foi possível gerar resposta do modelo.";

  return {
    text: output,
    model: "gpt-5-mini",
  };
}
