"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { validatePasswordStrength } from "@/lib/auth/password";

export function SecurityForm() {
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccess("");
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
        throw updateError;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess("Senha atualizada com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">Alterar senha</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize sua senha com segurança.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Nova senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua nova senha"
              className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Confirmar nova senha</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repita sua nova senha"
              className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Atualizando..." : "Atualizar senha"}
            </button>
          </div>
        </div>
      </form>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">Recuperação de acesso</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Se preferir, você também pode redefinir sua senha pelo fluxo de recuperação.
        </p>

        <div className="mt-5">
          <Link
            href="/esqueci-senha"
            className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
          >
            Esqueci minha senha
          </Link>
        </div>
      </section>
    </div>
  );
}
