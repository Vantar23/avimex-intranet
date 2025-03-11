import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  console.log("🟢 Token detectado en middleware:", token || "Ninguno");

  const protectedRoutes = ["/dashboard", "/perfil", "/configuracion"];
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    console.log("🔴 No hay token, redirigiendo a login");
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🔥 Agrega el token en el header con el nombre "token"
  const requestHeaders = new Headers(req.headers);
  if (token) {
    requestHeaders.set("token", token);
  }

  return NextResponse.next({ headers: requestHeaders });
}

export const config = {
  matcher: ["/dashboard/:path*", "/perfil/:path*", "/configuracion/:path*"],
};