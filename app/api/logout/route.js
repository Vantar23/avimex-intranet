import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  try {
    // Configurar múltiples cookies para que expiren inmediatamente
    const expiredCookies = [
      serialize("session", "", {
        httpOnly: true,
        secure: false, // ⚠️ No usar HTTPS en desarrollo
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      }),
      serialize("user", "", {
        httpOnly: true,
        secure: false, // ⚠️ No usar HTTPS en desarrollo
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      }),
      serialize("authToken", "", {
        httpOnly: true,
        secure: false, // ⚠️ No usar HTTPS en desarrollo
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      })
    ];

    const response = new NextResponse(
      JSON.stringify({ message: "Cierre de sesión exitoso" }),
      {
        status: 200,
        headers: {
          "Set-Cookie": expiredCookies.join(", "),
          "Content-Type": "application/json",
        },
      }
    );

    // Incluir un encabezado personalizado para indicar que se debe limpiar el localStorage
    response.headers.append("Clear-LocalStorage", "true");
    return response;
  } catch (error) {
    console.error("Error en logout:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
