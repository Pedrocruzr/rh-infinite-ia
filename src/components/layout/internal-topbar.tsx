"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CircleHelp,
  FileText,
  Menu,
  Scale,
  Settings2,
  X,
} from "lucide-react";

import { UserAccountMenu } from "@/components/auth/user-account-menu";
import { GlobalWorkspaceSearch } from "@/components/search/global-workspace-search";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type InternalTopbarProps = {
  fullName: string;
  companyName: string;
  accountStatus: string;
  planName: string;
  creditBalance: number;
  avatarUrl: string | null;
  planCode: string;
  email: string;
};

export function InternalTopbar({
  fullName,
  companyName,
  accountStatus,
  planName,
  creditBalance,
  avatarUrl,
  planCode,
  email,
}: InternalTopbarProps) {
  const pathname = usePathname();
  const hideTopbar = pathname.startsWith("/app/agentes/");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  if (hideTopbar) {
    return null;
  }

  const navLinkClass =
    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-[#0d1a2b] dark:hover:text-neutral-100";

  const navigation = [
    { href: "/app/agentes", label: "Agentes", icon: Bot },
    { href: "/app/recrutador/assessments", label: "Relatórios Stackers", icon: FileText },
    { href: "/app/painel-de-vagas", label: "Painel de Vagas", icon: BriefcaseBusiness },
    { href: "/app/agentes/clt-ia", label: "CLT IA", icon: Scale },
    { href: "/app/tutorial", label: "Tutorial", icon: BookOpen },
    { href: "/app/suporte", label: "Suporte", icon: CircleHelp },
    { href: "/app/configuracoes", label: "Configurações", icon: Settings2 },
  ] as const;

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4 dark:border-[#122033]/80 dark:bg-[#07111f]/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 shadow-sm transition hover:bg-neutral-50 dark:border-white/12 dark:bg-white/6 dark:text-slate-100 dark:hover:bg-white/10 dark:shadow-[0_10px_30px_rgba(2,6,23,0.22)]"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="min-w-0 flex-1 sm:flex-none">
        <GlobalWorkspaceSearch />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <ThemeToggle />
          <UserAccountMenu
            fullName={fullName}
            companyName={companyName}
            accountStatus={accountStatus}
            planName={planName}
            creditBalance={creditBalance}
            avatarUrl={avatarUrl}
            planCode={planCode}
            email={email}
          />
        </div>
      </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/45 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative h-full w-[58vw] max-w-[220px] overflow-y-auto border-r border-neutral-200 bg-white/92 shadow-2xl backdrop-blur-xl dark:border-[#24405f] dark:bg-[#0d1d31]/88">
            <div className="border-b border-neutral-200 px-3 pb-1 pt-1.5 dark:border-[#24405f]">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 shadow-sm transition hover:bg-neutral-50 dark:border-white/14 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mt-1 flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-2 py-2 dark:border-white/14 dark:bg-[#13263d]">
                <img
                  src="/brand/logomark-dark.png"
                  alt="Gestão Stackers"
                  className="block h-auto w-full object-contain dark:hidden"
                />
                <img
                  src="/brand/logomark-light.png"
                  alt="Gestão Stackers"
                  className="hidden h-auto w-full object-contain dark:block"
                />
              </div>
            </div>

            <nav className="space-y-1 px-2 py-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
