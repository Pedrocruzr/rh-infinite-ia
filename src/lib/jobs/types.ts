export type JobStatus = "em_aberto" | "pausada" | "fechada";

export interface JobOpening {
  id: string;
  user_id?: string;
  nome_vaga: string;
  data_abertura: string;
  data_fechamento: string | null;
  status: JobStatus;
  dias_em_aberto: number;
  created_at?: string;
  updated_at?: string;
}

export interface JobOpeningPayload {
  nome_vaga: string;
  data_abertura: string;
  data_fechamento?: string | null;
  status: JobStatus;
}

export interface JobFilters {
  search: string;
  status: "todos" | JobStatus;
  dateStart: string;
  dateEnd: string;
}
