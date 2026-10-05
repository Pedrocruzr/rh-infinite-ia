import nodemailer from "nodemailer";

const smtpHost = "smtp.suite.uol";
const smtpPort = 587;
const smtpUser = "suporte@stackercompany.com.br";
const smtpPass = "Rapa2719@";
const fromEmail = "suporte@stackercompany.com.br";
const toEmail = "pedrocruzr@gmail.com";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false, // 587 STARTTLS
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function main() {
  console.log(`Conectando ao servidor SMTP UOL Host (${smtpHost}:${smtpPort})...`);
  await transporter.verify();
  console.log("Autenticação SMTP realizada com sucesso!\n");

  // 1. Simulação Produto 1: Sistema Stacker Completo (Stacks Infinity)
  console.log("Enviando Simulação 1: Sistema Stacker Completo...");
  await transporter.sendMail({
    from: `"Stacker" <${fromEmail}>`,
    to: toEmail,
    subject: "[SIMULAÇÃO 1/3] Bem-vindo à Stacker! Conclua o seu cadastro 🚀 (Sistema Completo)",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 26px;">Stacker Intelligence</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Plataforma Integrada de RH & Inteligência Artificial</p>
        </div>

        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Parabéns pela aquisição do plano Stacks Infinity! 🚀</h2>
        <p>Olá, <strong>Pedro Cruz</strong>,</p>
        <p>Ficamos muito felizes em ter você conosco! Sua assinatura foi confirmada com sucesso.</p>
        <p>Para começar a usar a plataforma e liberar os seus <strong>29 créditos mensais</strong>, basta concluir o seu cadastro inicial clicando no botão abaixo:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://app.stackercompany.com.br/cadastro?email=${encodeURIComponent(toEmail)}&name=Pedro%20Cruz&plan=completo" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Concluir meu Cadastro</a>
        </div>
        
        <p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 13px;">
          ⚠️ <strong>Atenção:</strong> Ao se cadastrar, utilize este mesmo e-mail (<strong>${toEmail}</strong>), pois seus créditos e acessos estão vinculados a ele.
        </p>

        <div style="margin-top: 25px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 15px;">🎁 Seus Bônus Exclusivos inclusos:</h3>
          <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.6; font-size: 14px;">
            <li><strong>Bônus 1:</strong> <a href="https://app.stackercompany.com.br/downloads/ebook-recrutamento-inteligente.pdf" style="color: #0284c7;">E-book Recrutamento e Seleção Inteligente</a> (PDF)</li>
            <li><strong>Bônus 2:</strong> <a href="https://app.stackercompany.com.br/downloads/10-prompts-descricao-cargo.pdf" style="color: #0284c7;">10 Prompts para Descrição de Cargo</a> (PDF)</li>
            <li><strong>Bônus 3:</strong> <a href="https://app.stackercompany.com.br/downloads/50-perguntas-entrevista.xlsx" style="color: #0284c7;">50 Perguntas para Entrevista por Competência</a> (Excel/Planilha)</li>
          </ul>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Se precisar de qualquer suporte, basta responder a este e-mail ou escrever para <a href="mailto:suporte@stackercompany.com.br" style="color: #0284c7;">suporte@stackercompany.com.br</a>.</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
      </div>
    `,
  });
  console.log("Simulação 1 enviada!");

  // 2. Simulação Produto 2: Teste de Perfil Comportamental
  console.log("Enviando Simulação 2: Teste de Perfil Comportamental...");
  await transporter.sendMail({
    from: `"Stacker" <${fromEmail}>`,
    to: toEmail,
    subject: "[SIMULAÇÃO 2/3] Bem-vindo à Stacker! Conclua o seu cadastro e resgate seus bônus 🎁 (Perfil Comportamental)",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 26px;">Stacker Intelligence</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Módulo de Mapeamento e Avaliação Comportamental</p>
        </div>

        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Parabéns pela aquisição do pacote de Perfil Comportamental! 🎁</h2>
        <p>Olá, <strong>Pedro Cruz</strong>,</p>
        <p>Sua compra foi confirmada com sucesso! Você acaba de garantir <strong>9 créditos de avaliações comportamentais</strong> para aplicar testes DISC e Big Five nos seus candidatos e colaboradores.</p>
        <p>Para ativar seus créditos e começar a gerar links de teste imediatamente, clique abaixo:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://app.stackercompany.com.br/cadastro?email=${encodeURIComponent(toEmail)}&name=Pedro%20Cruz&plan=perfil_comportamental" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Acessar Minhas Avaliações</a>
        </div>
        
        <div style="margin-top: 25px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 15px;">🎁 Seus Bônus inclusos no pacote:</h3>
          <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.6; font-size: 14px;">
            <li><strong>Bônus 1:</strong> <a href="https://app.stackercompany.com.br/downloads/ebook-recrutamento-inteligente.pdf" style="color: #0284c7;">E-book Recrutamento e Seleção Inteligente</a></li>
            <li><strong>Bônus 2:</strong> <a href="https://app.stackercompany.com.br/downloads/10-prompts-descricao-cargo.pdf" style="color: #0284c7;">10 Prompts para Descrição de Cargo com IA</a></li>
            <li><strong>Bônus 3:</strong> <a href="https://app.stackercompany.com.br/downloads/50-perguntas-entrevista.xlsx" style="color: #0284c7;">50 Perguntas para Entrevista por Competência</a></li>
          </ul>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Dúvidas? Entre em contato pelo e-mail <a href="mailto:suporte@stackercompany.com.br" style="color: #0284c7;">suporte@stackercompany.com.br</a>.</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
      </div>
    `,
  });
  console.log("Simulação 2 enviada!");

  // 3. Simulação Produto 3: Recrutamento & Seleção (6 Meses + Renovação Semestral)
  console.log("Enviando Simulação 3A: Recrutamento & Seleção (Boas-vindas)...");
  await transporter.sendMail({
    from: `"Stacker" <${fromEmail}>`,
    to: toEmail,
    subject: "[SIMULAÇÃO 3/3] Bem-vindo ao Stacker Recrutamento & Seleção! Conclua o seu cadastro 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 26px;">Stacker Recrutamento & Seleção</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Acesso Semestral Liberado (6 Meses)</p>
        </div>

        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Seu plano de Recrutamento & Seleção está ativo! 🚀</h2>
        <p>Olá, <strong>Pedro Cruz</strong>,</p>
        <p>Parabéns pela decisão de transformar seus processos seletivos com IA! Seu plano tem validade de <strong>6 meses</strong> e libera acesso total sem limite de créditos aos seguintes módulos:</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px;">
          <h3 style="color: #0369a1; margin-top: 0; font-size: 15px;">✅ Tudo o que está liberado para você:</h3>
          <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.6; font-size: 14px; color: #0c4a6e;">
            <li><strong>Painel de Vagas Kanban:</strong> gestão de vagas, métricas de tempo e cálculo automático de SLA</li>
            <li><strong>Painel de Turnover & Retenção:</strong> gráficos de retenção e motivos de desligamento</li>
            <li><strong>CLT IA:</strong> consultor jurídico trabalhista ilimitado com base legal atualizada</li>
            <li><strong>8 Agentes Especialistas de Seleção:</strong> Taxa de Aderência com a Vaga, Teste de Perfil Comportamental, DISC, Big Five, Entrevistador Automatizado, Mentor de Dinâmicas, Parecer Técnico de Entrevista e Analista de Custo por Contratação</li>
            <li><strong>Tabela de Aluno:</strong> desconto exclusivo para compra avulsa de testes comportamentais</li>
          </ul>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="https://app.stackercompany.com.br/cadastro?email=${encodeURIComponent(toEmail)}&name=Pedro%20Cruz&plan=recrutamento" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Acessar o Painel de Recrutamento</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Suporte oficial: <a href="mailto:suporte@stackercompany.com.br" style="color: #0284c7;">suporte@stackercompany.com.br</a>.</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
      </div>
    `,
  });
  console.log("Simulação 3A enviada!");

  // 3B. Simulação do E-mail de Renovação Semestral (R$ 197)
  console.log("Enviando Simulação 3B: E-mail de Renovação Semestral Expirada (R$ 197)...");
  await transporter.sendMail({
    from: `"Stacker" <${fromEmail}>`,
    to: toEmail,
    subject: "[SIMULAÇÃO BÔNUS] Seu período de acesso ao Stacker Recrutamento expirou ⏳ Renove por 6 meses por apenas R$ 197",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #0284c7; margin-top: 0; font-size: 22px;">Seu acesso de 6 meses expirou! ⏳</h2>
        <p>Olá, <strong>Pedro Cruz</strong>,</p>
        <p>O seu período de 6 meses de acesso ao módulo <strong>Stacker - Recrutamento & Seleção</strong> chegou ao fim.</p>
        <p>Esperamos que a plataforma tenha acelerado e qualificado seus processos seletivos! Para continuar aproveitando todas as ferramentas sem interrupções, você pode renovar seu acesso semestral com o valor promocional exclusivo de renovação por apenas <strong>R$ 197,00</strong>:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://www.asaas.com/c/ez5sb4gd3enwnyo2" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Renovar Acesso por 6 Meses (R$ 197)</a>
        </div>

        <div style="margin-top: 25px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 15px;">🚀 O que continua liberado na sua renovação:</h3>
          <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.6; font-size: 14px;">
            <li>Painel de Vagas Kanban com métricas e SLA com IA</li>
            <li>Painel de Turnover e Retenção</li>
            <li>CLT IA com pesquisas legislativas ilimitadas</li>
            <li>Todos os 8 Agentes de Seleção liberados</li>
            <li>Acesso à Tabela de Aluno para pacotes de testes</li>
          </ul>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Se tiver qualquer dúvida, responda diretamente a este e-mail ou escreva para <a href="mailto:suporte@stackercompany.com.br" style="color: #0284c7;">suporte@stackercompany.com.br</a>.</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
      </div>
    `,
  });
  console.log("Simulação 3B enviada com sucesso!");
  console.log("\nTodos os 4 e-mails foram enviados para " + toEmail + "!");
}

main().catch((err) => {
  console.error("Erro no envio:", err);
  process.exit(1);
});
