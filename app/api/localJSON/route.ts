import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { method, url, body } = await req.json();

    if (!method || !url) {
      return NextResponse.json({ error: "Faltan 'method' y 'url' en la solicitud." }, { status: 400 });
    }

    console.log(`🔹 Proxy: ${method.toUpperCase()} → ${url}`);

    const options: RequestInit = {
      method: method.toUpperCase(), // Asegurar que el método es válido (GET, POST, etc.)
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}), // Incluir body solo si existe
    };

    const response = await fetch(url, options);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error en el proxy:", error);
    return NextResponse.json({ error: "Error en el proxy" }, { status: 500 });
  }
}