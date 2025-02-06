import { NextResponse } from "next/server";
import { serialize } from "cookie";

const API_URL = "http://37.27.133.117/backend/api/login"; // 🔥 URL del backend externo

export async function POST(req) {
  try {
    const { usuario, pwd } = await req.json();

    // Hacer la solicitud a la API externa
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, pwd }),
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    // Obtener la respuesta del backend
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0 || !data[0].tok) {
      return NextResponse.json({ message: "No se recibió un token válido" }, { status: 401 });
    }

    const sessionToken = data[0].tok;

    // Configurar cookie de sesión segura
    const cookie = serialize("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    // Responder con éxito y almacenar la cookie
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
