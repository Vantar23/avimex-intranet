import { cookies } from "next/headers";

function sanitizeInput(input: string): string {
  return input.replace(/[<>"'%;()&+]/g, "");
}

export async function GET() {
  const cookieStore = cookies();
  const cachedData = cookieStore.get("catalogos");

  if (cachedData) {
    return new Response(cachedData.value, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    const response = await fetch("http://37.27.133.117/backend/api/Catalogos");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Set-Cookie": `catalogos=${encodeURIComponent(data)}; Path=/; Max-Age=86400; HttpOnly`,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response("Error fetching data", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sanitizedData = new FormData();
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        sanitizedData.append(key, sanitizeInput(value));
      } else {
        sanitizedData.append(key, value);
      }
    }

    const response = await fetch("http://37.27.133.117/backend/api/compras", {
      method: "POST",
      body: sanitizedData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error sending data:", error);
    return new Response("Error sending data", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }