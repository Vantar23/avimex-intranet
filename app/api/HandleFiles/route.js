import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    // Obtener los datos enviados como formData (multipart/form-data)
    const formData = await req.formData();

    // Preparar un arreglo para almacenar los archivos recibidos
    const filesToSave = [];
    for (const key of formData.keys()) {
      const file = formData.get(key);
      if (file instanceof File) {
        filesToSave.push({ field: key, file });
      }
    }

    // Definir el directorio donde se guardarán los archivos
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Verificar si alguno de los archivos ya existe
    for (const { file } of filesToSave) {
      const filePath = path.join(uploadDir, file.name);
      if (fs.existsSync(filePath)) {
        console.error(`❌ El archivo ${file.name} ya existe.`);
        return NextResponse.json(
          { error: `El archivo ${file.name} ya existe.` },
          { status: 400 }
        );
      }
    }

    // Si ninguno existe, proceder a guardar los archivos
    const savedFiles = {};
    for (const { field, file } of filesToSave) {
      // Convertir el archivo a Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Definir la ruta donde se guardará el archivo (usando file.name)
      const filePath = path.join(uploadDir, file.name);

      // Guardar el archivo en disco
      fs.writeFileSync(filePath, buffer);
      
      // Almacenar la ruta relativa del archivo guardado
      savedFiles[field] = `/uploads/${file.name}`;
    }

    console.log("✅ Archivos guardados:", savedFiles);
    return NextResponse.json({ success: true, savedFiles });
  } catch (error) {
    console.error("❌ Error saving files:", error);
    return NextResponse.json({ error: "Error saving files" }, { status: 500 });
  }
}