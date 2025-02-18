import { headers } from "next/headers";

function sanitizeInput(input: string): string {
  return input.replace(/[<>"'%;()&+]/g, "");
}

export async function GET(): Promise<Response> {
  try {
    const response = await fetch("http://avimexintranet.com/backend/api/Catalogos");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return new Response("Error en la solicitud", { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    if (!request.body) {
      return new Response("Request body is missing", { status: 400 });
    }

    const formData = await request.formData();

    // 🔥 Depurar los datos recibidos en el servidor
    console.log("Datos recibidos en FormData:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Crear un nuevo FormData limpio
    const sanitizedData = new FormData();

    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        sanitizedData.append(key, sanitizeInput(value)); // Sanitizamos texto
      } else if (value instanceof Blob) {
        sanitizedData.append(key, value, (value as File).name); // Asegurar que los archivos se agreguen correctamente
      }
    }

    // 🔥 Depurar datos antes de enviarlos al backend
    console.log("Datos a enviar al backend:");
    for (const [key, value] of sanitizedData.entries()) {
      console.log(key, value);
    }

    const response = await fetch("http://avimexintranet.com/backend/api/compras", {
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
}