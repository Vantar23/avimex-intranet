import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function GET(req: NextRequest) {
  const apiUrl = req.nextUrl.searchParams.get("apiUrl");

  if (!apiUrl) {
    return NextResponse.json(
      { error: "Falta parámetro apiUrl" },
      { status: 400 }
    );
  }

  // --- Manejo de id_header ---
  const cookies = req.headers.get("cookie") || "";
  let currentParam = cookies.match(/id_header=([^;]+)/)?.[1];
  let responseHeaders: { [key: string]: string } = {};

  if (!currentParam) {
    currentParam = "0";
    console.log(`🔹 No se encontró id_header. Se inicializa a ${currentParam}`);
    responseHeaders["Set-Cookie"] = serialize("id_header", currentParam, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  try {
    const token = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "id_header": currentParam,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const dataRes = await fetch(apiUrl, { method: 'GET', headers });
    const cloneRes = dataRes.clone();

    const statusCode = dataRes.status;
    const statusText = dataRes.statusText;

    let text = '';
    try {
      text = await cloneRes.text();
    } catch (e) {
      console.error("❌ No se pudo leer el texto de la respuesta del backend:", e);
    }

    let data;
    if (!text.trim()) {
      data = { error: "Respuesta vacía del servidor" };
      console.error("❌ Respuesta vacía del backend");
    } else {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: text };
        console.error("❌ Error al parsear JSON:", e);
        console.error("❌ Respuesta como texto:", text);
      }
    }

    if (!dataRes.ok) {
      let additionalHeaders: { [key: string]: string } = {};
      if (statusCode === 401) {
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
        additionalHeaders["Set-Cookie"] = expiredCookies;
      }

      console.error(`⚠️ Error HTTP desde el backend (${statusCode} ${statusText})`);
      console.error("🧾 Respuesta completa:", text);

      return NextResponse.json(
        { error: data.error || "Error desconocido", originalStatus: statusCode },
        { status: 200, headers: additionalHeaders }
      );
    }

    // 🔄 Verificar si el backend envió un nuevo id_header
    if (typeof data.id_header !== "undefined" && data.id_header.toString() !== currentParam) {
      const newId = data.id_header.toString();
      console.log(`🔄 Actualizando id_header: "${currentParam}" -> "${newId}"`);
      responseHeaders["Set-Cookie"] = serialize("id_header", newId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    const columns = Array.isArray(data.Headers) ? data.Headers : [];
    const items = Array.isArray(data.Data) ? data.Data : [];

    return NextResponse.json(
      {
        columns,
        data: items,
        originalData: items
      },
      { status: 200, headers: responseHeaders }
    );
  } catch (error: any) {
    console.error("❌ Error en proxy-grid:", error);
    return NextResponse.json(
      { error: error.message || "Error desconocido" },
      { status: 200 }
    );
  }
}
