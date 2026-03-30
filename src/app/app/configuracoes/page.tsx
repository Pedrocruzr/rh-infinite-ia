import Link from "next/link";
import {
  BadgeCheck,
  CreditCard,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1728_100%)] dark:text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 md:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              Central de configurações
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Configurações
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Área inicial de configurações da conta, com acesso rápido às seções principais sem alterar o fluxo funcional atual.
            </p>
          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-3 md:pt-1">
          <Link
            href="/app/configuracoes/perfil"
            className="group rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_24px_60px_rgba(14,165,233,0.12)] dark:border-white/10 dark:bg-[#102033]/72 dark:hover:border-sky-400/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">
              <UserRound className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">
              Perfil
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Atualize nome, empresa, documento e avatar da conta.
            </p>
          </Link>
          <Link
            href="/app/configuracoes/seguranca"
            className="group rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_24px_60px_rgba(14,165,233,0.12)] dark:border-white/10 dark:bg-[#102033]/72 dark:hover:border-sky-400/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">
              Segurança
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Gerencie senha, proteção e recuperação de acesso.
            </p>
          </Link>
          <Link
            href="/app/configuracoes/assinatura"
            className="group rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_24px_60px_rgba(14,165,233,0.12)] dark:border-white/10 dark:bg-[#102033]/72 dark:hover:border-sky-400/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">
              Assinatura
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Veja plano ativo, créditos, renovação e uso recente.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
