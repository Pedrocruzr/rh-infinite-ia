"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { validatePasswordStrength } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/client";

export default function ResetarSenhaPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      if (password !== confirmPassword) {
        throw new Error("As senhas precisam ser iguais.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw new Error(
          "Não foi possível redefinir a senha. Abra o link do e-mail novamente."
        );
      }

      router.replace(
        "/login?message=Senha redefinida com sucesso. Faça login para continuar."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível redefinir a senha."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <div className="w-full rounded-3xl border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            Redefinir senha
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Digite sua nova senha para concluir o processo.
          </p>

          <form onSubmit={handleUpdate} className="mt-6 space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Nova senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Confirmar nova senha</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
                required
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-4 inline-flex text-sm text-primary hover:underline"
          >
            Voltar para login
          </Link>
        </div>
      </section>
    </main>
  );
}
