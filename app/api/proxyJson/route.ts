import { NextResponse } from "next/server";
import { serialize } from "cookie";

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
      return NextResponse.json(
        { error: "Missing API URL", status: 400 },
        { status: 200 }
      );
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
    // Clonar inmediatamente la respuesta para usarla en caso de error al parsear JSON
    const responseClone = response.clone();
    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await responseClone.text();
      data = { error: text };
    }

    console.log("✅ Respuesta recibida:", data);

    if (!response.ok) {
      console.error("❌ Error en la petición:", data, response.status);
      let additionalHeaders: { [key: string]: string } = {};
      if (response.status === 401) {
        console.warn("⚠️ El servidor retornó 401 (No autorizado). Eliminando cookie de sesión manualmente...");
        const expiredCookies = [
          serialize("session", "", {
            httpOnly: true,
            secure: false, // En producción: true, si usas HTTPS
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
          }),
          serialize("user", "", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
          }),
          serialize("authToken", "", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
          })
        ].join(", ");
        additionalHeaders["Set-Cookie"] = expiredCookies;
      }
      // Retornamos siempre status 200, encapsulando el error y el status original en el body,
      // y agregando las cabeceras para eliminar cookies si fuera 401.
      return NextResponse.json(
        { error: data.error || "Error desconocido", originalStatus: response.status },
        { status: 200, headers: additionalHeaders }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Error en el proxy:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 200 });
  }
}