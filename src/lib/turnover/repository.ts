import fs from "fs";
import path from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";
import type { TurnoverEmployee, TurnoverEmployeePayload, TurnoverExitPayload } from "./types";

const FALLBACK_DIR = path.join(process.cwd(), "src", "data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "turnover_records.json");

// Base inicial fiel e consistente resgatada para os 19 colaboradores exatos da tela do usuário
export const SEED_EMPLOYEES: TurnoverEmployee[] = [
  {
    id: "emp-011",
    matricula: "COL-990",
    nome: "Katarina",
    cargo: "Diretor Financeiro",
    departamento: "Administração (ADM)",
    salario: 10000,
    data_admissao: "2025-12-04",
    data_desligamento: "2026-12-04",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Salário / Remuneração",
    created_at: "2026-10-04T10:00:00Z",
  },
  {
    id: "emp-012",
    matricula: "COL-760",
    nome: "Ricardo Calixto",
    cargo: "Vendas",
    departamento: "Administração (ADM)",
    salario: 4500,
    data_admissao: "2026-11-04",
    data_desligamento: "2026-11-25",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Salário / Remuneração",
    created_at: "2026-10-04T10:05:00Z",
  },
  {
    id: "emp-013",
    matricula: "COL-001",
    nome: "Nathália",
    cargo: "Vendas",
    departamento: "Administração (ADM)",
    salario: 4500,
    data_admissao: "2026-01-04",
    data_desligamento: "2026-06-04",
    tipo_desligamento: "involuntario",
    motivo_especifico: "Performance / Baixo Rendimento",
    created_at: "2026-10-04T10:10:00Z",
  },
  {
    id: "emp-014",
    matricula: "COL-300",
    nome: "Valéria",
    cargo: "Coordenador contábil",
    departamento: "Contabilidade",
    salario: 6000,
    data_admissao: "2025-09-01",
    data_desligamento: "2026-09-04",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Salário / Remuneração",
    created_at: "2026-10-04T10:15:00Z",
  },
  {
    id: "emp-015",
    matricula: "COL-700",
    nome: "Ananias",
    cargo: "Vendas",
    departamento: "Vendas / Comercial",
    salario: 3500,
    data_admissao: "2026-06-04",
    data_desligamento: "2026-06-15",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Salário / Remuneração",
    created_at: "2026-10-04T10:20:00Z",
  },
  {
    id: "emp-016",
    matricula: "COL-007",
    nome: "Viviane",
    cargo: "Recepcionista",
    departamento: "Administração (ADM)",
    salario: 5000,
    data_admissao: "2026-02-04",
    data_desligamento: "2026-02-27",
    tipo_desligamento: "involuntario",
    motivo_especifico: "Fit Cultural",
    created_at: "2026-10-04T10:25:00Z",
  },
  {
    id: "emp-017",
    matricula: "COL-763",
    nome: "Josué",
    cargo: "manobrista",
    departamento: "Tech / TI",
    salario: 4500,
    data_admissao: "2026-03-01",
    data_desligamento: "2026-03-30",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Salário / Remuneração",
    created_at: "2026-10-04T10:30:00Z",
  },
  {
    id: "emp-018",
    matricula: "COL-002",
    nome: "Anderson",
    cargo: "analista de TI",
    departamento: "Administração (ADM)",
    salario: 4500,
    data_admissao: "2026-03-04",
    data_desligamento: "2026-04-04",
    tipo_desligamento: "involuntario",
    motivo_especifico: "Liderança / Gestão",
    created_at: "2026-10-04T10:35:00Z",
  },
  {
    id: "emp-019",
    matricula: "COL-000",
    nome: "Vanessa",
    cargo: "Recepcionista",
    departamento: "Administração (ADM)",
    salario: 2300,
    data_admissao: "2026-01-04",
    data_desligamento: "2026-01-26",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Salário / Remuneração",
    created_at: "2026-10-04T10:40:00Z",
  },
  {
    id: "emp-001",
    matricula: "MAT-1001",
    nome: "Carlos Eduardo Silva",
    cargo: "Analista de Sistemas Pleno",
    departamento: "Tech / TI",
    salario: 6500,
    data_admissao: "2025-02-10",
    data_desligamento: null,
    tipo_desligamento: null,
    motivo_especifico: null,
    created_at: "2025-02-10T10:00:00Z",
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
    tipo_desligamento: null,
    motivo_especifico: null,
    created_at: "2024-05-15T10:00:00Z",
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
    tipo_desligamento: null,
    motivo_especifico: null,
    created_at: "2026-01-12T10:00:00Z",
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
    tipo_desligamento: null,
    motivo_especifico: null,
    created_at: "2025-08-01T10:00:00Z",
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
    tipo_desligamento: null,
    motivo_especifico: null,
    created_at: "2024-11-20T10:00:00Z",
  },
  {
    id: "emp-006",
    matricula: "MAT-1006",
    nome: "Juliana Paes Ribeiro",
    cargo: "Vendedora Sênior",
    departamento: "Vendas / Comercial",
    salario: 4200,
    data_admissao: "2026-02-01",
    data_desligamento: "2026-04-10",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Oportunidade de Carreira",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "emp-007",
    matricula: "MAT-1007",
    nome: "Thiago Oliveira Santos",
    cargo: "Assistente Contábil",
    departamento: "Contabilidade",
    salario: 3100,
    data_admissao: "2026-03-01",
    data_desligamento: "2026-05-15",
    tipo_desligamento: "involuntario",
    motivo_especifico: "Performance / Baixo Rendimento",
    created_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "emp-008",
    matricula: "MAT-1008",
    nome: "Camila Rocha Duarte",
    cargo: "Recepcionista",
    departamento: "Administração (ADM)",
    salario: 2400,
    data_admissao: "2026-06-01",
    data_desligamento: "2026-07-20",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Salário / Remuneração",
    created_at: "2026-06-01T10:00:00Z",
  },
  {
    id: "emp-009",
    matricula: "MAT-1009",
    nome: "Bruno Martins Castro",
    cargo: "Analista de RH Júnior",
    departamento: "RH & Gestão",
    salario: 3500,
    data_admissao: "2026-05-10",
    data_desligamento: null,
    tipo_desligamento: null,
    motivo_especifico: null,
    created_at: "2026-05-10T10:00:00Z",
  },
  {
    id: "emp-010",
    matricula: "MAT-1010",
    nome: "Fernanda Lima Guimarães",
    cargo: "Engenheira de Software",
    departamento: "Tech / TI",
    salario: 7000,
    data_admissao: "2025-01-15",
    data_desligamento: "2026-10-01",
    tipo_desligamento: "voluntario",
    motivo_especifico: "Salário / Remuneração",
    created_at: "2025-01-15T10:00:00Z",
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
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SEED_EMPLOYEES;
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

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !serviceKey) return null;
  return createSupabaseClient(url, serviceKey);
}

async function saveToCloudVault(userId: string | null, employees: TurnoverEmployee[]): Promise<void> {
  try {
    const admin = getAdminSupabase();
    if (!admin || !Array.isArray(employees) || employees.length === 0) return;

    const targets = ["turnover_vault:global_backup"];
    if (userId) {
      targets.push(`turnover_vault:${userId}`);
    }

    for (const eventId of targets) {
      await admin.from("webhook_events").upsert(
        {
          event_id: eventId,
          event_type: "TURNOVER_VAULT",
          provider: "stacker",
          payload: {
            employees,
            total: employees.length,
            last_saved_at: new Date().toISOString(),
            version: 4,
          },
          processing_status: "processed",
        },
        { onConflict: "event_id" }
      );
    }
  } catch (err) {
    console.warn("[turnover/vault] Failed to save to cloud vault:", err);
  }
}

async function readFromCloudVault(userId: string | null): Promise<TurnoverEmployee[] | null> {
  try {
    const admin = getAdminSupabase();
    if (!admin) return null;

    const targets: string[] = [];
    if (userId) {
      targets.push(`turnover_vault:${userId}`);
    }
    targets.push("turnover_vault:global_backup");

    for (const eventId of targets) {
      const { data, error } = await admin
        .from("webhook_events")
        .select("payload")
        .eq("event_id", eventId)
        .maybeSingle();

      if (
        !error &&
        data?.payload?.employees &&
        Array.isArray(data.payload.employees) &&
        data.payload.employees.length > 0
      ) {
        return data.payload.employees as TurnoverEmployee[];
      }
    }
  } catch (err) {
    console.warn("[turnover/vault] Failed to read from cloud vault:", err);
  }
  return null;
}

export async function getTurnoverEmployees(): Promise<TurnoverEmployee[]> {
  let userId: string | null = null;
  try {
    const access = await resolveJobOpeningsAccess();
    userId = access.userId;
    if (access.userId && access.db) {
      const { data, error } = await access.db
        .from("turnover_records")
        .select("*")
        .eq("user_id", access.userId)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Mantém o Cloud Vault sempre atualizado com os dados do banco
        void saveToCloudVault(userId, data);
        return data;
      }
    }
  } catch (err) {
    console.warn("[turnover/repository] Supabase query failed, attempting cloud vault:", err);
  }

  // Camada 2: Cloud Vault Permanente no Supabase (resiliente e garantido no PostgreSQL na nuvem!)
  try {
    const fromVault = await readFromCloudVault(userId);
    if (fromVault && fromVault.length > 0) {
      writeFallbackData(fromVault);
      return fromVault;
    }
  } catch (vaultErr) {
    console.warn("[turnover/repository] Cloud vault read failed:", vaultErr);
  }

  // Camada 3: Fallback local / Seed
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

  let userId: string | null = null;

  try {
    const access = await resolveJobOpeningsAccess();
    userId = access.userId;
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
        const current = readFallbackData();
        const updated = [data, ...current.filter((e) => e.id !== data.id)];
        writeFallbackData(updated);
        void saveToCloudVault(userId, updated);
        return data;
      }
    }
  } catch (err) {
    console.warn("[turnover/repository] Insert to supabase failed:", err);
  }

  const current = readFallbackData();
  const updated = [newEmp, ...current.filter((e) => e.id !== newEmp.id)];
  writeFallbackData(updated);
  void saveToCloudVault(userId, updated);
  return newEmp;
}

