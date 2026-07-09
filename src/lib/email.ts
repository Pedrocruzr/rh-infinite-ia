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
    // Send via SMTP (Titan Mail / Hostgator)
    console.log(`[Email] Enviando e-mail para ${to} via SMTP (${smtpHost})...`);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
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
