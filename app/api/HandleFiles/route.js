import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// Forzamos runtime de Node.js para poder usar fs, path, etc.
export const config = {
  runtime: "nodejs",
  api: {
    bodyParser: false, // Desactiva el body parser de Next
  },
};

export async function POST(req) {
  try {
    // 1. Definir el directorio de destino
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Configurar formidable
    const form = new formidable.IncomingForm({
      multiples: true,               // Permite subir múltiples archivos en el mismo field
      maxFileSize: 150 * 1024 * 1024, // Ejemplo: límite de 50 MB
    });

    // 3. Parsear la request con formidable
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        return resolve([fields, files]);
      });
    });

    /*
      - `fields` contendrá los campos de texto.
      - `files` contendrá los archivos subidos, con estructura:
         {
           <nombreField>: {
             filepath: string,          // ruta temporal
             originalFilename: string,  // nombre original
             mimetype: string,          // tipo MIME
             size: number,              // tamaño en bytes
             ...
           } | [Object, Object, ...] // si multiples archivos en ese field
         }
    */

    // 4. Normalizamos los archivos en un arreglo "filesToSave"
    const filesToSave = [];
    for (const fieldName in files) {
      const fileOrFiles = files[fieldName];
      if (Array.isArray(fileOrFiles)) {
        // Si es un array, agregar cada archivo
        fileOrFiles.forEach((fileItem) =>
          filesToSave.push({ field: fieldName, file: fileItem })
        );
      } else {
        // Si es un solo archivo
        filesToSave.push({ field: fieldName, file: fileOrFiles });
      }
    }

    // 5. Verificar si alguno de los archivos ya existe
    for (const { file } of filesToSave) {
      const destino = path.join(uploadDir, file.originalFilename);
      if (fs.existsSync(destino)) {
        console.error(`❌ El archivo ${file.originalFilename} ya existe.`);
        return NextResponse.json(
          { error: `El archivo ${file.originalFilename} ya existe.` },
          { status: 400 }
        );
      }
    }

    // 6. Mover los archivos desde la ruta temporal al directorio final
    const savedFiles = {};
    for (const { field, file } of filesToSave) {
      const destino = path.join(uploadDir, file.originalFilename);

      // Mover (o renombrar) el archivo temporal de formidable
      fs.renameSync(file.filepath, destino);

      // Guardar la ruta relativa
      savedFiles[field] = `/uploads/${file.originalFilename}`;
    }

    console.log("✅ Archivos guardados:", savedFiles);
    return NextResponse.json({ success: true, savedFiles });
  } catch (error) {
    console.error("❌ Error al guardar archivos:", error);
    return NextResponse.json({ error: "Error al guardar archivos" }, { status: 500 });
  }
}