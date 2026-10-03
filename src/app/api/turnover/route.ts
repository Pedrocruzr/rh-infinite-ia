import { NextRequest, NextResponse } from "next/server";
import {
  createTurnoverEmployee,
  deleteTurnoverEmployee,
  getTurnoverEmployees,
  registerTurnoverExit,
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
