import fs from "fs";
import path from "path";

// Esta función maneja la carga de archivos y los datos del formulario
export const config = {
  api: {
    bodyParser: false, // Desactivamos el bodyParser para poder manejar el FormData
  },
};

const handler = (req, res) => {
  if (req.method === "POST") {
    let data = "";

    // Recibimos los datos del FormData
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        const formData = new URLSearchParams(data);

        // Extraemos los campos del formulario
        const archivo1 = formData.get("archivo1"); // El archivo debe venir como una cadena base64 o similar, dependiendo de cómo lo envíes
        const archivo2 = formData.get("archivo2");
        const codigo = formData.get("codigo");
        const cantidad = formData.get("cantidad");
        const productoId = formData.get("productoId");
        const medidaId = formData.get("medidaId");
        const marcaId = formData.get("marcaId");
        const noFactura = formData.get("noFactura");
        const noCotizacion = formData.get("noCotizacion");
        const observaciones = formData.get("observaciones");
        const proveedorId = formData.get("proveedorId");

        // Aseguramos que la carpeta 'uploads' exista, si no la creamos
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir);  // Crea la carpeta si no existe
        }

        // Para los archivos, puedes guardarlos en una carpeta dentro del servidor
        if (archivo1 && archivo2) {
          // Guardar los archivos de manera temporal
          const archivoPath1 = path.join(uploadsDir, "archivo1.pdf");
          const archivoPath2 = path.join(uploadsDir, "archivo2.pdf");
          
          // Asumiendo que los archivos se envían como cadenas base64, convertimos a buffer
          const buffer1 = Buffer.from(archivo1, "base64");
          const buffer2 = Buffer.from(archivo2, "base64");

          // Guardamos los archivos
          fs.writeFileSync(archivoPath1, buffer1);  // Guardamos el archivo 1
          fs.writeFileSync(archivoPath2, buffer2);  // Guardamos el archivo 2
        }

        // Responder con un mensaje de éxito
        res.status(200).json({ message: "Datos recibidos exitosamente." });
      } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({ error: "Hubo un error al procesar la solicitud." });
      }
    });
  } else if (req.method === "GET") {
    // Si la solicitud es GET, respondemos con un mensaje
    res.status(200).send("¡Bienvenido a la sección de compras! Aquí podrás gestionar tus archivos y datos de compras.");
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
};

export default handler;
