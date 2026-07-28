// O agente "taxa-aderencia-vaga" usa o mesmo motor de relatório do
// "taxa-de-aderencia-com-a-vaga". Mantemos um único builder para que a
// geração no fim da conversa e a regeneração em Relatórios Stackers
// produzam exatamente o mesmo documento.
export { generateTaxaAderenciaReport } from "@/lib/agents/taxa-de-aderencia-com-a-vaga/runner";

import { generateTaxaAderenciaReport as buildReport } from "@/lib/agents/taxa-de-aderencia-com-a-vaga/runner";

export function buildAderenciaVagaReport(rawAnswers: Record<string, unknown>) {
  return buildReport(rawAnswers as Parameters<typeof buildReport>[0]);
}
