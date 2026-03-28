"use client";

import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";

type UserAccountMenuProps = {
  fullName: string;
  companyName: string;
  accountStatus: string;
  planName: string;
  creditBalance: number;
  avatarUrl?: string | null;
};

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return (fullName.slice(0, 2) || "U").toUpperCase();
}

function formatCredits(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function UserAccountMenu({
  fullName,
  companyName,
  accountStatus,
  planName,
  creditBalance,
  avatarUrl,
}: UserAccountMenuProps) {
  const initials = getInitials(fullName);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-white text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Minha conta
            </p>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Status da conta
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {accountStatus}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Nome da empresa
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {companyName || "Empresa não informada"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Perfil
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {fullName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Assinatura
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {planName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Saldo de crédito
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {formatCredits(creditBalance)}
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <SignOutButton />
          </div>
        </div>
      ) : null}
    </div>
  );
}
