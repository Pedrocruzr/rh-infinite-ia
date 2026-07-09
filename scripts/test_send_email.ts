import { sendEmail } from "../src/lib/email";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function testEmail() {
  console.log("=== Enviando E-mail de Teste (Titan Mail / SMTP) ===");
  
  const destinationEmail = process.argv[2] || "suporte@stackercompany.com.br";
  const planArg = process.argv[3] || "perfil"; // "perfil" or "completo"
  const isProfileTest = planArg.toLowerCase() !== "completo";
  
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`Plano de teste: ${isProfileTest ? "Perfil Comportamental" : "Stacks Infinity (Completo)"}`);
  console.log(`Destinatário: ${destinationEmail}`);

  try {
    const planName = isProfileTest ? "Perfil Comportamental" : "Stacks Infinity";
    const planCredits = isProfileTest ? "9" : "29";
    const welcomeName = "Cliente Teste Stacker";
    const email = destinationEmail;

    const emailSubject = isProfileTest
      ? "Bem-vindo à Stacker! Conclua o seu cadastro e resgate seus bônus 🎁"
      : "Bem-vindo à Stacker! Conclua o seu cadastro 🚀";

    const emailHtml = `
      <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #0284c7; margin-top: 0; font-size: 24px;">Parabéns pela aquisição do plano ${planName}! 🚀</h2>
        <p>Olá, <strong>${welcomeName}</strong>,</p>
        <p>Este é um e-mail de teste para verificar se as suas configurações do Titan Mail SMTP na Stacker estão funcionando com sucesso!</p>
        <p>Para começar a usar a plataforma e liberar os seus <strong>${planCredits} créditos</strong> do plano, você precisa apenas concluir o seu cadastro inicial.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://app.stackercompany.com.br/cadastro?email=${encodeURIComponent(email)}&name=${encodeURIComponent(welcomeName)}" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Concluir meu Cadastro</a>
        </div>
        
        <p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 14px;">
          ⚠️ <strong>Atenção:</strong> Ao se cadastrar, certifique-se de usar exatamente o mesmo e-mail desta compra (<strong>${email}</strong>), pois é a ele que seus créditos e assinatura estão associados.
        </p>

        <div style="margin-top: 30px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">🎁 \${isProfileTest ? "Seus Bônus Exclusivos inclusos:" : "Seu Bônus Exclusivo incluso:"}</h3>
          <ul style="padding-left: 20px; margin-bottom: 0; line-height: 1.6;">
            <li><strong>Bônus 1:</strong> <a href="https://app.stackercompany.com.br/downloads/ebook-recrutamento-inteligente.pdf" style="color: #0284c7;">E-book Recrutamento e Seleção Inteligente</a> (PDF)</li>
            ${isProfileTest ? `
            <li><strong>Bônus 2:</strong> <a href="https://app.stackercompany.com.br/downloads/10-prompts-descricao-cargo.pdf" style="color: #0284c7;">10 Prompts para Descrição de Cargo</a> (PDF)</li>
            <li><strong>Bônus 3:</strong> <a href="https://app.stackercompany.com.br/downloads/50-perguntas-entrevista.xlsx" style="color: #0284c7;">50 Perguntas para Entrevista por Competência</a> (Excel/Planilha)</li>
            ` : ""}
          </ul>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Se precisar de qualquer suporte, basta responder diretamente a este e-mail.</p>
        <p style="font-size: 14px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
      </div>
    `;

    const res = await sendEmail({
      to: destinationEmail,
      subject: emailSubject,
      html: emailHtml
    });

    console.log("✅ E-mail enviado com sucesso! Verifique a sua caixa de entrada.");
    console.log("Detalhes do envio:", res);
  } catch (error) {
    console.error("❌ Falha no envio do e-mail:", error);
  }
}

testEmail();
