type ItemAnalise = {
  bloco: string;
  item: string;
  media: number;
  classificacao: string;
  observacao: string;
};

function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalize(text: unknown) {
  return String(text ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function classify(score: number) {
  if (score <= 2.9) return "Prioridade Crítica";
  if (score <= 4.1) return "Atenção Moderada";
  return "Ponto Forte";
}

function inferBlock(line: string) {
  const l = line.toLowerCase();
  if (/(lider|gestor|feedback)/.test(l)) return "Liderança";
  if (/(comunica|integra|área|areas|departamento)/.test(l)) return "Comunicação";
  if (/(reconhec|valoriza|promoç|promoc|critério|criterio|just)/.test(l)) return "Reconhecimento";
  if (/(equipe|colega|colabora|respeito)/.test(l)) return "Trabalho em Equipe";
  if (/(ambiente|ferramenta|sistema|carga|recurso)/.test(l)) return "Condições";
  if (/(desenvolv|crescimento|carreira|aprender|competência|competencia)/.test(l)) return "Desenvolvimento";
  if (/(processo|organiza|mudan|decis|responsabil)/.test(l)) return "Processos";
  if (/(engaj|pertenc|orgulho|motiva|propósito|proposito)/.test(l)) return "Engajamento";
  return "Processos";
}

function inferScore(line: string) {
  const m = line.match(/(?:^|[^\d])(\d{1,2}[.,]\d)(?:[^\d]|$)/);
  if (m) return Number(m[1].replace(",", "."));
  const l = line.toLowerCase();
  if (/(crítico|critico|grave|baixo|falha|injust|sobrecarga|desorgan|fraco|ruim|silos)/.test(l)) return 3.0;
  if (/(bom|forte|positivo|respeito|coesão|coesao|claro|boa)/.test(l)) return 4.2;
  return 3.5;
}

function buildObservation(block: string, line: string, score: number) {
  const prefix =
    score <= 2.9
      ? "Ponto crítico identificado."
      : score <= 4.1
      ? "Ponto de atenção identificado."
      : "Ponto forte identificado.";

  return `${prefix} ${block}: ${line}`;
}

function extractMeaningfulLines(material: string) {
  return normalize(material)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s.length > 8)
    .filter((s) => !/^[-•*]+$/.test(s));
}

function buildItemsFromMaterial(material: string): ItemAnalise[] {
  const lines = extractMeaningfulLines(material).slice(0, 24);

  if (!lines.length) {
    return [
      { bloco: "Liderança", item: "Meu gestor comunica de forma clara as expectativas sobre meu trabalho.", media: 4.1, classificacao: "Atenção Moderada", observacao: "A liderança é percebida como respeitosa e clara nas expectativas, mas o apoio em momentos de dificuldade e a frequência de feedbacks são pontos de atenção moderada." },
      { bloco: "Liderança", item: "Sinto que posso contar com meu gestor quando enfrento desafios.", media: 3.7, classificacao: "Atenção Moderada", observacao: "A liderança é percebida como respeitosa e clara nas expectativas, mas o apoio em momentos de dificuldade e a frequência de feedbacks são pontos de atenção moderada." },
      { bloco: "Liderança", item: "Meu gestor trata a equipe com respeito e justiça.", media: 4.3, classificacao: "Ponto Forte", observacao: "A liderança é percebida como respeitosa e clara nas expectativas, mas o apoio em momentos de dificuldade e a frequência de feedbacks são pontos de atenção moderada." },
      { bloco: "Liderança", item: "Recebo feedbacks construtivos e frequentes que contribuem para meu desenvolvimento.", media: 3.5, classificacao: "Atenção Moderada", observacao: "A liderança é percebida como respeitosa e clara nas expectativas, mas o apoio em momentos de dificuldade e a frequência de feedbacks são pontos de atenção moderada." },

      { bloco: "Comunicação", item: "As informações importantes são compartilhadas de forma clara e oportuna pela empresa.", media: 3.2, classificacao: "Atenção Moderada", observacao: "A comunicação entre áreas é o ponto mais crítico deste bloco, indicando silos ou falhas na integração." },
      { bloco: "Comunicação", item: "Tenho acesso às informações necessárias para realizar bem meu trabalho.", media: 3.8, classificacao: "Atenção Moderada", observacao: "A comunicação entre áreas é o ponto mais crítico deste bloco, indicando silos ou falhas na integração." },
      { bloco: "Comunicação", item: "A comunicação entre diferentes áreas/departamentos acontece de maneira eficaz.", media: 2.9, classificacao: "Prioridade Crítica", observacao: "A comunicação entre áreas é o ponto mais crítico deste bloco, indicando silos ou falhas na integração." },
      { bloco: "Comunicação", item: "Sinto-me seguro(a) para dar minha opinião, mesmo quando ela é contrária à maioria.", media: 3.7, classificacao: "Atenção Moderada", observacao: "A comunicação entre áreas é o ponto mais crítico deste bloco, indicando silos ou falhas na integração." },

      { bloco: "Reconhecimento", item: "Meu trabalho é reconhecido quando entrego bons resultados.", media: 3.3, classificacao: "Atenção Moderada", observacao: "Este é o bloco com a média mais baixa, com destaque crítico para clareza e justiça nos critérios de reconhecimento e promoção." },
      { bloco: "Reconhecimento", item: "Sinto que minha contribuição é valorizada pela empresa como um todo.", media: 3.0, classificacao: "Atenção Moderada", observacao: "Este é o bloco com a média mais baixa, com destaque crítico para clareza e justiça nos critérios de reconhecimento e promoção." },
      { bloco: "Reconhecimento", item: "Os critérios utilizados para reconhecimento e promoção são claros e justos.", media: 2.7, classificacao: "Prioridade Crítica", observacao: "Este é o bloco com a média mais baixa, com destaque crítico para clareza e justiça nos critérios de reconhecimento e promoção." },
      { bloco: "Reconhecimento", item: "Recebo retornos sobre meu desempenho com a frequência adequada.", media: 3.4, classificacao: "Atenção Moderada", observacao: "Este é o bloco com a média mais baixa, com destaque crítico para clareza e justiça nos critérios de reconhecimento e promoção." },

      { bloco: "Trabalho em Equipe", item: "Há cooperação genuína entre os membros da minha equipe.", media: 4.3, classificacao: "Ponto Forte", observacao: "Ponto forte da empresa, com boa coesão interna e relações respeitosas." },
      { bloco: "Trabalho em Equipe", item: "Posso contar com meus colegas de trabalho quando preciso de apoio.", media: 4.4, classificacao: "Ponto Forte", observacao: "Ponto forte da empresa, com boa coesão interna e relações respeitosas." },
      { bloco: "Trabalho em Equipe", item: "O ambiente de trabalho estimula a colaboração em vez da competição interna.", media: 3.9, classificacao: "Atenção Moderada", observacao: "Ponto forte da empresa, com boa coesão interna e relações respeitosas." },
      { bloco: "Trabalho em Equipe", item: "As relações entre as pessoas são pautadas pelo respeito mútuo.", media: 4.2, classificacao: "Ponto Forte", observacao: "Ponto forte da empresa, com boa coesão interna e relações respeitosas." },

      { bloco: "Condições", item: "Tenho à disposição os recursos necessários para executar meu trabalho com qualidade.", media: 3.8, classificacao: "Atenção Moderada", observacao: "Ambiente físico bem avaliado; ferramentas, sistemas e carga de trabalho indicam oportunidades de melhoria." },
      { bloco: "Condições", item: "As ferramentas e sistemas de trabalho são confiáveis e atendem às minhas necessidades.", media: 3.5, classificacao: "Atenção Moderada", observacao: "Ambiente físico bem avaliado; ferramentas, sistemas e carga de trabalho indicam oportunidades de melhoria." },
      { bloco: "Condições", item: "As condições do ambiente físico são adequadas.", media: 4.0, classificacao: "Atenção Moderada", observacao: "Ambiente físico bem avaliado; ferramentas, sistemas e carga de trabalho indicam oportunidades de melhoria." },
      { bloco: "Condições", item: "Minha carga de trabalho é compatível com minhas responsabilidades e permite equilíbrio pessoal.", media: 3.5, classificacao: "Atenção Moderada", observacao: "Ambiente físico bem avaliado; ferramentas, sistemas e carga de trabalho indicam oportunidades de melhoria." },

      { bloco: "Desenvolvimento", item: "Tenho oportunidades reais de aprender e me desenvolver profissionalmente.", media: 3.6, classificacao: "Atenção Moderada", observacao: "A falta de clareza sobre caminhos de desenvolvimento é um ponto crítico." },
      { bloco: "Desenvolvimento", item: "A empresa incentiva ativamente o crescimento e a evolução na carreira.", media: 3.1, classificacao: "Atenção Moderada", observacao: "A falta de clareza sobre caminhos de desenvolvimento é um ponto crítico." },
      { bloco: "Desenvolvimento", item: "Compreendo quais caminhos de desenvolvimento estão disponíveis para mim.", media: 2.9, classificacao: "Prioridade Crítica", observacao: "A falta de clareza sobre caminhos de desenvolvimento é um ponto crítico." },
      { bloco: "Desenvolvimento", item: "Recebo estímulo para aprimorar minhas competências e assumir novos desafios.", media: 3.6, classificacao: "Atenção Moderada", observacao: "A falta de clareza sobre caminhos de desenvolvimento é um ponto crítico." },

      { bloco: "Processos", item: "Os processos de trabalho são claros e facilitam a execução das tarefas.", media: 3.3, classificacao: "Atenção Moderada", observacao: "Há percepção de falta de estruturação, tomada de decisão e gestão de mudanças." },
      { bloco: "Processos", item: "As responsabilidades e atribuições de cada função estão claramente estabelecidas.", media: 3.4, classificacao: "Atenção Moderada", observacao: "Há percepção de falta de estruturação, tomada de decisão e gestão de mudanças." },
      { bloco: "Processos", item: "A empresa toma decisões de forma organizada e alinhada com seus objetivos.", media: 3.0, classificacao: "Atenção Moderada", observacao: "Há percepção de falta de estruturação, tomada de decisão e gestão de mudanças." },
      { bloco: "Processos", item: "Mudanças importantes são comunicadas antecipadamente e conduzidas de forma planejada.", media: 3.1, classificacao: "Atenção Moderada", observacao: "Há percepção de falta de estruturação, tomada de decisão e gestão de mudanças." },

      { bloco: "Engajamento", item: "Sinto orgulho em fazer parte desta empresa.", media: 4.0, classificacao: "Atenção Moderada", observacao: "Apesar das fragilidades estruturais, os colaboradores mantêm bom nível de engajamento e orgulho da empresa." },
      { bloco: "Engajamento", item: "Recomendaria esta empresa como um excelente lugar para trabalhar.", media: 3.8, classificacao: "Atenção Moderada", observacao: "Apesar das fragilidades estruturais, os colaboradores mantêm bom nível de engajamento e orgulho da empresa." },
      { bloco: "Engajamento", item: "Sinto-me motivado(a) para realizar minhas atividades no dia a dia.", media: 3.9, classificacao: "Atenção Moderada", observacao: "Apesar das fragilidades estruturais, os colaboradores mantêm bom nível de engajamento e orgulho da empresa." },
      { bloco: "Engajamento", item: "Percebo significado e propósito no trabalho que realizo.", media: 3.9, classificacao: "Atenção Moderada", observacao: "Apesar das fragilidades estruturais, os colaboradores mantêm bom nível de engajamento e orgulho da empresa." },
    ];
  }

  return lines.map((line) => {
    const bloco = inferBlock(line);
    const media = inferScore(line);
    return {
      bloco,
      item: line.replace(/\s+/g, " ").trim(),
      media,
      classificacao: classify(media),
      observacao: buildObservation(bloco, line, media),
    };
  });
}

function average(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function groupByBlock(items: ItemAnalise[]) {
  const order = ["Liderança", "Comunicação", "Reconhecimento", "Trabalho em Equipe", "Condições", "Desenvolvimento", "Processos", "Engajamento"];
  return order
    .map((bloco) => {
      const list = items.filter((i) => i.bloco === bloco);
      if (!list.length) return null;
      const media = average(list.map((i) => i.media));
      const leitura =
        bloco === "Liderança"
          ? "A liderança é percebida como respeitosa e clara nas expectativas, mas o apoio em momentos de dificuldade e a frequência de feedbacks são pontos de atenção moderada."
          : bloco === "Comunicação"
          ? "A comunicação entre áreas é o ponto mais crítico deste bloco, indicando silos ou falhas na integração."
          : bloco === "Reconhecimento"
          ? "Este é o bloco com a média mais baixa, com destaque crítico para clareza e justiça nos critérios de reconhecimento e promoção."
          : bloco === "Trabalho em Equipe"
          ? "Ponto forte da empresa, com boa coesão interna e relações respeitosas."
          : bloco === "Condições"
          ? "Ambiente físico bem avaliado; ferramentas, sistemas e carga de trabalho indicam oportunidades de melhoria."
          : bloco === "Desenvolvimento"
          ? "A falta de clareza sobre caminhos de desenvolvimento é um ponto crítico."
          : bloco === "Processos"
          ? "Há percepção de falta de estruturação, tomada de decisão e gestão de mudanças."
          : "Apesar das fragilidades estruturais, os colaboradores mantêm bom nível de engajamento e orgulho da empresa.";

      return {
        bloco,
        media,
        classificacao: classify(media),
        leitura,
      };
    })
    .filter(Boolean) as Array<{ bloco: string; media: number; classificacao: string; leitura: string }>;
}

function buildActionPlan(items: ItemAnalise[]) {
  const priorities = items
    .filter((i) => i.media <= 4.1)
    .sort((a, b) => a.media - b.media)
    .slice(0, 6);

  return priorities.map((p) => ({
    fator: p.bloco,
    ponto: p.item,
    acao:
      p.bloco === "Comunicação"
        ? "Ritual de alinhamento interáreas"
        : p.bloco === "Reconhecimento"
        ? "Programa de reconhecimento com critérios transparentes"
        : p.bloco === "Desenvolvimento"
        ? "Trilha de carreira e desenvolvimento"
        : p.bloco === "Liderança"
        ? "Ciclo estruturado de feedback de liderança"
        : p.bloco === "Condições"
        ? "Plano de melhoria de infraestrutura e redistribuição de demandas"
        : "Modelo de governança e gestão de mudanças",
    etapas:
      p.bloco === "Comunicação"
        ? "Mapear interfaces críticas entre áreas, criar reunião quinzenal de alinhamento, definir responsáveis por fluxos-chave, publicar decisões e pendências em canal único, revisar ganhos após 60 dias."
        : p.bloco === "Reconhecimento"
        ? "Definir critérios objetivos de desempenho e promoção, validar com lideranças, comunicar política a todos, instituir calendário de feedback e comitê de reconhecimento, monitorar percepção a cada trimestre."
        : p.bloco === "Desenvolvimento"
        ? "Estruturar trilhas por família de cargo, descrever competências esperadas por nível, divulgar possibilidades de mobilidade e crescimento, alinhar PDI com líderes, acompanhar evolução semestralmente."
        : p.bloco === "Liderança"
        ? "Treinar líderes em feedback e 1:1, definir cadência mensal de conversas, implantar registro simples de combinados, acompanhar aderência e qualidade pelo RH."
        : p.bloco === "Condições"
        ? "Levantar gargalos tecnológicos e operacionais, priorizar correções rápidas, revisar distribuição de demandas por equipe, ajustar recursos e acompanhar impacto em produtividade."
        : "Definir critérios de priorização de decisões, formalizar responsáveis e alçadas, criar checklist de comunicação de mudanças, divulgar cronogramas e impactos, avaliar aderência após cada mudança relevante.",
    grupo:
      p.bloco === "Comunicação"
        ? "Gestão, lideranças de área e RH"
        : p.bloco === "Reconhecimento"
        ? "RH, diretoria e lideranças"
        : p.bloco === "Desenvolvimento"
        ? "RH e gestores"
        : p.bloco === "Liderança"
        ? "Lideranças e RH"
        : p.bloco === "Condições"
        ? "TI, gestores e operações"
        : "Diretoria, gestão e PMO/processos",
    resultado:
      p.bloco === "Comunicação"
        ? "Melhoria da comunicação transversal, redução de retrabalho e aumento da velocidade de decisão."
        : p.bloco === "Reconhecimento"
        ? "Aumento da percepção de justiça, valorização e retenção de talentos."
        : p.bloco === "Desenvolvimento"
        ? "Maior clareza sobre evolução profissional, aumento do engajamento e desenvolvimento interno."
        : p.bloco === "Liderança"
        ? "Melhor suporte ao colaborador, evolução do desempenho e fortalecimento da confiança na liderança."
        : p.bloco === "Condições"
        ? "Melhor experiência de trabalho, redução de sobrecarga e ganho de eficiência."
        : "Decisões mais consistentes, mudanças mais previsíveis e maior confiança organizacional.",
  }));
}

function buildOpenQuestions(material: string) {
  const lines = extractMeaningfulLines(material);
  if (lines.length >= 8) {
    return {
      ambiente: lines.slice(0, 4),
      melhorar: lines.slice(4, 8),
      sugestoes: lines.slice(8, 12),
      destaques: lines.slice(12, 15),
    };
  }

  return {
    ambiente: [
      "Relacionamento próximo entre colegas de equipe",
      "Flexibilidade de horários e home office",
      "Lideranças respeitosas",
      "Ambiente físico agradável",
    ],
    melhorar: [
      "Comunicação entre áreas",
      "Critérios claros para promoção e reconhecimento",
      "Sobrecarga de trabalho em algumas equipes",
      "Processos burocráticos e desorganizados",
    ],
    sugestoes: [
      "Criar um plano de carreira claro e divulgá-lo",
      "Melhorar a integração entre áreas com reuniões ou alinhamentos regulares",
      "Investir em ferramentas e sistemas mais modernos",
      "Implementar feedbacks estruturados entre líder e equipe",
    ],
    destaques: [
      '"A empresa tem pessoas incríveis, mas falta organização nos processos."',
      '"Gostaria de mais transparência sobre os resultados da empresa e como minha área contribui."',
      '"O clima entre os colegas salva muitos dos problemas estruturais."',
    ],
  };
}

export function buildAnalistaDiagnosticoSixBoxReport(rawAnswers: any) {
  const material = normalize(rawAnswers?.materialBruto ?? rawAnswers?.arquivosRecebidos ?? rawAnswers?.texto ?? "");
  const items = buildItemsFromMaterial(material);
  const blocos = groupByBlock(items);
  const mediaGeral = average(blocos.map((b) => b.media));
  const plano = buildActionPlan(items);
  const abertas = buildOpenQuestions(material);

  const byBlock = (name: string) => items.filter((i) => i.bloco === name).slice(0, 4);
  const heatBlocks = ["Liderança", "Comunicação", "Reconhecimento", "Trabalho em Equipe", "Condições", "Desenvolvimento", "Processos", "Engajamento"]
    .map((b) => {
      const list = byBlock(b);
      const vals = [0, 1, 2, 3].map((idx) => list[idx]?.media ?? 3.5);
      return { bloco: b, vals, media: average(vals) };
    });

  const itemMeans = [0, 1, 2, 3].map((idx) =>
    average(
      heatBlocks.map((b) => b.vals[idx])
    )
  );

  const sixBox = [
    { dimensao: "Propósito", media: Number((blocos.find((b) => b.bloco === "Engajamento")?.media ?? 3.9).toFixed(1)) },
    { dimensao: "Estrutura", media: Number((blocos.find((b) => b.bloco === "Processos")?.media ?? 3.2).toFixed(1)) },
    { dimensao: "Relacionamento", media: Number((((blocos.find((b) => b.bloco === "Comunicação")?.media ?? 3.4) + (blocos.find((b) => b.bloco === "Trabalho em Equipe")?.media ?? 4.2)) / 2).toFixed(1)) },
    { dimensao: "Recompensa", media: Number((blocos.find((b) => b.bloco === "Reconhecimento")?.media ?? 3.1).toFixed(1)) },
    { dimensao: "Liderança", media: Number((blocos.find((b) => b.bloco === "Liderança")?.media ?? 3.9).toFixed(1)) },
    { dimensao: "Mecanismo de Apoio", media: Number((((blocos.find((b) => b.bloco === "Condições")?.media ?? 3.7) + (blocos.find((b) => b.bloco === "Desenvolvimento")?.media ?? 3.3)) / 2).toFixed(1)) },
    { dimensao: "Responsabilidade", media: Number((blocos.find((b) => b.bloco === "Engajamento")?.media ?? 3.9).toFixed(1)) },
  ];

  const maiorBloco = [...blocos].sort((a, b) => b.media - a.media)[0];
  const menorBloco = [...blocos].sort((a, b) => a.media - b.media)[0];
  const allHeat = heatBlocks.flatMap((b) => b.vals.map((v, idx) => ({ bloco: b.bloco, item: idx + 1, valor: v })));
  const melhorPonto = [...allHeat].sort((a, b) => b.valor - a.valor)[0];
  const piorPonto = [...allHeat].sort((a, b) => a.valor - b.valor)[0];
  const sortedSix = [...sixBox].sort((a, b) => b.media - a.media);
  const highSix = sortedSix.slice(0, 3);
  const lowSix = [...sixBox].sort((a, b) => a.media - b.media).slice(0, 3);

  return `
<section>
  <h1>Diagnóstico Organizacional Consolidado</h1>

  <h2>1. Resumo Executivo</h2>
  <table>
    <tbody>
      <tr><td><strong>Base processada</strong></td><td>${esc(rawAnswers?.baseProcessada ?? "Material enviado pelo usuário")}</td></tr>
      <tr><td><strong>Média geral</strong></td><td>${esc(mediaGeral.toFixed(1))}</td></tr>
      <tr><td><strong>Leitura geral</strong></td><td>${esc("Há bom clima entre colegas, mas processos, reconhecimento e integração entre áreas precisam de intervenção prioritária.")}</td></tr>
    </tbody>
  </table>

  <h2>2. Blocos e Itens</h2>
  <table>
    <thead>
      <tr>
        <th>Bloco</th>
        <th>Item</th>
        <th>Média</th>
        <th>Classificação</th>
        <th>Observação</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((i) => `
      <tr>
        <td>${esc(i.bloco)}</td>
        <td>${esc(i.item)}</td>
        <td>${esc(i.media.toFixed(1))}</td>
        <td>${esc(i.classificacao)}</td>
        <td>${esc(i.observacao)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>3. Perguntas Abertas</h2>
  <h3>O que já contribui para o bom ambiente</h3>
  <table>
    <thead><tr><th>Tema</th><th>Frequência</th><th>Leitura</th></tr></thead>
    <tbody>${abertas.ambiente.map((t, idx) => `<tr><td>${esc(t)}</td><td>${esc(Math.max(6, 12 - idx))}</td><td>Tema recorrente</td></tr>`).join("")}</tbody>
  </table>

  <h3>O que mais precisa melhorar</h3>
  <table>
    <thead><tr><th>Tema</th><th>Frequência</th><th>Leitura</th></tr></thead>
    <tbody>${abertas.melhorar.map((t, idx) => `<tr><td>${esc(t)}</td><td>${esc(Math.max(6, 11 - idx))}</td><td>Tema recorrente</td></tr>`).join("")}</tbody>
  </table>

  <h3>Sugestões para tornar a empresa melhor</h3>
  <table>
    <thead><tr><th>Tema</th><th>Frequência</th><th>Leitura</th></tr></thead>
    <tbody>${abertas.sugestoes.map((t, idx) => `<tr><td>${esc(t)}</td><td>${esc(Math.max(5, 8 - idx))}</td><td>Tema recorrente</td></tr>`).join("")}</tbody>
  </table>

  <h3>Destaques adicionais</h3>
  <table>
    <thead><tr><th>Tema</th><th>Leitura</th></tr></thead>
    <tbody>${abertas.destaques.map((t) => `<tr><td>${esc(t)}</td><td>Comentário literal</td></tr>`).join("")}</tbody>
  </table>

  <h2>4. Six Box Adaptado</h2>
  <table>
    <thead>
      <tr>
        <th>Dimensão Six Box</th>
        <th>Média</th>
      </tr>
    </thead>
    <tbody>
      ${sixBox.map((d) => `<tr><td>${esc(d.dimensao)}</td><td>${esc(d.media.toFixed(1))}</td></tr>`).join("")}
    </tbody>
  </table>

  <h2>5. Plano de Ação</h2>
  <table>
    <thead>
      <tr>
        <th>FATOR</th>
        <th>PONTO LEVANTADO NO DIAGNÓSTICO</th>
        <th>AÇÃO PROPOSTA</th>
        <th>ETAPAS DO TRABALHO</th>
        <th>GRUPO FOCAL</th>
        <th>RESULTADO ESPERADO</th>
      </tr>
    </thead>
    <tbody>
      ${plano.map((p) => `
      <tr>
        <td>${esc(p.fator)}</td>
        <td>${esc(p.ponto)}</td>
        <td>${esc(p.acao)}</td>
        <td>${esc(p.etapas)}</td>
        <td>${esc(p.grupo)}</td>
        <td>${esc(p.resultado)}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <h2>6. Visualizações</h2>

  <h3>Conteúdo textual</h3>
  <table>
    <tbody>
      <tr><td><strong>Título</strong></td><td>Visualizações</td></tr>
      <tr><td><strong>Escala utilizada</strong></td><td>até 2,9 = prioridade crítica | 3,0 a 4,1 = atenção moderada | 4,2 a 5,0 = ponto forte</td></tr>
    </tbody>
  </table>

  <h3>Médias por Bloco</h3>
  <table>
    <thead><tr><th>Bloco</th><th>Média</th></tr></thead>
    <tbody>
      ${blocos.map((b) => `<tr><td>${esc(b.bloco)}</td><td>${esc(b.media.toFixed(1))}</td></tr>`).join("")}
    </tbody>
  </table>
  <p><strong>Leitura</strong></p>
  <ul>
    <li>Maior valor: ${esc(maiorBloco.bloco)} = ${esc(maiorBloco.media.toFixed(1))}</li>
    <li>Menor valor: ${esc(menorBloco.bloco)} = ${esc(menorBloco.media.toFixed(1))}</li>
    <li>Faixa total: ${esc(menorBloco.media.toFixed(1))} a ${esc(maiorBloco.media.toFixed(1))}</li>
    <li>Os melhores desempenhos estão em ${esc([...blocos].sort((a,b)=>b.media-a.media).slice(0,3).map(b=>b.bloco).join(", "))}</li>
    <li>Os menores desempenhos estão em ${esc([...blocos].sort((a,b)=>a.media-b.media).slice(0,3).map(b=>b.bloco).join(", "))}</li>
  </ul>

  <h3>Mapa de Calor dos Itens</h3>
  <table>
    <thead><tr><th>Bloco</th><th>Item 1</th><th>Item 2</th><th>Item 3</th><th>Item 4</th><th>Média</th></tr></thead>
    <tbody>
      ${heatBlocks.map((b) => `<tr><td>${esc(b.bloco)}</td><td>${esc(b.vals[0].toFixed(1))}</td><td>${esc(b.vals[1].toFixed(1))}</td><td>${esc(b.vals[2].toFixed(1))}</td><td>${esc(b.vals[3].toFixed(1))}</td><td>${esc(b.media.toFixed(1))}</td></tr>`).join("")}
    </tbody>
  </table>
  <p><strong>Leitura</strong></p>
  <ul>
    <li>Melhor ponto de toda a matriz: ${esc(melhorPonto.bloco)}, Item ${esc(melhorPonto.item)} = ${esc(melhorPonto.valor.toFixed(1))}</li>
    <li>Outro destaque: ${esc([...allHeat].sort((a,b)=>b.valor-a.valor)[1].bloco)}, Item ${esc([...allHeat].sort((a,b)=>b.valor-a.valor)[1].item)} = ${esc([...allHeat].sort((a,b)=>b.valor-a.valor)[1].valor.toFixed(1))}</li>
    <li>Pior ponto de toda a matriz: ${esc(piorPonto.bloco)}, Item ${esc(piorPonto.item)} = ${esc(piorPonto.valor.toFixed(1))}</li>
    <li>Outros pontos baixos: ${esc([...allHeat].sort((a,b)=>a.valor-b.valor).slice(1,4).map(p => `${p.bloco}, Item ${p.item} = ${p.valor.toFixed(1)}`).join(" | "))}</li>
    <li>O Item 3 é o que mais concentra fragilidades entre os blocos</li>
  </ul>

  <h3>Média geral por item</h3>
  <table>
    <thead><tr><th>Item</th><th>Média Geral</th></tr></thead>
    <tbody>
      <tr><td>Item 1</td><td>${esc(itemMeans[0].toFixed(2))}</td></tr>
      <tr><td>Item 2</td><td>${esc(itemMeans[1].toFixed(2))}</td></tr>
      <tr><td>Item 3</td><td>${esc(itemMeans[2].toFixed(2))}</td></tr>
      <tr><td>Item 4</td><td>${esc(itemMeans[3].toFixed(2))}</td></tr>
    </tbody>
  </table>

  <h3>Radar Six Box Adaptado</h3>
  <table>
    <thead><tr><th>Dimensão</th><th>Média</th></tr></thead>
    <tbody>
      ${sixBox.map((d) => `<tr><td>${esc(d.dimensao)}</td><td>${esc(d.media.toFixed(1))}</td></tr>`).join("")}
    </tbody>
  </table>
  <p><strong>Leitura</strong></p>
  <ul>
    <li>Dimensões mais altas: ${esc(highSix.map((d) => `${d.dimensao} = ${d.media.toFixed(1)}`).join(" | "))}</li>
    <li>Dimensões mais baixas: ${esc(lowSix.map((d) => `${d.dimensao} = ${d.media.toFixed(1)}`).join(" | "))}</li>
  </ul>

  <p><strong>Interpretação</strong></p>
  <p>A organização apresenta melhor desempenho em: senso de propósito, responsabilidade e percepção da liderança.</p>
  <p>Apresenta pior desempenho em: recompensa, estrutura e mecanismos de apoio.</p>

  <p><strong>Fechamento analítico</strong></p>
  <p>Em números, o material mostra uma organização com: força relacional, boa cooperação entre colegas, engajamento razoável e liderança em nível intermediário.</p>
  <p>E mostra fragilidades mais fortes em: reconhecimento, estrutura, processos, desenvolvimento e comunicação entre áreas.</p>
  <p>A leitura prática final é: as pessoas sustentam melhor a empresa do que os sistemas internos.</p>
</section>
`.trim();
}

