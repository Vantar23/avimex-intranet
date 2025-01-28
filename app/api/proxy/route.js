import { cookies } from "next/headers";

export async function GET(req) {
  const cookieStore = cookies(); // Accede a las cookies.
  const cachedData = cookieStore.get("catalogos");

  if (cachedData) {
    // Si los datos están almacenados en cookies, úsalos.
    return new Response(cachedData.value, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Si no hay datos en cookies, solicita los datos al servidor.
  try {
    const response = await fetch("http://37.27.133.117/backend/api/Catalogos");
    const data = await response.json();

    // Guarda los datos en las cookies con una expiración (por ejemplo, 1 día).
    cookieStore.set("catalogos", JSON.stringify(data), {
      path: "/",
      maxAge: 86400, // 1 día en segundos.
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Manejo de errores al solicitar datos.
    return new Response(JSON.stringify({ error: "Error fetching data" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}