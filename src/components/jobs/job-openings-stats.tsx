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
    { label: "Total de vagas", value: total },
    { label: "Em aberto", value: open },
    { label: "Pausadas", value: paused },
    { label: "Fechadas", value: closed },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