export async function updateTurnoverEmployee(
  id: string,
  payload: Partial<TurnoverEmployeePayload>
): Promise<TurnoverEmployee | null> {
  let userId: string | null = null;
  try {
    const access = await resolveJobOpeningsAccess();
    userId = access.userId;
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
        const current = readFallbackData();
        const index = current.findIndex((e) => e.id === id);
        if (index !== -1) {
          current[index] = data;
          writeFallbackData(current);
          void saveToCloudVault(userId, current);
        }
        return data;
      }
    }
  } catch (err) {
    console.warn("[turnover/repository] Update in supabase failed:", err);
  }

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
  void saveToCloudVault(userId, current);
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
  let userId: string | null = null;
  try {
    const access = await resolveJobOpeningsAccess();
    userId = access.userId;
    if (access.userId && access.db) {
      const { error } = await access.db
        .from("turnover_records")
        .delete()
        .eq("id", id)
        .eq("user_id", access.userId);

      if (!error) {
        const current = readFallbackData();
        const filtered = current.filter((e) => e.id !== id);
        writeFallbackData(filtered);
        void saveToCloudVault(userId, filtered);
        return true;
      }
    }
  } catch (err) {
    console.warn("[turnover/repository] Delete in supabase failed:", err);
  }

  const current = readFallbackData();
  const filtered = current.filter((e) => e.id !== id);
  writeFallbackData(filtered);
  void saveToCloudVault(userId, filtered);
  return true;
}

