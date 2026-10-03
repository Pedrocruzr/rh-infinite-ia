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
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 5px 10px; font-weight: bold; text-align: left; font-size: 10pt;">${m.mesNome.toUpperCase()}</td>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 5px 10px; text-align: center; font-size: 10pt;">${m.efetivoAtivo || ""}</td>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 5px 10px; text-align: center; font-size: 10pt;">${m.admissoes > 0 ? m.admissoes : ""}</td>
          <td bgcolor="#A6A6A6" style="border: 1px solid #000000; padding: 5px 10px; text-align: center; font-weight: bold; color: #000000; font-size: 10pt;">${m.desligamentos > 0 ? m.desligamentos : ""}</td>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 5px 10px; text-align: center; font-weight: bold; font-size: 10pt;">${taxaFormatada}</td>
        </tr>
      `;
    })
    .join("");

  const taxaTotal =
    totalDezAnterior > 0
      ? `${((totalSaidas / totalDezAnterior) * 100).toFixed(2).replace(".", ",")}%`
      : "0,00%";

  // Linhas das porcentagens e barras para o gráfico visual dentro do Excel
  const cabecalhoMesesGrafico = mesesEvolucao
    .map(
      (m) =>
        `<th bgcolor="#F2F2F2" style="border: 1px solid #D9D9D9; padding: 4px; text-align: center; font-size: 9pt; font-weight: bold; width: 60px;">${m.mesAbrev.toUpperCase()}</th>`
    )
    .join("");

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

  const barrasVisuaisGrafico = mesesEvolucao
    .map((m) => {
      const taxa = m.taxaTurnoverDesligamento;
      if (taxa <= 0) {
        return `<td bgcolor="#FFFFFF" style="border: 1px solid #D9D9D9; height: 50px; text-align: center; vertical-align: bottom; font-size: 8pt; color: #BFBFBF;">—</td>`;
      }
      // Barra colorida em azul marinho proporcional
      return `
        <td bgcolor="#FFFFFF" style="border: 1px solid #D9D9D9; height: 50px; text-align: center; vertical-align: bottom; padding-bottom: 2px;">
          <table width="80%" align="center" style="border-collapse: collapse; margin: 0 auto;">
            <tr>
              <td bgcolor="#002060" style="height: ${Math.max(14, Math.round(taxa * 1.2))}px; border: 1px solid #001030;">&nbsp;</td>
            </tr>
          </table>
        </td>
      `;
    })
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
          body { font-family: Calibri, Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 15px; }
          th, td { font-family: Calibri, Arial, sans-serif; }
        </style>
      </head>
      <body>
        <!-- BANNER SUPERIOR TURNOVER GLOBAL -->
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <th colspan="12" bgcolor="#002060" style="background-color: #002060; color: #FFFFFF; font-size: 16pt; font-weight: bold; text-align: center; padding: 14px; border: 1px solid #000000;">
              TURNOVER GLOBAL
            </th>
          </tr>
        </table>

        <!-- SEÇÃO DO GRÁFICO TURNOVER GLOBAL COMPLETO -->
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #BFBFBF;">
          <tr>
            <th colspan="12" bgcolor="#FFFFFF" style="color: #000000; font-size: 11pt; font-weight: bold; text-align: center; padding: 10px; border-bottom: 1px solid #D9D9D9;">
              TURNOVER GLOBAL (EVOLUÇÃO MENSAL)
            </th>
          </tr>
          <!-- Linha com os valores percentuais -->
          <tr>
            ${taxasMesesGrafico}
          </tr>
          <!-- Linha com as barras visuais azuis -->
          <tr>
            ${barrasVisuaisGrafico}
          </tr>
          <!-- Linha com o nome dos meses -->
          <tr>
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
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: left; width: 200px; color: #FFFFFF; font-size: 10.5pt;">MÊS</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px; color: #FFFFFF; font-size: 10.5pt;">TOTAL COLAB.</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px; color: #FFFFFF; font-size: 10.5pt;">ENTRADAS</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px; color: #FFFFFF; font-size: 10.5pt;">SAÍDAS</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 180px; color: #FFFFFF; font-size: 10.5pt;">TURNOVER (GLOBAL)</th>
          </tr>

          <!-- LINHA DEZEMBRO INICIAL (BASE DO ANO ANTERIOR EM BEGE SUAVE) -->
          <tr bgcolor="#FFF2CC" style="background-color: #FFF2CC;">
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 5px 10px; font-weight: bold; text-align: left; font-size: 10pt;">DEZEMBRO</td>
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 5px 10px; text-align: center; font-weight: bold; font-size: 10pt;">${totalDezAnterior}</td>
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 5px 10px; text-align: center; font-size: 10pt;"></td>
            <td bgcolor="#A6A6A6" style="border: 1px solid #000000; padding: 5px 10px; text-align: center; background-color: #A6A6A6; font-size: 10pt;"></td>
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 5px 10px; text-align: center; font-size: 10pt;">-</td>
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
