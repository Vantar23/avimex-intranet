import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  try {
    // Configurar la cookie para que expire inmediatamente
    const cookie = serialize("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0, // Expira inmediatamente
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
