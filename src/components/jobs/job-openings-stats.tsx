"use client";

import { Briefcase, Search, PauseCircle, CheckCircle2 } from "lucide-react";

interface JobOpeningsStatsProps {
  total: number;
  open: number;
  paused: number;
  closed: number;
  isPurpleTheme?: boolean;
}

export function JobOpeningsStats({
  total,
  open,
  paused,
  closed,
  isPurpleTheme = false,
}: JobOpeningsStatsProps) {
  const cards = [
    {
      label: "Total de vagas",
      value: total,
      subtext: `${total} cadastradas no sistema`,
      icon: Briefcase,
      iconBg: isPurpleTheme
        ? "bg-purple-500/25 text-pink-300 border border-purple-400/40"
        : "bg-sky-500/15 text-sky-500 border border-sky-500/30 dark:bg-sky-400/10 dark:text-sky-300",
      topGlow: isPurpleTheme
        ? "via-pink-500"
        : "via-[#2488BA]",
    },
    {
      label: "Em aberto",
      value: open,
      subtext: `${open} ativas para candidatura`,
      icon: Search,
      iconBg: isPurpleTheme
        ? "bg-pink-500/25 text-pink-200 border border-pink-400/40"
        : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-400/10 dark:text-[#2BEF83]",
      topGlow: isPurpleTheme
        ? "via-pink-500"
        : "via-[#2BEF83]",
    },
    {
      label: "Pausadas",
      value: paused,
      subtext: `${paused} em espera temporária`,
      icon: PauseCircle,
      iconBg: isPurpleTheme
        ? "bg-purple-400/25 text-purple-200 border border-purple-400/40"
        : "bg-amber-500/15 text-amber-600 border border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-300",
      topGlow: isPurpleTheme
        ? "via-purple-400"
        : "via-amber-400",
    },
    {
      label: "Fechadas",
      value: closed,
      subtext: `${closed} contratações concluídas`,
      icon: CheckCircle2,
      iconBg: isPurpleTheme
        ? "bg-rose-500/25 text-pink-200 border border-rose-400/40"
        : "bg-violet-500/15 text-violet-600 border border-violet-500/30 dark:bg-violet-400/10 dark:text-violet-300",
      topGlow: isPurpleTheme
        ? "via-rose-400"
        : "via-violet-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const IconComponent = card.icon;

        return (
          <div
            key={card.label}
            className={`group relative overflow-hidden rounded-[1.75rem] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
              isPurpleTheme
                ? "border-purple-500/30 bg-[#160d26] shadow-[0_14px_40px_rgba(168,85,247,0.15)] hover:border-pink-500/50"
                : "border-slate-200/80 bg-white/90 shadow-[0_14px_40px_rgba(15,23,42,0.05)] hover:border-slate-300 dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1928] dark:to-[#0A111C] dark:shadow-[0_14px_40px_rgba(0,0,0,0.4)] dark:hover:border-white/20"
            }`}
          >
            {/* Top rim lighting */}
            <div
              className={`pointer-events-none absolute inset-x-6 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent ${card.topGlow} to-transparent opacity-80`}
            />

            <div className="flex items-center gap-4">
              {/* Circular tactile embossed icon */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105 ${card.iconBg}`}
              >
                <IconComponent className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                {/* Legible text: Crisp white in purple and dark mode */}
                <p
                  className={`text-xs font-semibold ${
                    isPurpleTheme ? "text-pink-200" : "text-slate-600 dark:text-slate-200"
                  }`}
                >
                  {card.label}
                </p>
                <p
                  className={`mt-0.5 text-2xl font-black tracking-tight ${
                    isPurpleTheme ? "text-white" : "text-slate-950 dark:text-white"
                  }`}
                >
                  {card.value}
                </p>
                <p
                  className={`mt-0.5 truncate text-[11px] font-medium ${
                    isPurpleTheme ? "text-purple-200/80" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {card.subtext}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
