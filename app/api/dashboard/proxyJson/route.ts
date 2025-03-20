import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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
    const sessionCookie = (await cookies()).get("session");
    const token = sessionCookie ? sessionCookie.value : "";

    if (method === "GET" || method === "DELETE") {
      const { searchParams } = new URL(req.url);
      url = searchParams.get("url") || "";
    } else {
      const requestBody = await req.json().catch(() => null);
      if (!requestBody || typeof requestBody !== "object") {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        );
      }
      url = requestBody.url || "";
      body = requestBody.body || null;
    }

    if (!url || !isValidURL(url)) {
      console.error("❌ Error: Invalid or missing API URL");
      return NextResponse.json(
        { error: "Invalid or missing API URL" },
        { status: 400 }
      );
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      console.warn(`⚠️ API request failed with status ${response.status}`);
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("Content-Type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (response.status === 401 || response.status === 307 || data === "Token is missing") {
      console.warn("🔒 No autorizado: Eliminando sesión y redirigiendo.");
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("❌ Error en proxy:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Función para validar URLs
function isValidURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}
