"use client";

import { Printer, X, FileSpreadsheet } from "lucide-react";
import type { JobOpening } from "@/lib/jobs/types";
import {
  computeJobOpeningsMonthlyStats,
  generateJobOpeningsExcel,
} from "@/lib/jobs/export-excel";

interface JobOpeningsExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: JobOpening[];
  ano?: number;
}

export function JobOpeningsExportModal({
  open,
  onOpenChange,
  items,
  ano = new Date().getFullYear(),
}: JobOpeningsExportModalProps) {
  if (!open) return null;

  const { mesesEvolucao, baseDezAnterior } = computeJobOpeningsMonthlyStats(items, ano);

  let totalAberturas = 0;
  let totalFechadas = 0;

  mesesEvolucao.forEach((m) => {
    totalAberturas += m.aberturas;
    totalFechadas += m.fechadas;
  });

  const taxaTotal =
    baseDezAnterior > 0
      ? `${((totalFechadas / Math.max(baseDezAnterior + totalAberturas, 1)) * 100).toFixed(2).replace(".", ",")}%`
      : "0,00%";

  function handlePrintIsolated() {
    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (!printWindow) {
      window.print();
      return;
    }

    const linhasTabela = mesesEvolucao
      .map((m) => {
        const taxaFormatada =
          m.taxaEficiencia > 0 ? `${m.taxaEficiencia.toFixed(2).replace(".", ",")}%` : "0,00%";

        return `
          <tr style="height: 20px;">
            <td style="border: 1px solid #000000; padding: 3px 8px; font-weight: bold; text-align: left; background: #ffffff;">${m.mesNome.toUpperCase()}</td>
            <td style="border: 1px solid #000000; padding: 3px 8px; text-align: center; background: #ffffff;">${m.totalVagas || ""}</td>
            <td style="border: 1px solid #000000; padding: 3px 8px; text-align: center; background: #ffffff;">${m.aberturas > 0 ? m.aberturas : ""}</td>
            <td style="border: 1px solid #000000; padding: 3px 8px; text-align: center; font-weight: bold; background: #A6A6A6 !important; -webkit-print-color-adjust: exact !important;">${m.fechadas > 0 ? m.fechadas : ""}</td>
            <td style="border: 1px solid #000000; padding: 3px 8px; text-align: center; font-weight: bold; background: #ffffff;">${taxaFormatada}</td>
          </tr>
        `;
      })
      .join("");

    const colunasGrafico = mesesEvolucao
      .map((m) => {
        const taxa = m.taxaEficiencia;
        const heightPx = Math.min(100, Math.max(3, Math.round(taxa * 1.05)));
        const taxaStr = taxa > 0 ? `${taxa.toFixed(2).replace(".", ",")}%` : "0,00%";

        return `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
            <span style="font-size: 8px; font-weight: bold; color: #333333; margin-bottom: 2px;">${taxaStr}</span>
            <div style="width: 14px; height: ${heightPx}px; background-color: #002060 !important; -webkit-print-color-adjust: exact !important; border-radius: 2px 2px 0 0;"></div>
            <span style="font-size: 8px; font-weight: bold; color: #444444; margin-top: 3px;">${m.mesAbrev.toUpperCase()}</span>
          </div>
        `;
      })
      .join("");

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Painel de Vagas - Relatório Global</title>
          <style>
            @page {
              size: portrait;
              margin: 8mm 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
              background-color: #ffffff;
              color: #000000;
              width: 100%;
              height: auto;
            }
            .page-sheet {
              width: 100%;
              max-width: 760px;
              margin: 0 auto;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #000000;
              font-family: Arial, Helvetica, sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="page-sheet">
            <!-- BANNER PRINCIPAL AZUL MARINHO -->
            <div style="background-color: #002060 !important; color: #ffffff !important; padding: 8px 12px; text-align: center; border: 1px solid #000000; margin-bottom: 8px;">
              <h1 style="margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 1px; color: #ffffff;">PAINEL DE VAGAS - GESTÃO GLOBAL</h1>
            </div>

            <!-- GRÁFICO SUPERIOR COMPACTO (1 PÁGINA) -->
            <div style="border: 1px solid #000000; padding: 6px 12px; margin-bottom: 10px; background-color: #ffffff;">
              <div style="text-align: center; font-size: 10px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">
                PAINEL DE VAGAS (EVOLUÇÃO MENSAL)
              </div>
              <div style="position: relative; height: 120px; width: 100%; display: flex; align-items: flex-end; border-bottom: 1px solid #999999; padding-bottom: 2px;">
                ${colunasGrafico}
              </div>
            </div>

            <!-- TABELA DE MOVIMENTAÇÕES IDÊNTICA AO MODELO OFICIAL -->
            <table>
              <thead>
                <tr>
                  <th colspan="2" style="border: none; background: #ffffff;"></th>
                  <th colspan="2" style="background-color: #FFC000 !important; color: #000000; font-weight: bold; text-align: center; padding: 3px; font-size: 10px; border: 1px solid #000000;">
                    MOVIMENTAÇÕES
                  </th>
                  <th colspan="1" style="border: none; background: #ffffff;"></th>
                </tr>
                <tr style="background-color: #002060 !important; color: #ffffff !important;">
                  <th style="padding: 4px 8px; text-align: left; font-size: 10px; color: #ffffff; width: 25%;">MÊS</th>
                  <th style="padding: 4px 8px; text-align: center; font-size: 10px; color: #ffffff; width: 18%;">TOTAL VAGAS</th>
                  <th style="padding: 4px 8px; text-align: center; font-size: 10px; color: #ffffff; width: 18%;">ABERTURAS</th>
                  <th style="padding: 4px 8px; text-align: center; font-size: 10px; color: #ffffff; width: 18%;">FECHADAS</th>
                  <th style="padding: 4px 8px; text-align: center; font-size: 10px; color: #ffffff; width: 21%;">EFICIÊNCIA (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background-color: #FFF2CC !important; font-weight: bold;">
                  <td style="padding: 3px 8px; text-align: left;">DEZEMBRO</td>
                  <td style="padding: 3px 8px; text-align: center;">${baseDezAnterior}</td>
                  <td style="padding: 3px 8px; text-align: center;"></td>
                  <td style="padding: 3px 8px; text-align: center; background-color: #A6A6A6 !important;"></td>
                  <td style="padding: 3px 8px; text-align: center;">-</td>
                </tr>
                ${linhasTabela}
                <tr style="background-color: #595959 !important; color: #ffffff !important; font-weight: bold;">
                  <td colspan="2" style="padding: 4px 8px; text-align: right; color: #ffffff;">TOTAL</td>
                  <td style="padding: 4px 8px; text-align: center; color: #ffffff;">${totalAberturas}</td>
                  <td style="padding: 4px 8px; text-align: center; color: #ffffff;">${totalFechadas}</td>
                  <td style="padding: 4px 8px; text-align: center; color: #ffffff;">${taxaTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }

  function handleDownloadExcel() {
    generateJobOpeningsExcel(items, ano);
  }

  return (
    <div
      onClick={() => onOpenChange(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[96vh] overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-2xl p-4 sm:p-6 cursor-default"
      >
        {/* BARRA SUPERIOR DE AÇÕES */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Relatório Oficial: Painel de Vagas
            </h2>
            <p className="text-xs text-slate-500">
              Exportação oficial no modelo analítico executivo (Excel com gráfico e PDF em 1 página).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition"
              title="Baixar planilha Excel com gráfico de barras e cores oficiais"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Baixar Excel com Gráfico
            </button>

            <button
              type="button"
              onClick={handlePrintIsolated}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
              title="Gerar PDF oficial em 1 página única com cores vivas e sem distorções"
            >
              <Printer className="h-4 w-4" />
              Gerar PDF (1 Página)
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-slate-700 transition"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ÁREA DA PLANILHA (VISUALIZAÇÃO IDÊNTICA AO MODELO OFICIAL) */}
        <div className="mt-4 border border-slate-300 bg-white shadow-sm p-4 sm:p-6">
          {/* BANNER PRINCIPAL AZUL ESCURO */}
          <div className="w-full bg-[#002060] py-3.5 px-4 text-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase">
              PAINEL DE VAGAS - GESTÃO GLOBAL
            </h1>
          </div>

          {/* GRÁFICO SUPERIOR */}
          <div className="mt-4 border border-slate-200 bg-white p-4">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-800 mb-4">
              PAINEL DE VAGAS (EVOLUÇÃO MENSAL)
            </div>

            <div className="relative h-44 w-full">
              {/* Linhas de Grade */}
              <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-400 pointer-events-none pb-6">
                {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((val) => (
                  <div key={val} className="flex items-center w-full border-b border-slate-200">
                    <span className="w-10 text-right pr-2">{val.toFixed(2).replace(".", ",")}%</span>
                  </div>
                ))}
              </div>

              {/* Colunas do Gráfico de Janeiro a Dezembro */}
              <div className="relative z-10 flex h-full items-end justify-between pl-10 pr-2 pb-6">
                {mesesEvolucao.map((m) => {
                  const taxa = m.taxaEficiencia;
                  const height = Math.min(100, Math.max(3, taxa));

                  return (
                    <div key={m.mesNumero} className="flex flex-1 flex-col items-center justify-end h-full">
                      <span className="text-[8.5px] font-bold text-slate-700 mb-0.5">
                        {taxa > 0 ? `${taxa.toFixed(2).replace(".", ",")}%` : "0,00%"}
                      </span>
                      <div
                        className="w-3 bg-[#002060] rounded-t-sm transition-all"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase">
                        {m.mesAbrev}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TABELA DE MOVIMENTAÇÕES IDÊNTICA AO MODELO OFICIAL */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-black font-sans">
              <thead>
                {/* Linha Dourada de Movimentações */}
                <tr>
                  <th colSpan={2} className="border-none bg-white"></th>
                  <th
                    colSpan={2}
                    className="border border-black bg-[#FFC000] text-black font-extrabold uppercase py-1 px-3 text-center text-[11px]"
                  >
                    MOVIMENTAÇÕES
                  </th>
                  <th className="border-none bg-white"></th>
                </tr>

                {/* Cabeçalho Azul Escuro */}
                <tr className="bg-[#002060] text-white font-extrabold text-[11px]">
                  <th className="border border-black py-2 px-3 text-left w-1/4">MÊS</th>
                  <th className="border border-black py-2 px-3 text-center w-1/5">TOTAL VAGAS</th>
                  <th className="border border-black py-2 px-3 text-center w-1/6">ABERTURAS</th>
                  <th className="border border-black py-2 px-3 text-center w-1/6">FECHADAS</th>
                  <th className="border border-black py-2 px-3 text-center w-1/4">EFICIÊNCIA (%)</th>
                </tr>
              </thead>
              <tbody>
                {/* Linha DEZEMBRO (Base Inicial em Bege Suave) */}
                <tr className="bg-[#FFF2CC] font-bold">
                  <td className="border border-black py-1.5 px-3 text-left">DEZEMBRO</td>
                  <td className="border border-black py-1.5 px-3 text-center">{baseDezAnterior}</td>
                  <td className="border border-black py-1.5 px-3 text-center"></td>
                  <td className="border border-black py-1.5 px-3 text-center bg-[#A6A6A6]"></td>
                  <td className="border border-black py-1.5 px-3 text-center text-slate-500">-</td>
                </tr>

                {/* Meses de Janeiro a Dezembro */}
                {mesesEvolucao.map((m) => {
                  const taxaFormatada =
                    m.taxaEficiencia > 0 ? `${m.taxaEficiencia.toFixed(2).replace(".", ",")}%` : "0,00%";

                  return (
                    <tr key={m.mesNumero} className="hover:bg-slate-50">
                      <td className="border border-black py-1.5 px-3 font-bold text-left uppercase">
                        {m.mesNome}
                      </td>
                      <td className="border border-black py-1.5 px-3 text-center font-medium">
                        {m.totalVagas || ""}
                      </td>
                      <td className="border border-black py-1.5 px-3 text-center font-medium">
                        {m.aberturas > 0 ? m.aberturas : ""}
                      </td>
                      {/* Célula de FECHADAS com fundo cinza #A6A6A6 */}
                      <td className="border border-black py-1.5 px-3 text-center font-bold bg-[#A6A6A6] text-black">
                        {m.fechadas > 0 ? m.fechadas : ""}
                      </td>
                      <td className="border border-black py-1.5 px-3 text-center font-semibold">
                        {taxaFormatada}
                      </td>
                    </tr>
                  );
                })}

                {/* Linha TOTAL (Cinza Escuro com Texto Branco) */}
                <tr className="bg-[#595959] text-white font-extrabold text-[11px]">
                  <td colSpan={2} className="border border-black py-2 px-4 text-right">
                    TOTAL
                  </td>
                  <td className="border border-black py-2 px-3 text-center">{totalAberturas}</td>
                  <td className="border border-black py-2 px-3 text-center">{totalFechadas}</td>
                  <td className="border border-black py-2 px-3 text-center">{taxaTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
