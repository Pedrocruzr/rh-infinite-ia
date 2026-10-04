import type { JobOpening } from "./types";

interface MonthJobStat {
  mesNumero: number;
  mesNome: string;
  mesAbrev: string;
  aberturas: number;
  fechadas: number;
  totalVagas: number;
  taxaEficiencia: number;
}

const MESES = [
  { numero: 1, nome: "Janeiro", abrev: "Jan" },
  { numero: 2, nome: "Fevereiro", abrev: "Fev" },
  { numero: 3, nome: "Março", abrev: "Mar" },
  { numero: 4, nome: "Abril", abrev: "Abr" },
  { numero: 5, nome: "Maio", abrev: "Mai" },
  { numero: 6, nome: "Junho", abrev: "Jun" },
  { numero: 7, nome: "Julho", abrev: "Jul" },
  { numero: 8, nome: "Agosto", abrev: "Ago" },
  { numero: 9, nome: "Setembro", abrev: "Set" },
  { numero: 10, nome: "Outubro", abrev: "Out" },
  { numero: 11, nome: "Novembro", abrev: "Nov" },
  { numero: 12, nome: "Dezembro", abrev: "Dez" },
];

function parseDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.slice(0, 10);
  const parts = clean.split("-");
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function computeJobOpeningsMonthlyStats(
  items: JobOpening[],
  ano = new Date().getFullYear()
): { mesesEvolucao: MonthJobStat[]; baseDezAnterior: number } {
  const dataLimiteDezAnterior = new Date(ano - 1, 11, 31, 23, 59, 59);

  // Vagas abertas até o fim do ano anterior que não foram fechadas antes
  const baseDezAnterior =
    items.filter((job) => {
      const dtAbert = parseDate(job.data_abertura);
      const dtFech = parseDate(job.data_fechamento);
      return dtAbert && dtAbert <= dataLimiteDezAnterior && (!dtFech || dtFech > dataLimiteDezAnterior);
    }).length;

  const mesesEvolucao: MonthJobStat[] = MESES.map((mes) => {
    const dataInicioMes = new Date(ano, mes.numero - 1, 1);
    const dataFimMes = new Date(ano, mes.numero, 0, 23, 59, 59);

    let aberturas = 0;
    let fechadas = 0;
    let totalVagas = 0;

    for (const job of items) {
      const dtAbert = parseDate(job.data_abertura);
      const dtFech = parseDate(job.data_fechamento);

      // Abertura no mês
      if (dtAbert && dtAbert.getFullYear() === ano && dtAbert.getMonth() + 1 === mes.numero) {
        aberturas++;
      }

      // Fechamento no mês
      if (job.status === "fechada") {
        const dateTarget = dtFech || dtAbert;
        if (dateTarget && dateTarget.getFullYear() === ano && dateTarget.getMonth() + 1 === mes.numero) {
          fechadas++;
        }
      }

      // Vagas ativas no mês
      if (dtAbert && dtAbert <= dataFimMes && (!dtFech || dtFech >= dataInicioMes)) {
        totalVagas++;
      }
    }

    // Se o mês corrente tiver vagas registradas
    const currentMonthIdx = new Date().getMonth();
    if (mes.numero - 1 === currentMonthIdx) {
      totalVagas = Math.max(totalVagas, items.length);
      fechadas = items.filter((j) => j.status === "fechada").length;
      aberturas = items.filter((j) => j.status === "em_aberto").length;
    }

    const baseCalculo = Math.max(totalVagas, fechadas, 1);
    const taxaEficiencia = Math.round((fechadas / baseCalculo) * 1000) / 10;

    return {
      mesNumero: mes.numero,
      mesNome: mes.nome,
      mesAbrev: mes.abrev,
      aberturas,
      fechadas,
      totalVagas,
      taxaEficiencia,
    };
  });

  return { mesesEvolucao, baseDezAnterior };
}

