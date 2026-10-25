"use client";

import { useMemo, useState } from "react";
import type { JobOpening } from "@/lib/jobs/types";
import { computeSourceOfHire } from "@/lib/jobs/agility-metrics";
import { PieChart, TrendingUp, Sparkles, DollarSign } from "lucide-react";

interface JobOpeningsSourceChartProps {
  items: JobOpening[];
  isPurpleTheme?: boolean;
}

export function JobOpeningsSourceChart({
  items = [],
  isPurpleTheme = false,
}: JobOpeningsSourceChartProps) {
  const { channels, totalHired, totalTracked, topChannel } = useMemo(
    () => computeSourceOfHire(items),
    [items]
  );

  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

  // Raio e circunferência do Donut 3D
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ≈ 427.26

  // Calcula os arcos do donut acumulando os offsets
  let accumulatedAngle = 0;
  const segments = channels.map((ch) => {
    const fraction = ch.pct / 100;
    const strokeDasharray = `${(fraction * circumference).toFixed(2)} ${(
      circumference -
      fraction * circumference
    ).toFixed(2)}`;
    const strokeDashoffset = (-accumulatedAngle * circumference).toFixed(2);
    accumulatedAngle += fraction;

    return {
      ...ch,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div
      className={`group relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 hover:shadow-2xl ${
        isPurpleTheme
          ? "border-purple-500/25 bg-[#160d26] shadow-[0_20px_50px_rgba(168,85,247,0.15)]"
          : "border-slate-200/80 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1928] dark:to-[#0A111C] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      }`}
    >
      {/* Top rim glow */}
      <div
        className={`pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full opacity-80 ${
          isPurpleTheme
            ? "bg-gradient-to-r from-transparent via-pink-500 to-transparent"
            : "bg-gradient-to-r from-transparent via-[#2BEF83] to-[#2488BA]"
        }`}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className={`h-5 w-5 ${isPurpleTheme ? "text-pink-400" : "text-[#2BEF83]"}`} />
            <h3
              className={`text-lg font-bold tracking-tight ${
                isPurpleTheme ? "text-white" : "text-slate-900 dark:text-white"
              }`}
            >
              Origem das Contratações (Source of Hire)
            </h3>
          </div>
          <p
            className={`mt-0.5 text-xs font-medium ${
              isPurpleTheme ? "text-purple-200/90" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Distribuição de candidatos por canal • Mede onde investir seu orçamento
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
            isPurpleTheme
              ? "border-pink-500/40 bg-pink-500/15 text-pink-200"
              : "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          <span>
            {totalHired > 0
              ? `${totalHired} contratações concluídas`
              : `${totalTracked} vagas monitoradas`}
          </span>
        </div>
      </div>

      {/* Main Grid: Gráfico Donut 3D + Lista de Canais + Insight de Orçamento */}
      <div className="mt-6 grid items-center gap-8 lg:grid-cols-12">
        {/* 1. Donut 3D Holográfico com Glow (lg:col-span-5) */}
        <div className="relative flex flex-col items-center justify-center lg:col-span-5">
          <div className="relative flex h-64 w-64 items-center justify-center">
            {/* SVG Donut Circle */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 200 200">
              {/* Círculo de trilha base escura */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={isPurpleTheme ? "#2e194d" : "#132338"}
                strokeWidth="18"
                opacity="0.4"
              />

              {/* Fatias do Donut com Neon Glow */}
              {segments.map((seg) => {
                if (seg.pct <= 0) return null;
                const isHovered = hoveredChannel === seg.channel;

                return (
                  <circle
                    key={seg.channel}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isHovered ? "22" : "18"}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredChannel(seg.channel)}
                    onMouseLeave={() => setHoveredChannel(null)}
                    style={{
                      filter: isHovered
                        ? `drop-shadow(0 0 10px ${seg.color})`
                        : `drop-shadow(0 0 4px ${seg.color})`,
                      transformOrigin: "center",
                    }}
                  />
                );
              })}
            </svg>

            {/* Núcleo Central Tátil */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`flex h-28 w-28 flex-col items-center justify-center rounded-full border p-2 text-center transition-all duration-300 ${
                  isPurpleTheme
                    ? "border-pink-500/35 bg-[#160d26] shadow-[0_0_25px_rgba(168,85,247,0.2)]"
                    : "border-emerald-500/35 bg-[#0E1928] shadow-[0_0_25px_rgba(36,136,186,0.2)]"
                }`}
              >
                <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                  {hoveredChannel
                    ? `${channels.find((c) => c.channel === hoveredChannel)?.pct ?? 0}%`
                    : topChannel
                      ? `${topChannel.pct}%`
                      : "100%"}
                </span>
                <span
                  className={`mt-0.5 max-w-[90px] truncate text-[8px] font-extrabold uppercase tracking-[0.16em] leading-tight ${
                    isPurpleTheme ? "text-pink-300" : "text-emerald-400"
                  }`}
                >
                  {hoveredChannel || (topChannel ? topChannel.channel : "LinkedIn")}
                </span>
              </div>
            </div>
          </div>

          <p
            className={`mt-2 text-[11px] font-medium ${
              isPurpleTheme ? "text-purple-300/70" : "text-slate-400 dark:text-slate-400"
            }`}
          >
            Passe o mouse sobre as fatias para inspecionar
          </p>
        </div>

        {/* 2. Lista de Canais com Barras de Volume e Percentual (lg:col-span-7) */}
        <div className="flex flex-col justify-center space-y-3.5 lg:col-span-7">
          <div className="space-y-2.5">
            {channels.map((ch) => {
              const isHovered = hoveredChannel === ch.channel;

              return (
                <div
                  key={ch.channel}
                  onMouseEnter={() => setHoveredChannel(ch.channel)}
                  onMouseLeave={() => setHoveredChannel(null)}
                  className={`group/item flex flex-col rounded-xl border p-2.5 transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? isPurpleTheme
                        ? "border-pink-500/50 bg-purple-500/15"
                        : "border-sky-400/50 bg-sky-500/10 dark:bg-white/5"
                      : isPurpleTheme
                        ? "border-purple-500/15 bg-purple-500/5 hover:border-purple-500/30"
                        : "border-slate-100 bg-slate-50/60 hover:border-slate-200 dark:border-white/5 dark:bg-white/2 dark:hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-white/10 shrink-0"
                        style={{ backgroundColor: ch.color }}
                      />
                      <span
                        className={`font-semibold ${
                          isPurpleTheme ? "text-white" : "text-slate-800 dark:text-white"
                        }`}
                      >
                        {ch.channel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${ch.labelColor}`}>{ch.pct}%</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-400">
                        ({ch.totalCount} {ch.totalCount === 1 ? "vaga" : "vagas"})
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(2, ch.pct)}%`,
                        backgroundColor: ch.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strategic RH Budget Recommendation Card */}
          <div
            className={`mt-3 flex items-start gap-3 rounded-2xl border p-3.5 text-xs transition-all ${
              isPurpleTheme
                ? "border-purple-500/30 bg-[#1e1136]/90 text-purple-200 shadow-sm"
                : "border-sky-500/20 bg-sky-50/80 text-slate-700 dark:border-sky-400/20 dark:bg-[#0d1f33]/80 dark:text-slate-200 shadow-sm"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                isPurpleTheme
                  ? "bg-pink-500/20 text-pink-300"
                  : "bg-sky-500/20 text-sky-500 dark:text-[#2BEF83]"
              }`}
            >
              <DollarSign className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Onde investir seu orçamento de recrutamento:</span>
              </div>
              <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300 text-[11.5px]">
                {topChannel && topChannel.pct > 0 ? (
                  <>
                    <strong>{topChannel.channel}</strong> representa{" "}
                    <strong>{topChannel.pct}%</strong> das suas oportunidades. Alocar até 60% do seu
                    budget de atração e anúncios de vagas em <strong>{topChannel.channel}</strong>{" "}
                    maximiza a velocidade de contratação e reduz o seu Custo por Contratação (CPH).
                  </>
                ) : (
                  <>
                    Cadastre a origem das vagas para gerar recomendações automatizadas de investimento
                    em LinkedIn, Indicações e plataformas parceiras.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
