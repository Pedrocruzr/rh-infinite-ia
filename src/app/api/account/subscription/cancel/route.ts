import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelAsaasSubscription } from "@/lib/billing/asaas/service";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { reason, feedback } = body;

    const admin = createAdminClient();

    const { data: subscription, error: subscriptionError } = await admin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: "Assinatura não encontrada." },
        { status: 404 }
      );
    }

    const subscriptionId = (subscription as any).asaas_subscription_id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Assinatura Asaas ainda não vinculada." },
        { status: 400 }
      );
    }

    if (subscriptionId !== "mock_subscription_id") {
      await cancelAsaasSubscription(subscriptionId);
    }

    // Insert cancellation feedback support ticket
    if (reason) {
      await admin.from("support_tickets").insert({
        user_id: user.id,
        subject: "Cancelamento de Assinatura",
        priority: "alta",
        status: "aberto",
        message: `O usuário solicitou o cancelamento da assinatura.\n\nMotivo selecionado: ${reason}\n\nComentários adicionais: ${feedback || "Nenhum"}`,
      });

      // Send email alert to support
      const resendApiKey = process.env.RESEND_API_KEY;
      const resendFrom = process.env.RESEND_FROM_EMAIL || "suporte@stackercompany.com.br";

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: resendFrom,
            to: "suporte@stackercompany.com.br",
            subject: `🚨 Alerta de Cancelamento - ${user.email}`,
            html: `
              <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #ef4444; margin-top: 0;">Solicitação de Cancelamento de Assinatura</h2>
                <p>O usuário <strong>${user.email}</strong> solicitou o cancelamento do plano na plataforma.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="margin-bottom: 5px; font-weight: bold; color: #475569;">Motivo do Cancelamento:</p>
                <blockquote style="background: #f8fafc; padding: 12px 16px; border-left: 4px solid #ef4444; border-radius: 6px; margin: 0 0 16px 0; font-style: italic;">
                  ${reason}
                </blockquote>
                <p style="margin-bottom: 5px; font-weight: bold; color: #475569;">Feedback / Comentários adicionais:</p>
                <blockquote style="background: #f8fafc; padding: 12px 16px; border-left: 4px solid #cbd5e1; border-radius: 6px; margin: 0; font-style: italic;">
                  ${feedback || "Nenhum comentário enviado."}
                </blockquote>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Erro ao enviar e-mail de cancelamento via Resend:", emailError);
        }
      }
    }

    await admin
      .from("subscriptions")
      .update({
        status: "canceled",
        cancel_at_period_end: true,
      })
      .eq("id", subscription.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao cancelar assinatura.",
      },
      { status: 500 }
    );
  }
}
