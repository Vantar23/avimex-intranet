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
    const sessionCookie = cookies().get("session");
    const token = sessionCookie ? sessionCookie.value : "";

    if (method === "GET" || method === "DELETE") {
      const { searchParams } = new URL(req.url);
      url = searchParams.get("url") || "";
    } else {
      const requestBody = await req.json();
      url = requestBody.url || "";
      body = requestBody.body || null;
    }

    if (!url) {
      console.error("❌ Error: Missing API URL");
      return NextResponse.json({ error: "Missing API URL" });
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, options);
    const contentType = response.headers.get("Content-Type") || "";

    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (response.status === 401 || data === "Token is missing") {
      console.warn("🔒 No autorizado: Eliminando sesión y redirigiendo.");
      const res = NextResponse.redirect(new URL("/", req.url));
      res.cookies.delete("session");
      return res;
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error:", error.name);
    } else {
      console.error("❌ Error:", error);
    }
    return NextResponse.json({ error: (error as Error).name });
  }
}
