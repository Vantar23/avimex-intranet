import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const envToken = process.env.MY_PRIVATE_TOKEN;

  console.log("🟢 Token detectado en middleware:", token || "Ninguno");

  // Si no hay cookie 'session' pero existe el token de entorno, establecerlo como cookie
  if (!token && envToken) {
    console.log("🟡 No hay cookie, estableciendo token desde .env");
    const res = NextResponse.next();
    res.cookies.set("session", envToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return res;
  }

  const protectedRoutes = ["/dashboard", "/perfil", "/configuracion"];
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    console.log("🔴 No hay token, redirigiendo a login")
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🔥 Agrega el token en el header con el nombre "Authorization" y el prefijo "Bearer"
  const requestHeaders = new Headers(req.headers);
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = NextResponse.next({ headers: requestHeaders });

  // 🔥 Si la respuesta del servidor es 401 o contiene "Unexpected token", borra las cookies y redirige al login
  if (response.status === 401 || response.statusText.includes("Unexpected token")) {
    response.cookies.delete("session");
    return NextResponse.redirect(new URL("/", req.url));
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/perfil/:path*", "/configuracion/:path*", "/api/proxyJson/:path*"],
};