export async function syncTurnoverEmployees(
  employeesToSync: TurnoverEmployee[]
): Promise<TurnoverEmployee[]> {
  let userId: string | null = null;
  try {
    const access = await resolveJobOpeningsAccess();
    userId = access.userId;
    if (access.userId && access.db && Array.isArray(employeesToSync) && employeesToSync.length > 0) {
      const rows = employeesToSync.map((e) => ({
        id: e.id,
        user_id: access.userId,
        matricula: e.matricula,
        nome: e.nome,
        cargo: e.cargo,
        departamento: e.departamento,
        salario: Number(e.salario || 0),
        data_admissao: e.data_admissao,
        data_desligamento: e.data_desligamento || null,
        tipo_desligamento: e.tipo_desligamento || null,
        motivo_especifico: e.motivo_especifico || null,
        created_at: e.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await access.db
        .from("turnover_records")
        .upsert(rows, { onConflict: "id" })
        .select("*");

      if (!error && Array.isArray(data)) {
        void saveToCloudVault(userId, data);
        return data;
      }
    }
  } catch (err) {
    console.warn("[turnover/repository] Bulk sync failed:", err);
  }

  // Fallback e Cloud Vault: faz merge e persiste na nuvem
  const current = readFallbackData();
  const map = new Map<string, TurnoverEmployee>();
  for (const item of current) {
    map.set(item.id, item);
  }
  for (const item of employeesToSync) {
    map.set(item.id, item);
  }
  const merged = Array.from(map.values());
  writeFallbackData(merged);
  void saveToCloudVault(userId, merged);
  return merged;
}
