import { NextResponse } from "next/server";
import { serialize } from "cookie";

const API_URL = process.env.API_URL || "http://avimexintranet.com/backend/api/login"; // 🔥 Usa variable de entorno

export async function POST(req) {
  try {
    const { usuario, pwd } = await req.json();

    if (typeof usuario !== "string" || typeof pwd !== "string" || !usuario.trim() || !pwd.trim()) {
      return NextResponse.json({ message: "Usuario o contraseña inválidos" }, { status: 400 });
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, pwd }),
      redirect: "manual",
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    const data = await response.json();
    console.log("Respuesta del backend:", data);

    // 🔥 Ajusta esto según la estructura real del JSON que recibes
    const sessionToken = data?.token || (Array.isArray(data) && data[0]?.token);

    if (!sessionToken) {
      return NextResponse.json({ message: "No se recibió un token válido" }, { status: 401 });
    }

    const cookie = serialize("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ Solo en producción
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return new NextResponse(
      JSON.stringify({ message: "Inicio de sesión exitoso", token: sessionToken }),
      {
        status: 200,
        headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}