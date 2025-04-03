import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function GET(req: NextRequest) {
  // Solo se recibe apiUrl
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

  // Si no existe la cookie, se asigna el valor "0"
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
  // ----------------------------

  try {
    // Extraer token de la cookie, si existe
    const token = req.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      // Se incluye id_header en la petición saliente
      "id_header": currentParam,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Realizar la petición a la API
    const dataRes = await fetch(apiUrl, { method: 'GET', headers });
    const cloneRes = dataRes.clone();

    let data;
    try {
      data = await dataRes.json();
    } catch (e) {
      const text = await cloneRes.text();
      data = { error: text };
    }

    // En caso de error (ej. 401), se eliminan las cookies de sesión
    if (!dataRes.ok) {
      let additionalHeaders: { [key: string]: string } = {};
      if (dataRes.status === 401) {
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
      return NextResponse.json(
        { error: data.error || "Error desconocido", originalStatus: dataRes.status },
        { status: 200, headers: additionalHeaders }
      );
    }

    // Actualizar id_header si la respuesta incluye un "id"
    let newId: string | undefined;
    if (
      data.Data &&
      Array.isArray(data.Data) &&
      data.Data.length > 0 &&
      typeof data.Data[0].id !== "undefined"
    ) {
      newId = data.Data[0].id.toString();
    } else if (typeof data.id !== "undefined") {
      newId = data.id.toString();
    }
    if (newId && newId !== currentParam) {
      console.log(`🔄 Actualizando id_header: "${currentParam}" -> "${newId}"`);
      responseHeaders["Set-Cookie"] = serialize("id_header", newId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    // Extraer columnas y datos según la estructura recibida
    const columns = Array.isArray(data.Headers) ? data.Headers : [];
    const items = Array.isArray(data.Data) ? data.Data : [];

    return NextResponse.json(
      {
        columns,
        data: items,
        originalData: items // Aquí solo se envía el arreglo de datos
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