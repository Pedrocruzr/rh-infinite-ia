import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveJobOpeningsAccess } from "@/lib/jobs/auth";
import { getUserPlanType, getTurnoverLimits, resolvePlanType } from "@/lib/auth/access-control";
import {
  createTurnoverEmployee,
  deleteTurnoverEmployee,
  getTurnoverEmployees,
  registerTurnoverExit,
  syncTurnoverEmployees,
  updateTurnoverEmployee,
} from "@/lib/turnover/repository";

export async function GET() {
  try {
    const employees = await getTurnoverEmployees();
    return NextResponse.json({
      ok: true,
      data: employees,
      employees,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Erro ao carregar colaboradores de turnover.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action;

    // Verificar controle de acesso e limites de plano
    const access = await resolveJobOpeningsAccess();
    const cookieStore = await cookies();
    const simulatedPlan = cookieStore.get("simulated_plan_code")?.value;
    const planType =
      access.userId && access.db
        ? await getUserPlanType(access.db, { id: access.userId }, simulatedPlan)
        : simulatedPlan
        ? resolvePlanType(simulatedPlan)
        : "completo";

    if (planType === "turnover") {
      const limits = getTurnoverLimits(simulatedPlan);
      const allCurrent = await getTurnoverEmployees();
      const countAtivos = allCurrent.filter((e) => !e.data_desligamento).length;
      const countDesligados = allCurrent.filter((e) => !!e.data_desligamento).length;
      const planName =
        limits.maxAtivos === 10
          ? "Start (10 ativas / 10 desligadas)"
          : "Pro (25 ativas / 25 desligadas)";

      if (action === "exit" || action === "register_exit") {
        if (countDesligados >= limits.maxDesligados) {
          return NextResponse.json(
            {
              ok: false,
              error: `Você atingiu o limite de ${limits.maxDesligados} contas de desligamento do seu plano ${planName}. Faça upgrade para o plano Pro para registrar até 25 desligamentos.`,
              code: "LIMIT_REACHED",
              limit: limits.maxDesligados,
            },
            { status: 403 }
          );
        }
      } else if (!action || action === "create") {
        const isDesligado = Boolean(body?.data_desligamento);
        if (!isDesligado && countAtivos >= limits.maxAtivos) {
          return NextResponse.json(
            {
              ok: false,
              error: `Você atingiu o limite de ${limits.maxAtivos} contas ativas do seu plano ${planName}. Faça upgrade para o plano Pro para registrar até 25 contas ativas.`,
              code: "LIMIT_REACHED",
              limit: limits.maxAtivos,
            },
            { status: 403 }
          );
        }
        if (isDesligado && countDesligados >= limits.maxDesligados) {
          return NextResponse.json(
            {
              ok: false,
              error: `Você atingiu o limite de ${limits.maxDesligados} contas de desligamento do seu plano ${planName}. Faça upgrade para o plano Pro para registrar até 25 desligamentos.`,
              code: "LIMIT_REACHED",
              limit: limits.maxDesligados,
            },
            { status: 403 }
          );
        }
      }
    }

    // Sincronização em lote resiliente (garante que nada inserido no cliente seja perdido)
    if (action === "sync") {
      const items = Array.isArray(body?.employees) ? body.employees : [];
      const synced = await syncTurnoverEmployees(items);
      return NextResponse.json({ ok: true, data: synced, employees: synced });
    }

    // Ação rápida de registrar desligamento (aceita "exit" ou "register_exit")
    if (action === "exit" || action === "register_exit") {
      const id = String(body?.id || "").trim();
      if (!id) {
        return NextResponse.json({ ok: false, error: "ID do colaborador é obrigatório." }, { status: 400 });
      }
      const data_desligamento = String(body?.data_desligamento || "").trim();
      const tipo_desligamento = body?.tipo_desligamento;
      const motivo_especifico = body?.motivo_especifico;

      if (!data_desligamento || !tipo_desligamento || !motivo_especifico) {
        return NextResponse.json(
          { ok: false, error: "Data, tipo e motivo do desligamento são obrigatórios." },
          { status: 400 }
        );
      }

      const updated = await registerTurnoverExit(id, {
        data_desligamento,
        tipo_desligamento,
        motivo_especifico,
      });

      if (!updated) {
        return NextResponse.json({ ok: false, error: "Colaborador não encontrado." }, { status: 404 });
      }

      const allEmployees = await getTurnoverEmployees();
      return NextResponse.json({ ok: true, data: updated, employees: allEmployees });
    }

    // Criar novo colaborador
    const matricula = String(body?.matricula || "").trim();
    const nome = String(body?.nome || "").trim();
    const cargo = String(body?.cargo || "").trim();
    const departamento = String(body?.departamento || "").trim();
    const data_admissao = String(body?.data_admissao || "").trim();
    const salario = Number(body?.salario || 0);

    if (!matricula || !nome || !cargo || !departamento || !data_admissao) {
      return NextResponse.json(
        { ok: false, error: "Matrícula, nome, cargo, departamento e data de admissão são obrigatórios." },
        { status: 400 }
      );
    }

    const created = await createTurnoverEmployee({
      matricula,
      nome,
      cargo,
      departamento,
      salario,
      data_admissao,
      data_desligamento: body?.data_desligamento || null,
      tipo_desligamento: body?.tipo_desligamento || null,
      motivo_especifico: body?.motivo_especifico || null,
    });

    const allEmployees = await getTurnoverEmployees();
    return NextResponse.json({ ok: true, data: created, employees: allEmployees }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Erro ao processar requisição.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body?.id || "").trim();
    if (!id) {
      return NextResponse.json({ ok: false, error: "ID do colaborador é obrigatório." }, { status: 400 });
    }

    const updated = await updateTurnoverEmployee(id, body);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Colaborador não encontrado." }, { status: 404 });
    }

    const allEmployees = await getTurnoverEmployees();
    return NextResponse.json({ ok: true, data: updated, employees: allEmployees });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Erro ao atualizar colaborador.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "ID é obrigatório para exclusão." }, { status: 400 });
    }

    await deleteTurnoverEmployee(id);
    const allEmployees = await getTurnoverEmployees();
    return NextResponse.json({ ok: true, success: true, employees: allEmployees });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Erro ao excluir colaborador.", details: String(error) },
      { status: 500 }
    );
  }
}
