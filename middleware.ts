import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("session")?.value;

  // Permitir acceso sin restricción a la página principal
  if (pathname === "/") return; // No devuelve una respuesta, deja que el servidor maneje la petición normalmente

  // Si no hay token en cookies, redirigir a "/"
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/perfil/:path*", "/configuracion/:path*", "/api/proxyJson/:path*"],
};
