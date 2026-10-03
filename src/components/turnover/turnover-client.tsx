"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Sparkles, Palette, UserPlus } from "lucide-react";

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
import { TurnoverExportModal } from "./turnover-export-modal";

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

const CACHE_KEY = "rh_turnover_employees_cache_v2";

export function TurnoverClient({ initialEmployees }: TurnoverClientProps) {
  const [employees, setEmployees] = useState<TurnoverEmployee[]>(initialEmployees);
  const [filters, setFilters] = useState<TurnoverFiltersType>(DEFAULT_FILTERS);
  const [isPurpleTheme, setIsPurpleTheme] = useState(false);

  // Modais
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<TurnoverEmployee | null>(null);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitingEmployee, setExitingEmployee] = useState<TurnoverEmployee | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Sincronização inicial com cache do navegador para resiliência total
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEmployees(parsed);
        }
      }
    } catch {}

    void refreshEmployees();
  }, []);

  // Salva no cache do navegador sempre que o array de colaboradores mudar
  function persistLocal(newEmps: TurnoverEmployee[]) {
    setEmployees(newEmps);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newEmps));
    } catch {}
  }

  async function refreshEmployees() {
    setLoading(true);
    try {
      const res = await fetch("/api/turnover", { cache: "no-store" });
      const payload = await res.json();
      const list = payload?.data || payload?.employees;
      if (res.ok && Array.isArray(list) && list.length > 0) {
        persistLocal(list);
      }
    } catch (err) {
      console.warn("Aviso ao sincronizar colaboradores com a API:", err);
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
        const matchesName = (emp.nome || "").toLowerCase().includes(q);
        const matchesCargo = (emp.cargo || "").toLowerCase().includes(q);
        const matchesMatricula = (emp.matricula || "").toLowerCase().includes(q);
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
        const inAdmissao = emp.data_admissao?.startsWith(`${filters.ano}-${padMonth}`);
        const inDesligamento = emp.data_desligamento?.startsWith(`${filters.ano}-${padMonth}`);
        if (!inAdmissao && !inDesligamento) {
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

  // Handlers de mutação com REATIVIDADE IMEDIATA (0ms)
  async function handleSubmitEmployee(values: TurnoverEmployeePayload) {
    setSubmitting(true);
    try {
      const isEditing = Boolean(editingEmployee?.id);

      if (isEditing && editingEmployee?.id) {
        // Atualização Otimista Imediata
        const updated: TurnoverEmployee = {
          ...editingEmployee,
          ...values,
          updated_at: new Date().toISOString(),
        };
        const nextList = employees.map((e) => (e.id === updated.id ? updated : e));
        persistLocal(nextList);

        setIsEmployeeModalOpen(false);
        setEditingEmployee(null);
        showToast("Colaborador atualizado com sucesso!");

        // Sincroniza com o servidor
        await fetch("/api/turnover", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: updated.id, ...values }),
        });
      } else {
        // Criação Otimista Imediata
        const newEmp: TurnoverEmployee = {
          id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ...values,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const nextList = [newEmp, ...employees];
        persistLocal(nextList);

        setIsEmployeeModalOpen(false);
        setEditingEmployee(null);
        showToast("Colaborador cadastrado com sucesso!");

        // Sincroniza com o servidor
        const res = await fetch("/api/turnover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (data?.data?.id) {
          // Atualiza com o ID real do servidor
          const syncedList = nextList.map((e) => (e.id === newEmp.id ? data.data : e));
          persistLocal(syncedList);
        }
      }
    } catch (err: any) {
      console.error("Erro ao submeter colaborador:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmExit(id: string, values: TurnoverExitPayload) {
    setSubmitting(true);
    try {
      // Atualização Otimista Imediata no React e Cache (0ms de atraso!)
      const nextList = employees.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            data_desligamento: values.data_desligamento,
            tipo_desligamento: values.tipo_desligamento,
            motivo_especifico: values.motivo_especifico,
            updated_at: new Date().toISOString(),
          };
        }
        return e;
      });
      persistLocal(nextList);

      setIsExitModalOpen(false);
      setExitingEmployee(null);
      showToast("Desligamento registrado com sucesso!");

      // Sincroniza com a API em background
      await fetch("/api/turnover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_exit",
          id,
          ...values,
        }),
      });
    } catch (err: any) {
      console.error("Erro ao registrar desligamento:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEmployee(id: string) {
    if (!confirm("Tem certeza que deseja remover este colaborador?")) return;

    // Atualização Otimista Imediata
    const nextList = employees.filter((e) => e.id !== id);
    persistLocal(nextList);
    showToast("Colaborador removido.");

    try {
      await fetch(`/api/turnover?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Erro ao remover no servidor:", err);
    }
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
              {/* Texto explicativo sem citar "gráficos 3D" */}
              <p
                className={`mt-4 max-w-2xl text-base leading-7 md:text-lg transition-colors duration-300 ${
                  isPurpleTheme ? "text-white" : "text-slate-600 dark:text-white"
                }`}
              >
                Painel executivo para controle de retenção de talentos, acompanhamento de admissões e desligamentos, análise de causas de rotatividade e projeção de custos rescisórios.
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
                onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:border-sky-400/30"
              >
                <Download className="h-4 w-4" />
                Exportar Planilha
              </button>

              {/* Botão Único de Novo Colaborador no topo */}
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950 shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                Novo Colaborador
              </button>
            </div>
          </div>
        </section>

        {/* KPIs principais */}
        <TurnoverStats metrics={metrics} isPurpleTheme={isPurpleTheme} />

        {/* Gráficos Analíticos e Diagnóstico */}
        <TurnoverAnalytics metrics={metrics} isPurpleTheme={isPurpleTheme} />

        {/* Filtros da Tabela com selects compactos e sem botão duplicado */}
        <TurnoverFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          onOpenExitDialog={() => {
            const active = employees.find((e) => !e.data_desligamento);
            if (active) handleOpenExit(active);
            else handleOpenCreate();
          }}
          onExport={() => setIsExportModalOpen(true)}
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

      {/* Modal Oficial de Visualização e Exportação da Planilha Fiel à Imagem */}
      <TurnoverExportModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        mesesEvolucao={metrics.mesesEvolucao}
        employees={employees}
        ano={filters.ano}
      />
    </>
  );
}
