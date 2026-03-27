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

export function UserAccountMenu({
  fullName,
  companyName,
  accountStatus,
  planName,
  creditBalance,
  avatarUrl,
}: UserAccountMenuProps) {
  const initials = getInitials(fullName);

  return (
    <details className="group relative">
      <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-white text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </summary>

      <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <div className="border-b border-neutral-200 px-5 py-4">
          <p className="text-base font-semibold text-neutral-900">Minha conta</p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Status da conta
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-900">
              {accountStatus}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Nome da empresa
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-900">
              {companyName || "Empresa não informada"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Perfil
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-900">
              {fullName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Assinatura
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-900">
              {planName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Saldo de crédito
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-900">
              {creditBalance}
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-5 py-4">
          <SignOutButton />
        </div>
      </div>
    </details>
  );
}
