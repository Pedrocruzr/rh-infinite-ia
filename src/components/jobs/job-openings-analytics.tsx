"use client";

import { useMemo, useState } from "react";
import type { JobOpening } from "@/lib/jobs/types";
import { JOB_DEPARTMENTS, parseJobTitleAndArea } from "@/lib/jobs/departments";

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

  // ─── CÁLCULO DE CONTRATAÇÕES + REGRESSÃO LINEAR NOS MESES FUTUROS ──────────
  const { monthStats } = useMemo(() => {
    const realHiresPerMonth = new Array(12).fill(0);

    for (const job of items) {
      if (job.status === "fechada") {
        const dateStr = job.data_fechamento || job.data_abertura;
        if (dateStr) {
          const clean = String(dateStr).trim().slice(0, 10);
          let m = -1;

          if (clean.includes("-")) {
            const parts = clean.split("-");
            if (parts.length === 3) {
              m = parseInt(parts[1], 10) - 1;
            }
          } else if (clean.includes("/")) {
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
    const maxReal = Math.max(...realHiresPerMonth, 1);

    // Regressão Linear Simples Y = a + bX com base no histórico real dos meses transcorridos
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
      const isFuture = i > currentMonthIdx;
      // Projeção estimada por regressão linear para meses futuros (Novembro, Dezembro)
      const projected = Math.max(0, Math.round(a + b * x));
      const count = isFuture ? projected : realHiresPerMonth[i];

      // Comparativo com o mês anterior
      let pct = 0;
      if (i > 0) {
        const prev = stats[i - 1].count;
        if (prev > 0) {
          pct = Math.round(((count - prev) / prev) * 100);
        } else if (count > 0) {
          pct = 100;
        } else {
          pct = 0;
        }
      }

      // Altura visual proporcional: se tiver contratações, cresce de 28% a 92%; se 0, fica na base (12%)
      let heightPct = 12;
      if (count > 0) {
        heightPct = Math.max(28, Math.min(92, Math.round((count / maxReal) * 88)));
      }

      stats.push({
        name: MONTH_NAMES[i],
        monthNum: x,
        count,
        pct,
        isProjected: isFuture,
        heightPct,
      });
    }

    return { monthStats: stats };
  }, [items]);

  const selectedMonth = monthStats[selectedMonthIndex] || monthStats[0];

  // ─── DEPARTAMENTOS: CÁLCULO 100% DINÂMICO CONECTADO ÀS ÁREAS REAIS ──────────
  const departments = useMemo(() => {
    const openJobs = items.filter((job) => job.status === "em_aberto");
    const activeList = openJobs.length > 0 ? openJobs : items;
    const totalJobs = activeList.length;

    const counts: Record<string, number> = {};
    for (const dep of JOB_DEPARTMENTS) {
      counts[dep.name] = 0;
    }

    for (const job of activeList) {
      const { area } = parseJobTitleAndArea(job.nome_vaga);
      if (counts[area] !== undefined) {
        counts[area]++;
      } else {
        counts["Administração (ADM)"] = (counts["Administração (ADM)"] || 0) + 1;
      }
    }

    const calcPct = (count: number) =>
      totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;

    // Raios concêntricos de 98 até 44 para 7 áreas com respiro abundante para a esfera central
    return JOB_DEPARTMENTS.map((dept, idx) => {
      const r = 98 - idx * 9;
      const circumference = Math.round(2 * Math.PI * r);
      const count = counts[dept.name] || 0;
      return {
        ...dept,
        count,
        pct: calcPct(count),
        r,
        circumference,
      };
    });
  }, [items]);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* ─── 1. GRÁFICO 3D: TENDÊNCIA DE CONTRATAÇÃO (ASPECTO PRISMA 3D ISOMÉTRICO) ─── */}
      <div
        className={`group relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 hover:shadow-2xl lg:col-span-7 ${
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
            <h3
              className={`text-lg font-bold tracking-tight ${
                isPurpleTheme ? "text-white" : "text-slate-900 dark:text-white"
              }`}
            >
              Tendência de Contratação
            </h3>
            <p
              className={`text-xs font-medium ${
                isPurpleTheme ? "text-purple-200/90" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Últimos 12 meses • Base real de contratações do sistema
            </p>
          </div>

          <div
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all duration-300 ${
              selectedMonth.isProjected
                ? isPurpleTheme
                  ? "border border-purple-400/50 bg-purple-500/20 text-purple-200 shadow-sm"
                  : "border border-sky-400/40 bg-sky-500/15 text-sky-600 dark:text-sky-300 shadow-sm"
                : isPurpleTheme
                  ? "border border-pink-500/40 bg-pink-500/15 text-pink-200"
                  : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
            }`}
          >
            {selectedMonth.isProjected ? (
              <span>
                {selectedMonth.name}: Projeção estimada de contratação ({selectedMonth.count}{" "}
                {selectedMonth.count === 1 ? "vaga" : "vagas"})
              </span>
            ) : (
              <span>
                {selectedMonth.name}: {selectedMonth.count}{" "}
                {selectedMonth.count === 1 ? "contratação" : "contratações"}
              </span>
            )}
          </div>
        </div>

        {/* 3D Isometric Columns Container com feixes verticais estilo imagem 2 */}
        <div className="relative mt-8 flex h-64 w-full items-end justify-between gap-1.5 px-3 pb-6 pt-16">
          {/* Fios verticais de luz e grid lines 3D de fundo (conforme Imagem 2) */}
          <div className="pointer-events-none absolute inset-x-3 bottom-6 top-6 flex justify-between">
            {monthStats.map((item) => (
              <div key={`guide-${item.name}`} className="flex h-full w-full justify-center">
                <div
                  className={`h-full w-[1px] opacity-15 ${
                    isPurpleTheme
                      ? "bg-gradient-to-t from-pink-500/40 via-purple-400/20 to-transparent"
                      : "bg-gradient-to-t from-[#2BEF83]/40 via-[#2488BA]/20 to-transparent"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Grid lines horizontais */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 top-8 flex flex-col justify-between border-b border-white/5">
            <div className="border-b border-dashed border-white/5" />
            <div className="border-b border-dashed border-white/5" />
            <div className="border-b border-dashed border-white/5" />
          </div>

          {monthStats.map((item, index) => {
            const isSelected = index === selectedMonthIndex;

            // Alinhamento inteligente do tooltip flutuante para NUNCA vazar da caixa (meses 10 e 11 na borda direita)
            const tooltipAlignClass =
              index >= 10
                ? "right-0 left-auto"
                : index <= 1
                  ? "left-0 right-auto"
                  : "left-1/2 -translate-x-1/2";

            return (
              <div
                key={item.name}
                onClick={() => setSelectedMonthIndex(index)}
                className="group/col relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
                title={
                  item.isProjected
                    ? `${item.name}: Projeção estimada de ${item.count} contratação`
                    : `${item.name}: ${item.count} contratações`
                }
              >
                {/* Floating Tooltip / Badge over selected month */}
                {isSelected && (
                  <div
                    className={`absolute -top-12 z-30 flex whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-bold shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${tooltipAlignClass} ${
                      item.isProjected
                        ? isPurpleTheme
                          ? "border border-purple-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/40"
                          : "border border-sky-400 bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sky-500/40"
                        : isPurpleTheme
                          ? "border border-pink-400 bg-pink-500 text-white shadow-pink-500/50"
                          : "border border-emerald-400 bg-gradient-to-r from-[#2BEF83] to-[#2488BA] text-slate-950 shadow-emerald-500/50"
                    }`}
                  >
                    {item.isProjected ? (
                      <span>
                        Projeção estimada: {item.count} {item.count === 1 ? "vaga" : "vagas"}
                      </span>
                    ) : (
                      <span>
                        {item.pct > 0 ? `+${item.pct}%` : `${item.pct}%`} ({item.count}{" "}
                        {item.count === 1 ? "contratação" : "contratações"})
                      </span>
                    )}
                  </div>
                )}

                {/* Coluna Prisma 3D Facetado com Volumetria e Glow no Piso */}
                <div className="relative flex h-full w-full max-w-[28px] items-end justify-center">
                  {/* Glow volumétrico no piso da coluna */}
                  <div
                    className={`absolute -bottom-1 h-2 w-full rounded-full blur-xs transition-opacity duration-300 ${
                      isSelected
                        ? isPurpleTheme
                          ? "bg-pink-500 opacity-90 scale-125"
                          : "bg-[#2BEF83] opacity-90 scale-125"
                        : item.count > 0
                          ? isPurpleTheme
                            ? "bg-purple-500/40 opacity-50"
                            : "bg-[#2488BA]/40 opacity-50"
                          : "opacity-0"
                    }`}
                  />

                  <div
                    className="relative flex w-full flex-col justify-end transition-all duration-500"
                    style={{ height: `${item.heightPct}%` }}
                  >
                    {/* Topo Chanfrado 3D (Bevel Elíptico Iluminado com Highlight de Vidro) */}
                    <div
                      className={`relative z-20 h-3.5 w-full shrink-0 rounded-full border transition-all duration-300 ${
                        isSelected
                          ? isPurpleTheme
                            ? "border-pink-200 bg-gradient-to-r from-pink-300 via-rose-200 to-pink-400 shadow-[0_0_16px_rgba(244,114,182,1)]"
                            : "border-emerald-200 bg-gradient-to-r from-[#7ef5b6] via-white to-[#2BEF83] shadow-[0_0_16px_rgba(43,239,131,1)]"
                          : isPurpleTheme
                            ? item.count > 0
                              ? "border-purple-300/60 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400"
                              : "border-purple-400/20 bg-purple-400/20"
                            : item.count > 0
                              ? "border-sky-300/60 bg-gradient-to-r from-[#2488BA] via-[#5ce1e6] to-[#2BEF83]"
                              : "border-[#2488BA]/20 bg-[#2488BA]/20"
                      }`}
                    >
                      {/* Especular highlight central */}
                      <div className="absolute inset-x-1.5 top-0.5 h-1 rounded-full bg-white/70 blur-[0.3px]" />
                    </div>

                    {/* Corpo do Prisma 3D com Duas Facetas: Frontal Iluminada + Lateral Sombreada */}
                    <div
                      className={`relative flex w-full overflow-hidden rounded-b-md transition-all duration-300 ${
                        item.heightPct > 15 ? "flex-1" : "h-1"
                      } ${
                        item.isProjected
                          ? isSelected
                            ? isPurpleTheme
                              ? "border-x border-b border-dashed border-pink-300 bg-gradient-to-t from-purple-900 via-purple-700 to-pink-600 shadow-[0_0_24px_rgba(236,72,153,0.6)]"
                              : "border-x border-b border-dashed border-sky-300 bg-gradient-to-t from-slate-900 via-sky-700 to-cyan-500 shadow-[0_0_24px_rgba(56,189,248,0.6)]"
                            : isPurpleTheme
                              ? "border-x border-b border-dashed border-purple-400/40 bg-purple-900/30 hover:opacity-80"
                              : "border-x border-b border-dashed border-sky-400/40 bg-sky-950/30 hover:opacity-80"
                          : isSelected
                            ? isPurpleTheme
                              ? "shadow-[0_0_28px_rgba(236,72,153,0.7)]"
                              : "shadow-[0_0_28px_rgba(43,239,131,0.7)]"
                            : item.count > 0
                              ? "hover:opacity-95"
                              : "opacity-30 hover:opacity-50"
                      }`}
                    >
                      {/* Faceta Frontal (65% largura - Iluminada com gradiente vertical) */}
                      <div
                        className={`h-full w-[65%] transition-colors duration-300 ${
                          isSelected
                            ? isPurpleTheme
                              ? "bg-gradient-to-t from-[#6D28D9] via-[#A855F7] to-[#EC4899]"
                              : "bg-gradient-to-t from-[#0E1928] via-[#2488BA] to-[#2BEF83]"
                            : isPurpleTheme
                              ? item.count > 0
                                ? "bg-gradient-to-t from-purple-950 via-purple-800 to-purple-500"
                                : "bg-gradient-to-t from-purple-950 to-purple-800"
                              : item.count > 0
                                ? "bg-gradient-to-t from-slate-900 via-slate-700 to-sky-500"
                                : "bg-gradient-to-t from-slate-900 to-sky-900"
                        }`}
                      >
                        {/* Brilho linear vertical (reflexo de aresta 3D) */}
                        <div className="h-full w-full bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-80" />
                      </div>

                      {/* Faceta Lateral Chanfrada (35% largura - Sombreada para profundidade 3D) */}
                      <div
                        className={`h-full w-[35%] border-l border-black/20 transition-colors duration-300 ${
                          isSelected
                            ? isPurpleTheme
                              ? "bg-gradient-to-t from-[#4C1D95] via-[#7E22CE] to-[#BE185D]"
                              : "bg-gradient-to-t from-[#060D17] via-[#1A5C7E] to-[#1F9F58]"
                            : isPurpleTheme
                              ? item.count > 0
                                ? "bg-gradient-to-t from-purple-950 via-purple-900 to-purple-700"
                                : "bg-purple-950"
                              : item.count > 0
                                ? "bg-gradient-to-t from-slate-950 via-slate-800 to-sky-700"
                                : "bg-slate-950"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Month Label com indicador de projeção */}
                <span
                  className={`mt-2 flex flex-col items-center text-[11px] font-bold transition-colors ${
                    isSelected
                      ? isPurpleTheme
                        ? "text-pink-300 underline underline-offset-4"
                        : "text-[#2BEF83] dark:text-[#2BEF83] underline underline-offset-4"
                      : isPurpleTheme
                        ? "text-purple-200/70"
                        : "text-slate-400 dark:text-slate-400"
                  }`}
                >
                  <span>{item.name}</span>
                  {item.isProjected && (
                    <span className="text-[9px] font-medium opacity-65">
                      proj.
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 2. GRÁFICO HUD ORBITAL 3D: VAGAS POR DEPARTAMENTO ──────────────── */}
      <div
        className={`group relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 hover:shadow-2xl lg:col-span-5 ${
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
          <h3
            className={`text-lg font-bold tracking-tight ${
              isPurpleTheme ? "text-white" : "text-slate-900 dark:text-white"
            }`}
          >
            Vagas por Departamento
          </h3>
          <p
            className={`text-xs font-medium ${
              isPurpleTheme ? "text-purple-200/90" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Distribuição em tempo real das posições
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center gap-6 sm:flex-row sm:justify-around">
          {/* Orbital HUD Graphic com Anéis Animados Circulando o Círculo */}
          <div className="relative flex h-56 w-56 shrink-0 items-center justify-center">
            {/* Ambient Background Glow */}
            <div
              className={`absolute h-44 w-44 rounded-full blur-3xl opacity-25 ${
                isPurpleTheme ? "bg-pink-500" : "bg-[#2BEF83]"
              }`}
            />

            {/* SVG Concentric Rings com Animação Contínua Circulando o Círculo */}
            <svg
              className="h-full w-full -rotate-90 transform"
              viewBox="0 0 220 220"
            >
              {departments.map((dep, idx) => {
                const strokeDashoffset =
                  dep.pct > 0
                    ? dep.circumference - (dep.circumference * dep.pct) / 100
                    : dep.circumference;

                // Animação com velocidades alternadas em rotação orbital contínua
                const animDuration = 16 + idx * 4;
                const isClockwise = idx % 2 === 0;

                return (
                  <g
                    key={dep.name}
                    style={{
                      transformOrigin: "110px 110px",
                      animation: `spin ${animDuration}s linear infinite ${isClockwise ? "normal" : "reverse"}`,
                    }}
                  >
                    {/* Ring Track de fundo */}
                    <circle
                      cx="110"
                      cy="110"
                      r={dep.r}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={dep.r > 65 ? "3.5" : "3"}
                    />

                    {/* Ring Arc colorido proporcional às vagas reais */}
                    {dep.pct > 0 && (
                      <circle
                        cx="110"
                        cy="110"
                        r={dep.r}
                        fill="none"
                        stroke={dep.color}
                        strokeWidth={dep.r > 65 ? "4.5" : "3.5"}
                        strokeDasharray={dep.circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                          filter: `drop-shadow(0 0 4px ${dep.color})`,
                        }}
                      />
                    )}

                    {/* Ponto / Feixe de luz circulando continuamente ao redor do anel */}
                    <circle
                      cx="110"
                      cy="110"
                      r={dep.r}
                      fill="none"
                      stroke={dep.color}
                      strokeWidth={dep.r > 65 ? "3" : "2.5"}
                      strokeDasharray={`14 ${dep.circumference - 14}`}
                      strokeLinecap="round"
                      opacity={dep.pct > 0 ? "0.9" : "0.35"}
                      style={{
                        filter: `drop-shadow(0 0 6px ${dep.color})`,
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Núcleo Central 3D em Esfera de Vidro com Palavras em Escala Ajustada */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`relative flex h-24 w-24 flex-col items-center justify-center rounded-full border p-2 text-center backdrop-blur-md shadow-2xl transition-all duration-300 ${
                  isPurpleTheme
                    ? "border-pink-500/40 bg-gradient-to-b from-[#2a1347]/90 via-[#160d26]/95 to-[#0b0514] shadow-[inset_0_2px_8px_rgba(244,114,182,0.35),_inset_0_-6px_12px_rgba(0,0,0,0.8),_0_0_24px_rgba(168,85,247,0.3)]"
                    : "border-emerald-500/40 bg-gradient-to-b from-[#162a42]/90 via-[#0E1928]/95 to-[#050b12] shadow-[inset_0_2px_8px_rgba(43,239,131,0.35),_inset_0_-6px_12px_rgba(0,0,0,0.8),_0_0_24px_rgba(36,136,186,0.3)]"
                }`}
              >
                {/* Reflexo vítreo especular no topo da esfera 3D */}
                <div className="pointer-events-none absolute inset-x-4 top-1.5 h-3 rounded-full bg-gradient-to-b from-white/30 to-transparent blur-[0.5px]" />

                <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                  {openCount}
                </span>
                <span
                  className={`mt-0.5 max-w-[85px] text-[7.5px] font-extrabold uppercase tracking-[0.16em] leading-tight ${
                    isPurpleTheme ? "text-pink-300" : "text-emerald-400"
                  }`}
                >
                  {openCount === 1 ? "Vaga em aberto" : "Vagas em aberto"}
                </span>
              </div>
            </div>
          </div>

          {/* Department Legend List: Nomes e porcentagens 100% dinâmicos e fiéis às áreas reais */}
          <div className="flex flex-col gap-2">
            {departments.map((dep) => (
              <div
                key={dep.name}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shadow-sm ring-1 ring-white/10"
                    style={{ backgroundColor: dep.color }}
                  />
                  <span
                    className={`font-semibold ${
                      isPurpleTheme ? "text-white" : "text-slate-800 dark:text-white"
                    }`}
                  >
                    {dep.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${dep.labelColor}`}>
                    {dep.pct}%
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400">
                    ({dep.count} {dep.count === 1 ? "vaga" : "vagas"})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
