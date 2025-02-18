import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function sanitizeInput(input: string): string {
  return input.replace(/[<>"'%;()&+]/g, "");
}

async function saveFile(file: File): Promise<{ filePath: string; fileName: string }> {
  // Directorio de subida: /public/documentos
  const uploadDir = path.join(process.cwd(), "public", "documentos");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const filePathLocal = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePathLocal, buffer);
  // La ruta pública (accesible desde el navegador)
  const publicPath = `/documentos/${fileName}`;
  return { filePath: publicPath, fileName: file.name };
}

export async function GET(): Promise<Response> {
  try {
    const response = await fetch("http://avimexintranet.com/backend/api/Catalogos");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.text();
    return new Response(data, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error en la solicitud GET:", error);
    return new Response("Error en la solicitud", { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    if (!request.body) {
      return new Response("Request body is missing", { status: 400 });
    }
    const formData = await request.formData();

    console.log("Datos recibidos en FormData:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Crear un nuevo FormData para reenviar al backend
    const newFormData = new FormData();

    // Procesar cada entrada:
    for (const [key, value] of formData.entries()) {
      if ((key === "archivo1" || key === "archivo2") && value instanceof File) {
        // Guardar el archivo en /public/documentos
        const saved = await saveFile(value);
        if (key === "archivo1") {
          // Agrega la ruta y el nombre del archivo de factura
          newFormData.append("ArchFact", sanitizeInput(saved.filePath));
          newFormData.append("NombreFact", sanitizeInput(saved.fileName));
        } else if (key === "archivo2") {
          // Agrega la ruta y el nombre del archivo de cotización
          newFormData.append("ArchCoti", sanitizeInput(saved.filePath));
          newFormData.append("NombreCoti", sanitizeInput(saved.fileName));
        }
      } else {
        // Para los demás campos (texto) se agregan sanitizados
        newFormData.append(key, sanitizeInput(value.toString()));
      }
    }

    console.log("Datos a enviar al backend:");
    for (const [key, value] of newFormData.entries()) {
      console.log(key, value);
    }

    const response = await fetch("http://avimexintranet.com/backend/api/compras", {
      method: "POST",
      body: newFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error del backend:", errorText);
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