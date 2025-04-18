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

    // Para GET y DELETE se extrae la URL desde searchParams, para otros métodos se obtiene del body
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

    // Leer la cookie id_header o usar "0" por defecto y establecerla si no existe
    const cookies = req.headers.get("cookie") || "";
    let currentParam = cookies.match(/id_header=([^;]+)/)?.[1];
    let responseHeaders: { [key: string]: string } = {};

    if (!currentParam) {
      currentParam = "0";
      console.log(`🔹 No se encontró id_header. Se crea con el valor por defecto: ${currentParam}`);
      responseHeaders["Set-Cookie"] = serialize("id_header", currentParam, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    console.log(`🔹 Haciendo petición ${method} a: ${url} con id_header: ${currentParam}`);
    if (body) console.log("📤 Datos enviados:", body);

    // Configurar la petición saliente, incluyendo el header "id_header" con el valor actual
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "id_header": currentParam,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    // Extraer el token de las cookies y agregarlo al encabezado Authorization si existe
    const token = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];
    if (token) {
      options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
      };
    }

    // Realizar la petición al URL deseado
    const response = await fetch(url, options);
    const responseClone = response.clone();
    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await responseClone.text();
      data = { error: text };
    }

    console.log("✅ Respuesta recibida:", data);

    // Verificar si la respuesta contiene un nuevo id_header
    if (data && typeof data.id_header !== "undefined") {
      const newParam = data.id_header.toString();
      if (newParam !== currentParam) {
        console.log(`🔄 Actualizando el id_header: "${currentParam}" -> "${newParam}"`);
        responseHeaders["Set-Cookie"] = serialize("id_header", newParam, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });
      }
    }


    // Si la respuesta tiene error (por ejemplo, 401), se pueden agregar acciones adicionales (como eliminar cookies)
    if (!response.ok) {
      console.error("❌ Error en la petición:", data, response.status);
      if (response.status === 401) {
        console.warn("⚠️ El servidor retornó 401. Eliminando cookies de sesión...");
        const expiredCookies = [
          serialize("session", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
          }),
          serialize("user", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
          }),
          serialize("authToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
          })
        ].join(", ");
        responseHeaders["Set-Cookie"] = expiredCookies;
      }
      return NextResponse.json(
        { error: data.error || "Error desconocido", originalStatus: response.status },
        { status: 200, headers: responseHeaders }
      );
    }

    return NextResponse.json(data, { status: 200, headers: responseHeaders });
  } catch (error) {
    console.error("❌ Error en el proxy:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 200 });
  }
}