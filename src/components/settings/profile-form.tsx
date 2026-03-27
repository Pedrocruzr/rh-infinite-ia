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
};

export function ProfileForm({
  userId,
  email,
  initialFullName,
  initialAvatarUrl,
  initialCompanyName,
}: ProfileFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [fullName, setFullName] = useState(initialFullName);
  const [companyName, setCompanyName] = useState(initialCompanyName);
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
      className="rounded-3xl border bg-card p-8 shadow-sm"
    >
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Dados do perfil</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Atualize os dados básicos da sua conta.
          </p>
        </div>

        <div className="grid gap-6">
          <div>
            <label htmlFor="full_name" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-neutral-400"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label htmlFor="company_name" className="text-sm font-medium">
              Nome da empresa
            </label>
            <input
              id="company_name"
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-neutral-400"
              placeholder="Nome da empresa"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="mt-2 h-12 w-full rounded-xl border bg-neutral-50 px-4 text-sm text-neutral-500 outline-none"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium">Foto do perfil</p>

            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full border object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-neutral-100 text-lg font-semibold text-neutral-700">
                  {getInitials()}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Avatar</p>
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-neutral-50"
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
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: PNG, JPG, JPEG e WEBP.
                </p>
                <p className="text-xs text-neutral-500">
                  {avatarFile ? avatarFile.name : "Nenhum arquivo selecionado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </form>
  );
}
