export type SupportPriority = "baixa" | "media" | "alta";
export type SupportStatus = "aberto" | "em_andamento" | "resolvido";

export interface SupportTicket {
  id: string;
  user_id: string | null;
  subject: string;
  priority: string;
  status: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketPayload {
  subject: string;
  priority: SupportPriority;
  message: string;
}
