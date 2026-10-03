"use client";

import { useEffect, useMemo, useState } from "react";
import { UserMinus, Download, Sparkles, Palette, UserPlus, RefreshCw } from "lucide-react";

import type {
  TurnoverEmployee,
  TurnoverEmployeePayload,
  TurnoverExitPayload,
  TurnoverFilters as TurnoverFiltersType,
} from "@/lib/turnover/types";
import { computeTurnoverMetrics } from "@/lib/turnover/calculations";
import { TurnoverStats } from "./turnover-stats";
import { TurnoverAnalytics } from "./turnover-analytics";
import { TurnoverFiltersBar } from "./turnover-filters";
import { TurnoverTable } from "./turnover-table";
import { TurnoverEmployeeDialog } from "./turnover-employee-dialog";
import { TurnoverExitDialog } from "./turnover-exit-dialog";

interface TurnoverClientProps {
  initialEmployees: TurnoverEmployee[];
}

const DEFAULT_FILTERS: TurnoverFiltersType = {
  search: "",
  departamento: "todos",
  status: "todos",
  periodoMes: 0,
  ano: 2026,
};

export function TurnoverClient({ initialEmployees }: TurnoverClientProps) {
  const [employees, setEmployees] = useState<TurnoverEmployee[]>(initialEmployees);
  const [filters, setFilters] = useState<TurnoverFiltersType>(DEFAULT_FILTERS);
  const [isPurpleTheme, setIsPurpleTheme] = useState(false);

  // Modais
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<TurnoverEmployee | null>(null);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitingEmployee, setExitingEmployee] = useState<TurnoverEmployee | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Se a lista inicial veio vazia, tenta buscar da API
  useEffect(() => {
    if (initialEmployees.length === 0) {
      void refreshEmployees();
    }
  }, [initialEmployees.length]);

  async function refreshEmployees() {
    setLoading(true);
    try {
      const res = await fetch("/api/turnover", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.employees) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error("Erro ao buscar colaboradores:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filtragem da lista para exibição na tabela
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Busca por nome, cargo ou matrícula
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = emp.nome.toLowerCase().includes(q);
        const matchesCargo = emp.cargo.toLowerCase().includes(q);
        const matchesMatricula = emp.matricula.toLowerCase().includes(q);
        if (!matchesName && !matchesCargo && !matchesMatricula) return false;
      }

      // Filtro de departamento
      if (filters.departamento !== "todos" && emp.departamento !== filters.departamento) {
        return false;
      }

      // Filtro de status
      if (filters.status === "ativos" && emp.data_desligamento) return false;
      if (filters.status === "desligados" && !emp.data_desligamento) return false;

      // Filtro de mês (admitido ou desligado no mês)
      if (filters.periodoMes > 0) {
        const padMonth = String(filters.periodoMes).padStart(2, "0");
        const inAdmissao = emp.data_admissao.startsWith(`${filters.ano}-${padMonth}`);
        const inDesligamento = emp.data_desligamento?.startsWith(`${filters.ano}-${padMonth}`);
        if (!inAdmissao && !inDesligamento) {
          // Se for filtro de mês específico e o funcionário estava ativo nesse mês
          const adm = new Date(emp.data_admissao);
          const des = emp.data_desligamento ? new Date(emp.data_desligamento) : null;
          const target = new Date(filters.ano, filters.periodoMes - 1, 28);
          if (adm > target) return false;
          if (des && des < new Date(filters.ano, filters.periodoMes - 1, 1)) return false;
        }
      }

      return true;
    });
  }, [employees, filters]);

  // Cálculo das métricas do motor
  const metrics = useMemo(() => {
    return computeTurnoverMetrics(employees, filters.ano, filters.periodoMes);
  }, [employees, filters]);

  // Abertura de modais
  function handleOpenCreate() {
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  }

  function handleOpenEdit(emp: TurnoverEmployee) {
    setEditingEmployee(emp);
    setIsEmployeeModalOpen(true);
  }

  function handleOpenExit(emp: TurnoverEmployee) {
    setExitingEmployee(emp);
    setIsExitModalOpen(true);
  }

  // Handlers de mutação
  async function handleSubmitEmployee(values: TurnoverEmployeePayload) {
    setSubmitting(true);
    try {
      const isEditing = Boolean(editingEmployee?.id);
      const url = "/api/turnover";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing ? { id: editingEmployee?.id, ...values } : values;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar colaborador.");
      }

      setIsEmployeeModalOpen(false);
      setEditingEmployee(null);
      await refreshEmployees();
      showToast(isEditing ? "Colaborador atualizado com sucesso!" : "Colaborador cadastrado com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao salvar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmExit(id: string, values: TurnoverExitPayload) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/turnover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_exit",
          id,
          ...values,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar desligamento.");
      }

      setIsExitModalOpen(false);
      setExitingEmployee(null);
      await refreshEmployees();
      showToast("Desligamento registrado com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao registrar saída.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEmployee(id: string) {
    if (!confirm("Tem certeza que deseja remover este colaborador?")) return;

    try {
      const res = await fetch(`/api/turnover?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir.");
      await refreshEmployees();
      showToast("Colaborador removido.");
    } catch (err: any) {
      alert(err.message || "Erro ao remover.");
    }
  }

  // Exportar dados como CSV
  function handleExportCsv() {
    if (filteredEmployees.length === 0) {
      alert("Nenhum dado para exportar.");
      return;
    }

    const headers = [
      "Matricula",
      "Nome",
      "Cargo",
      "Departamento",
      "Salario",
      "Data Admissao",
      "Data Desligamento",
      "Tipo Desligamento",
      "Motivo",
    ];

    const rows = filteredEmployees.map((emp) => [
      `"${emp.matricula}"`,
      `"${emp.nome}"`,
      `"${emp.cargo}"`,
      `"${emp.departamento}"`,
      emp.salario,
      `"${emp.data_admissao}"`,
      `"${emp.data_desligamento || ""}"`,
      `"${emp.tipo_desligamento || ""}"`,
      `"${emp.motivo_especifico || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `turnover_colaboradores_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Toast Notificação */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900/95 px-5 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md border border-white/10 animate-fade-in flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            {toastMessage}
          </div>
        )}

        {/* Header Principal */}
        <section
          className={`rounded-[2rem] border p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 ${
            isPurpleTheme
              ? "border-purple-500/20 bg-gradient-to-b from-[#180e29]/90 to-[#0e071a]/95 shadow-[0_24px_80px_rgba(168,85,247,0.15)]"
              : "border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#102033]/72 dark:shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] transition-all duration-300 ${
                  isPurpleTheme
                    ? "border-pink-500/30 bg-pink-500/10 text-pink-300"
                    : "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Retenção & People Analytics
              </div>
              <h1
                className={`mt-6 text-4xl font-semibold tracking-[-0.05em] md:text-5xl pb-2 leading-tight overflow-visible transition-all duration-300 ${
                  isPurpleTheme
                    ? "bg-gradient-to-r from-purple-400 via-pink-400 to-rose-300 bg-clip-text text-transparent"
                    : "text-slate-950 dark:text-white"
                }`}
              >
                Painel de Turnover
              </h1>
              <p
                className={`mt-4 max-w-2xl text-base leading-7 md:text-lg transition-colors duration-300 ${
                  isPurpleTheme ? "text-white" : "text-slate-600 dark:text-white"
                }`}
              >
                Acompanhe o Turnover Geral, Desligamento, Voluntário e Early Turnover com gráficos 3D e cálculo financeiro do custo de rotatividade.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPurpleTheme((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all duration-300 shadow-sm ${
                  isPurpleTheme
                    ? "border-pink-500/50 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-pink-500/30"
                    : "border-slate-200 bg-white/90 text-slate-700 hover:border-purple-300 hover:text-purple-600 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-purple-400/40"
                }`}
                title="Alternar entre paleta oficial e tema Roxo/Rosa"
              >
                <Palette className="h-4 w-4" />
                {isPurpleTheme ? "Paleta Oficial" : "Tema Roxo / Rosa"}
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950"
              >
                <UserPlus className="h-4 w-4" />
                Novo Colaborador
              </button>
            </div>
          </div>
        </section>

        {/* KPIs principais */}
        <TurnoverStats metrics={metrics} isPurpleTheme={isPurpleTheme} />

        {/* Gráficos Analíticos 3D e Diagnóstico */}
        <TurnoverAnalytics metrics={metrics} isPurpleTheme={isPurpleTheme} />

        {/* Filtros da Tabela */}
        <TurnoverFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          onOpenNewEmployee={handleOpenCreate}
          onOpenExitDialog={() => {
            const active = employees.find((e) => !e.data_desligamento);
            if (active) handleOpenExit(active);
            else handleOpenCreate();
          }}
          onExportCsv={handleExportCsv}
          isPurpleTheme={isPurpleTheme}
        />

        {/* Tabela de Colaboradores */}
        <TurnoverTable
          employees={filteredEmployees}
          onEdit={handleOpenEdit}
          onExit={handleOpenExit}
          onDelete={handleDeleteEmployee}
          isPurpleTheme={isPurpleTheme}
        />
      </div>

      {/* Modais */}
      <TurnoverEmployeeDialog
        open={isEmployeeModalOpen}
        item={editingEmployee}
        submitting={submitting}
        isPurpleTheme={isPurpleTheme}
        onOpenChange={setIsEmployeeModalOpen}
        onSubmit={handleSubmitEmployee}
      />

      <TurnoverExitDialog
        open={isExitModalOpen}
        employee={exitingEmployee}
        submitting={submitting}
        isPurpleTheme={isPurpleTheme}
        onOpenChange={setIsExitModalOpen}
        onSubmit={handleConfirmExit}
      />
    </>
  );
}
