import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, unlink, stat } from "fs/promises";
import path from "path";

// Ruta de la carpeta donde se guardarán los archivos
const documentsDir = path.join(process.cwd(), "public", "documents");

// Función para asegurarse de que la carpeta exista
async function ensureDocumentsDir(): Promise<void> {
  try {
    await stat(documentsDir);
  } catch {
    await mkdir(documentsDir, { recursive: true });
  }
}

// POST: Subida de archivos usando req.formData()
export async function POST(req: NextRequest) {
  await ensureDocumentsDir();
  try {
    const formData = await req.formData();
    const savedFiles: string[] = [];

    // Itera sobre las entradas del formData
    for (const key of formData.keys()) {
      const entries = formData.getAll(key);
      for (const value of entries) {
        if (value instanceof File) {
          // Se usa trim() para limpiar espacios en blanco
          const originalFileName = (value.name || "archivo_sin_nombre").trim();
          let newFileName = originalFileName;
          
          // Si el nombre ya inicia con 6 dígitos y un guion bajo, lo dejamos igual
          if (!/^\d{6}_/.test(originalFileName)) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            const timeStamp = `${hours}${minutes}${seconds}`;
            newFileName = `${timeStamp}_${originalFileName}`;
          }
          
          const filePath = path.join(documentsDir, newFileName);
          const buffer = Buffer.from(await value.arrayBuffer());
          await writeFile(filePath, buffer);
          savedFiles.push(`/documents/${newFileName}`);
        }
      }
    }

    return NextResponse.json({ savedFiles });
  } catch (error) {
    console.error("Error al subir archivos:", error);
    return NextResponse.json(
      { error: "Error al subir archivos." },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar archivos
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const savedFiles: string[] = body.savedFiles;

    if (!Array.isArray(savedFiles)) {
      return NextResponse.json(
        { error: "La lista de archivos no tiene el formato correcto." },
        { status: 400 }
      );
    }

    const deletedFiles: string[] = [];
    for (const relPath of savedFiles) {
      const filePath = path.join(
        process.cwd(),
        "public",
        relPath.replace(/^\/+/, "")
      );
      try {
        await unlink(filePath);
        deletedFiles.push(relPath);
      } catch (err) {
        console.error("Error al eliminar el archivo:", relPath, err);
      }
    }

    return NextResponse.json({ deletedFiles });
  } catch (error) {
    console.error("Error en DELETE:", error);
    return NextResponse.json(
      { error: "Error al eliminar archivos." },
      { status: 500 }
    );
  }
}