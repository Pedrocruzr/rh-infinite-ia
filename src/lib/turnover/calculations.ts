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

      // Efetivo ativo durante ou no último dia do mês
      // Admitido até o fim do mês E (não desligado OU desligado após o fim do mês)
      if (dtAdm <= dataFimMes && (!dtDeslig || dtDeslig > dataFimMes)) {
        efetivoAtivo++;
      }
    }

    // Base de cálculo do mês: considera efetivo restante ou o efetivo antes das saídas
    const efetivoBaseCalculo = Math.max(efetivoAtivo, desligamentos, 1);

    const taxaTurnoverDesligamento =
      efetivoBaseCalculo > 0 ? (desligamentos / efetivoBaseCalculo) * 100 : 0;

    const taxaTurnoverGeral =
      efetivoBaseCalculo > 0
        ? (((admissoes + desligamentos) / 2) / efetivoBaseCalculo) * 100
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
  const baseCalculoPeriodo = Math.max(efetivoAtivoAtual, totalDesligamentosPeriodo, 1);
  const taxaTurnoverDesligamento =
    Math.round((totalDesligamentosPeriodo / baseCalculoPeriodo) * 1000) / 10;

  // Taxa TG do período
  const taxaTurnoverGeral =
    Math.round(
      (((totalAdmissoesPeriodo + totalDesligamentosPeriodo) / 2) /
        baseCalculoPeriodo) *
        1000
    ) / 10;

  // 3. Voluntário vs Involuntário
  const volCount = desligadosPeriodo.filter(
    (e) => e.tipo_desligamento === "voluntario"
  ).length;
  const involCount = desligadosPeriodo.filter(
    (e) => e.tipo_desligamento === "involuntario"
  ).length;

  const turnoverVoluntarioPct =
    totalDesligamentosPeriodo > 0
      ? Math.round((volCount / totalDesligamentosPeriodo) * 1000) / 10
      : 0;

  const turnoverInvoluntarioPct =
    totalDesligamentosPeriodo > 0
      ? Math.round((involCount / totalDesligamentosPeriodo) * 1000) / 10
      : 0;

  // 4. Early Turnover (<= 90 dias)
  const earlyTurnoverList = desligadosPeriodo.filter((emp) => {
    const dtAdm = parseDate(emp.data_admissao);
    const dtDeslig = parseDate(emp.data_desligamento);
    if (!dtAdm || !dtDeslig) return false;
    return diffDays(dtAdm, dtDeslig) <= 90;
  });

  const earlyTurnoverQtd = earlyTurnoverList.length;
  const earlyTurnoverPct =
    totalDesligamentosPeriodo > 0
      ? Math.round((earlyTurnoverQtd / totalDesligamentosPeriodo) * 1000) / 10
      : 0;

  // 5. Custo Estimado e Salário Médio
  const salariosValidos = employees
    .map((e) => Number(e.salario || 0))
    .filter((s) => s > 0);
  const salarioMedio =
    salariosValidos.length > 0
      ? salariosValidos.reduce((a, b) => a + b, 0) / salariosValidos.length
      : 4000;

  // Multiplicador SHRM/FGV: custo total de rescisão, reposição e onboarding é ~1.5x a 2x o salário base
  const custoEstimadoTurnover = Math.round(
    totalDesligamentosPeriodo * salarioMedio * 1.75
  );

  // 6. Tempo médio de casa (em meses) dos desligados do período
  let totalDiasCasa = 0;
  let countDias = 0;
  for (const emp of desligadosPeriodo) {
    const dtAdm = parseDate(emp.data_admissao);
    const dtDeslig = parseDate(emp.data_desligamento);
    if (dtAdm && dtDeslig) {
      totalDiasCasa += diffDays(dtAdm, dtDeslig);
      countDias++;
    }
  }
  const tempoMedioCasaMeses =
    countDias > 0 ? Math.round((totalDiasCasa / countDias / 30) * 10) / 10 : 0;

  // Variação em relação ao mês anterior
  const mesAnteriorTaxaTD = mesDataAnterior
    ? mesDataAnterior.taxaTurnoverDesligamento
    : 0;
  const variacaoMesAnterior =
    mesDataAtual && mesDataAnterior
      ? Math.round(
          (mesDataAtual.taxaTurnoverDesligamento -
            mesDataAnterior.taxaTurnoverDesligamento) *
            10
        ) / 10
      : 0;

  // 7. Ranking por Departamento
  const departamentosRanking: DepartmentTurnoverData[] = JOB_DEPARTMENTS.map(
    (dept) => {
      const empsDept = employees.filter((e) => e.departamento === dept.name);
      const desligDept = empsDept.filter((e) => {
        const dt = parseDate(e.data_desligamento);
        if (!dt) return false;
        if (dt.getFullYear() !== anoAtual) return false;
        if (mesFiltro > 0 && dt.getMonth() + 1 !== mesFiltro) return false;
        return true;
      });

      const efetivoDept = empsDept.filter((e) => !e.data_desligamento).length;
      const baseDept = Math.max(efetivoDept, desligDept.length, 1);
      const taxa =
        desligDept.length > 0
          ? Math.round((desligDept.length / baseDept) * 1000) / 10
          : 0;

      return {
        departamento: dept.name,
        cor: dept.color,
        efetivo: efetivoDept,
        desligamentos: desligDept.length,
        taxa,
      };
    }
  ).sort((a, b) => b.desligamentos - a.desligamentos);

  // 8. Distribuição de Motivos de Saída
  const motivosCountMap: Record<string, number> = {};
  for (const m of MOTIVOS_DESLIGAMENTO) {
    motivosCountMap[m.id] = 0;
  }

  for (const emp of desligadosPeriodo) {
    const motivo = emp.motivo_especifico || "Outro";
    motivosCountMap[motivo] = (motivosCountMap[motivo] || 0) + 1;
  }

  const motivosDistribuicao: ReasonTurnoverData[] = MOTIVOS_DESLIGAMENTO.map(
    (m) => {
      const qtd = motivosCountMap[m.id] || 0;
      const pct =
        totalDesligamentosPeriodo > 0
          ? Math.round((qtd / totalDesligamentosPeriodo) * 1000) / 10
          : 0;
      return {
        motivo: m.label,
        quantidade: qtd,
        percentual: pct,
        cor: m.cor,
      };
    }
  )
    .filter((m) => m.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade);

  return {
    efetivoAtivoAtual,
    totalDesligamentosPeriodo,
    totalAdmissoesPeriodo,
    taxaTurnoverDesligamento,
    taxaTurnoverGeral,
    turnoverVoluntarioPct,
    turnoverInvoluntarioPct,
    earlyTurnoverQtd,
    earlyTurnoverPct,
    salarioMedio,
    custoEstimadoTurnover,
    tempoMedioCasaMeses,
    mesAnteriorTaxaTD,
    variacaoMesAnterior,
    mesesEvolucao,
    departamentosRanking,
    motivosDistribuicao,
  };
}
