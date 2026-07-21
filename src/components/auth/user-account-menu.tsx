"use client";

import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/client";

type UserAccountMenuProps = {
  fullName: string;
  companyName: string;
  accountStatus: string;
  planName: string;
  creditBalance: number;
  avatarUrl?: string | null;
  planCode: string;
  email: string;
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
  planCode,
  email,
}: UserAccountMenuProps) {
  const initials = getInitials(fullName);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (err) {
        console.error("Erro ao obter user no client:", err);
      }
    }
    loadUser();
  }, []);

  const handleTogglePlan = (newPlan: string) => {
    sessionStorage.setItem("simulated_plan_code", newPlan);
    document.cookie = `simulated_plan_code=${newPlan}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const isProfilePlan = planCode === "perfil_comportamental" || planCode.startsWith("perfil_");
  const activeEmail = (userEmail || email || "").trim().toLowerCase();
  const isAdmin = activeEmail === "pedrocruzr@gmail.com";

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
        <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-[#1d2b3d] dark:bg-[#0c1624]">
          <div className="border-b border-neutral-200 px-5 py-4 dark:border-[#1d2b3d]">
            <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Minha conta
            </p>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-[#7f8ea3]">
                Status da conta
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {accountStatus}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-[#7f8ea3]">
                Nome da empresa
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {companyName || "Empresa não informada"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-[#7f8ea3]">
                Perfil
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {fullName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-[#7f8ea3]">
                Assinatura
              </p>
              {isAdmin ? (
                <div className="mt-1 flex flex-col">
                  <select
                    value={planCode?.startsWith("perfil_") ? "perfil_start" : (planCode || "start")}
                    onChange={(e) => handleTogglePlan(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs font-semibold text-neutral-900 shadow-sm focus:border-sky-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    <option value="start">Completo (Infinity)</option>
                    <option value="perfil_start">Teste de Perfil Comportamental</option>
                    <option value="recrutamento_selecao">Recrutamento & Seleção</option>
                  </select>
                </div>
              ) : (
                <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {planName}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-[#7f8ea3]">
                {isProfilePlan ? "Saldo de Avaliações" : "Saldo de crédito"}
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {isProfilePlan ? formatCredits(Math.floor(creditBalance / 3)) : formatCredits(creditBalance)}
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-200 px-5 py-4 dark:border-[#1d2b3d] dark:bg-[#0a1320]">
            <SignOutButton />
          </div>
        </div>
      ) : null}
    </div>
  );
}
