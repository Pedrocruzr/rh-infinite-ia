import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    // 1. Auth check via query token if configured
    const url = new URL(request.url);
    const tokenParam = url.searchParams.get("token");
    const configuredSecret = process.env.KIWIFY_WEBHOOK_SECRET;

    if (configuredSecret && tokenParam !== configuredSecret) {
      return NextResponse.json(
        { error: "Webhook não autorizado. Token incorreto." },
        { status: 401 }
      );
    }

    // 2. Parse request payload
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Corpo da requisição vazio ou inválido." },
        { status: 400 }
      );
    }

    // Kiwify payload common structures
    const orderStatus = String(body.order_status || body.status || body.event || "").toLowerCase();
    const customer = body.Customer || body.customer || {};
    const email = String(customer.email || body.email || "").trim().toLowerCase();
    const name = String(customer.name || body.name || "").trim();
    const orderId = String(body.order_id || body.id || "").trim();

    // Check if purchase is approved
    const isApproved =
      orderStatus === "approved" ||
      orderStatus === "paid" ||
      orderStatus === "compra_aprovada" ||
      orderStatus === "subscription_renewed" ||
      orderStatus === "renewed";

    if (!email || !orderId) {
      // Return 200 to acknowledge receipt even if fields are missing (avoid retry loops from Kiwify)
      return NextResponse.json({
        ok: false,
        warning: "Campos obrigatórios (email ou order_id) ausentes no payload.",
      });
    }

    if (!isApproved) {
      return NextResponse.json({
        ok: true,
        message: `Evento ignorado: status da compra é ${orderStatus}.`,
      });
    }

    // 3. Connect to Supabase as Admin to process purchase
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("process_kiwify_approved_purchase", {
      p_email: email,
      p_name: name || null,
      p_order_id: orderId,
      p_payload: body,
    });

    if (error) {
      throw new Error(error.message || "Erro ao processar compra no banco de dados.");
    }

    const rpcResult = data as any;

    // 4. Send welcoming email to customer via Resend if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL || "suporte@stackercompany.com.br";

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const welcomeName = name || "Cliente";

        if (rpcResult?.status === "saved_for_later_registration") {
          // User needs to sign up
          await resend.emails.send({
            from: resendFrom,
            to: email,
            subject: "Bem-vindo à Stacker! Conclua o seu cadastro",
            html: `
              <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <h2 style="color: #0284c7; margin-top: 0; font-size: 24px;">Parabéns pela aquisição do sistema Stacker! 🚀</h2>
                <p>Olá, <strong>${welcomeName}</strong>,</p>
                <p>Ficamos muito felizes em ter você conosco. Sua compra foi confirmada com sucesso!</p>
                <p>Para começar a usar a plataforma e liberar os seus <strong>29 créditos</strong> do plano Stacker, você precisa apenas concluir o seu cadastro inicial.</p>
                
                <div style="margin: 30px 0; text-align: center;">
                  <a href="https://app.stackercompany.com.br/cadastro" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Cadastrar-se na Plataforma</a>
                </div>
                
                <p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 14px;">
                  ⚠️ <strong>Atenção:</strong> Ao se cadastrar, certifique-se de usar exatamente o mesmo e-mail desta compra (<strong>${email}</strong>), pois é a ele que seus créditos e assinatura estão associados.
                </p>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Se precisar de qualquer suporte, basta responder diretamente a este e-mail.</p>
                <p style="font-size: 14px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
              </div>
            `,
          });
        } else if (rpcResult?.status === "processed_immediately") {
          // User already has an account, subscription was activated immediately
          await resend.emails.send({
            from: resendFrom,
            to: email,
            subject: "Seu plano Stacker já está ativo! 🚀",
            html: `
              <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <h2 style="color: #0284c7; margin-top: 0; font-size: 24px;">Seu plano Stacker já está ativo! 🚀</h2>
                <p>Olá, <strong>${welcomeName}</strong>,</p>
                <p>Sua compra foi confirmada com sucesso!</p>
                <p>Como você já possuía uma conta cadastrada com esse e-mail na Stacker, o seu plano e os seus <strong>29 créditos</strong> já foram liberados e estão prontos para uso.</p>
                
                <div style="margin: 30px 0; text-align: center;">
                  <a href="https://app.stackercompany.com.br/login" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Acessar o Painel</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Se precisar de qualquer suporte, basta responder diretamente a este e-mail.</p>
                <p style="font-size: 14px; color: #64748b; margin-top: 5px;"><strong>Equipe Stacker</strong></p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de boas-vindas via Resend:", emailError);
      }
    }

    return NextResponse.json({
      ok: true,
      result: rpcResult,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado no processamento do webhook.",
      },
      { status: 500 }
    );
  }
}
