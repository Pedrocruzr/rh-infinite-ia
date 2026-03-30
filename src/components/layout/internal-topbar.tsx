"use client";

import { usePathname } from "next/navigation";

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
};

export function InternalTopbar({
  fullName,
  companyName,
  accountStatus,
  planName,
  creditBalance,
  avatarUrl,
}: InternalTopbarProps) {
  const pathname = usePathname();
  const hideTopbar = pathname.startsWith("/app/agentes/");

  if (hideTopbar) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-neutral-200 bg-white/95 px-6 py-4 backdrop-blur-xl dark:border-[#122033]/80 dark:bg-[#07111f]/60">
      <GlobalWorkspaceSearch />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserAccountMenu
          fullName={fullName}
          companyName={companyName}
          accountStatus={accountStatus}
          planName={planName}
          creditBalance={creditBalance}
          avatarUrl={avatarUrl}
        />
      </div>
    </div>
  );
}
