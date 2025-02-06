import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  try {
    // Sobrescribir la cookie con una versión expirada
    const cookie = serialize("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Cambiado a 'lax' para evitar problemas en algunos navegadores
      path: "/",
      expires: new Date(0), // Expira inmediatamente
    });

    return new NextResponse(
      JSON.stringify({ message: "Cierre de sesión exitoso" }),
      {
        status: 200,
        headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error en logout:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}