import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); // 🔹 Añadir await
  const cachedData = cookieStore.get("catalogos");

  if (cachedData) {
    return new Response(cachedData.value, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch("http://37.27.133.117/backend/api/Catalogos");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 🔹 Configurar Set-Cookie en la respuesta
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `catalogos=${encodeURIComponent(
          JSON.stringify(data)
        )}; Path=/; Max-Age=86400; HttpOnly`,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Error fetching data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}