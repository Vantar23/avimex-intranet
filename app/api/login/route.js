import { NextResponse } from "next/server";
import { serialize } from "cookie";

const API_URL = "http://localhost:3000/api/logintest"; // 🔥 Reemplaza con la URL real de la API externa

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Hacer la solicitud a la API externa
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }

    // Obtener el token de la API externa
    const data = await response.json();
    const sessionToken = data.token; // 🔥 Asegúrate de que la API devuelve un token

    if (!sessionToken) {
      return NextResponse.json({ message: "No se recibió un token válido" }, { status: 401 });
    }

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