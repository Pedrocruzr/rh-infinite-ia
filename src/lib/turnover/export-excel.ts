import type { MonthTurnoverData, TurnoverEmployee } from "./types";

export function generateTurnoverExcel(
  mesesEvolucao: MonthTurnoverData[],
  employees: TurnoverEmployee[],
  ano = new Date().getFullYear()
) {
  // Headcount em Dezembro do ano anterior (base inicial)
  const dataLimiteDezAnterior = new Date(ano - 1, 11, 31, 23, 59, 59);
  const totalDezAnterior =
    employees.filter((emp) => {
      const dAdm = new Date(emp.data_admissao);
      const dDes = emp.data_desligamento ? new Date(emp.data_desligamento) : null;
      return dAdm <= dataLimiteDezAnterior && (!dDes || dDes > dataLimiteDezAnterior);
    }).length ||
    employees.filter((e) => !e.data_desligamento).length ||
    35;

  let totalEntradas = 0;
  let totalSaidas = 0;

  // Linhas dos 12 meses na tabela de movimentações
  const linhasMesesHtml = mesesEvolucao
    .map((m) => {
      totalEntradas += m.admissoes;
      totalSaidas += m.desligamentos;
      const taxaFormatada =
        m.taxaTurnoverDesligamento > 0
          ? `${m.taxaTurnoverDesligamento.toFixed(2).replace(".", ",")}%`
          : "0,00%";

      return `
        <tr>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 6px 12px; font-weight: bold; text-align: left; font-size: 10pt;">${m.mesNome.toUpperCase()}</td>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-size: 10pt;">${m.efetivoAtivo || ""}</td>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-size: 10pt;">${m.admissoes > 0 ? m.admissoes : ""}</td>
          <td bgcolor="#A6A6A6" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-weight: bold; color: #000000; font-size: 10pt;">${m.desligamentos > 0 ? m.desligamentos : ""}</td>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-weight: bold; font-size: 10pt;">${taxaFormatada}</td>
        </tr>
      `;
    })
    .join("");

  const taxaTotal =
    totalDezAnterior > 0
      ? `${((totalSaidas / totalDezAnterior) * 100).toFixed(2).replace(".", ",")}%`
      : "0,00%";

  // Gráfico de Barras em Grade Nativa de Células:
  // Cria faixas verticais proporcionais para que as colunas subam visualmente no Excel e Google Sheets!
  const maxTaxaGeral = Math.max(...mesesEvolucao.map((m) => m.taxaTurnoverDesligamento), 20);
  const topoEscala = Math.ceil(maxTaxaGeral / 10) * 10;
  const step = Math.max(5, Math.round(topoEscala / 5));

  const levels: { label: string; min: number }[] = [];
  for (let val = topoEscala; val >= step; val -= step) {
    levels.push({ label: `${val.toFixed(1).replace(".", ",")}%`, min: val - step * 0.4 });
  }

  // Linhas das faixas verticais do gráfico com células pintadas de azul marinho #002060
  const linhasGradeBarras = levels
    .map((lvl) => {
      const celulasMeses = mesesEvolucao
        .map((m) => {
          const ativo = m.taxaTurnoverDesligamento >= lvl.min;
          if (ativo) {
            return `<td bgcolor="#002060" style="background-color: #002060; border-left: 1px solid #001030; border-right: 1px solid #001030; height: 20px; text-align: center; color: #002060; font-size: 6pt;">█</td>`;
          }
          return `<td bgcolor="#FFFFFF" style="background-color: #FFFFFF; border-left: 1px dashed #E5E5E5; border-right: 1px dashed #E5E5E5; height: 20px;"></td>`;
        })
        .join("");

      return `
        <tr>
          <td bgcolor="#F8FAFC" style="border-right: 1px solid #000000; font-size: 8pt; color: #555555; text-align: right; padding-right: 6px; font-weight: bold; width: 65px;">${lvl.label}</td>
          ${celulasMeses}
        </tr>
      `;
    })
    .join("");

  // Linha das taxas calculadas no topo do gráfico
  const taxasMesesGrafico = mesesEvolucao
    .map((m) => {
      const taxaFormatada =
        m.taxaTurnoverDesligamento > 0
          ? `${m.taxaTurnoverDesligamento.toFixed(2).replace(".", ",")}%`
          : "0,00%";
      const isDestaque = m.taxaTurnoverDesligamento > 0;
      return `<td bgcolor="${isDestaque ? "#EBF1F5" : "#FFFFFF"}" style="border: 1px solid #D9D9D9; padding: 6px 2px; text-align: center; font-size: 9pt; font-weight: bold; color: ${isDestaque ? "#002060" : "#595959"};">${taxaFormatada}</td>`;
    })
    .join("");

  // Linha com barras sólidas de bloco Unicode visíveis diretamente em qualquer planilha
  const barrasDeBloco = mesesEvolucao
    .map((m) => {
      const taxa = m.taxaTurnoverDesligamento;
      if (taxa <= 0) {
        return `<td bgcolor="#FFFFFF" style="border: 1px solid #D9D9D9; text-align: center; font-size: 9pt; color: #CCCCCC;">—</td>`;
      }
      // Repete blocos azuis escuros proporcionais à taxa
      const numBlocos = Math.min(8, Math.max(2, Math.round(taxa / 4)));
      const blocos = "█".repeat(numBlocos);
      return `<td bgcolor="#EBF1F5" style="border: 1px solid #D9D9D9; text-align: center; font-size: 11pt; font-weight: bold; color: #002060;">${blocos}</td>`;
    })
    .join("");

  // Linha com o nome dos meses na base do gráfico
  const cabecalhoMesesGrafico = mesesEvolucao
    .map(
      (m) =>
        `<th bgcolor="#002060" style="background-color: #002060; border: 1px solid #000000; padding: 5px; text-align: center; font-size: 9pt; font-weight: bold; color: #FFFFFF; width: 65px;">${m.mesAbrev.toUpperCase()}</th>`
    )
    .join("");

  const htmlSpreadsheet = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Turnover Global</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, Arial, sans-serif; margin: 0; padding: 0; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
          th, td { font-family: Calibri, Arial, sans-serif; }
        </style>
      </head>
      <body>
        <!-- BANNER PRINCIPAL AZUL MARINHO -->
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <th colspan="13" bgcolor="#002060" style="background-color: #002060; color: #FFFFFF; font-size: 16pt; font-weight: bold; text-align: center; padding: 14px; border: 1px solid #000000;">
              TURNOVER GLOBAL
            </th>
          </tr>
        </table>

        <!-- SEÇÃO DO GRÁFICO DE BARRAS TURNOVER GLOBAL COMPLETO -->
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #000000;">
          <tr>
            <th colspan="13" bgcolor="#FFFFFF" style="color: #000000; font-size: 11pt; font-weight: bold; text-align: center; padding: 8px; border-bottom: 1px solid #000000;">
              TURNOVER GLOBAL (EVOLUÇÃO MENSAL)
            </th>
          </tr>

          <!-- Linha com os valores percentuais no topo do gráfico -->
          <tr>
            <td bgcolor="#F8FAFC" style="border: 1px solid #D9D9D9; font-size: 8pt; color: #777777; font-weight: bold; text-align: right; padding-right: 6px;">TAXA</td>
            ${taxasMesesGrafico}
          </tr>

          <!-- Linha com barras visuais sólidas de alta densidade em cada coluna -->
          <tr>
            <td bgcolor="#F8FAFC" style="border: 1px solid #D9D9D9; font-size: 8pt; color: #777777; font-weight: bold; text-align: right; padding-right: 6px;">BARRAS</td>
            ${barrasDeBloco}
          </tr>

          <!-- Grade de colunas verticais subindo proporcionalmente -->
          ${linhasGradeBarras}

          <!-- Linha dos meses na base do gráfico -->
          <tr>
            <th bgcolor="#F8FAFC" style="border: 1px solid #000000; font-size: 8pt; color: #333333; font-weight: bold; text-align: center;">MÊS</th>
            ${cabecalhoMesesGrafico}
          </tr>
        </table>

        <br/>

        <!-- TABELA DE MOVIMENTAÇÕES IDÊNTICA À IMAGEM -->
        <table style="border-collapse: collapse; width: 100%;">
          <!-- LINHA AGRUPADORA: MOVIMENTAÇÕES EM DOURADO -->
          <tr>
            <td colspan="2" style="border: none;"></td>
            <th colspan="2" bgcolor="#FFC000" style="background-color: #FFC000; color: #000000; font-size: 11pt; font-weight: bold; text-align: center; border: 1px solid #000000; padding: 6px;">
              MOVIMENTAÇÕES
            </th>
            <td style="border: none;"></td>
          </tr>

          <!-- CABEÇALHOS DA TABELA EM AZUL ESCURO -->
          <tr bgcolor="#002060" style="background-color: #002060; color: #FFFFFF;">
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: left; width: 220px; color: #FFFFFF; font-size: 10.5pt;">MÊS</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px; color: #FFFFFF; font-size: 10.5pt;">TOTAL COLAB.</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px; color: #FFFFFF; font-size: 10.5pt;">ENTRADAS</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px; color: #FFFFFF; font-size: 10.5pt;">SAÍDAS</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 180px; color: #FFFFFF; font-size: 10.5pt;">TURNOVER (GLOBAL)</th>
          </tr>

          <!-- LINHA DEZEMBRO INICIAL (BASE DO ANO ANTERIOR EM BEGE SUAVE) -->
          <tr bgcolor="#FFF2CC" style="background-color: #FFF2CC;">
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 6px 12px; font-weight: bold; text-align: left; font-size: 10pt;">DEZEMBRO</td>
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-weight: bold; font-size: 10pt;">${totalDezAnterior}</td>
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-size: 10pt;"></td>
            <td bgcolor="#A6A6A6" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; background-color: #A6A6A6; font-size: 10pt;"></td>
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-size: 10pt;">-</td>
          </tr>

          <!-- MESES DE JANEIRO A DEZEMBRO -->
          ${linhasMesesHtml}

          <!-- LINHA TOTAL (CINZA ESCURO COM TEXTO BRANCO) -->
          <tr bgcolor="#595959" style="background-color: #595959; color: #FFFFFF; font-weight: bold;">
            <td colspan="2" bgcolor="#595959" style="border: 1px solid #000000; padding: 8px 12px; text-align: right; background-color: #595959; color: #FFFFFF; font-size: 10.5pt;">TOTAL</td>
            <td bgcolor="#595959" style="border: 1px solid #000000; padding: 8px 12px; text-align: center; background-color: #595959; color: #FFFFFF; font-size: 10.5pt;">${totalEntradas}</td>
            <td bgcolor="#595959" style="border: 1px solid #000000; padding: 8px 12px; text-align: center; background-color: #595959; color: #FFFFFF; font-size: 10.5pt;">${totalSaidas}</td>
            <td bgcolor="#595959" style="border: 1px solid #000000; padding: 8px 12px; text-align: center; background-color: #595959; color: #FFFFFF; font-size: 10.5pt;">${taxaTotal}</td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([htmlSpreadsheet], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Turnover_Global_${ano}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
