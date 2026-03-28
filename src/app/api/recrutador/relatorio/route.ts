import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDiscReport } from "@/lib/disc-runner";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function detectEvidenceLevel(answer: string) {
  const text = answer.toLowerCase();

  if (text.length >= 90) return "Alto";
  if (text.length >= 40) return "Médio";
  return "Baixo";
}

function buildCompetencyJustification(competency: string, answer: string) {
  const text = answer.toLowerCase();

  if (!answer.trim()) {
    return "O candidato não apresentou evidência suficiente nesta resposta, o que exige aprofundamento na entrevista para validar essa competência.";
  }

  const rules: Record<string, string[]> = {
    comunicação: [
      "comuniquei", "expliquei", "falei", "conversei", "atendi", "cliente", "equipe", "escutei", "alinhei"
    ],
    organização: [
      "organizei", "planilha", "agenda", "controle", "processo", "ordem", "lista", "rotina", "documento"
    ],
    proatividade: [
      "ajudei", "antecipei", "fui", "resolvi", "iniciei", "sem me pedirem", "procurei", "tomei iniciativa"
    ],
    empatia: [
      "ouvi", "entendi", "ajudei", "acolhi", "calma", "cliente", "respeito", "compreendi"
    ],
  };

  const competencyKey = competency.toLowerCase();
  const matched = (rules[competencyKey] || []).some((word) => text.includes(word));

  if (competencyKey === "comunicação") {
    if (matched) {
      return "A resposta indica que o candidato consegue se expressar, interagir com outras pessoas e atuar em situações que exigem troca de informação, o que sugere boa capacidade de comunicação aplicada ao contexto profissional.";
    }
    return "A resposta sugere alguma vivência prática, mas ainda precisa de aprofundamento para confirmar clareza, objetividade e impacto da comunicação no ambiente de trabalho.";
  }

  if (competencyKey === "organização") {
    if (matched) {
      return "A resposta demonstra preocupação com ordem, estrutura, controle de atividades ou melhoria de fluxo, indicando traços de organização e atenção ao funcionamento do trabalho.";
    }
    return "A resposta traz indícios limitados de organização. O recrutador deve explorar melhor como o candidato estrutura tarefas, prazos e prioridades.";
  }

  if (competencyKey === "proatividade") {
    if (matched) {
      return "A resposta mostra iniciativa sem depender exclusivamente de comando direto, indicando disposição para agir, assumir responsabilidade e contribuir além do mínimo esperado.";
    }
    return "A resposta sugere alguma iniciativa, mas ainda não evidencia com clareza autonomia, antecipação de problemas ou ação espontânea.";
  }

  if (competencyKey === "empatia") {
    if (matched) {
      return "A resposta sugere sensibilidade no trato com outras pessoas, escuta e cuidado com a experiência do outro, o que fortalece a leitura de empatia comportamental.";
    }
    return "A resposta traz poucos elementos objetivos para validar empatia, sendo importante aprofundar como o candidato reage às necessidades e emoções de terceiros.";
  }

  if (matched) {
    return "A resposta apresenta indícios práticos compatíveis com a competência avaliada, sugerindo aplicação dessa habilidade em contexto real de trabalho.";
  }

  return "A resposta aponta alguma experiência relacionada, mas o recrutador deve aprofundar o contexto, a ação tomada e o resultado alcançado para validar melhor essa competência.";
}

function buildDiscInterpretation(discAnswer: string, role: string) {
  const text = discAnswer.toLowerCase();

  if (text.includes("influ") || text.includes("b")) {
    return `O padrão de resposta sugere traços de influência, com tendência a comunicação mais aberta, interação social e facilidade de relacionamento. Para a vaga de ${role || "referência"}, isso pode favorecer atendimento, interação com equipe e presença relacional.`;
  }

  if (text.includes("domin") || text.includes("d")) {
    return `O padrão de resposta sugere traços de dominância, com tendência a objetividade, rapidez de ação e foco em resultado. Para a vaga de ${role || "referência"}, isso pode indicar energia para decisão e enfrentamento de desafios.`;
  }

  if (text.includes("estab") || text.includes("s")) {
    return `O padrão de resposta sugere traços de estabilidade, com tendência a constância, cooperação e equilíbrio no ambiente. Para a vaga de ${role || "referência"}, isso pode contribuir para rotina, suporte e manutenção de clima estável.`;
  }

  if (text.includes("conform") || text.includes("c")) {
    return `O padrão de resposta sugere traços de conformidade, com tendência a cuidado, precisão e atenção a regras e detalhes. Para a vaga de ${role || "referência"}, isso pode ser positivo em funções que exigem qualidade e padronização.`;
  }

  return `A resposta DISC fornece sinais iniciais do estilo comportamental do candidato. O recrutador deve usar essa leitura como apoio para aprofundar a entrevista e validar aderência ao contexto da vaga de ${role || "referência"}.`;
}

