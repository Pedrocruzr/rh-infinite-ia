"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  userId: string;
  email: string;
  initialFullName: string;
  initialAvatarUrl: string;
};

export function ProfileForm({
  userId,
  email,
  initialFullName,
  initialAvatarUrl,
}: ProfileFormProps) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function uploadAvatarIfNeeded() {
    if (!selectedFile) {
      return avatarUrl.trim() || null;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const finalAvatarUrl = await uploadAvatarIfNeeded();

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          avatar_url: finalAvatarUrl,
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      if (finalAvatarUrl) {
        setAvatarUrl(finalAvatarUrl);
      }

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess("Perfil atualizado com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">Dados do perfil</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize os dados básicos da sua conta.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Nome</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Seu nome"
              className="h-11 rounded-xl border bg-background px-3 outline-none transition focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">E-mail</span>
            <input
              value={email}
              disabled
              className="h-11 rounded-xl border bg-muted px-3 text-muted-foreground outline-none"
            />
          </label>

          <div className="rounded-2xl border bg-background p-4">
            <p className="mb-3 text-sm font-medium">Foto do perfil</p>

            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="mb-4 h-20 w-20 rounded-full border object-cover"
              />
            ) : (
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border bg-muted text-xs text-muted-foreground">
                Sem foto
              </div>
            )}

            <div className="flex flex-col gap-3 text-sm">
              <span className="font-medium">Enviar nova foto</span>

              <input
                ref={fileInputRef}
                id="avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedFile(file);
                }}
                className="hidden"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted"
                >
                  Escolher foto
                </label>

                <span className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
                </span>
              </div>

              <span className="text-xs text-muted-foreground">
                Formatos aceitos: PNG, JPG, JPEG e WEBP.
              </span>
            </div>
          </div>

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
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
