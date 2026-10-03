"use client";

import { useMemo, useState } from "react";
import { TrendingDown, Users, PieChart, Building2, HelpCircle } from "lucide-react";
import type { TurnoverMetrics } from "@/lib/turnover/types";

interface TurnoverAnalyticsProps {
  metrics: TurnoverMetrics;
  isPurpleTheme?: boolean;
}

export function TurnoverAnalytics({ metrics, isPurpleTheme }: TurnoverAnalyticsProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Máximo para escala das barras
  const maxTaxa = useMemo(() => {
    const maxVal = Math.max(
      ...metrics.mesesEvolucao.map((m) => m.taxaTurnoverDesligamento),
      10
    );
    return Math.ceil(maxVal * 1.25);
  }, [metrics.mesesEvolucao]);

  // Ângulos do Donut 3D de Motivos de Saída
  const donutSegments = useMemo(() => {
    let currentAngle = -90; // Começa no topo
    const totalQtd = metrics.motivosDistribuicao.reduce((acc, curr) => acc + curr.quantidade, 0);

    return metrics.motivosDistribuicao.map((item) => {
      const angle = totalQtd > 0 ? (item.quantidade / totalQtd) * 360 : 0;
      const start = currentAngle;
      currentAngle += angle;
      return {
        ...item,
        startAngle: start,
        endAngle: currentAngle,
        angleSize: angle,
      };
    });
  }, [metrics.motivosDistribuicao]);

  return (
    <div className="flex flex-col gap-6">
      {/* LINHA SUPERIOR: GRÁFICO 3D DE EVOLUÇÃO (12 MESES) & CÍRCULO 3D DE MOTIVOS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* GRÁFICO 1: EVOLUÇÃO 12 MESES COM BARRAS 3D PRISMÁTICAS */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all duration-300 lg:col-span-2 ${
            isPurpleTheme
              ? "border-purple-500/20 bg-gradient-to-b from-[#180e29] to-[#0e071a] shadow-purple-950/20 text-white"
              : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/50 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 dark:border-white/10 border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div
                className={`rounded-xl p-2 ${
                  isPurpleTheme
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300"
                }`}
              >
                <TrendingDown className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">
                  Evolução Histórica do Turnover (Jan a Dez)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Taxa mensal de desligamentos (TD %) em relação ao efetivo ativo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-sky-600 to-sky-400 dark:from-sky-500 dark:to-cyan-300" />
                Taxa TD (%)
              </span>
            </div>
          </div>

          {/* ÁREA DO GRÁFICO COM COLUNAS 3D */}
          <div className="relative mt-8 h-72 w-full pt-8">
            {/* Linhas de Grade de Fundo */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-[10px] text-slate-400">
              <div className="flex items-center w-full border-b border-dashed border-slate-200 dark:border-white/5">
                <span className="w-8">{maxTaxa}%</span>
              </div>
              <div className="flex items-center w-full border-b border-dashed border-slate-200 dark:border-white/5">
                <span className="w-8">{Math.round(maxTaxa * 0.66)}%</span>
              </div>
              <div className="flex items-center w-full border-b border-dashed border-slate-200 dark:border-white/5">
                <span className="w-8">{Math.round(maxTaxa * 0.33)}%</span>
              </div>
              <div className="flex items-center w-full border-b border-slate-200 dark:border-white/10">
                <span className="w-8">0%</span>
              </div>
            </div>

            {/* As 12 Colunas 3D */}
            <div className="relative z-10 flex h-full items-end justify-between pl-8 pr-2 pb-8">
              {metrics.mesesEvolucao.map((mes, idx) => {
                const taxa = mes.taxaTurnoverDesligamento;
                const heightPct = Math.min(100, Math.max(6, (taxa / maxTaxa) * 100));
                const isHovered = hoveredMonth === mes.mesNumero;

                return (
                  <div
                    key={mes.mesNumero}
                    className="group relative flex flex-1 flex-col items-center justify-end h-full px-1"
                    onMouseEnter={() => setHoveredMonth(mes.mesNumero)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Tooltip Flutuante 3D */}
                    {isHovered && (
                      <div
                        className={`absolute -top-14 z-30 flex flex-col items-center rounded-xl p-2 text-xs shadow-xl pointer-events-none transition-all duration-200 ${
                          idx > 9 ? "right-0" : idx < 2 ? "left-0" : ""
                        } ${
                          isPurpleTheme
                            ? "bg-[#23153c] text-white border border-purple-500/30"
                            : "bg-slate-900 text-white border border-slate-800"
                        }`}
                        style={{ minWidth: "130px" }}
                      >
                        <span className="font-bold text-[11px] text-sky-400">
                          {mes.mesNome}
                        </span>
                        <span className="text-[12px] font-extrabold">
                          Taxa TD: {taxa}%
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {mes.desligamentos} saídas ({mes.desligamentosVoluntarios} vol. / {mes.desligamentosInvoluntarios} invol.)
                        </span>
                      </div>
                    )}

                    {/* Rótulo superior da barra */}
                    <span
                      className={`mb-2 text-[10.5px] font-extrabold transition-colors duration-200 ${
                        isHovered
                          ? "text-sky-400 scale-110"
                          : isPurpleTheme
                          ? "text-purple-300"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {taxa > 0 ? `${taxa}%` : "0%"}
                    </span>

                    {/* COLUNA 3D PRISMÁTICA */}
                    <div
                      className="relative w-full max-w-[28px] rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${heightPct}%`,
                        perspective: "600px",
                      }}
                    >
                      {/* Face frontal com degradê prismático */}
                      <div
                        className={`h-full w-full rounded-t-md transition-all duration-300 ${
                          taxa > 0
                            ? isPurpleTheme
                              ? "bg-gradient-to-t from-purple-700 via-pink-600 to-rose-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                              : "bg-gradient-to-t from-blue-700 via-sky-500 to-cyan-400 shadow-[0_0_15px_rgba(14,165,233,0.35)]"
                            : isPurpleTheme
                            ? "bg-purple-900/30"
                            : "bg-slate-200 dark:bg-white/10"
                        } ${isHovered ? "brightness-110 scale-y-[1.03]" : ""}`}
                      />

                      {/* Chanfro brilhante no topo 3D */}
                      <div
                        className={`absolute top-0 inset-x-0 h-1.5 rounded-t-md ${
                          taxa > 0 ? "bg-white/80" : "bg-transparent"
                        }`}
                      />

                      {/* Feixe de luz vertical lateral 3D */}
                      <div
                        className={`absolute inset-y-0 left-0 w-1 rounded-tl-md ${
                          taxa > 0 ? "bg-white/40" : "bg-transparent"
                        }`}
                      />
                    </div>

                    {/* Rótulo do Mês no eixo X */}
                    <span className="mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {mes.mesAbrev}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* GRÁFICO 3: CÍRCULO 3D DE MOTIVOS DE SAÍDA */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all duration-300 flex flex-col justify-between ${
            isPurpleTheme
              ? "border-purple-500/20 bg-gradient-to-b from-[#180e29] to-[#0e071a] shadow-purple-950/20 text-white"
              : "border-slate-200/80 bg-white/90 text-slate-900 shadow-slate-200/50 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 dark:border-white/10 border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div
                className={`rounded-xl p-2 ${
                  isPurpleTheme
                    ? "bg-pink-500/20 text-pink-300"
                    : "bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-300"
                }`}
              >
                <PieChart className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Motivos de Saída</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Por que os talentos estão saindo
                </p>
              </div>
            </div>
          </div>

          {/* Círculo 3D Central */}
          <div className="relative my-4 flex items-center justify-center">
            {/* SVG do Donut Orbital */}
            <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-xl">
              <defs>
                <filter id="turnover-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>

              {/* Anel de órbita decorativo */}
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="opacity-20 animate-spin text-sky-400"
                style={{ animationDuration: "35s" }}
              />

              {/* Fundo do Donut */}
              <circle
                cx="100"
                cy="100"
                r="64"
                fill="none"
                stroke="currentColor"
                strokeWidth="20"
                className="text-slate-200 dark:text-white/10"
              />

              {/* Segmentos coloridos baseados no dashoffset */}
              {donutSegments.map((seg, i) => {
                const radius = 64;
                const circ = 2 * Math.PI * radius;
                const strokeLength = (seg.angleSize / 360) * circ;
                const offset = -((seg.startAngle + 90) / 360) * circ;

                if (seg.quantidade === 0) return null;

                return (
                  <circle
                    key={seg.motivo}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={seg.cor}
                    strokeWidth="22"
                    strokeDasharray={`${strokeLength} ${circ - strokeLength}`}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                  />
                );
              })}

              {/* Núcleo interno redondo com estatística */}
              <circle
                cx="100"
                cy="100"
                r="46"
                className={`transition-colors duration-300 ${
                  isPurpleTheme ? "fill-[#160d26]" : "fill-[#0E1928] dark:fill-[#0E1928]"
                }`}
              />

              <text
                x="100"
                y="94"
                textAnchor="middle"
                className="text-[20px] font-extrabold fill-white"
              >
                {metrics.totalDesligamentosPeriodo}
              </text>
              <text
                x="100"
                y="112"
                textAnchor="middle"
                className="text-[8.5px] font-semibold uppercase tracking-wider fill-slate-400"
              >
                Desligamentos
              </text>
            </svg>
          </div>

          {/* Legenda de Motivos */}
          <div className="flex flex-col gap-1.5 pt-2 text-xs">
            {metrics.motivosDistribuicao.slice(0, 4).map((motivo) => (
              <div key={motivo.motivo} className="flex items-center justify-between">
                <span className="flex items-center gap-2 truncate text-slate-600 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: motivo.cor }}
                  />
                  <span className="truncate">{motivo.motivo}</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {motivo.percentual}% ({motivo.quantidade})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LINHA INFERIOR: RANKING POR DEPARTAMENTO & TIPO DE SAÍDA */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* GRÁFICO 2: TURNOVER POR DEPARTAMENTO */}
        <div
          className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 ${
            isPurpleTheme
              ? "border-purple-500/20 bg-[#180e29] text-white"
              : "border-slate-200/80 bg-white/90 text-slate-900 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5 border-b pb-4 dark:border-white/10 border-slate-200/80 mb-5">
            <div
              className={`rounded-xl p-2 ${
                isPurpleTheme
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300"
              }`}
            >
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Turnover por Departamento</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Taxa de rotatividade por setor da empresa
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {metrics.departamentosRanking.map((dept) => (
              <div key={dept.departamento} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: dept.cor }}
                    />
                    {dept.departamento}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">
                    {dept.taxa}% ({dept.desligamentos} saídas / {dept.efetivo} ativos)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(4, dept.taxa))}%`,
                      backgroundColor: dept.cor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO 4: VOLUNTÁRIO VS INVOLUNTÁRIO & ALERTA DE EARLY TURNOVER */}
        <div
          className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 flex flex-col justify-between ${
            isPurpleTheme
              ? "border-purple-500/20 bg-[#180e29] text-white"
              : "border-slate-200/80 bg-white/90 text-slate-900 dark:border-white/10 dark:bg-[#102033]/80 dark:text-white"
          }`}
        >
          <div>
            <div className="flex items-center gap-2.5 border-b pb-4 dark:border-white/10 border-slate-200/80 mb-5">
              <div
                className={`rounded-xl p-2 ${
                  isPurpleTheme
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300"
                }`}
              >
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Voluntário vs. Involuntário</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Iniciativa do colaborador (pediu conta) vs decisão da empresa
                </p>
              </div>
            </div>

            {/* Barra Dividida Proporcional */}
            <div className="my-4">
              <div className="flex h-5 w-full overflow-hidden rounded-full border border-slate-200 dark:border-white/10">
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{ width: `${metrics.turnoverVoluntarioPct}%` }}
                  title={`Voluntário: ${metrics.turnoverVoluntarioPct}%`}
                />
                <div
                  className="bg-blue-600 transition-all duration-500"
                  style={{ width: `${metrics.turnoverInvoluntarioPct}%` }}
                  title={`Involuntário: ${metrics.turnoverInvoluntarioPct}%`}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Voluntário: {metrics.turnoverVoluntarioPct}%
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Involuntário: {metrics.turnoverInvoluntarioPct}%
                </span>
              </div>
            </div>
          </div>

          {/* CARD DE ALERTA DE EARLY TURNOVER */}
          <div
            className={`mt-4 rounded-2xl p-4 border transition-colors duration-300 ${
              metrics.earlyTurnoverPct > 15
                ? "bg-rose-50/80 border-rose-300 text-rose-950 dark:bg-rose-950/20 dark:border-rose-800/40 dark:text-rose-200"
                : "bg-emerald-50/80 border-emerald-300 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-200"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Diagnóstico de Recrutamento & Onboarding
                </p>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  {metrics.earlyTurnoverPct > 15
                    ? `Atenção: ${metrics.earlyTurnoverPct}% dos desligamentos ocorreram antes de 90 dias de casa (${metrics.earlyTurnoverQtd} colaboradores). Isso costuma sinalizar desalinhamento de expectativas no recrutamento ou carência no processo de integração (onboarding).`
                    : `Excelente retenção no período de experiência: apenas ${metrics.earlyTurnoverPct}% dos desligamentos ocorreram antes de 90 dias, indicando assertividade na seleção e bom acolhimento no onboarding.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
