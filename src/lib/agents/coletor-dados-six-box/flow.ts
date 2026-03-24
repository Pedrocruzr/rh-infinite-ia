export const flow = {
  start: {
    question: "Você já tem um questionário pronto? (sim/nao)",
    field: "temQuestionario",
  },

  temQuestionario: {
    validate: (input: string) => {
      const v = input.trim().toLowerCase();
      if (v === "sim" || v === "nao") return true;
      return "Responda apenas com sim ou nao.";
    },
    next: (input: string) => {
      const v = input.trim().toLowerCase();
      return v === "sim" ? "desejaMelhorar" : "finalModeloBase";
    },
  },

  desejaMelhorar: {
    question: "Deseja que o agente Coletor de Dados Six Box melhore o seu questionário para uma melhor aplicação na empresa? (sim/nao)",
    field: "desejaMelhorar",
    validate: (input: string) => {
      const v = input.trim().toLowerCase();
      if (v === "sim" || v === "nao") return true;
      return "Responda apenas com sim ou nao.";
    },
    next: (input: string) => {
      const v = input.trim().toLowerCase();
      return v === "sim" ? "questionarioUsuario" : "finalSemMelhoria";
    },
  },

  questionarioUsuario: {
    question: "Cole aqui o seu questionário completo para que eu possa corrigir gramaticalmente e melhorar a estrutura para uma melhor aplicação.",
    field: "questionarioUsuario",
    validate: (input: string) => {
      if (!input || input.trim().length < 20) {
        return "Envie o questionário completo para que eu possa melhorar o material.";
      }
      return true;
    },
    next: "finalQuestionarioMelhorado",
  },

  finalModeloBase: {
    finished: true,
  },

  finalSemMelhoria: {
    finished: true,
  },

  finalQuestionarioMelhorado: {
    finished: true,
  },
};
