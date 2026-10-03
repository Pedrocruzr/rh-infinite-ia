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
    return NextResponse.json({ data: employees });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar colaboradores de turnover.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action;

    // Ação rápida de registrar desligamento
    if (action === "exit") {
      const id = String(body?.id || "");
      if (!id) {
        return NextResponse.json({ error: "ID do colaborador é obrigatório." }, { status: 400 });
      }
      const data_desligamento = String(body?.data_desligamento || "").trim();
      const tipo_desligamento = body?.tipo_desligamento;
      const motivo_especifico = body?.motivo_especifico;

      if (!data_desligamento || !tipo_desligamento || !motivo_especifico) {
        return NextResponse.json(
          { error: "Data, tipo e motivo do desligamento são obrigatórios." },
          { status: 400 }
        );
      }

      const updated = await registerTurnoverExit(id, {
        data_desligamento,
        tipo_desligamento,
        motivo_especifico,
      });

      if (!updated) {
        return NextResponse.json({ error: "Colaborador não encontrado." }, { status: 404 });
      }

      return NextResponse.json({ data: updated });
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
        { error: "Matrícula, nome, cargo, departamento e data de admissão são obrigatórios." },
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

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar requisição.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body?.id || "");
    if (!id) {
      return NextResponse.json({ error: "ID do colaborador é obrigatório." }, { status: 400 });
    }

    const updated = await updateTurnoverEmployee(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Colaborador não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar colaborador.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório para exclusão." }, { status: 400 });
    }

    await deleteTurnoverEmployee(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao excluir colaborador.", details: String(error) },
      { status: 500 }
    );
  }
}
