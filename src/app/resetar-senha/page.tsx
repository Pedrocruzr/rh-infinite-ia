"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#020817_0%,#07111f_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:88px_88px]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10 lg:px-8">
        <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.32)] backdrop-blur-xl md:p-10">
          <div className="w-full max-w-xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-white">
              Redefinir senha
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Digite sua nova senha para concluir o processo com segurança.
            </p>

            <form onSubmit={handleUpdate} className="mt-8 space-y-5">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-100">Nova senha</span>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua nova senha"
                  className="h-12 rounded-2xl border-white/12 bg-white/8 px-4 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-100">Confirmar nova senha</span>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="h-12 rounded-2xl border-white/12 bg-white/8 px-4 text-slate-100 placeholder:text-slate-400"
                  required
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="h-12 w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
              >
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>

            <Link
              href="/login"
              className="mt-6 inline-flex text-sm text-slate-300 hover:text-white hover:underline"
            >
              Voltar para login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
