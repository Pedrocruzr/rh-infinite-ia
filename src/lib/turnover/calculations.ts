import { JOB_DEPARTMENTS } from "@/lib/jobs/departments";
import { MESES_ANO, MOTIVOS_DESLIGAMENTO } from "./constants";
import type {
  DepartmentTurnoverData,
  MonthTurnoverData,
  ReasonTurnoverData,
  TurnoverEmployee,
  TurnoverMetrics,
} from "./types";

function parseDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function diffDays(d1: Date, d2: Date): number {
  const t1 = d1.getTime();
  const t2 = d2.getTime();
  return Math.round(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24));
}

export function computeTurnoverMetrics(
  employees: TurnoverEmployee[],
  anoFiltro = new Date().getFullYear(),
  mesFiltro = 0 // 0 = ano todo, 1..12 = mês específico
): TurnoverMetrics {
  const hoje = new Date();
  const anoAtual = anoFiltro || hoje.getFullYear();

  // 1. Evolução mês a mês (Jan a Dez do ano selecionado)
  const mesesEvolucao: MonthTurnoverData[] = MESES_ANO.map((mes) => {
    const dataInicioMes = new Date(anoAtual, mes.numero - 1, 1);
    const dataFimMes = new Date(anoAtual, mes.numero, 0, 23, 59, 59);

    let admissoes = 0;
    let desligamentos = 0;
    let desligamentosVoluntarios = 0;
    let desligamentosInvoluntarios = 0;
    let efetivoAtivo = 0;

    for (const emp of employees) {
      const dtAdm = parseDate(emp.data_admissao);
      const dtDeslig = parseDate(emp.data_desligamento);

      if (!dtAdm) continue;

      // Admissão no mês
      if (
        dtAdm.getFullYear() === anoAtual &&
        dtAdm.getMonth() + 1 === mes.numero
      ) {
        admissoes++;
      }

      // Desligamento no mês
      if (
        dtDeslig &&
        dtDeslig.getFullYear() === anoAtual &&
        dtDeslig.getMonth() + 1 === mes.numero
      ) {
        desligamentos++;
        if (emp.tipo_desligamento === "voluntario") {
          desligamentosVoluntarios++;
        } else {
          desligamentosInvoluntarios++;
        }
      }

      // Efetivo ativo no último dia do mês
      // Admitido até o fim do mês E (não desligado OU desligado após o fim do mês)
      if (dtAdm <= dataFimMes && (!dtDeslig || dtDeslig > dataFimMes)) {
        efetivoAtivo++;
      }
    }

    // Fórmulas
    const taxaTurnoverDesligamento =
      efetivoAtivo > 0 ? (desligamentos / efetivoAtivo) * 100 : 0;

    const taxaTurnoverGeral =
      efetivoAtivo > 0
        ? (((admissoes + desligamentos) / 2) / efetivoAtivo) * 100
        : 0;

    return {
      mesNumero: mes.numero,
      mesNome: mes.nome,
      mesAbrev: mes.abrev,
      admissoes,
      desligamentos,
      desligamentosVoluntarios,
      desligamentosInvoluntarios,
      efetivoAtivo,
      taxaTurnoverDesligamento: Math.round(taxaTurnoverDesligamento * 10) / 10,
      taxaTurnoverGeral: Math.round(taxaTurnoverGeral * 10) / 10,
    };
  });

  // 2. Filtragem do período atual vs período anterior
  const mesAtualNum = mesFiltro > 0 ? mesFiltro : hoje.getMonth() + 1;
  const mesDataAtual = mesesEvolucao[mesAtualNum - 1];
  const mesDataAnterior =
    mesAtualNum > 1 ? mesesEvolucao[mesAtualNum - 2] : null;

  // Headcount atual (geral de ativos hoje)
  const ativosAtuais = employees.filter((e) => !e.data_desligamento);
  const efetivoAtivoAtual =
    mesFiltro > 0 ? mesDataAtual.efetivoAtivo : ativosAtuais.length;

  // Desligamentos do período selecionado
  const desligadosPeriodo = employees.filter((emp) => {
    const dt = parseDate(emp.data_desligamento);
    if (!dt) return false;
    if (dt.getFullYear() !== anoAtual) return false;
    if (mesFiltro > 0 && dt.getMonth() + 1 !== mesFiltro) return false;
    return true;
  });

  const totalDesligamentosPeriodo = desligadosPeriodo.length;

  // Admissões do período selecionado
  const admissoesPeriodo = employees.filter((emp) => {
    const dt = parseDate(emp.data_admissao);
    if (!dt) return false;
    if (dt.getFullYear() !== anoAtual) return false;
    if (mesFiltro > 0 && dt.getMonth() + 1 !== mesFiltro) return false;
    return true;
  });
  const totalAdmissoesPeriodo = admissoesPeriodo.length;

  // Taxa TD do período
  const taxaTurnoverDesligamento =
    efetivoAtivoAtual > 0
      ? (totalDesligamentosPeriodo / efetivoAtivoAtual) * 100
      : 0;

  // Taxa TG do período
  const taxaTurnoverGeral =
    efetivoAtivoAtual > 0
      ? (((totalAdmissoesPeriodo + totalDesligamentosPeriodo) / 2) /
          efetivoAtivoAtual) *
        100
      : 0;

  // Desligamentos voluntários vs involuntários
  const totalVoluntarios = desligadosPeriodo.filter(
    (e) => e.tipo_desligamento === "voluntario"
  ).length;
  const turnoverVoluntarioPct =
    totalDesligamentosPeriodo > 0
      ? (totalVoluntarios / totalDesligamentosPeriodo) * 100
      : 0;
  const turnoverInvoluntarioPct =
    totalDesligamentosPeriodo > 0 ? 100 - turnoverVoluntarioPct : 0;

  // Early turnover (desligados com <= 90 dias de casa)
  let earlyTurnoverQtd = 0;
  let somaDiasCasa = 0;
  for (const emp of desligadosPeriodo) {
    const dtAdm = parseDate(emp.data_admissao);
    const dtDeslig = parseDate(emp.data_desligamento);
    if (dtAdm && dtDeslig) {
      const dias = diffDays(dtAdm, dtDeslig);
      somaDiasCasa += dias;
      if (dias <= 90) {
        earlyTurnoverQtd++;
      }
    }
  }

  const earlyTurnoverPct =
    totalDesligamentosPeriodo > 0
      ? (earlyTurnoverQtd / totalDesligamentosPeriodo) * 100
      : 0;

  const tempoMedioCasaMeses =
    totalDesligamentosPeriodo > 0
      ? Math.round((somaDiasCasa / totalDesligamentosPeriodo / 30) * 10) / 10
      : 0;

  // Salário médio e custo estimado
  const salariosValidos = employees
    .map((e) => Number(e.salario || 0))
    .filter((s) => s > 0);
  const salarioMedio =
    salariosValidos.length > 0
      ? salariosValidos.reduce((acc, curr) => acc + curr, 0) /
        salariosValidos.length
      : 2500; // fallback para média nacional se não preenchido

  // Custo Estimado: Total Demitidos × (Salário Médio × 2.5)
  const custoEstimadoTurnover =
    totalDesligamentosPeriodo * (salarioMedio * 2.5);

  // Variação em relação ao mês anterior
  const mesAnteriorTaxaTD = mesDataAnterior
    ? mesDataAnterior.taxaTurnoverDesligamento
    : 0;
  const variacaoMesAnterior =
    mesDataAnterior && mesDataAnterior.taxaTurnoverDesligamento > 0
      ? taxaTurnoverDesligamento - mesDataAnterior.taxaTurnoverDesligamento
      : 0;

  // 3. Ranking por Departamento
  const departamentosRanking: DepartmentTurnoverData[] = JOB_DEPARTMENTS.map(
    (dept) => {
      const empsDept = employees.filter((e) => e.departamento === dept.name);
      const ativosDept = empsDept.filter((e) => !e.data_desligamento).length;
      const desfigsDept = empsDept.filter((e) => {
        const dt = parseDate(e.data_desligamento);
        if (!dt) return false;
        if (dt.getFullYear() !== anoAtual) return false;
        if (mesFiltro > 0 && dt.getMonth() + 1 !== mesFiltro) return false;
        return true;
      }).length;

      const taxa =
        ativosDept > 0 ? (desfigsDept / ativosDept) * 100 : desfigsDept > 0 ? 100 : 0;

      return {
        departamento: dept.name,
        cor: dept.color,
        efetivo: ativosDept,
        desligamentos: desfigsDept,
        taxa: Math.round(taxa * 10) / 10,
      };
    }
  ).sort((a, b) => b.taxa - a.taxa);

  // 4. Distribuição de Motivos de Saída
  const motivosCount: Record<string, number> = {};
  for (const emp of desligadosPeriodo) {
    const mot = emp.motivo_especifico || "Outro";
    motivosCount[mot] = (motivosCount[mot] || 0) + 1;
  }

  const motivosDistribuicao: ReasonTurnoverData[] = MOTIVOS_DESLIGAMENTO.map(
    (m) => {
      const qtd = motivosCount[m.label] || 0;
      const pct =
        totalDesligamentosPeriodo > 0
          ? (qtd / totalDesligamentosPeriodo) * 100
          : 0;
      return {
        motivo: m.label,
        quantidade: qtd,
        percentual: Math.round(pct * 10) / 10,
        cor: m.cor,
      };
    }
  ).sort((a, b) => b.quantidade - a.quantidade);

  return {
    efetivoAtivoAtual,
    totalDesligamentosPeriodo,
    totalAdmissoesPeriodo,
    taxaTurnoverDesligamento: Math.round(taxaTurnoverDesligamento * 10) / 10,
    taxaTurnoverGeral: Math.round(taxaTurnoverGeral * 10) / 10,
    turnoverVoluntarioPct: Math.round(turnoverVoluntarioPct * 10) / 10,
    turnoverInvoluntarioPct: Math.round(turnoverInvoluntarioPct * 10) / 10,
    earlyTurnoverQtd,
    earlyTurnoverPct: Math.round(earlyTurnoverPct * 10) / 10,
    salarioMedio: Math.round(salarioMedio),
    custoEstimadoTurnover: Math.round(custoEstimadoTurnover),
    tempoMedioCasaMeses,
    mesAnteriorTaxaTD,
    variacaoMesAnterior: Math.round(variacaoMesAnterior * 10) / 10,
    mesesEvolucao,
    departamentosRanking,
    motivosDistribuicao,
  };
}
