"use client";

import { Download, Printer, X } from "lucide-react";
import type { MonthTurnoverData, TurnoverEmployee } from "@/lib/turnover/types";
import { generateTurnoverExcel } from "@/lib/turnover/export-excel";

interface TurnoverExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesesEvolucao: MonthTurnoverData[];
  employees: TurnoverEmployee[];
  ano?: number;
}

export function TurnoverExportModal({
  open,
  onOpenChange,
  mesesEvolucao,
  employees,
  ano = new Date().getFullYear(),
}: TurnoverExportModalProps) {
  if (!open) return null;

  // Headcount Dezembro anterior
  const totalDezAnterior =
    employees.filter((e) => !e.data_desligamento).length || 35;

  let totalEntradas = 0;
  let totalSaidas = 0;

  mesesEvolucao.forEach((m) => {
    totalEntradas += m.admissoes;
    totalSaidas += m.desligamentos;
  });

  const taxaTotal =
    totalDezAnterior > 0
      ? `${((totalSaidas / totalDezAnterior) * 100).toFixed(2).replace(".", ",")}%`
      : "0,00%";

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    generateTurnoverExcel(mesesEvolucao, employees, ano);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="w-full max-w-4xl max-h-[96vh] overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-2xl p-4 sm:p-6 print:max-h-none print:shadow-none print:rounded-none print:p-0">
        {/* BARRA SUPERIOR DE AÇÕES (OCULTA NA IMPRESSÃO) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Relatório Oficial: Planilha de Turnover Global
            </h2>
            <p className="text-xs text-slate-500">
              Visualização e exportação fiel conforme diretrizes corporativas de movimentações e rotatividade.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition"
            >
              <Download className="h-4 w-4" />
              Baixar Planilha (.xls)
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Printer className="h-4 w-4" />
              Imprimir / PDF
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

        {/* ÁREA DA PLANILHA (RÉPLICA EXATA DA IMAGEM) */}
        <div className="mt-4 border border-slate-300 bg-white shadow-sm p-4 sm:p-6 print:border-none print:p-0 print:shadow-none">
          {/* BANNER PRINCIPAL AZUL ESCURO */}
          <div className="w-full bg-[#002060] py-3.5 px-4 text-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase">
              TURNOVER GLOBAL
            </h1>
          </div>

          {/* GRÁFICO SUPERIOR (0% A 100%) */}
          <div className="mt-4 border border-slate-200 bg-white p-4">
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-800 mb-4">
              TURNOVER GLOBAL
            </div>

            <div className="relative h-44 w-full">
              {/* Linhas de Grade de 10% em 10% */}
              <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-400 pointer-events-none pb-6">
                {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((val) => (
                  <div key={val} className="flex items-center w-full border-b border-slate-200">
                    <span className="w-10 text-right pr-2">{val.toFixed(2).replace(".", ",")}%</span>
                  </div>
                ))}
              </div>

              {/* Colunas/Pontos do Gráfico de Janeiro a Dezembro */}
              <div className="relative z-10 flex h-full items-end justify-between pl-10 pr-2 pb-6">
                {mesesEvolucao.map((m) => {
                  const taxa = m.taxaTurnoverDesligamento;
                  const height = Math.min(100, Math.max(3, taxa));

                  return (
                    <div key={m.mesNumero} className="flex flex-1 flex-col items-center justify-end h-full">
                      <span className="text-[8px] font-bold text-slate-600 mb-0.5">
                        {taxa > 0 ? `${taxa.toFixed(2).replace(".", ",")}%` : "0,00%"}
                      </span>
                      <div
                        className="w-2.5 bg-blue-700 rounded-t-sm"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[7.5px] font-semibold text-slate-600 mt-1 uppercase">
                        {m.mesAbrev}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TABELA DE MOVIMENTAÇÕES IDÊNTICA À IMAGEM */}
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
                  <th className="border border-black py-2 px-3 text-center w-1/5">TOTAL COLAB.</th>
                  <th className="border border-black py-2 px-3 text-center w-1/6">ENTRADAS</th>
                  <th className="border border-black py-2 px-3 text-center w-1/6">SAÍDAS</th>
                  <th className="border border-black py-2 px-3 text-center w-1/4">TURNOVER (GLOBAL)</th>
                </tr>
              </thead>
              <tbody>
                {/* Linha DEZEMBRO (Base Inicial com fundo Bege Suave) */}
                <tr className="bg-[#FFF2CC] font-bold">
                  <td className="border border-black py-1.5 px-3 text-left">DEZEMBRO</td>
                  <td className="border border-black py-1.5 px-3 text-center">{totalDezAnterior}</td>
                  <td className="border border-black py-1.5 px-3 text-center"></td>
                  <td className="border border-black py-1.5 px-3 text-center bg-[#A6A6A6]"></td>
                  <td className="border border-black py-1.5 px-3 text-center text-slate-500">-</td>
                </tr>

                {/* Meses de Janeiro a Dezembro */}
                {mesesEvolucao.map((m) => {
                  const taxaFormatada =
                    m.taxaTurnoverDesligamento > 0
                      ? `${m.taxaTurnoverDesligamento.toFixed(2).replace(".", ",")}%`
                      : "0,00%";

                  return (
                    <tr key={m.mesNumero} className="hover:bg-slate-50">
                      <td className="border border-black py-1.5 px-3 font-bold text-left uppercase">
                        {m.mesNome}
                      </td>
                      <td className="border border-black py-1.5 px-3 text-center font-medium">
                        {m.efetivoAtivo || ""}
                      </td>
                      <td className="border border-black py-1.5 px-3 text-center font-medium">
                        {m.admissoes > 0 ? m.admissoes : ""}
                      </td>
                      {/* Célula de SAÍDAS com fundo cinza #A6A6A6 */}
                      <td className="border border-black py-1.5 px-3 text-center font-bold bg-[#A6A6A6] text-black">
                        {m.desligamentos > 0 ? m.desligamentos : ""}
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
                  <td className="border border-black py-2 px-3 text-center">{totalEntradas}</td>
                  <td className="border border-black py-2 px-3 text-center">{totalSaidas}</td>
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
