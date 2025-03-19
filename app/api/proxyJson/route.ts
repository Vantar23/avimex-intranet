import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return handleRequest(req, "POST");
}

export async function GET(req: Request) {
  return handleRequest(req, "GET");
}

export async function PUT(req: Request) {
  return handleRequest(req, "PUT");
} 

export async function DELETE(req: Request) {
  return handleRequest(req, "DELETE");
}

async function handleRequest(req: Request, method: string) {
  try {
    let url = "";
    let body = null;

    if (method === "GET" || method === "DELETE") {
      const { searchParams } = new URL(req.url);
      url = searchParams.get("url") || "";
    } else {
      const requestBody = await req.json();
      url = requestBody.url || "";
      body = requestBody.body || null;
    }

    if (!url) {
      console.error("❌ Falta la URL en la petición.");
      return NextResponse.json({ error: "Missing API URL" }, { status: 400 });
    }

    console.log(`🔹 Haciendo petición ${method} a: ${url}`);
    if (body) console.log("📤 Datos enviados:", body);

    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    };

    // Extraer el token de las cookies y agregarlo al encabezado Authorization
    const token = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];
    if (token) {
      options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
      };
    }

    const response = await fetch(url, options);
    const data = await response.json();

    console.log("✅ Respuesta recibida:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error en el proxy:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}