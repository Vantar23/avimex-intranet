import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const texto = formData.get("texto"); // Captura el texto
    const archivo = formData.get("archivo"); // Captura el archivo

    if (!texto) {
      return NextResponse.json(
        { error: "El campo 'texto' es obligatorio." },
        { status: 400 }
      );
    }

    if (!archivo || typeof archivo === "string") {
      return NextResponse.json(
        { error: "No se recibió un archivo válido." },
        { status: 400 }
      );
    }

    // Lee el contenido del archivo
    const buffer = Buffer.from(await archivo.arrayBuffer());

    // Genera un nombre único para el archivo
    const nombreArchivo = `${uuidv4()}_${archivo.name}`;

    // Define la ruta donde se guardará el archivo
    const rutaCarpeta = path.join(process.cwd(), "public/uploads");
    await mkdir(rutaCarpeta, { recursive: true }); // Asegura que la carpeta exista

    const rutaArchivo = path.join(rutaCarpeta, nombreArchivo);

    // Guarda el archivo en el sistema
    await writeFile(rutaArchivo, buffer);

    console.log(`Archivo guardado en: ${rutaArchivo}`);
    console.log(`Texto recibido: ${texto}`);

    return NextResponse.json(
      { message: "Datos guardados exitosamente.", filePath: `/uploads/${nombreArchivo}`, texto },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al guardar los datos:", error);
    return NextResponse.json(
      { error: "Hubo un problema al guardar los datos." },
      { status: 500 }
    );
  }
}
