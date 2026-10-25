export type JobStatus = "em_aberto" | "pausada" | "fechada";

export type JobOriginChannel =
  | "LinkedIn"
  | "Indicação Interna"
  | "Gupy"
  | "Site de Carreiras"
  | "Instagram / Redes"
  | "Outros";

export interface JobOpening {
  id: string;
  user_id?: string;
  nome_vaga: string;
  data_abertura: string;
  data_fechamento: string | null;
  status: JobStatus;
  dias_em_aberto: number;
  data_primeiro_contato?: string | null;
  canal_origem?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface JobOpeningPayload {
  nome_vaga: string;
  data_abertura: string;
  data_fechamento?: string | null;
  status: JobStatus;
  data_primeiro_contato?: string | null;
  canal_origem?: string | null;
}

export interface JobFilters {
  search: string;
  status: "todos" | JobStatus;
  dateStart: string;
  dateEnd: string;
  canal?: "todos" | string;
}
