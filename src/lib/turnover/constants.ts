import { JOB_DEPARTMENTS, type JobDepartment } from "@/lib/jobs/departments";
import type { MotivoDesligamento } from "./types";

export { JOB_DEPARTMENTS, type JobDepartment };

export const MOTIVOS_DESLIGAMENTO: { id: MotivoDesligamento; label: string; cor: string }[] = [
  { id: "Salário / Remuneração", label: "Salário / Remuneração", cor: "#F59E0B" }, // Âmbar
  { id: "Liderança / Gestão", label: "Liderança / Gestão", cor: "#EF4444" }, // Vermelho
  { id: "Performance / Baixo Rendimento", label: "Performance / Rendimento", cor: "#8B5CF6" }, // Roxo
  { id: "Fit Cultural", label: "Fit Cultural", cor: "#EC4899" }, // Rosa
  { id: "Oportunidade de Carreira", label: "Oportunidade de Carreira", cor: "#3B82F6" }, // Azul
  { id: "Ambiente de Trabalho", label: "Ambiente de Trabalho", cor: "#10B981" }, // Verde
  { id: "Saúde / Pessoal", label: "Saúde / Pessoal", cor: "#06B6D4" }, // Ciano
  { id: "Outro", label: "Outro", cor: "#64748B" }, // Cinza
];

export const MESES_ANO = [
  { numero: 1, nome: "Janeiro", abrev: "Jan" },
  { numero: 2, nome: "Fevereiro", abrev: "Fev" },
  { numero: 3, nome: "Março", abrev: "Mar" },
  { numero: 4, nome: "Abril", abrev: "Abr" },
  { numero: 5, nome: "Maio", abrev: "Mai" },
  { numero: 6, nome: "Junho", abrev: "Jun" },
  { numero: 7, nome: "Julho", abrev: "Jul" },
  { numero: 8, nome: "Agosto", abrev: "Ago" },
  { numero: 9, nome: "Setembro", abrev: "Set" },
  { numero: 10, nome: "Outubro", abrev: "Out" },
  { numero: 11, nome: "Novembro", abrev: "Nov" },
  { numero: 12, nome: "Dezembro", abrev: "Dez" },
];
