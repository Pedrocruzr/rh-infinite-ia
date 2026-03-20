import OpenAI from "openai";

type AssessmentRecord = {
  candidate_name: string;
  target_role: string;
  competencies: string[];
  disc_answer: string | null;
  motivation_answer: string | null;
  example_1: string | null;
  example_2: string | null;
  example_3: string | null;
};

function discLabel(value: string | null) {
  switch (value) {
    case "dominancia":
      return "Dominante (D)";
    case "influencia":
      return "Influente (I)";
    case "estabilidade":
      return "Estável (S)";
    case "conformidade":
      return "Conforme (C)";
    default:
      return "Não identificado";
  }
}

function motivationLabel(value: string | null) {
  switch (value) {
    case "seguranca":
      return "Foco em Segurança e Pertencimento";
    case "reconhecimento":
      return "Foco em Reconhecimento e Validação";
    case "crescimento":
      return "Foco em Crescimento e Evolução";
    case "autonomia":
      return "Foco em Autonomia e Liberdade de Execução";
    default:
      return "Motivação não identificada";
  }
}

export async function generateProfileReport(assessment: AssessmentRecord) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const [c1, c2, c3] = assessment.competencies || [
    "Comunicação",
    "Organização",
    "Empatia",
  ];

  const prompt = `
Você é um especialista em RH, entrevista por competências e análise comportamental.

Seu trabalho é gerar um relatório profissional final, pronto para recrutadores, no formato abaixo.

REGRAS IMPORTANTES:
- Escreva em português do Brasil.
- Use exatamente a estrutura abaixo.
- Não mencione IA.
- Não use disclaimer.
- Não use notas de rodapé.
- Seja claro, objetivo, profissional e analítico.
- Baseie a análise nas respostas dadas.
- O tom deve ser de um relatório de RH real.
- Entregue o texto final já pronto, preenchido.

FORMATO OBRIGATÓRIO:

📄 RELATÓRIO DE PERFIL PROFISSIONAL

Candidato: [nome]
Vaga de Referência: [vaga]

1. ANÁLISE DE PERFIL COMPORTAMENTAL (DISC)

Perfil Indicado: [perfil]

Interpretação:
[interpretação]

2. ANÁLISE DE MOTIVADORES PROFISSIONAIS

Padrão Motivacional Indicado: [motivador]

Interpretação:
[interpretação]

3. AVALIAÇÃO POR COMPETÊNCIAS

Competência: [competência 1]
Nível de Evidência: [baixo, médio ou alto]
Justificativa com Base na Resposta:
[texto]

Competência: [competência 2]
Nível de Evidência: [baixo, médio ou alto]
Justificativa com Base na Resposta:
[texto]

Competência: [competência 3]
Nível de Evidência: [baixo, médio ou alto]
Justificativa com Base na Resposta:
[texto]

4. SÍNTESE DO PERFIL

[texto final de síntese]

DADOS DO CANDIDATO:
Nome: ${assessment.candidate_name}
Vaga: ${assessment.target_role}
DISC escolhido: ${discLabel(assessment.disc_answer)}
Motivação escolhida: ${motivationLabel(assessment.motivation_answer)}

Competência 1: ${c1}
Resposta 1: ${assessment.example_1 || ""}

Competência 2: ${c2}
Resposta 2: ${assessment.example_2 || ""}

Competência 3: ${c3}
Resposta 3: ${assessment.example_3 || ""}
`;

  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.output_text?.trim() || "Relatório não gerado.";
}
