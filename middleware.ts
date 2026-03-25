import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PAGES = new Set([
  "/",
  "/login",
  "/cadastro",
  "/verificar-email",
  "/email-confirmado",
  "/esqueci-senha",
  "/resetar-senha",
]);

const PRIVATE_API_PREFIXES = [
  "/api/agents",
  "/api/assessments",
  "/api/recrutador",
  "/api/job-openings",
  "/api/support-tickets",
  "/api/tutorial-videos",
];

const PUBLIC_API_PREFIXES = [
  "/api/auth/precheck",
  "/api/debug-auth",
];

function isPrivatePage(pathname: string) {
  return pathname.startsWith("/app");
}

function isPrivateApi(pathname: string) {
  return PRIVATE_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isEmailVerified(user: { email_confirmed_at?: string | null }) {
  return Boolean(user.email_confirmed_at);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublicApi(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isPrivateApi(pathname)) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    if (isPrivatePage(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  const verified = isEmailVerified(user);

  if (!verified) {
    if (isPrivateApi(pathname)) {
      return NextResponse.json(
        { error: "Verifique seu e-mail antes de acessar este recurso." },
        { status: 403 }
      );
    }

    if (isPrivatePage(pathname)) {
      const verifyUrl = new URL("/verificar-email", request.url);
      verifyUrl.searchParams.set("email", user.email ?? "");
      return NextResponse.redirect(verifyUrl);
    }
  }

  if (verified && PUBLIC_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL("/app/agentes", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
