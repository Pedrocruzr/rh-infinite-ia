"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  userId: string;
  email: string;
  initialFullName: string;
  initialAvatarUrl: string;
  initialCompanyName: string;
  initialDocumentNumber: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatDocument(value: string) {
  const digits = onlyDigits(value);

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

export function ProfileForm({
  userId,
  email,
  initialFullName,
  initialAvatarUrl,
  initialCompanyName,
  initialDocumentNumber,
}: ProfileFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [fullName, setFullName] = useState(initialFullName);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [documentNumber, setDocumentNumber] = useState(
    formatDocument(initialDocumentNumber)
  );
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function getInitials() {
    const source = (fullName || email || "U").trim();
    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);

    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  }

  async function uploadAvatar(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const normalizedDocument = onlyDigits(documentNumber);
      if (
        normalizedDocument &&
        normalizedDocument.length !== 11 &&
        normalizedDocument.length !== 14
      ) {
        throw new Error("Informe um CPF ou CNPJ válido.");
      }

      let finalAvatarUrl =
        initialAvatarUrl && initialAvatarUrl.trim()
          ? initialAvatarUrl.trim()
          : null;

      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(avatarFile);
      } else if (avatarUrl?.trim()) {
        finalAvatarUrl = avatarUrl.trim();
      } else {
        finalAvatarUrl = null;
      }

      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim() || null,
          companyName: companyName.trim() || null,
          documentNumber: normalizedDocument || null,
          avatarUrl: finalAvatarUrl,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao atualizar perfil.");
      }

      setSuccess("Perfil atualizado com sucesso.");
      setAvatarUrl(finalAvatarUrl ?? "");
      setAvatarFile(null);
      setDocumentNumber(formatDocument(normalizedDocument));
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar perfil.";
      setError(message);
      console.error("PROFILE_UPDATE_ERROR:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Dados do perfil
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Atualize os dados básicos da sua conta.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="full_name" className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Nome
            </label>
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label htmlFor="company_name" className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Nome da empresa
            </label>
            <input
              id="company_name"
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              placeholder="Nome da empresa"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="document_number" className="text-sm font-medium text-slate-800 dark:text-slate-100">
              CPF ou CNPJ
            </label>
            <input
              id="document_number"
              type="text"
              inputMode="numeric"
              value={documentNumber}
              onChange={(event) => setDocumentNumber(formatDocument(event.target.value))}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400/40 dark:focus:ring-sky-400/10"
              placeholder="Digite seu CPF ou CNPJ"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Esse dado é necessário para gerar cobranças no Asaas.
            </p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-800 dark:text-slate-100">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 text-sm text-slate-500 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
            />
          </div>

          <div className="md:col-span-2 rounded-[1.75rem] border border-slate-200/80 bg-slate-50/70 p-6 dark:border-white/10 dark:bg-white/5">
            <p className="mb-4 text-sm font-medium text-slate-800 dark:text-slate-100">
              Foto do perfil
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full border border-slate-200 object-cover dark:border-white/10"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white">
                  {getInitials()}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Avatar
                </p>
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
                >
                  Escolher foto
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formatos aceitos: PNG, JPG, JPEG e WEBP.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {avatarFile ? avatarFile.name : "Nenhum arquivo selecionado"}
                </p>
              </div>
            </div>
          </div>
        </div>

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

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </form>
  );
}
