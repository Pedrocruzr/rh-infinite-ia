import fs from "fs";
import path from "path";
import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";
import type { TurnoverEmployee, TurnoverEmployeePayload, TurnoverExitPayload } from "./types";

const FALLBACK_DIR = path.join(process.cwd(), "src", "data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "turnover_records.json");

// Base inicial limpa e consistente com o padrão Stacker para o primeiro acesso
const SEED_EMPLOYEES: TurnoverEmployee[] = [
  {
    id: "emp-001",
    matricula: "MAT-1001",
    nome: "Carlos Eduardo Silva",
    cargo: "Analista de Sistemas Pleno",
    departamento: "Tech / TI",
    salario: 6500,
    data_admissao: "2025-02-10",
    data_desligamento: null,
  },
  {
    id: "emp-002",
    matricula: "MAT-1002",
    nome: "Mariana Costa Prado",
    cargo: "Coordenadora de RH",
    departamento: "RH & Gestão",
    salario: 7200,
    data_admissao: "2024-05-15",
    data_desligamento: null,
  },
  {
    id: "emp-003",
    matricula: "MAT-1003",
    nome: "Lucas Ferreira Lima",
    cargo: "Assistente Administrativo",
    departamento: "Administração (ADM)",
    salario: 2800,
    data_admissao: "2026-01-12",
    data_desligamento: null,
  },
  {
    id: "emp-004",
    matricula: "MAT-1004",
    nome: "Beatriz Nogueira Souza",
    cargo: "Especialista em Marketing",
    departamento: "Marketing",
    salario: 5400,
    data_admissao: "2025-08-01",
    data_desligamento: null,
  },
  {
    id: "emp-005",
    matricula: "MAT-1005",
    nome: "Rafael Mendes Alves",
    cargo: "Analista Financeiro",
    departamento: "Financeiro",
    salario: 4800,
    data_admissao: "2024-11-20",
    data_desligamento: null,
  },
  {
    id: "emp-006",
    matricula: "MAT-1006",
    nome: "Juliana Rocha Martins",
    cargo: "Executiva de Contas",
    departamento: "Vendas / Comercial",
    salario: 5000,
    data_admissao: "2025-04-10",
    data_desligamento: "2026-09-15",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Oportunidade de Carreira",
  },
  {
    id: "emp-007",
    matricula: "MAT-1007",
    nome: "Felipe Antunes Dias",
    cargo: "Auxiliar Contábil",
    departamento: "Contabilidade",
    salario: 2600,
    data_admissao: "2026-06-01",
    data_desligamento: "2026-08-20",
    tipo_desligamento: "involuntario",
    motivo_especifico: "Performance / Baixo Rendimento",
  },
  {
    id: "emp-008",
    matricula: "MAT-1008",
    nome: "Fernanda Ribeiro Ramos",
    cargo: "Desenvolvedora Frontend",
    departamento: "Tech / TI",
    salario: 7000,
    data_admissao: "2025-01-15",
    data_desligamento: "2026-10-01",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Salário / Remuneração",
  },
];

function readFallbackData(): TurnoverEmployee[] {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    if (!fs.existsSync(FALLBACK_FILE)) {
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(SEED_EMPLOYEES, null, 2), "utf8");
      return SEED_EMPLOYEES;
    }
    const content = fs.readFileSync(FALLBACK_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("[turnover/repository] Error reading fallback data:", error);
    return SEED_EMPLOYEES;
  }
}

function writeFallbackData(data: TurnoverEmployee[]) {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("[turnover/repository] Error writing fallback data:", error);
  }
}

export async function getTurnoverEmployees(): Promise<TurnoverEmployee[]> {
  try {
    const access = await resolveJobOpeningsAccess();
    if (access.userId && access.db) {
      const { data, error } = await access.db
        .from("turnover_records")
        .select("*")
        .eq("user_id", access.userId)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return data;
      }
    }
  } catch {}

  return readFallbackData();
}

export async function createTurnoverEmployee(
  payload: TurnoverEmployeePayload
): Promise<TurnoverEmployee> {
  const newEmp: TurnoverEmployee = {
    id: crypto.randomUUID(),
    matricula: payload.matricula,
    nome: payload.nome,
    cargo: payload.cargo,
    departamento: payload.departamento,
    salario: Number(payload.salario || 0),
    data_admissao: payload.data_admissao,
    data_desligamento: payload.data_desligamento || null,
    tipo_desligamento: payload.tipo_desligamento || null,
    motivo_especifico: payload.motivo_especifico || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const access = await resolveJobOpeningsAccess();
    if (access.userId && access.db) {
      const { data, error } = await access.db
        .from("turnover_records")
        .insert({
          ...newEmp,
          user_id: access.userId,
        })
        .select("*")
        .single();

      if (!error && data) {
        return data;
      }
    }
  } catch {}

  const current = readFallbackData();
  const updated = [newEmp, ...current];
  writeFallbackData(updated);
  return newEmp;
}

export async function updateTurnoverEmployee(
  id: string,
  payload: Partial<TurnoverEmployeePayload>
): Promise<TurnoverEmployee | null> {
  try {
    const access = await resolveJobOpeningsAccess();
    if (access.userId && access.db) {
      const { data, error } = await access.db
        .from("turnover_records")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", access.userId)
        .select("*")
        .single();

      if (!error && data) {
        return data;
      }
    }
  } catch {}

  const current = readFallbackData();
  const index = current.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updatedItem: TurnoverEmployee = {
    ...current[index],
    ...payload,
    updated_at: new Date().toISOString(),
  };
  current[index] = updatedItem;
  writeFallbackData(current);
  return updatedItem;
}

export async function registerTurnoverExit(
  id: string,
  exitData: TurnoverExitPayload
): Promise<TurnoverEmployee | null> {
  return updateTurnoverEmployee(id, {
    data_desligamento: exitData.data_desligamento,
    tipo_desligamento: exitData.tipo_desligamento,
    motivo_especifico: exitData.motivo_especifico,
  });
}

export async function deleteTurnoverEmployee(id: string): Promise<boolean> {
  try {
    const access = await resolveJobOpeningsAccess();
    if (access.userId && access.db) {
      const { error } = await access.db
        .from("turnover_records")
        .delete()
        .eq("id", id)
        .eq("user_id", access.userId);

      if (!error) return true;
    }
  } catch {}

  const current = readFallbackData();
  const filtered = current.filter((e) => e.id !== id);
  writeFallbackData(filtered);
  return true;
}
