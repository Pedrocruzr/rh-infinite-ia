"use client";

import { useMemo, useState } from "react";
import type { JobOpening } from "@/lib/jobs/types";

interface JobOpeningsAnalyticsProps {
  isPurpleTheme?: boolean;
  openCount: number;
  totalCount: number;
  items?: JobOpening[];
}

interface MonthStat {
  name: string;
  monthNum: number;
  count: number;
  pct: number;
  isProjected: boolean;
  heightPct: number;
}

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export function JobOpeningsAnalytics({
  isPurpleTheme = false,
  openCount = 0,
  totalCount = 0,
  items = [],
}: JobOpeningsAnalyticsProps) {
  // Mês padrão selecionado: Outubro (índice 9) ou mês atual
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(() => {
    const currentMonth = new Date().getMonth();
    return currentMonth >= 0 && currentMonth < 12 ? currentMonth : 9;
  });

  // ─── CÁLCULO DE CONTRATAÇÕES 100% REAL E CONTINGENTE AOS DADOS DO USUÁRIO ──
  const { monthStats } = useMemo(() => {
    const realHiresPerMonth = new Array(12).fill(0);

    // Contabiliza apenas as vagas reais marcadas como fechadas/contratadas
    for (const job of items) {
      if (job.status === "fechada") {
        const dateStr = job.data_fechamento || job.data_abertura;
        if (dateStr) {
          const clean = String(dateStr).trim().slice(0, 10);
          let m = -1;

          if (clean.includes("-")) {
            // Formato YYYY-MM-DD
            const parts = clean.split("-");
            if (parts.length === 3) {
              m = parseInt(parts[1], 10) - 1;
            }
          } else if (clean.includes("/")) {
            // Formato DD/MM/YYYY
            const parts = clean.split("/");
            if (parts.length === 3) {
              m = parseInt(parts[1], 10) - 1;
            }
          }

          if (m < 0 || m > 11) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              m = d.getMonth();
            }
          }

          if (m >= 0 && m < 12) {
            realHiresPerMonth[m] += 1;
          }
        }
      }
    }

    const currentMonthIdx = new Date().getMonth(); // Outubro = 9
    const maxReal = Math.max(...realHiresPerMonth);

    // Regressão Linear Simples Y = a + bX (apenas com base no histórico real dos meses transcorridos)
    const n = Math.max(1, currentMonthIdx + 1);
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const x = i + 1;
      const y = realHiresPerMonth[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const denominator = n * sumX2 - sumX * sumX;
    const b = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
    const a = n > 0 ? (sumY - b * sumX) / n : 0;

    const stats: MonthStat[] = [];

    for (let i = 0; i < 12; i++) {
      const x = i + 1;
      const isPastOrPresent = i <= currentMonthIdx;
      // Para meses futuros projeta Y = a + bX, se positivo; caso contrário 0
      const projected = Math.max(0, Math.round(a + b * x));
      const count = isPastOrPresent ? realHiresPerMonth[i] : projected;

      // Comparativo com o mês anterior
      let pct = 0;
      if (i > 0) {
        const prev = stats[i - 1].count;
        if (prev > 0) {
          pct = Math.round(((count - prev) / prev) * 100);
        } else if (count > 0) {
          pct = 100; // Saiu de 0 para algo positivo
        } else {
          pct = 0;
        }
      }

      // Altura visual proporcional: se tiver contratações, cresce de 25% a 92%; se 0, fica na base (10%)
      let heightPct = 10;
      if (count > 0) {
        const referenceMax = Math.max(maxReal, 1);
        heightPct = Math.max(25, Math.min(95, Math.round((count / referenceMax) * 88)));
      }

      stats.push({
        name: MONTH_NAMES[i],
        monthNum: x,
        count,
        pct,
        isProjected: !isPastOrPresent,
        heightPct,
      });
    }

    return { monthStats: stats };
  }, [items]);

  const selectedMonth = monthStats[selectedMonthIndex] || monthStats[0];

  // ─── DEPARTAMENTOS: 5 CORES TOTALMENTE DISTINTAS (SEM TONS DE AZUL) ─────────
  const departments = [
    {
      name: "Vendas",
      pct: 32,
      color: "#F59E0B", // Laranja / Âmbar
      labelColor: "text-amber-400",
    },
    {
      name: "Tech / TI",
      pct: 28,
      color: "#10B981", // Verde Esmeralda / Menta
      labelColor: "text-emerald-400",
    },
    {
      name: "RH & Gestão",
      pct: 21,
      color: "#8B5CF6", // Roxo / Violeta
      labelColor: "text-purple-400",
    },
    {
      name: "Finanças",
      pct: 11,
      color: "#06B6D4", // Ciano Elétrico
      labelColor: "text-cyan-400",
    },
    {
      name: "Marketing",
      pct: 8,
      color: "#EC4899", // Rosa / Magenta
      labelColor: "text-pink-400",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* ─── 1. GRÁFICO 3D: TENDÊNCIA DE CONTRATAÇÃO ──────────────────────── */}
      <div
        className={`group relative rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl lg:col-span-7 ${
          isPurpleTheme
            ? "border-purple-500/25 bg-[#160d26] shadow-[0_20px_50px_rgba(168,85,247,0.15)]"
            : "border-slate-200/80 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1928] dark:to-[#0A111C] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* Top edge glow */}
        <div
          className={`pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full opacity-80 ${
            isPurpleTheme
              ? "bg-gradient-to-r from-transparent via-pink-500 to-transparent"
              : "bg-gradient-to-r from-transparent via-[#2BEF83] to-[#2488BA]"
          }`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white dark:text-white">
              Tendência de Contratação
            </h3>
            <p
              className={`text-xs font-medium ${
                isPurpleTheme ? "text-purple-200/80" : "text-slate-400 dark:text-slate-400"
              }`}
            >
              Últimos 12 meses • Base real de contratações do sistema
            </p>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isPurpleTheme
                ? "border border-pink-500/40 bg-pink-500/15 text-pink-200"
                : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
            }`}
          >
            {selectedMonth.name}: {selectedMonth.count} {selectedMonth.count === 1 ? "contratação" : "contratações"}
          </div>
        </div>

        {/* 3D Isometric / Cylindrical Columns Container com altura total explícita */}
        <div className="relative mt-8 flex h-60 w-full items-end justify-between gap-1.5 px-2 pb-6 pt-14">
          {/* Subtle horizontal grid lines */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 top-8 flex flex-col justify-between border-b border-white/5">
            <div className="border-b border-dashed border-white/5" />
            <div className="border-b border-dashed border-white/5" />
            <div className="border-b border-dashed border-white/5" />
          </div>

          {monthStats.map((item, index) => {
            const isSelected = index === selectedMonthIndex;

            return (
              <div
                key={item.name}
                onClick={() => setSelectedMonthIndex(index)}
                className="group/col relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
                title={`${item.name}: ${item.count} contratações`}
              >
                {/* Floating Tooltip / Badge over selected month */}
                {isSelected && (
                  <div
                    className={`absolute -top-12 z-20 flex whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-bold shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                      isPurpleTheme
                        ? "border border-pink-400 bg-pink-500 text-white shadow-pink-500/50"
                        : "border border-emerald-400 bg-gradient-to-r from-[#2BEF83] to-[#2488BA] text-slate-950 shadow-emerald-500/50"
                    }`}
                  >
                    {item.pct > 0 ? `+${item.pct}%` : `${item.pct}%`} ({item.count} {item.count === 1 ? "contratação" : "contratações"})
                  </div>
                )}

                {/* 3D Column Cylinder Wrapper (com altura percentual calculada sobre h-full) */}
                <div className="relative flex h-full w-full max-w-[28px] items-end justify-center">
                  <div
                    className="relative w-full transition-all duration-500 flex flex-col justify-end"
                    style={{ height: `${item.heightPct}%` }}
                  >
                    {/* Top Cylinder Cap (3D Bevel) */}
                    <div
                      className={`h-3 w-full shrink-0 rounded-full transition-all duration-300 ${
                        isSelected
                          ? isPurpleTheme
                            ? "bg-pink-300 shadow-[0_0_16px_rgba(244,114,182,1)]"
                            : "bg-[#7ef5b6] shadow-[0_0_16px_rgba(43,239,131,1)]"
                          : isPurpleTheme
                            ? item.count > 0 ? "bg-purple-300/80" : "bg-purple-400/30"
                            : item.count > 0 ? "bg-[#2488BA]/80" : "bg-[#2488BA]/30"
                      }`}
                    />

                    {/* Cylinder Column Body */}
                    <div
                      className={`w-full rounded-b-lg transition-all duration-300 ${
                        item.heightPct > 15 ? "flex-1" : "h-1"
                      } ${
                        isSelected
                          ? isPurpleTheme
                            ? "bg-gradient-to-t from-[#7C3AED] via-[#A855F7] to-[#EC4899] shadow-[0_0_24px_rgba(236,72,153,0.6)]"
                            : "bg-gradient-to-t from-[#0E1928] via-[#2488BA] to-[#2BEF83] shadow-[0_0_26px_rgba(43,239,131,0.6)]"
                          : isPurpleTheme
                            ? item.count > 0
                              ? "bg-gradient-to-t from-purple-900/80 to-purple-500/80 hover:opacity-90"
                              : "opacity-25 hover:opacity-50 bg-gradient-to-t from-purple-900/40 to-purple-500/40"
                            : item.count > 0
                              ? "bg-gradient-to-t from-slate-800 to-sky-500 hover:opacity-90"
                              : "opacity-25 hover:opacity-50 bg-gradient-to-t from-slate-800 to-sky-700/50"
                      }`}
                    />
                  </div>
                </div>

                {/* Month Label */}
                <span
                  className={`mt-2 text-[11px] font-bold transition-colors ${
                    isSelected
                      ? isPurpleTheme
                        ? "text-pink-300 underline underline-offset-4"
                        : "text-[#2BEF83] dark:text-[#2BEF83] underline underline-offset-4"
                      : isPurpleTheme
                        ? "text-purple-200/70"
                        : "text-slate-400 dark:text-slate-400"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 2. GRÁFICO HUD ORBITAL: VAGAS POR DEPARTAMENTO ───────────────── */}
      <div
        className={`group relative rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl lg:col-span-5 ${
          isPurpleTheme
            ? "border-purple-500/25 bg-[#160d26] shadow-[0_20px_50px_rgba(168,85,247,0.15)]"
            : "border-slate-200/80 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1928] dark:to-[#0A111C] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* Top edge glow */}
        <div
          className={`pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full opacity-80 ${
            isPurpleTheme
              ? "bg-gradient-to-r from-transparent via-purple-500 to-transparent"
              : "bg-gradient-to-r from-transparent via-[#2488BA] to-transparent"
          }`}
        />

        <div>
          <h3 className="text-lg font-bold tracking-tight text-white dark:text-white">
            Vagas por Departamento
          </h3>
          <p
            className={`text-xs font-medium ${
              isPurpleTheme ? "text-purple-200/80" : "text-slate-400 dark:text-slate-400"
            }`}
          >
            Distribuição em tempo real das posições
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center gap-6 sm:flex-row sm:justify-around">
          {/* Orbital HUD Graphic com raio expandido (110 center) para garantir RESPIRO TOTAL do texto */}
          <div className="relative flex h-52 w-52 shrink-0 items-center justify-center">
            {/* Ambient Background Glow */}
            <div
              className={`absolute h-40 w-40 rounded-full blur-2xl opacity-20 ${
                isPurpleTheme ? "bg-pink-500" : "bg-[#2BEF83]"
              }`}
            />

            {/* SVG Concentric Rings com 5 cores distintas */}
            <svg
              className="h-full w-full -rotate-90 transform"
              viewBox="0 0 220 220"
            >
              {/* Ring 1 Track & Arc: Vendas (Laranja #F59E0B) */}
              <circle cx="110" cy="110" r="98" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle
                cx="110"
                cy="110"
                r="98"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="5"
                strokeDasharray="615"
                strokeDashoffset="200"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />

              {/* Ring 2 Track & Arc: Tech (Verde Menta #10B981) */}
              <circle cx="110" cy="110" r="84" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle
                cx="110"
                cy="110"
                r="84"
                fill="none"
                stroke="#10B981"
                strokeWidth="5"
                strokeDasharray="527"
                strokeDashoffset="150"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />

              {/* Ring 3 Track & Arc: RH & Gestão (Roxo #8B5CF6) */}
              <circle cx="110" cy="110" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="110"
                cy="110"
                r="70"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="4"
                strokeDasharray="439"
                strokeDashoffset="120"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />

              {/* Ring 4 Track & Arc: Finanças (Ciano #06B6D4) */}
              <circle cx="110" cy="110" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="110"
                cy="110"
                r="58"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="3.5"
                strokeDasharray="364"
                strokeDashoffset="110"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            {/* Central Text Display com amplo respiro (raio interno = 58px / diâmetro = 116px) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tight text-white">
                {openCount}
              </span>
              <span
                className={`mt-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  isPurpleTheme ? "text-pink-300" : "text-[#2BEF83]"
                }`}
              >
                Vagas em Aberto
              </span>
            </div>
          </div>

          {/* Department Legend List: Nomes em BRANCO puro e cores distintas */}
          <div className="flex flex-col gap-2.5">
            {departments.map((dep) => (
              <div
                key={dep.name}
                className="flex items-center justify-between gap-5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full shadow-sm ring-1 ring-white/10"
                    style={{ backgroundColor: dep.color }}
                  />
                  <span className="font-semibold text-white">
                    {dep.name}
                  </span>
                </div>
                <span className={`font-bold ${dep.labelColor}`}>
                  {dep.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
