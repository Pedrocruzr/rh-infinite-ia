"use client";

import { useState } from "react";

export function ChangeCardButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    number: "",
    holderName: "",
    expiry: "", // format: MM/AA
    ccv: "",
    holderEmail: "",
    holderCpfCnpj: "",
    holderPhone: "",
    holderPostalCode: "",
    holderAddressNumber: "",
  });

  // Simple mask helpers
  function maskCardNumber(value: string) {
    const digits = value.replace(/\D/g, "");
    return digits
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function maskExpiry(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }

  function maskCpfCnpj(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      // CPF: 000.000.000-00
      return digits
        .replace(/(\d{3})(?=\d)/, "$1.")
        .replace(/(\d{3})(?=\d)/, "$1.")
        .replace(/(\d{3})(?=\d{2})$/, "$1-");
    } else {
      // CNPJ: 00.000.000/0000-00
      return digits
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
  }

  function maskCep(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  }

  function maskPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 10) {
      // (00) 0000-0000
      return digits
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{4})(\d)/g, "$1-$2");
    }
    // (00) 00000-0000
    return digits
      .slice(0, 11)
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/g, "$1-$2");
  }

  function handleChange(field: keyof typeof formData, value: string) {
    let masked = value;
    if (field === "number") masked = maskCardNumber(value);
    if (field === "expiry") masked = maskExpiry(value);
    if (field === "holderCpfCnpj") masked = maskCpfCnpj(value);
    if (field === "holderPostalCode") masked = maskCep(value);
    if (field === "holderPhone") masked = maskPhone(value);

    setFormData((prev) => ({ ...prev, [field]: masked }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const [month, year] = formData.expiry.split("/");
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        throw new Error("Data de expiração inválida (use o formato MM/AA).");
      }

      // Expire year in Asaas API must be 4 digits (e.g. 2026)
      const fullYear = `20${year}`;

      const response = await fetch("/api/account/subscription/update-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: formData.number.replace(/\s/g, ""),
          holderName: formData.holderName.trim(),
          expiryMonth: month,
          expiryYear: fullYear,
          ccv: formData.ccv,
          holderInfo: {
            name: formData.holderName.trim(),
            email: formData.holderEmail.trim().toLowerCase(),
            cpfCnpj: formData.holderCpfCnpj.replace(/\D/g, ""),
            postalCode: formData.holderPostalCode.replace(/\D/g, ""),
            addressNumber: formData.holderAddressNumber.trim(),
            phone: formData.holderPhone.replace(/\D/g, ""),
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao atualizar cartão de crédito.");
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        // Clear card info
        setFormData({
          number: "",
          holderName: "",
          expiry: "",
          ccv: "",
          holderEmail: "",
          holderCpfCnpj: "",
          holderPhone: "",
          holderPostalCode: "",
          holderAddressNumber: "",
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar cartão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-sky-400/30"
      >
        Trocar de cartão
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#102033]">
            <div className="p-6">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Atualizar Cartão de Crédito
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Altere os dados de cobrança da sua assinatura recorrente ativa.
              </p>

              {success ? (
                <div className="my-8 flex flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    ✓
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                    Cartão atualizado com sucesso!
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Suas próximas faturas cobrarão o novo cartão.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {error && (
                    <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João Silva"
                      value={formData.holderName}
                      onChange={(e) => handleChange("holderName", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      value={formData.number}
                      onChange={(e) => handleChange("number", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Validade
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        value={formData.expiry}
                        onChange={(e) => handleChange("expiry", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        CVC / CCV
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={formData.ccv}
                        onChange={(e) => handleChange("ccv", e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 dark:border-white/5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Dados de Faturamento do Titular
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          E-mail
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="email@exemplo.com"
                          value={formData.holderEmail}
                          onChange={(e) => handleChange("holderEmail", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          CPF / CNPJ
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="000.000.000-00"
                          value={formData.holderCpfCnpj}
                          onChange={(e) => handleChange("holderCpfCnpj", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Telefone
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="(00) 00000-0000"
                          value={formData.holderPhone}
                          onChange={(e) => handleChange("holderPhone", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          CEP
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="00000-000"
                          value={formData.holderPostalCode}
                          onChange={(e) => handleChange("holderPostalCode", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 mt-3">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Número do Endereço
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 123 ou AP 42"
                        value={formData.holderAddressNumber}
                        onChange={(e) => handleChange("holderAddressNumber", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm transition focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-white/5"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60 dark:bg-sky-500 dark:hover:bg-sky-400"
                    >
                      {loading ? "Atualizando..." : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
