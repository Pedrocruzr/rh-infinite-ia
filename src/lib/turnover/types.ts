export type TipoDesligamento = "voluntario" | "involuntario";

export type MotivoDesligamento =
  | "Salário / Remuneração"
  | "Liderança / Gestão"
  | "Performance / Baixo Rendimento"
  | "Fit Cultural"
  | "Oportunidade de Carreira"
  | "Saúde / Pessoal"
  | "Ambiente de Trabalho"
  | "Outro";

export interface TurnoverEmployee {
  id: string;
  user_id?: string;
  matricula: string;
  nome: string;
  cargo: string;
  departamento: string;
  salario: number;
  data_admissao: string; // YYYY-MM-DD
  data_desligamento?: string | null; // YYYY-MM-DD
  tipo_desligamento?: TipoDesligamento | null;
  motivo_especifico?: MotivoDesligamento | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TurnoverEmployeePayload {
  matricula: string;
  nome: string;
  cargo: string;
  departamento: string;
  salario: number;
  data_admissao: string;
  data_desligamento?: string | null;
  tipo_desligamento?: TipoDesligamento | null;
  motivo_especifico?: MotivoDesligamento | string | null;
}

export interface TurnoverExitPayload {
  data_desligamento: string;
  tipo_desligamento: TipoDesligamento;
  motivo_especifico: MotivoDesligamento | string;
}

export interface TurnoverFilters {
  search: string;
  departamento: string;
  status: "todos" | "ativos" | "desligados";
  periodoMes: number; // 0 = todos, 1 = jan ... 12 = dez
  ano: number;
}

export interface MonthTurnoverData {
  mesNumero: number;
  mesNome: string;
  mesAbrev: string;
  admissoes: number;
  desligamentos: number;
  desligamentosVoluntarios: number;
  desligamentosInvoluntarios: number;
  efetivoAtivo: number;
  taxaTurnoverDesligamento: number; // TD %
  taxaTurnoverGeral: number; // TG %
}

export interface DepartmentTurnoverData {
  departamento: string;
  cor: string;
  efetivo: number;
  desligamentos: number;
  taxa: number; // %
}

export interface ReasonTurnoverData {
  motivo: string;
  quantidade: number;
  percentual: number;
  cor: string;
}

export interface TurnoverMetrics {
  efetivoAtivoAtual: number;
  totalDesligamentosPeriodo: number;
  totalAdmissoesPeriodo: number;
  taxaTurnoverDesligamento: number; // TD %
  taxaTurnoverGeral: number; // TG %
  turnoverVoluntarioPct: number; // TV %
  turnoverInvoluntarioPct: number;
  earlyTurnoverQtd: number; // <= 90 dias
  earlyTurnoverPct: number; // ET %
  salarioMedio: number;
  custoEstimadoTurnover: number;
  tempoMedioCasaMeses: number;
  mesAnteriorTaxaTD: number;
  variacaoMesAnterior: number;
  mesesEvolucao: MonthTurnoverData[];
  departamentosRanking: DepartmentTurnoverData[];
  motivosDistribuicao: ReasonTurnoverData[];
}
