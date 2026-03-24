function escapeHtml(value: string) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeText(texto: string) {
  return String(texto ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitLines(texto: string) {
  return normalizeText(texto)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanQuestion(line: string) {
  return line
    .replace(/^\d+[\).\-\s]+/, "")
    .replace(/^pergunta\s*\d+[:\-\s]*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}


function improveQuestion(line: string) {
  let q = line
    .replace(/^\d+[\).\-\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!q) return "";

  q = q.toLowerCase();

  // 🔴 REESCRITA REAL (não só correção)

  if (q.includes("empresa escuta")) {
    return "A empresa demonstra abertura para ouvir as opiniões e percepções dos colaboradores?";
  }

  if (q.includes("chefe ajuda") || q.includes("lider ajuda")) {
    return "Seu líder oferece o suporte necessário para a realização do seu trabalho no dia a dia?";
  }

  if (q.includes("comunicacao") || q.includes("comunicação")) {
    return "Como você avalia a clareza e a efetividade da comunicação interna na empresa?";
  }

  if (q.includes("ambiente") || q.includes("clima")) {
    return "Como você percebe o ambiente de trabalho em relação ao respeito, convivência e colaboração entre as pessoas?";
  }

  if (q.includes("objetivo") || q.includes("meta")) {
    return "Os objetivos e metas da empresa são comunicados de forma clara e compreensível para você?";
  }

  if (q.includes("salario") || q.includes("salário")) {
    return "Você considera a remuneração compatível com as responsabilidades e atividades desempenhadas?";
  }

  if (q.includes("crescimento")) {
    return "A empresa oferece oportunidades claras de desenvolvimento e crescimento profissional?";
  }

  if (q.includes("feedback")) {
    return "Você recebe feedbacks claros e construtivos que contribuem para o seu desenvolvimento profissional?";
  }

  // 🔴 REGRA GERAL (reescrita executiva)

  q = q
    .replace("voce", "você")
    .replace("vc", "você");

  // transformar em pergunta profissional
  if (!q.endsWith("?")) {
    if (q.startsWith("como")) {
      q = q.charAt(0).toUpperCase() + q.slice(1) + "?";
    } else if (q.startsWith("se")) {
      q = "Você percebe se " + q.replace(/^se\s*/, "") + "?";
    } else {
      q = "Como você avalia " + q + "?";
    }
  }

  // ajuste final
  q = q.charAt(0).toUpperCase() + q.slice(1);

  return q;
}


function buildModeloBaseSixBoxHtml() {
  return `
<section>
  <h1>Questionário Base Six Box</h1>
  <p>Este material foi estruturado para apoiar a aplicação do questionário Six Box na empresa, com organização visual adequada para leitura, uso interno e salvamento em Avaliações recebidas.</p>

  <h2>1. Orientação de uso</h2>
  <p>Você pode utilizar este questionário no Google Forms ou no respondi.app.</p>
  <p>Na área de Tutoriais da plataforma, há um vídeo explicando como montar, ajustar e aplicar esse material.</p>

  <h2>2. Identificação inicial</h2>
  <ul>
    <li>Nome da empresa</li>
    <li>Área ou setor do colaborador</li>
    <li>Cargo</li>
    <li>Tempo de empresa</li>
  </ul>

  <h2>3. Escala de resposta</h2>
  <p>Utilize uma escala de 1 a 10, onde:</p>
  <ul>
    <li>1 = muito ruim ou discordo totalmente</li>
    <li>10 = excelente ou concordo totalmente</li>
  </ul>

  <h2>4. Estrutura sugerida do questionário</h2>

  <h3>4.1 Propósito</h3>
  <ul>
    <li>Os objetivos da empresa são claros para mim.</li>
    <li>Eu entendo o que a empresa espera alcançar.</li>
    <li>Sei como meu trabalho contribui para os objetivos da empresa.</li>
  </ul>

  <h3>4.2 Estrutura</h3>
  <ul>
    <li>As responsabilidades do meu cargo são claras.</li>
    <li>Existe boa organização das atividades na minha área.</li>
    <li>O trabalho é distribuído de forma lógica entre as pessoas.</li>
    <li>Existe coerência entre o que deve ser feito e o que realmente é feito.</li>
  </ul>

  <h3>4.3 Relacionamento</h3>
  <ul>
    <li>Há boa colaboração entre as pessoas da equipe.</li>
    <li>Existe boa comunicação entre áreas.</li>
    <li>Os conflitos são tratados de forma adequada.</li>
    <li>As pessoas conseguem trabalhar bem juntas.</li>
    <li>Os papéis de cada um são compatíveis com a prática.</li>
    <li>A equipe recebe desenvolvimento adequado.</li>
  </ul>

  <h3>4.4 Recompensa</h3>
  <ul>
    <li>Meu salário é compatível com o trabalho que realizo.</li>
    <li>Existe justiça na forma como a empresa recompensa as pessoas.</li>
    <li>A empresa reconhece os resultados alcançados.</li>
    <li>Existem oportunidades de crescimento pessoal.</li>
    <li>Existem oportunidades de promoção.</li>
  </ul>

  <h3>4.5 Liderança</h3>
  <ul>
    <li>Meu líder ou supervisor se comunica bem com a equipe.</li>
    <li>Existe apoio adequado da liderança.</li>
    <li>A relação entre líder e equipe é positiva.</li>
    <li>As lideranças se comunicam bem entre si.</li>
    <li>Recebo feedbacks úteis.</li>
    <li>A liderança demonstra boa gestão de pessoas.</li>
    <li>Meu supervisor tem preparo para liderar.</li>
  </ul>

  <h3>4.6 Mecanismos de apoio</h3>
  <ul>
    <li>A empresa possui processos bem definidos.</li>
    <li>Existem políticas que ajudam no trabalho.</li>
    <li>O planejamento e o controle funcionam bem.</li>
    <li>Os mecanismos de avaliação ajudam a melhorar o desempenho.</li>
  </ul>

  <h3>4.7 Responsabilidade</h3>
  <ul>
    <li>As pessoas demonstram comprometimento com as atividades.</li>
    <li>Existe senso de responsabilidade no trabalho.</li>
    <li>Há foco real em alcançar resultados.</li>
  </ul>

  <h2>5. Pergunta aberta</h2>
  <p>Na sua percepção, qual é hoje o principal ponto que mais precisa ser melhorado na empresa?</p>
</section>
`.trim();
}

function buildQuestionarioMelhoradoHtml(texto: string) {
  const original = splitLines(texto);
  const improved = original
    .map(improveQuestion)
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index);

  return `
<section>
  <h1>Questionário Revisado e Melhorado para Aplicação</h1>
  <p>O material enviado foi revisado com foco em correção gramatical, melhoria de clareza, ajuste de estrutura e melhor leitura para os colaboradores.</p>

  <h2>1. Versão aprimorada do questionário</h2>
  <ul>
    ${improved.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}
  </ul>

  <h2>2. Melhorias aplicadas</h2>
  <ul>
    <li>Correção gramatical e textual</li>
    <li>Melhoria de clareza nas perguntas</li>
    <li>Ajuste da estrutura para facilitar a aplicação</li>
    <li>Melhoria de leitura para os colaboradores</li>
  </ul>

  <h2>3. Orientação de uso</h2>
  <p>Você pode aplicar esse questionário no Google Forms ou no respondi.app.</p>
  <p>Na área de Tutoriais da plataforma, há um vídeo explicando como estruturar esse material para aplicação.</p>

  <h2>4. Observação técnica</h2>
  <p>A versão final foi organizada para tornar a leitura mais objetiva, padronizada e adequada ao preenchimento pelos colaboradores.</p>
</section>
`.trim();
}

export function buildColetorSixBoxReport(raw: Record<string, any>) {
  const textoUsuario = normalizeText(raw?.questionarioUsuario ?? "");
  const temQuestionario = String(raw?.temQuestionario ?? "").trim().toLowerCase();

  if (temQuestionario === "sim" && textoUsuario) {
    return buildQuestionarioMelhoradoHtml(textoUsuario);
  }

  return buildModeloBaseSixBoxHtml();
}

export async function runAgent(input: any) {
  const currentField = input?.currentField ?? "start";
  const answer = typeof input?.answer === "string" ? input.answer : "";
  const session = input?.session ?? {};

  if (currentField === "start") {
    return {
      reply: "Você já tem um questionário pronto? (sim/não)",
      session,
      currentField: "temQuestionario",
      nextField: "temQuestionario",
      finished: false,
      completed: false,
    };
  }

  if (currentField === "temQuestionario") {
    const v = answer.trim().toLowerCase();

    if (v !== "sim" && v !== "não" && v !== "nao") {
      return {
        reply: "Responda apenas com sim ou não.",
        session,
        currentField: "temQuestionario",
        nextField: "temQuestionario",
        finished: false,
        completed: false,
      };
    }

    if (v === "sim") {
      return {
        reply: "Envie aqui o seu questionário para o agente Coletor de Dados Six Box melhorar a aplicação na empresa.",
        session: { ...session, temQuestionario: "sim" },
        currentField: "questionarioUsuario",
        nextField: "questionarioUsuario",
        finished: false,
        completed: false,
      };
    }

    const finalSession = {
      ...session,
      temQuestionario: "não",
      status: "completed",
      reportStatus: "generated",
    };

    const report = buildColetorSixBoxReport(finalSession);

    return {
      reply: report,
      report,
      reportMarkdown: report,
      session: { ...finalSession, reportMarkdown: report },
      currentField: null,
      nextField: null,
      finished: true,
      completed: true,
    };
  }

  if (currentField === "questionarioUsuario") {
    const texto = answer.trim();

    if (texto.length < 20) {
      return {
        reply: "Envie o questionário completo para que eu possa melhorar o material.",
        session,
        currentField: "questionarioUsuario",
        nextField: "questionarioUsuario",
        finished: false,
        completed: false,
      };
    }

    const finalSession = {
      ...session,
      questionarioUsuario: texto,
      status: "completed",
      reportStatus: "generated",
    };

    const report = buildColetorSixBoxReport(finalSession);

    return {
      reply: report,
      report,
      reportMarkdown: report,
      session: { ...finalSession, reportMarkdown: report },
      currentField: null,
      nextField: null,
      finished: true,
      completed: true,
    };
  }

  return {
    reply: "Você já tem um questionário pronto? (sim/não)",
    session,
    currentField: "temQuestionario",
    nextField: "temQuestionario",
    finished: false,
    completed: false,
  };
}