function buildMotivationInterpretation(motivation: string) {
  const text = motivation.toLowerCase();

  if (text.includes("segurança") || text.includes("estabilidade")) {
    return "O candidato demonstra valorização por ambientes previsíveis, seguros e organizados, o que pode favorecer consistência, permanência e menor tolerância a ambientes muito caóticos.";
  }

  if (text.includes("crescimento") || text.includes("desenvolvimento")) {
    return "O candidato parece se mobilizar por evolução, aprendizado e avanço profissional, o que pode aumentar engajamento em contextos com metas e oportunidade de desenvolvimento.";
  }

  if (text.includes("relacionamento") || text.includes("equipe") || text.includes("harmonia")) {
    return "O candidato demonstra motivação ligada a pertencimento, clima positivo e boas relações no trabalho, o que pode favorecer colaboração e integração com a equipe.";
  }

  if (text.includes("resultado") || text.includes("desafio")) {
    return "O candidato indica motivação por entrega, desafio e superação, o que pode ser positivo em ambientes com metas claras e exigência de performance.";
  }

  return "A resposta ajuda a identificar o que sustenta o engajamento do candidato no trabalho. O recrutador deve aprofundar quais condições de ambiente, liderança e rotina favorecem melhor desempenho.";
}

function buildSummary(data: any) {
  const role = normalize(data.target_role);
  const disc = normalize(data.disc_answer);
  const motivation = normalize(data.motivation_answer);
  const c1 = normalize(data.example_1);
  const c2 = normalize(data.example_2);
  const c3 = normalize(data.example_3);

  const strongSignals = [
    c1.length >= 30,
    c2.length >= 30,
    c3.length >= 30,
    disc.length > 0,
    motivation.length > 0,
  ].filter(Boolean).length;

  if (strongSignals >= 4) {
    return `O perfil apresentado demonstra boa base comportamental para a vaga de ${role || "referência"}, com sinais consistentes nas respostas fechadas e abertas. O candidato aparenta ter repertório prático suficiente para uma entrevista mais aprofundada, onde o recrutador poderá validar consistência, contexto e aderência final ao cargo.`;
  }

  if (strongSignals >= 2) {
    return `O candidato apresenta sinais iniciais relevantes para a vaga de ${role || "referência"}, mas o recrutador ainda deve aprofundar a entrevista para confirmar maturidade comportamental, consistência prática e adequação ao contexto da função.`;
  }

  return `As respostas fornecem uma leitura inicial do perfil do candidato para a vaga de ${role || "referência"}, porém ainda exigem aprofundamento na entrevista para validar evidências comportamentais e aderência real ao cargo.`;
}

function buildProfileReport(data: any) {
  const nome = normalize(data.candidate_name) || "Não informado";
  const vaga = normalize(data.target_role) || "Não informada";
  const disc = normalize(data.disc_answer) || "Não informado";
  const motivacao = normalize(data.motivation_answer) || "Não informado";
  const competencias = Array.isArray(data.competencies) ? data.competencies : [];

  const competencia1 = competencias[0] || "Competência 1";
  const competencia2 = competencias[1] || "Competência 2";
  const competencia3 = competencias[2] || "Competência 3";

  const resposta1 = normalize(data.example_1);
  const resposta2 = normalize(data.example_2);
  const resposta3 = normalize(data.example_3);

  const nivel1 = detectEvidenceLevel(resposta1);
  const nivel2 = detectEvidenceLevel(resposta2);
  const nivel3 = detectEvidenceLevel(resposta3);

  return ` RELATÓRIO DE PERFIL PROFISSIONAL

Candidato: ${nome}
Vaga de Referência: ${vaga}

1. ANÁLISE DE PERFIL COMPORTAMENTAL (DISC)

Resposta registrada:
${disc}

Interpretação:
${buildDiscInterpretation(disc, vaga)}

2. ANÁLISE DE MOTIVADORES PROFISSIONAIS

Resposta registrada:
${motivacao}

Interpretação:
${buildMotivationInterpretation(motivacao)}

3. AVALIAÇÃO POR COMPETÊNCIAS

Competência: ${competencia1}
Resposta do candidato:
${resposta1 || "Não informado"}

Nível de Evidência: ${nivel1}
Justificativa com Base na Resposta:
${buildCompetencyJustification(competencia1, resposta1)}

Competência: ${competencia2}
Resposta do candidato:
${resposta2 || "Não informado"}

Nível de Evidência: ${nivel2}
Justificativa com Base na Resposta:
${buildCompetencyJustification(competencia2, resposta2)}

Competência: ${competencia3}
Resposta do candidato:
${resposta3 || "Não informado"}

Nível de Evidência: ${nivel3}
Justificativa com Base na Resposta:
${buildCompetencyJustification(competencia3, resposta3)}

4. SÍNTESE DO PERFIL

${buildSummary(data)}

5. ORIENTAÇÃO PARA O RECRUTADOR

Use este relatório para:
- aprofundar os exemplos trazidos pelo candidato;
- validar contexto, ação e resultado em cada resposta;
- confirmar aderência comportamental à vaga;
- explorar riscos, lacunas e consistência do discurso na entrevista.`;
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID da avaliação não informado." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: assessment, error: fetchError } = await supabase
      .from("profile_assessments")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !assessment) {
      return NextResponse.json(
        { error: "Avaliação não encontrada." },
        { status: 404 }
      );
    }

    if (assessment.report_status === "generated") {
      return NextResponse.json(
        { error: "O relatório deste candidato já foi gerado." },
        { status: 400 }
      );
    }

    let report = "";

    if (assessment.agent_slug === "teste-perfil-disc") {
      report = await generateDiscReport((assessment.raw_answers ?? {}) as any);
    } else {
      report = buildProfileReport(assessment);
    }

    const { error: updateError } = await supabase
      .from("profile_assessments")
      .update({
        report_markdown: report,
        report_status: "generated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: `Erro ao salvar relatório: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao gerar relatório.",
      },
      { status: 500 }
    );
  }
}
