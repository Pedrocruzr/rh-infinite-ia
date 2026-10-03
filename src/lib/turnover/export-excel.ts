import type { MonthTurnoverData, TurnoverEmployee } from "./types";

export function generateTurnoverExcel(
  mesesEvolucao: MonthTurnoverData[],
  employees: TurnoverEmployee[],
  ano = new Date().getFullYear()
) {
  // Headcount em Dezembro do ano anterior (base inicial)
  const dataLimiteDezAnterior = new Date(ano - 1, 11, 31, 23, 59, 59);
  const totalDezAnterior = employees.filter((emp) => {
    const dAdm = new Date(emp.data_admissao);
    const dDes = emp.data_desligamento ? new Date(emp.data_desligamento) : null;
    return dAdm <= dataLimiteDezAnterior && (!dDes || dDes > dataLimiteDezAnterior);
  }).length || employees.filter((e) => !e.data_desligamento).length || 35;

  let totalEntradas = 0;
  let totalSaidas = 0;

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
          <td style="border: 1px solid #000000; padding: 6px 12px; font-weight: bold; text-align: left; background-color: #FFFFFF;">${m.mesNome.toUpperCase()}</td>
          <td style="border: 1px solid #000000; padding: 6px 12px; text-align: center; background-color: #FFFFFF;">${m.efetivoAtivo || ""}</td>
          <td style="border: 1px solid #000000; padding: 6px 12px; text-align: center; background-color: #FFFFFF;">${m.admissoes > 0 ? m.admissoes : ""}</td>
          <td style="border: 1px solid #000000; padding: 6px 12px; text-align: center; background-color: #A6A6A6; font-weight: bold; color: #000000;">${m.desligamentos > 0 ? m.desligamentos : ""}</td>
          <td style="border: 1px solid #000000; padding: 6px 12px; text-align: center; background-color: #FFFFFF; font-weight: bold;">${taxaFormatada}</td>
        </tr>
      `;
    })
    .join("");

  const taxaTotal =
    totalDezAnterior > 0
      ? `${((totalSaidas / totalDezAnterior) * 100).toFixed(2).replace(".", ",")}%`
      : "0,00%";

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
          table { border-collapse: collapse; width: 100%; }
          th, td { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        </style>
      </head>
      <body>
        <table>
          <!-- BANNER SUPERIOR TURNOVER GLOBAL -->
          <tr>
            <th colspan="5" style="background-color: #002060; color: #FFFFFF; font-size: 16pt; font-weight: bold; text-align: center; padding: 14px; border: 1px solid #000000;">
              TURNOVER GLOBAL - ${ano}
            </th>
          </tr>

          <tr><td colspan="5" style="height: 14px;"></td></tr>

          <!-- LINHA AGRUPADORA: MOVIMENTAÇÕES EM DOURADO -->
          <tr>
            <td colspan="2" style="border: none;"></td>
            <th colspan="2" style="background-color: #FFC000; color: #000000; font-size: 11pt; font-weight: bold; text-align: center; border: 1px solid #000000; padding: 6px;">
              MOVIMENTAÇÕES
            </th>
            <td style="border: none;"></td>
          </tr>

          <!-- CABEÇALHOS DA TABELA EM AZUL ESCURO -->
          <tr style="background-color: #002060; color: #FFFFFF;">
            <th style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 180px;">MÊS</th>
            <th style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px;">TOTAL COLAB.</th>
            <th style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px;">ENTRADAS</th>
            <th style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px;">SAÍDAS</th>
            <th style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 180px;">TURNOVER (GLOBAL)</th>
          </tr>

          <!-- LINHA DEZEMBRO INICIAL (BASE DO ANO ANTERIOR) -->
          <tr style="background-color: #FFF2CC;">
            <td style="border: 1px solid #000000; padding: 6px 12px; font-weight: bold; text-align: left;">DEZEMBRO</td>
            <td style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-weight: bold;">${totalDezAnterior}</td>
            <td style="border: 1px solid #000000; padding: 6px 12px; text-align: center;"></td>
            <td style="border: 1px solid #000000; padding: 6px 12px; text-align: center; background-color: #A6A6A6;"></td>
            <td style="border: 1px solid #000000; padding: 6px 12px; text-align: center;">-</td>
          </tr>

          <!-- MESES DE JANEIRO A DEZEMBRO -->
          ${linhasMesesHtml}

          <!-- LINHA TOTAL -->
          <tr style="background-color: #595959; color: #FFFFFF; font-weight: bold;">
            <td colspan="2" style="border: 1px solid #000000; padding: 8px 12px; text-align: right; background-color: #595959; color: #FFFFFF;">TOTAL</td>
            <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; background-color: #595959; color: #FFFFFF;">${totalEntradas}</td>
            <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; background-color: #595959; color: #FFFFFF;">${totalSaidas}</td>
            <td style="border: 1px solid #000000; padding: 8px 12px; text-align: center; background-color: #595959; color: #FFFFFF;">${taxaTotal}</td>
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
