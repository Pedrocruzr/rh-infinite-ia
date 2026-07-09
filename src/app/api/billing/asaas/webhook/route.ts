import { NextResponse } from "next/server";
import { getAsaasConfig } from "@/lib/billing/asaas/config";
import { handleAsaasWebhook } from "@/lib/billing/asaas/service";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const config = getAsaasConfig();
    const token =
      request.headers.get("asaas-access-token") ||
      request.headers.get("authorization") ||
      "";

    if (config.webhookToken && (!token || !token.includes(config.webhookToken))) {
      return NextResponse.json({ error: "Webhook não autorizado." }, { status: 401 });
    }

    const payload = await request.json().catch(() => null);
    const result = await handleAsaasWebhook(payload) as any;

    // Check if it's an actionable payment event and we have customerDetails
    const payment = result?.payment || {};
    const customer = result?.customerDetails || {};
    const email = String(customer.email || "").trim().toLowerCase();
    const name = String(customer.name || "").trim();

    const resendApiKey = process.env.RESEND_API_KEY;
    const smtpHost = process.env.SMTP_HOST;
    const resendFrom = process.env.RESEND_FROM_EMAIL || "suporte@stackercompany.com.br";

    const hasEmailConfig = !!(smtpHost || resendApiKey);

    if (hasEmailConfig && email && (payment?.status === "saved_for_later_registration" || payment?.status === "processed_immediately")) {
      try {
        const welcomeName = name || "Cliente";
        const isProfileTest = payment?.planCode === "perfil_comportamental";
        
        const planName = isProfileTest ? "Perfil Comportamental" : "Stacks Infinity";
        const planCredits = isProfileTest ? "9" : "29";

        // HTML Templates
        let emailHtml = "";
        let emailSubject = "";

        if (payment?.status === "saved_for_later_registration") {
          emailSubject = isProfileTest 
            ? "Bem-vindo à Stacker! Conclua o seu cadastro e resgate seus bônus 🎁"
            : "Bem-vindo à Stacker! Conclua o seu cadastro 🚀";

          emailHtml = `
            <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <h2 style="color: #0284c7; margin-top: 0; font-size: 24px;">Parabéns pela aquisição do plano ${planName}! 🚀</h2>
              <p>Olá, <strong>${welcomeName}</strong>,</p>
              <p>Ficamos muito felizes em ter você conosco. Sua compra foi confirmada com sucesso!</p>
              <p>Para começar a usar a plataforma e liberar os seus <strong>${planCredits} créditos</strong> do plano, você precisa apenas concluir o seu cadastro inicial.</p>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://app.stackercompany.com.br/cadastro?email=${encodeURIComponent(email)}&name=${encodeURIComponent(welcomeName)}" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Concluir meu Cadastro</a>
              </div>
              
              <p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 14px;">
                ⚠️ <strong>Atenção:</strong> Ao se cadastrar, certifique-se de usar exatamente o mesmo e-mail desta compra (<strong>${email}</strong>), pois é a ele que seus créditos e assinatura estão associados.
              </p>

              <div style="margin-top: 30px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc;">
                <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">🎁 Seus Bônus Exclusivos inclusos:</h3>
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
        } else {
          emailSubject = "Seu plano Stacker já está ativo! 🚀";
          emailHtml = `
            <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <h2 style="color: #0284c7; margin-top: 0; font-size: 24px;">Seu plano Stacker já está ativo! 🚀</h2>
              <p>Olá, <strong>${welcomeName}</strong>,</p>
              <p>Sua compra do plano <strong>${planName}</strong> foi confirmada com sucesso!</p>
              <p>Como você já possuía uma conta cadastrada com esse e-mail na Stacker, o seu plano e os seus <strong>${planCredits} créditos</strong> já foram liberados e estão prontos para uso.</p>
              
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://app.stackercompany.com.br/login" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Acessar o Painel</a>
              </div>

              <div style="margin-top: 30px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc;">
                <h3 style="color: #0f172a; margin-top: 0; font-size: 16px;">🎁 Seus Bônus Exclusivos inclusos:</h3>
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
        }

        await sendEmail({
          from: resendFrom,
          to: email,
          subject: emailSubject,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de boas-vindas (Asaas Webhook):", emailError);
      }
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao processar webhook Asaas.",
      },
      { status: 500 }
    );
  }
}
