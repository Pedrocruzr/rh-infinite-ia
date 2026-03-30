"use client";

interface JobOpeningsStatsProps {
  total: number;
  open: number;
  paused: number;
  closed: number;
}

export function JobOpeningsStats({
  total,
  open,
  paused,
  closed,
}: JobOpeningsStatsProps) {
  const cards = [
    { label: "Total de vagas", value: total, tone: "sky" },
    { label: "Em aberto", value: open, tone: "emerald" },
    { label: "Pausadas", value: paused, tone: "amber" },
    { label: "Fechadas", value: closed, tone: "violet" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#102033]/72 ${
            card.tone === "sky"
              ? "dark:shadow-[inset_0_1px_0_rgba(56,189,248,0.12)]"
              : card.tone === "emerald"
                ? "dark:shadow-[inset_0_1px_0_rgba(52,211,153,0.12)]"
                : card.tone === "amber"
                  ? "dark:shadow-[inset_0_1px_0_rgba(251,191,36,0.12)]"
                  : "dark:shadow-[inset_0_1px_0_rgba(167,139,250,0.12)]"
          }`}
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
