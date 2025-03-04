import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Se espera que el body tenga dos propiedades:
    // - minimalPayload: objeto con { ModuloId, title, description }
    // - fullJson: el JSON "completo" generado en el cliente
    const { minimalPayload, fullJson } = await request.json();

    // Reenvío al endpoint externo (backend)
    const response = await fetch("http://avimexintranet.com/backend/api/formulario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(minimalPayload),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al enviar el formulario al backend" },
        { status: response.status }
      );
    }

    // Se espera que el backend retorne un array de objetos, por ejemplo: [{ "id": 4 }]
    const data = await response.json();
    const id = data[0]?.id;
    if (!id) {
      return NextResponse.json({ error: "ID no recibido del backend" }, { status: 500 });
    }

    // Definir la ruta donde se guardará el archivo:
    // - Carpeta base: "form-data"
    // - Subcarpeta: nombre del ModuloId
    const baseDir = path.join(process.cwd(), "public/form-data");
    const subDir = path.join(baseDir, String(minimalPayload.ModuloId));
    // Crear la carpeta de forma recursiva en caso de que no exista
    await mkdir(subDir, { recursive: true });

    const fileName = `${id}.json`;
    const filePath = path.join(subDir, fileName);

    // Escribir el archivo con el JSON completo formateado
    await writeFile(filePath, JSON.stringify(fullJson, null, 2), "utf-8");

    // Responder con el id y el nombre del archivo creado
    return NextResponse.json({ id, file: fileName }, { status: 200 });
  } catch (error) {
    console.error("Error en el endpoint proxy:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}