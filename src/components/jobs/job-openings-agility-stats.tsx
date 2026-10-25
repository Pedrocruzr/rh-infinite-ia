"use client";

import { useMemo } from "react";
import type { JobOpening } from "@/lib/jobs/types";
import { computeTimeMetrics } from "@/lib/jobs/agility-metrics";
import { Timer, Zap, Compass, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

interface JobOpeningsAgilityStatsProps {
  items: JobOpening[];
  isPurpleTheme?: boolean;
}

export function JobOpeningsAgilityStats({
  items = [],
  isPurpleTheme = false,
}: JobOpeningsAgilityStatsProps) {
  const metrics = useMemo(() => computeTimeMetrics(items), [items]);

  const cards = [
    {
      title: "Tempo de Fechamento (Time to Fill)",
      value: `${metrics.timeToFillDays} ${metrics.timeToFillDays === 1 ? "dia" : "dias"}`,
      statusText: metrics.timeToFillLabel,
      subtext: metrics.timeToFillSubtext,
      badgeColor: metrics.timeToFillBadgeColor,
      status: metrics.timeToFillStatus,
      icon: Timer,
      iconBg: isPurpleTheme
        ? "bg-purple-500/20 text-pink-300 border border-purple-400/30"
        : "bg-sky-500/15 text-sky-400 border border-sky-500/30",
      rimGlow:
        metrics.timeToFillStatus === "gargalo"
          ? "via-red-500"
          : metrics.timeToFillStatus === "atencao"
            ? "via-amber-400"
            : isPurpleTheme
              ? "via-pink-500"
              : "via-[#2BEF83]",
      footnote:
        metrics.timeToFillClosedCount > 0
          ? `Baseado em ${metrics.timeToFillClosedCount} contratações concluídas`
          : "Média calculada sobre o fluxo de vagas",
    },
    {
      title: "Tempo de Contratação (Time to Hire)",
      value: `${metrics.timeToHireDays} ${metrics.timeToHireDays === 1 ? "dia" : "dias"}`,
      statusText: metrics.timeToHireLabel,
      subtext: metrics.timeToHireSubtext,
      badgeColor: metrics.timeToHireBadgeColor,
      status: metrics.timeToHireStatus,
      icon: Zap,
      iconBg: isPurpleTheme
        ? "bg-pink-500/20 text-pink-200 border border-pink-400/30"
        : "bg-emerald-500/15 text-emerald-400 dark:text-[#2BEF83] border border-emerald-500/30",
      rimGlow:
        metrics.timeToHireStatus === "lento"
          ? "via-red-500"
          : metrics.timeToHireStatus === "padrao"
            ? "via-sky-400"
            : isPurpleTheme
              ? "via-pink-400"
              : "via-[#2BEF83]",
      footnote:
        metrics.timeToHireSampleCount > 0
          ? `${metrics.timeToHireSampleCount} vagas com 1º contato registrado`
          : "Mede da triagem à aceitação da proposta",
    },
    {
      title: "Origem Mais Eficiente (Top Source)",
      value: metrics.topSourceChannel,
      statusText: `${metrics.topSourcePct}% das vagas`,
      subtext: "Canal líder em captação de talentos",
      badgeColor: "text-purple-300 bg-purple-500/15 border-purple-500/30",
      status: "agil",
      icon: Compass,
      iconBg: isPurpleTheme
        ? "bg-purple-600/25 text-pink-200 border border-purple-500/40"
        : "bg-purple-500/15 text-purple-400 border border-purple-500/30",
      rimGlow: isPurpleTheme ? "via-purple-400" : "via-purple-500",
      footnote: "Onde concentrar seu orçamento de anúncios",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const IconComponent = card.icon;

        return (
          <div
            key={card.title}
            className={`group relative overflow-hidden rounded-[1.75rem] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              isPurpleTheme
                ? "border-purple-500/25 bg-[#160d26]/90 shadow-[0_12px_35px_rgba(168,85,247,0.12)] hover:border-pink-500/40"
                : "border-slate-200/80 bg-white/90 shadow-[0_12px_35px_rgba(15,23,42,0.04)] hover:border-slate-300 dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1928] dark:to-[#0A111C] dark:shadow-[0_12px_35px_rgba(0,0,0,0.35)] dark:hover:border-white/20"
            }`}
          >
            {/* Top rim glow */}
            <div
              className={`pointer-events-none absolute inset-x-6 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent ${card.rimGlow} to-transparent opacity-80`}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105 ${card.iconBg}`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h4
                    className={`text-xs font-semibold ${
                      isPurpleTheme ? "text-pink-200/90" : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {card.title}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-black tracking-tight ${
                        isPurpleTheme ? "text-white" : "text-slate-950 dark:text-white"
                      }`}
                    >
                      {card.value}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status pill badge with semáforo indicator */}
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${card.badgeColor}`}
              >
                {card.status === "gargalo" || card.status === "lento" ? (
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                ) : card.status === "atencao" ? (
                  <AlertCircle className="h-3 w-3 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                )}
                <span>{card.statusText}</span>
              </div>
            </div>

            <div className="mt-3.5 border-t border-slate-100 pt-3 dark:border-white/5">
              <p
                className={`text-xs font-medium ${
                  isPurpleTheme ? "text-purple-200" : "text-slate-700 dark:text-slate-200"
                }`}
              >
                {card.subtext}
              </p>
              <p
                className={`mt-0.5 text-[10px] ${
                  isPurpleTheme ? "text-purple-300/60" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {card.footnote}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
