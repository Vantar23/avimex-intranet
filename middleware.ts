import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("session")?.value;

  // Permitir acceso sin restricción a la página principal
  if (pathname === "/") return NextResponse.next();

  // Si no hay token en cookies, redirigir a "/"
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/perfil/:path*", "/configuracion/:path*", "/api/proxyJson/:path*"],
};