export function generateJobOpeningsExcel(items: JobOpening[], ano = new Date().getFullYear()) {
  const { mesesEvolucao, baseDezAnterior } = computeJobOpeningsMonthlyStats(items, ano);

  let totalAberturas = 0;
  let totalFechadas = 0;

  const linhasMesesHtml = mesesEvolucao
    .map((m) => {
      totalAberturas += m.aberturas;
      totalFechadas += m.fechadas;
      const taxaFormatada =
        m.taxaEficiencia > 0 ? `${m.taxaEficiencia.toFixed(2).replace(".", ",")}%` : "0,00%";

      return `
        <tr>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 6px 12px; font-weight: bold; text-align: left; font-size: 10pt;">${m.mesNome.toUpperCase()}</td>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-size: 10pt;">${m.totalVagas || ""}</td>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-size: 10pt;">${m.aberturas > 0 ? m.aberturas : ""}</td>
          <td bgcolor="#A6A6A6" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-weight: bold; color: #000000; font-size: 10pt;">${m.fechadas > 0 ? m.fechadas : ""}</td>
          <td bgcolor="#FFFFFF" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-weight: bold; font-size: 10pt;">${taxaFormatada}</td>
        </tr>
      `;
    })
    .join("");

  const taxaTotal =
    baseDezAnterior > 0
      ? `${((totalFechadas / Math.max(baseDezAnterior + totalAberturas, 1)) * 100).toFixed(2).replace(".", ",")}%`
      : "0,00%";

  // Gráfico de Barras em Grade Nativa de Células:
  const maxTaxa = Math.max(...mesesEvolucao.map((m) => m.taxaEficiencia), 20);
  const topoEscala = Math.ceil(maxTaxa / 10) * 10;
  const step = Math.max(5, Math.round(topoEscala / 5));

  const levels: { label: string; min: number }[] = [];
  for (let val = topoEscala; val >= step; val -= step) {
    levels.push({ label: `${val.toFixed(1).replace(".", ",")}%`, min: val - step * 0.4 });
  }

  const linhasGradeBarras = levels
    .map((lvl) => {
      const celulasMeses = mesesEvolucao
        .map((m) => {
          const ativo = m.taxaEficiencia >= lvl.min;
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

  const taxasMesesGrafico = mesesEvolucao
    .map((m) => {
      const taxaFormatada =
        m.taxaEficiencia > 0 ? `${m.taxaEficiencia.toFixed(2).replace(".", ",")}%` : "0,00%";
      const isDestaque = m.taxaEficiencia > 0;
      return `<td bgcolor="${isDestaque ? "#EBF1F5" : "#FFFFFF"}" style="border: 1px solid #D9D9D9; padding: 6px 2px; text-align: center; font-size: 9pt; font-weight: bold; color: ${isDestaque ? "#002060" : "#595959"};">${taxaFormatada}</td>`;
    })
    .join("");

  const barrasDeBloco = mesesEvolucao
    .map((m) => {
      const taxa = m.taxaEficiencia;
      if (taxa <= 0) {
        return `<td bgcolor="#FFFFFF" style="border: 1px solid #D9D9D9; text-align: center; font-size: 9pt; color: #CCCCCC;">—</td>`;
      }
      const numBlocos = Math.min(8, Math.max(2, Math.round(taxa / 4)));
      const blocos = "█".repeat(numBlocos);
      return `<td bgcolor="#EBF1F5" style="border: 1px solid #D9D9D9; text-align: center; font-size: 11pt; font-weight: bold; color: #002060;">${blocos}</td>`;
    })
    .join("");

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
                <x:Name>Painel de Vagas</x:Name>
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
              PAINEL DE VAGAS - GESTÃO GLOBAL
            </th>
          </tr>
        </table>

        <!-- SEÇÃO DO GRÁFICO DE BARRAS -->
        <table style="border-collapse: collapse; width: 100%; border: 1px solid #000000;">
          <tr>
            <th colspan="13" bgcolor="#FFFFFF" style="color: #000000; font-size: 11pt; font-weight: bold; text-align: center; padding: 8px; border-bottom: 1px solid #000000;">
              PAINEL DE VAGAS (EVOLUÇÃO MENSAL)
            </th>
          </tr>

          <!-- Linha com os valores percentuais no topo do gráfico -->
          <tr>
            <td bgcolor="#F8FAFC" style="border: 1px solid #D9D9D9; font-size: 8pt; color: #777777; font-weight: bold; text-align: right; padding-right: 6px;">TAXA</td>
            ${taxasMesesGrafico}
          </tr>

          <!-- Linha com barras visuais sólidas em cada coluna -->
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

        <!-- TABELA DE MOVIMENTAÇÕES IDÊNTICA AO MODELO OFICIAL -->
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
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px; color: #FFFFFF; font-size: 10.5pt;">TOTAL VAGAS</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px; color: #FFFFFF; font-size: 10.5pt;">ABERTURAS</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 140px; color: #FFFFFF; font-size: 10.5pt;">FECHADAS</th>
            <th bgcolor="#002060" style="border: 1px solid #000000; padding: 8px 12px; font-weight: bold; text-align: center; width: 180px; color: #FFFFFF; font-size: 10.5pt;">EFICIÊNCIA (%)</th>
          </tr>

          <!-- LINHA DEZEMBRO INICIAL (BASE DO ANO ANTERIOR EM BEGE SUAVE) -->
          <tr bgcolor="#FFF2CC" style="background-color: #FFF2CC;">
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 6px 12px; font-weight: bold; text-align: left; font-size: 10pt;">DEZEMBRO</td>
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-weight: bold; font-size: 10pt;">${baseDezAnterior}</td>
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-size: 10pt;"></td>
            <td bgcolor="#A6A6A6" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; background-color: #A6A6A6; font-size: 10pt;"></td>
            <td bgcolor="#FFF2CC" style="border: 1px solid #000000; padding: 6px 12px; text-align: center; font-size: 10pt;">-</td>
          </tr>

          <!-- MESES DE JANEIRO A DEZEMBRO -->
          ${linhasMesesHtml}

          <!-- LINHA TOTAL (CINZA ESCURO COM TEXTO BRANCO) -->
          <tr bgcolor="#595959" style="background-color: #595959; color: #FFFFFF; font-weight: bold;">
            <td colspan="2" bgcolor="#595959" style="border: 1px solid #000000; padding: 8px 12px; text-align: right; background-color: #595959; color: #FFFFFF; font-size: 10.5pt;">TOTAL</td>
            <td bgcolor="#595959" style="border: 1px solid #000000; padding: 8px 12px; text-align: center; background-color: #595959; color: #FFFFFF; font-size: 10.5pt;">${totalAberturas}</td>
            <td bgcolor="#595959" style="border: 1px solid #000000; padding: 8px 12px; text-align: center; background-color: #595959; color: #FFFFFF; font-size: 10.5pt;">${totalFechadas}</td>
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
  link.download = `Painel_de_Vagas_${ano}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
