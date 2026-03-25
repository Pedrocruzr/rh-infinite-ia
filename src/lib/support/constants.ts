import type { SupportPriority, SupportStatus } from "./types";

export const SUPPORT_EMAIL = "suporte@rhinfiniteia.com";
export const SUPPORT_WHATSAPP_URL = "https://wa.link/sx5z94";

export const SUPPORT_PRIORITY_OPTIONS: Array<{ value: SupportPriority; label: string }> = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
];

export const SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
};

export const SUPPORT_PRIORITY_LABELS: Record<SupportPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const SUPPORT_STATUS_BADGE_CLASSES: Record<SupportStatus, string> = {
  aberto:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300",
  em_andamento:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300",
  resolvido:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
};

export const SUPPORT_PRIORITY_BADGE_CLASSES: Record<SupportPriority, string> = {
  baixa:
    "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300",
  media:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300",
  alta:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300",
};

export const SUPPORT_FAQ = [
  {
    question: "Não consigo executar um agente. O que verificar?",
    answer:
      "Confirme se os campos obrigatórios foram preenchidos, revise a conexão e tente novamente com informações mais objetivas.",
  },
  {
    question: "O resultado parece incompleto. O que fazer?",
    answer:
      "Refaça o envio com mais contexto, detalhes da vaga ou mais informações do candidato para melhorar a resposta.",
  },
  {
    question: "O sistema ficou lento ou travou. Como reportar?",
    answer:
      "Use o botão de reportar problema técnico no formulário ou abra diretamente o WhatsApp de suporte.",
  },
  {
    question: "Consigo acompanhar o andamento do meu chamado?",
    answer:
      "Sim. A própria página de suporte mostra o status atual das suas solicitações.",
  },
];
