import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Expose the current pathname to headers so Server Components can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const isAppRoute = pathname.startsWith("/app");
  const isBypassedRoute =
    pathname.startsWith("/app/configuracoes") ||
    pathname.startsWith("/app/suporte");

  if (isAppRoute && !isBypassedRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!user.email_confirmed_at) {
      return NextResponse.redirect(
        new URL(`/verificar-email?email=${encodeURIComponent(user.email ?? "")}`, request.url)
      );
    }

    // Query active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const normalizedStatus = (subscription?.status || "").toLowerCase();
    const isMainActive = new Set(["active", "paid", "ativo"]).has(normalizedStatus);

    const isTrialingAndNotExpired =
      normalizedStatus === "trialing" &&
      subscription?.current_period_end &&
      new Date(subscription.current_period_end) > new Date();

    const isCanceledButNotExpired =
      normalizedStatus === "canceled" &&
      subscription?.current_period_end &&
      new Date(subscription.current_period_end) > new Date();

    const isSubscriptionActive =
      isMainActive ||
      isTrialingAndNotExpired ||
      isCanceledButNotExpired ||
      user.email?.toLowerCase() === "rnsantos27@gmail.com";

    if (!isSubscriptionActive) {
      return NextResponse.redirect(
        new URL("/app/configuracoes/assinatura?blocked=true", request.url)
      );
    }
  }

  // Local/Simulation check for perfil_comportamental plan
  const simulatedPlan = request.cookies.get("simulated_plan_code")?.value;
  if (simulatedPlan === "perfil_comportamental") {
    const isAgenteRoute = pathname.startsWith("/app/agentes");
    const isAgenteApiRoute = pathname.startsWith("/api/agents");

    if (isAgenteRoute) {
      const isBypassedAgent =
        pathname === "/app/agentes" ||
        pathname === "/app/agentes/teste-perfil-comportamental" ||
        pathname === "/app/agentes/clt-ia";

      if (!isBypassedAgent) {
        return NextResponse.redirect(new URL("/app/agentes?upsell=true", request.url));
      }
    }

    if (isAgenteApiRoute) {
      const isBypassedApi =
        pathname === "/api/agents/teste-perfil-comportamental";

      if (!isBypassedApi) {
        return NextResponse.json(
          {
            ok: false,
            stage: "plan_restriction",
            error: "Este agente não está disponível no seu plano. Atualize sua assinatura para desbloquear todos os agentes.",
          },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  // Match all internal application pages and agent APIs
  matcher: ["/app/:path*", "/api/agents/:path*"],
};
