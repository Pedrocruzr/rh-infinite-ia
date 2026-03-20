import OpenAI from "openai";
import {
  getNextDiscQuestion,
  isDiscReady,
  updateDiscSession,
  type DiscField,
  type DiscSession,
} from "@/lib/disc-flow";
import { rankDiscProfiles } from "@/lib/disc-metrics";
import { safeLoadDiscKnowledge } from "@/lib/disc-knowledge-loader";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DISC_SYSTEM_PROMPT = `
Você é um analista de perfil comportamental DISC com foco em linguagem profissional de RH.
Sua tarefa é gerar relatório em markdown, com clareza, objetividade e base nas respostas.
Não use disclaimer sobre IA.
Não use nota de rodapé.
Sempre identifique perfil dominante e perfil secundário quando houver evidência.
Quando a evidência for limitada, use "não evidenciado".
`.trim();

function buildKnowledgeContext(): string {
  const diretrizes = safeLoadDiscKnowledge("diretrizes.md");
  const fundamentos = safeLoadDiscKnowledge("fundamentos-disc.md");
  const perfis = safeLoadDiscKnowledge("perfis-disc.md");
  const perguntas = safeLoadDiscKnowledge("perguntas-disc.md");
  const estrutura = safeLoadDiscKnowledge("estrutura-relatorio.md");

  return [
    "[DIRETRIZES]",
    diretrizes,
    "",
    "[FUNDAMENTOS DISC]",
    fundamentos,
    "",
    "[PERFIS DISC]",
    perfis,
    "",
    "[PERGUNTAS DE APOIO]",
    perguntas,
    "",
    "[ESTRUTURA DO RELATÓRIO]",
    estrutura,
  ].join("\n");
}

export function initializeDiscSession(): DiscSession {
  return {
    status: "in_progress",
    reportStatus: "pending",
  };
}

export function applyDiscAnswer(
  session: DiscSession,
  field: DiscField,
  answer: string
): DiscSession {
  return updateDiscSession(session, field, answer);
}

export function getNextDiscStep(session: DiscSession): {
  field: DiscField;
  question: string;
} | null {
  return getNextDiscQuestion(session);
}

export async function runDiscStep(params: {
  session: DiscSession;
  answer?: string;
  currentField?: DiscField;
}): Promise<{
  session: DiscSession;
  reply: string;
  nextField?: DiscField;
  done: boolean;
}> {
  let session = params.session;

  if (params.answer && params.currentField) {
    session = applyDiscAnswer(session, params.currentField, params.answer);
  }

  if (!isDiscReady(session)) {
    const next = getNextDiscStep(session);

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

  return {
    session: {
      ...session,
      status: "completed",
      reportStatus: "pending",
    },
    reply:
      "Obrigado por concluir sua avaliação DISC. Suas respostas foram registradas com sucesso e ficarão disponíveis para análise do recrutador.",
    done: true,
  };
}

export async function generateDiscReport(session: DiscSession): Promise<string> {
  const knowledgeContext = buildKnowledgeContext();

  const ranking = rankDiscProfiles([
    session.resposta1 ?? "",
    session.resposta2 ?? "",
    session.resposta3 ?? "",
    session.resposta4 ?? "",
  ]);

  const dominante = ranking[0]?.profile ?? null;
  const secundario = ranking[1]?.profile ?? null;

  const inputData = `
Nome do participante: ${session.nome ?? "Não informado"}
Vaga de referência: ${session.vaga ?? "Não informada"}

Resposta 1:
${session.resposta1 ?? "Não informado"}

Resposta 2:
${session.resposta2 ?? "Não informado"}

Resposta 3:
${session.resposta3 ?? "Não informado"}

Resposta 4:
${session.resposta4 ?? "Não informado"}

Perfil dominante inferido:
${dominante ?? "não evidenciado"}

Perfil secundário inferido:
${secundario ?? "não evidenciado"}
  `.trim();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: DISC_SYSTEM_PROMPT }],
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
Com base nas respostas abaixo, gere um relatório final em markdown no estilo profissional de RH.

DADOS:
${inputData}

Regras:
- Estruture o relatório com:
  1. Relatório de Perfil Comportamental DISC
  2. Participante
  3. Vaga de referência
  4. Resultado geral
  5. Síntese do perfil
  6. Evidências comportamentais por fator
  7. Perfil comportamental provável
  8. Pontos fortes prováveis
  9. Pontos de atenção
  10. Ambiente de trabalho em que tende a render mais
  11. Possíveis funções em que o perfil pode se destacar
  12. Conclusão
  13. Perfil final
- Use exatamente a lógica DISC.
- Conecte análise às respostas dadas.
- Identifique perfil predominante e perfil secundário.
- Não trate a pessoa como se tivesse só um traço.
- No final, inclua orientação clara para o recrutador salvar ou copiar o relatório.
            `.trim(),
          },
        ],
      },
    ],
  });

  return response.output_text?.trim() || "Não foi possível gerar o relatório DISC.";
}
