"use client";

import { useState } from "react";

interface JobOpeningsAnalyticsProps {
  isPurpleTheme?: boolean;
  openCount: number;
  totalCount: number;
}

interface MonthData {
  name: string;
  count: number;
  pct: number;
  heightPct: number;
}

const DEFAULT_MONTHS: MonthData[] = [
  { name: "Jan", count: 24, pct: 10, heightPct: 35 },
  { name: "Fev", count: 32, pct: 14, heightPct: 45 },
  { name: "Mar", count: 48, pct: 18, heightPct: 65 },
  { name: "Abr", count: 38, pct: 15, heightPct: 52 },
  { name: "Mai", count: 56, pct: 22, heightPct: 75 },
  { name: "Jun", count: 42, pct: 16, heightPct: 58 },
  { name: "Jul", count: 70, pct: 28, heightPct: 90 },
  { name: "Ago", count: 84, pct: 32, heightPct: 100 },
  { name: "Set", count: 52, pct: 20, heightPct: 70 },
  { name: "Out", count: 64, pct: 25, heightPct: 82 },
  { name: "Nov", count: 40, pct: 16, heightPct: 55 },
  { name: "Dez", count: 46, pct: 18, heightPct: 62 },
];

export function JobOpeningsAnalytics({
  isPurpleTheme = false,
  openCount = 42,
  totalCount = 148,
}: JobOpeningsAnalyticsProps) {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(7); // Agosto default

  const selectedMonth = DEFAULT_MONTHS[selectedMonthIndex] || DEFAULT_MONTHS[0];

  const departments = [
    {
      name: "Vendas",
      pct: 32,
      color: isPurpleTheme ? "#EC4899" : "#2488BA",
      labelColor: isPurpleTheme ? "text-pink-400" : "text-sky-400",
    },
    {
      name: "Tech / TI",
      pct: 28,
      color: isPurpleTheme ? "#A855F7" : "#2BEF83",
      labelColor: isPurpleTheme ? "text-purple-400" : "text-emerald-400",
    },
    {
      name: "RH & Gestão",
      pct: 21,
      color: isPurpleTheme ? "#C084FC" : "#10B981",
      labelColor: isPurpleTheme ? "text-purple-300" : "text-emerald-300",
    },
    {
      name: "Finanças",
      pct: 11,
      color: isPurpleTheme ? "#F472B6" : "#38BDF8",
      labelColor: isPurpleTheme ? "text-pink-300" : "text-sky-300",
    },
    {
      name: "Marketing",
      pct: 8,
      color: "#FFFFFF",
      labelColor: "text-slate-300",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* ─── 1. GRÁFICO 3D: TENDÊNCIA DE CONTRATAÇÃO ──────────────────────── */}
      <div
        className={`group relative rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl lg:col-span-7 ${
          isPurpleTheme
            ? "border-purple-500/20 bg-gradient-to-b from-[#180e29]/90 to-[#0e071a]/95 shadow-[0_20px_50px_rgba(168,85,247,0.12)]"
            : "border-slate-200/80 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1928] dark:to-[#0A111C] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* Subtle top edge glow */}
        <div
          className={`pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full opacity-70 ${
            isPurpleTheme
              ? "bg-gradient-to-r from-transparent via-pink-500 to-transparent"
              : "bg-gradient-to-r from-transparent via-[#2BEF83] to-[#2488BA]"
          }`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Tendência de Contratação
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Últimos 12 meses • Clique em qualquer mês para destacar
            </p>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isPurpleTheme
                ? "border border-purple-500/30 bg-purple-500/10 text-pink-300"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
            }`}
          >
            {selectedMonth.name}: +{selectedMonth.pct}%
          </div>
        </div>

        {/* 3D Isometric / Cylindrical Columns Container */}
        <div className="relative mt-8 flex h-56 items-end justify-between gap-2 px-2 pb-6 pt-12">
          {/* Subtle horizontal grid lines */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 top-8 flex flex-col justify-between border-b border-slate-200/50 dark:border-white/5">
            <div className="border-b border-dashed border-slate-200/40 dark:border-white/5" />
            <div className="border-b border-dashed border-slate-200/40 dark:border-white/5" />
            <div className="border-b border-dashed border-slate-200/40 dark:border-white/5" />
          </div>

          {DEFAULT_MONTHS.map((item, index) => {
            const isSelected = index === selectedMonthIndex;

            return (
              <div
                key={item.name}
                onClick={() => setSelectedMonthIndex(index)}
                className="group/col relative flex flex-1 cursor-pointer flex-col items-center justify-end"
                title={`${item.name}: ${item.count} vagas (+${item.pct}%)`}
              >
                {/* Floating Tooltip / Badge over selected month */}
                {isSelected && (
                  <div
                    className={`absolute -top-11 z-20 flex whitespace-nowrap rounded-xl px-2.5 py-1 text-xs font-bold shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                      isPurpleTheme
                        ? "border border-pink-400 bg-pink-500 text-white shadow-pink-500/30"
                        : "border border-emerald-400 bg-gradient-to-r from-[#2BEF83] to-[#2488BA] text-slate-950 shadow-emerald-500/30 dark:text-slate-950"
                    }`}
                  >
                    +{item.pct}% ({item.count} vagas)
                  </div>
                )}

                {/* 3D Column Cylinder */}
                <div
                  className="relative w-full max-w-[26px] transition-all duration-300"
                  style={{ height: `${item.heightPct}%` }}
                >
                  {/* Top Cylinder Cap (3D Bevel) */}
                  <div
                    className={`absolute -top-2 left-0 right-0 h-3 rounded-full transition-all duration-300 ${
                      isSelected
                        ? isPurpleTheme
                          ? "bg-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.8)]"
                          : "bg-[#7ef5b6] shadow-[0_0_14px_rgba(43,239,131,0.9)]"
                        : isPurpleTheme
                          ? "bg-purple-300/60"
                          : "bg-[#2488BA]/60"
                    }`}
                  />

                  {/* Cylinder Column Body */}
                  <div
                    className={`h-full w-full rounded-b-lg transition-all duration-300 ${
                      isSelected
                        ? isPurpleTheme
                          ? "bg-gradient-to-t from-[#7C3AED] via-[#A855F7] to-[#EC4899] shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                          : "bg-gradient-to-t from-[#0E1928] via-[#2488BA] to-[#2BEF83] shadow-[0_0_22px_rgba(43,239,131,0.5)] dark:from-[#0E1928]"
                        : isPurpleTheme
                          ? "opacity-35 hover:opacity-75 bg-gradient-to-t from-purple-900/60 to-purple-500/60"
                          : "opacity-35 hover:opacity-75 bg-gradient-to-t from-slate-300 to-sky-400 dark:from-slate-800 dark:to-sky-600/70"
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span
                  className={`mt-2 text-[11px] font-medium transition-colors ${
                    isSelected
                      ? isPurpleTheme
                        ? "font-bold text-pink-400"
                        : "font-bold text-[#2BEF83] dark:text-[#2BEF83]"
                      : "text-slate-400 dark:text-slate-500"
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
            ? "border-purple-500/20 bg-gradient-to-b from-[#180e29]/90 to-[#0e071a]/95 shadow-[0_20px_50px_rgba(168,85,247,0.12)]"
            : "border-slate-200/80 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1928] dark:to-[#0A111C] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* Subtle top edge glow */}
        <div
          className={`pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full opacity-70 ${
            isPurpleTheme
              ? "bg-gradient-to-r from-transparent via-purple-500 to-transparent"
              : "bg-gradient-to-r from-transparent via-[#2488BA] to-transparent"
          }`}
        />

        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Vagas por Departamento
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribuição em tempo real das posições
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center justify-center gap-6 sm:flex-row sm:justify-around">
          {/* Orbital Futuristic Circular HUD Graphic */}
          <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
            {/* Ambient Background Glow */}
            <div
              className={`absolute h-36 w-36 rounded-full blur-2xl opacity-20 ${
                isPurpleTheme ? "bg-pink-500" : "bg-[#2BEF83]"
              }`}
            />

            {/* SVG Concentric Rings */}
            <svg
              className="h-full w-full -rotate-90 transform"
              viewBox="0 0 160 160"
            >
              {/* Outer Ring Track */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={isPurpleTheme ? "rgba(168,85,247,0.12)" : "rgba(36,136,186,0.12)"}
                strokeWidth="4"
              />
              {/* Outer Ring Glow Segment */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={isPurpleTheme ? "#EC4899" : "#2BEF83"}
                strokeWidth="5"
                strokeDasharray="440"
                strokeDashoffset="140"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />

              {/* Middle Ring Track */}
              <circle
                cx="80"
                cy="80"
                r="56"
                fill="none"
                stroke={isPurpleTheme ? "rgba(168,85,247,0.12)" : "rgba(36,136,186,0.12)"}
                strokeWidth="4"
              />
              {/* Middle Ring Glow Segment */}
              <circle
                cx="80"
                cy="80"
                r="56"
                fill="none"
                stroke={isPurpleTheme ? "#A855F7" : "#2488BA"}
                strokeWidth="5"
                strokeDasharray="350"
                strokeDashoffset="110"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />

              {/* Inner Ring Track */}
              <circle
                cx="80"
                cy="80"
                r="42"
                fill="none"
                stroke={isPurpleTheme ? "rgba(168,85,247,0.12)" : "rgba(36,136,186,0.12)"}
                strokeWidth="3"
              />
              {/* Inner Ring Glow Segment */}
              <circle
                cx="80"
                cy="80"
                r="42"
                fill="none"
                stroke={isPurpleTheme ? "#F472B6" : "#38BDF8"}
                strokeWidth="4"
                strokeDasharray="260"
                strokeDashoffset="90"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            {/* Central Number Display: Quantidade de Vagas em Aberto */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                {openCount > 0 ? openCount : 42}
              </span>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isPurpleTheme
                    ? "text-pink-400"
                    : "text-[#2BEF83] dark:text-[#2BEF83]"
                }`}
              >
                Vagas em Aberto
              </span>
            </div>
          </div>

          {/* Department Legend List */}
          <div className="flex flex-col gap-2.5">
            {departments.map((dep) => (
              <div
                key={dep.name}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: dep.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {dep.name}
                  </span>
                </div>
                <span className={`font-semibold ${dep.labelColor}`}>
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
