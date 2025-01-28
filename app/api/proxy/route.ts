import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); // 🔹 Usar await para obtener las cookies correctamente
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

    // Guarda los datos en las cookies con una expiración de 1 día
    cookieStore.set("catalogos", JSON.stringify(data), {
      path: "/",
      maxAge: 86400, // 1 día en segundos
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Error fetching data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}