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
      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
      >
        <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Alterar senha
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Atualize sua senha com segurança.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-100">Nova senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua nova senha"
              className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-100">Confirmar nova senha</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repita sua nova senha"
              className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              {success}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              {loading ? "Atualizando..." : "Atualizar senha"}
            </button>
          </div>
        </div>
      </form>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Recuperação de acesso
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Se preferir, você também pode redefinir sua senha pelo fluxo de recuperação.
        </p>

        <div className="mt-5">
          <Link
            href="/esqueci-senha"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
          >
            Esqueci minha senha
          </Link>
        </div>
      </section>
    </div>
  );
}
