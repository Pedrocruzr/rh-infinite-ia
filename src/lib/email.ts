import nodemailer from "nodemailer";
import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  from?: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, from, subject, html }: SendEmailInput) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || "465");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  const fromEmail = from || process.env.RESEND_FROM_EMAIL || "suporte@stackercompany.com.br";

  if (smtpHost && smtpUser && smtpPass) {
    // Send via SMTP (UOL Host / Titan Mail / Hostgator)
    console.log(`[Email] Enviando e-mail para ${to} via SMTP (${smtpHost})...`);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });
  } else {
    // Fallback to Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error("Nenhuma configuração de envio de e-mail encontrada (SMTP ou Resend).");
    }
    
    console.log(`[Email] Enviando e-mail para ${to} via Resend...`);
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message || "Erro no envio via Resend.");
    }

    return data;
  }
}

export async function sendRenewalExpiredEmail({ to, name }: { to: string; name?: string }) {
  const customerName = name || "Cliente";
  const renewalUrl = "https://www.asaas.com/c/ez5sb4gd3enwnyo2";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "suporte@stackercompany.com.br";

  const subject = "Seu período de acesso ao Stacker Recrutamento expirou ⏳ Renove por 6 meses por apenas R$ 197";
  const html = `
    <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #0284c7; margin-top: 0; font-size: 24px;">Seu acesso de 6 meses expirou! ⏳</h2>
      <p>Olá, <strong>${customerName}</strong>,</p>
      <p>O seu período de 6 meses de acesso ao módulo <strong>Stacker - Recrutamento & Seleção</strong> chegou ao fim.</p>
      <p>Esperamos que a plataforma tenha acelerado e qualificado seus processos seletivos! Para continuar aproveitando todas as ferramentas sem interrupções, você pode reativar seu acesso semestral com o valor promocional exclusivo de renovação por apenas <strong>R$ 197,00</strong>:</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${renewalUrl}" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Renovar Acesso por 6 Meses (R$ 197)</a>
      </div>

      <div style="margin-top: 30px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc;">
        <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">🚀 O que continua liberado na sua renovação:</h3>
        <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.6;">
          <li>Painel de Vagas Kanban com métricas e SLA de fechamento com IA</li>
          <li>Painel de Turnover e Retenção</li>
          <li>CLT IA com pesquisas legislativas ilimitadas</li>
          <li>Todos os Agentes de Seleção (Aderência com a Vaga, Teste de Perfil, DISC, Big Five, Entrevistador Automatizado, Mentor de Dinâmicas, Parecer Técnico e Custo por Contratação)</li>
          <li>Acesso à Tabela de Aluno para pacotes de testes</li>
        </ul>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Se tiver qualquer dúvida ou precisar de auxílio, basta responder diretamente a este e-mail ou escrever para <a href="mailto:suporte@stackercompany.com.br" style="color: #0284c7;">suporte@stackercompany.com.br</a>.</p>
      <p style="font-size: 14px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
    </div>
  `;

  return sendEmail({
    to,
    from: fromEmail,
    subject,
    html,
  });
}
