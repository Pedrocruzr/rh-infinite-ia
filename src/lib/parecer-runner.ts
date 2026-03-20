import OpenAI from "openai";
import { agents } from "./agents";
import {
  classifyRoleLevel,
  getParecerModelPath,
} from "./parecer-metrics";
import {
  getNextParecerQuestion,
  isParecerReady,
  updateParecerSession,
  type ParecerField,
  type ParecerSession,
} from "./parecer-flow";
import { safeLoadParecerKnowledge } from "./parecer-knowledge-loader";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildKnowledgeContext(modelPath: string): string {
  const diretrizes = safeLoadParecerKnowledge("diretrizes.md");
  const boasPraticas = safeLoadParecerKnowledge("modelo-geral-boas-praticas.md");
  const classificacao = safeLoadParecerKnowledge("classificacao-cargo.md");
  const estrutura = safeLoadParecerKnowledge("estrutura-relatorio.md");
  const modelo = safeLoadParecerKnowledge(modelPath);

  return [
    "[DIRETRIZES]",
    diretrizes,
    "",
    "[BOAS PRÁTICAS]",
    boasPraticas,
    "",
    "[CLASSIFICAÇÃO DO CARGO]",
    classificacao,
    "",
    "[ESTRUTURA DO RELATÓRIO]",
    estrutura,
    "",
    "[MODELO OFICIAL SELECIONADO]",
    modelo,
  ].join("\n");
}

export function initializeParecerSession(): ParecerSession {
  return {};
}

export function applyParecerAnswer(
  session: ParecerSession,
  field: ParecerField,
  answer: string
): ParecerSession {
  const updated = updateParecerSession(session, field, answer);

  if (field === "vaga" && answer.trim()) {
    updated.nivelVaga = classifyRoleLevel(answer);
  }

  return updated;
}

export function getNextParecerStep(session: ParecerSession): {
  field: ParecerField;
  question: string;
} | null {
  return getNextParecerQuestion(session);
}

function buildCollectedData(session: ParecerSession): string {
  return [
    `Empresa: ${session.empresa ?? "Não informado"}`,
    `Vaga: ${session.vaga ?? "Não informado"}`,
    `Candidato: ${session.candidato ?? "Não informado"}`,
    `Data da entrevista: ${session.dataEntrevista ?? "Não informado"}`,
    `Entrevistadores: ${session.entrevistadores ?? "Não informado"}`,
    `Motivação: ${session.motivacao ?? "Não informado"}`,
    `Formação: ${session.formacao ?? "Não informado"}`,
    `Trajetória: ${session.trajetoria ?? "Não informado"}`,
    `Competências técnicas: ${session.competenciasTecnicas ?? "Não informado"}`,
    `Competências comportamentais: ${session.competenciasComportamentais ?? "Não informado"}`,
    `Testes/Ferramentas: ${session.testes ?? "Não informado"}`,
    `Referências: ${session.referencias ?? "Não informado"}`,
    `Fit cultural: ${session.fitCultural ?? "Não informado"}`,
    `Pontos fortes: ${session.pontosFortes ?? "Não informado"}`,
    `Pontos de atenção: ${session.pontosAtencao ?? "Não informado"}`,
    `Recomendação final: ${session.recomendacaoFinal ?? "Não informado"}`,
    `Nível da vaga: ${session.nivelVaga ?? "Não identificado"}`,
  ].join("\n");
}

export async function generateParecer(session: ParecerSession): Promise<string> {
  const agent = agents["parecer-tecnico-entrevista"];
  const level = session.nivelVaga ?? "operacional";
  const modelPath = getParecerModelPath(level);
  const knowledgeContext = buildKnowledgeContext(modelPath);
  const collectedData = buildCollectedData(session);

  const response = await client.responses.create({
    model: agent.model,
    temperature: agent.temperature,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: agent.systemPrompt }],
      },
      {
        role: "system",
        content: [{ type: "input_text", text: knowledgeContext }],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
Com base nos dados abaixo, gere o parecer técnico final.

DADOS:
${collectedData}

Regras:
- Use markdown.
- Siga estritamente o modelo selecionado para o nível da vaga.
- Não misture estruturas entre modelos.
- Não simplifique modelos gerenciais ou estratégicos.
- Use linguagem técnica e profissional.
- Fundamente afirmações em evidências observáveis.
- Se alguma informação não foi fornecida, registre tecnicamente essa ausência.
- A recomendação final deve ser coerente com o corpo do parecer.
            `.trim(),
          },
        ],
      },
    ],
  });

  return response.output_text?.trim() || "Não foi possível gerar o parecer técnico.";
}

export async function runParecerStep(params: {
  session: ParecerSession;
  answer?: string;
  currentField?: ParecerField;
}): Promise<{
  session: ParecerSession;
  reply: string;
  nextField?: ParecerField;
  done: boolean;
}> {
  let session = params.session;

  if (params.answer && params.currentField) {
    session = applyParecerAnswer(session, params.currentField, params.answer);
  }

  if (!isParecerReady(session)) {
    const next = getNextParecerStep(session);

    if (!next) {
      return {
        session,
        reply: "Não foi possível determinar a próxima pergunta.",
        done: false,
      };
    }

    return {
      session,
      reply: next.question,
      nextField: next.field,
      done: false,
    };
  }

  const parecer = await generateParecer(session);

  return {
    session: {
      ...session,
      generatedParecer: parecer,
    },
    reply: parecer,
    done: true,
  };
}
