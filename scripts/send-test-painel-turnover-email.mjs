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
  console.log("Autenticação SMTP OK!");

  // Simulação 1: Painel de Turnover - Plano Start (R$ 67/mês - Até 10 contas ativas e 10 desligamentos)
  console.log("Enviando Simulação: Painel de Turnover - Plano Start (R$ 67)...");
  await transporter.sendMail({
    from: `"Stacker" <${fromEmail}>`,
    to: toEmail,
    subject: "Bem-vindo ao Painel de Turnover Stacker! Conclua o seu cadastro 📊 (Plano Start)",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 26px;">Stacker Intelligence</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Painel de Gestão e Análise de Turnover & Retenção</p>
        </div>

        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Parabéns pela aquisição do Painel de Turnover Start! 📊</h2>
        <p>Olá, <strong>Pedro Cruz</strong>,</p>
        <p>Sua assinatura foi confirmada com sucesso! O seu acesso ao <strong>Painel de Turnover - Plano Start</strong> já está liberado para monitorar <strong>até 10 colaboradores ativos e até 10 colaboradores desligados</strong> com inteligência e previsibilidade.</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px;">
          <h3 style="color: #0369a1; margin-top: 0; font-size: 15px;">🚀 O que você tem no seu Painel de Turnover:</h3>
          <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.6; font-size: 14px; color: #0c4a6e;">
            <li><strong>Cálculo Automático de Taxa de Turnover:</strong> geral e por departamento</li>
            <li><strong>Análise de Motivos de Desligamento:</strong> voluntário vs. involuntário, remuneração, fit cultural e liderança</li>
            <li><strong>Custo Estimado de Rotatividade:</strong> cálculo em tempo real do impacto financeiro das rescisões</li>
            <li><strong>Gestão Segura:</strong> sincronização em tempo real e proteção de dados no Cloud Vault</li>
            <li><strong>Capacidade do Plano Start:</strong> até 10 contas ativas e 10 contas de desligamento cadastradas</li>
          </ul>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="https://app.stackercompany.com.br/cadastro?email=${encodeURIComponent(toEmail)}&name=Pedro%20Cruz&plan=turnover_start" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Concluir Cadastro e Acessar Painel</a>
        </div>
        
        <p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 13px;">
          💡 <strong>Dica:</strong> Você poderá visualizar todas as demais ferramentas da plataforma (vagas, robôs de IA e CLT). Sempre que desejar desbloquear robôs adicionais ou migrar para o plano Pro (até 25 ativas e 25 desligamentos), basta clicar no recurso para ver as opções de upgrade.
        </p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Se precisar de qualquer suporte, basta responder a este e-mail ou escrever para <a href="mailto:suporte@stackercompany.com.br" style="color: #0284c7;">suporte@stackercompany.com.br</a>.</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
      </div>
    `,
  });
  console.log("Simulação 1 enviada!");

  // Simulação 2: Painel de Turnover - Plano Pro (R$ 97/mês - Até 25 contas ativas e 25 desligamentos)
  console.log("Enviando Simulação: Painel de Turnover - Plano Pro (R$ 97)...");
  await transporter.sendMail({
    from: `"Stacker" <${fromEmail}>`,
    to: toEmail,
    subject: "Bem-vindo ao Painel de Turnover Stacker! Conclua o seu cadastro 📊 (Plano Pro)",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 26px;">Stacker Intelligence</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Painel de Gestão e Análise de Turnover & Retenção</p>
        </div>

        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Parabéns pela aquisição do Painel de Turnover Pro! 📊</h2>
        <p>Olá, <strong>Pedro Cruz</strong>,</p>
        <p>Sua assinatura foi confirmada com sucesso! O seu acesso ao <strong>Painel de Turnover - Plano Pro</strong> já está liberado para gerenciar <strong>até 25 colaboradores ativos e até 25 colaboradores desligados</strong> com inteligência analítica completa.</p>
        
        <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px;">
          <h3 style="color: #0369a1; margin-top: 0; font-size: 15px;">🚀 O que você tem no seu Painel de Turnover Pro:</h3>
          <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.6; font-size: 14px; color: #0c4a6e;">
            <li><strong>Capacidade Ampliada:</strong> até 25 contas ativas e 25 contas de desligamento cadastradas</li>
            <li><strong>Cálculo Automático de Taxa de Turnover:</strong> geral e discriminado por departamentos</li>
            <li><strong>Matriz de Causa-Raiz:</strong> voluntário vs. involuntário, remuneração, liderança e fit cultural</li>
            <li><strong>Custo Financeiro Estimado:</strong> impacto orçamentário real por desligamento e substituição</li>
            <li><strong>Exportação e Relatórios:</strong> visão executiva completa para reuniões de diretoria</li>
          </ul>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="https://app.stackercompany.com.br/cadastro?email=${encodeURIComponent(toEmail)}&name=Pedro%20Cruz&plan=turnover_pro" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Concluir Cadastro e Acessar Painel</a>
        </div>
        
        <p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 13px;">
          💡 <strong>Dica:</strong> Você poderá visualizar todas as demais ferramentas da plataforma (vagas, robôs de IA e CLT). Sempre que desejar desbloquear recursos adicionais, basta clicar no recurso para ver as opções de upgrade.
        </p>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Se precisar de qualquer suporte, basta responder a este e-mail ou escrever para <a href="mailto:suporte@stackercompany.com.br" style="color: #0284c7;">suporte@stackercompany.com.br</a>.</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
      </div>
    `,
  });
  console.log("Simulação 2 enviada!");
  console.log("\nTodos os e-mails de teste do Painel de Turnover foram entregues com sucesso a " + toEmail + "!");
}

main().catch((err) => {
  console.error("Erro no envio:", err);
  process.exit(1);
});
