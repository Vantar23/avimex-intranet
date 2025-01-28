"use client";

import { useState } from "react";

export default function FormularioCompleto() {
  const [formulario, setFormulario] = useState({
    noFactura: "",
    noCotizacion: "",
    cantidad: 0, // decimal
    productoId: 0, // int
    medidaId: 0, // int
    marcaId: 0, // int
    codigo: "",
    observaciones: "",
    proveedorId: 0, // int
  });

  const [archivos, setArchivos] = useState<File[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // Manejador para cambios en los campos de texto o números
  const manejarCambioTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    // Convertir a número si el tipo lo requiere
    const parsedValue =
      type === "number" ? (name === "cantidad" ? parseFloat(value) : parseInt(value)) : value;

    setFormulario((prev) => ({ ...prev, [name]: parsedValue }));
    console.log(`${name} actualizado:`, parsedValue);
  };

  // Manejador para cambios en la selección de archivos
  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files)); // Guardar múltiples archivos
      console.log("Archivos seleccionados:", Array.from(e.target.files).map((file) => file.name));
    }
  };

  // Validación del formulario antes del envío
  const validarFormulario = () => {
    const camposRequeridos = [
      "noFactura",
      "noCotizacion",
      "cantidad",
      "productoId",
      "medidaId",
      "marcaId",
      "codigo",
      "observaciones",
      "proveedorId",
    ];

    for (const campo of camposRequeridos) {
      if (!formulario[campo as keyof typeof formulario]) {
        alert(`El campo '${campo}' es obligatorio.`);
        return false;
      }
    }

    if (archivos.length < 2) {
      alert("Debes seleccionar al menos dos archivos (archivo1 y archivo2).");
      return false;
    }

    return true;
  };

  // Manejador para el envío del formulario
  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!validarFormulario()) return;
  
    setLoading(true);
    setMensaje(""); // Limpiar cualquier mensaje previo
  
    const formData = new FormData();
  
    // Agregar los dos primeros archivos al FormData como archivo1 y archivo2
    formData.append("archivo1", archivos[0]);
    formData.append("archivo2", archivos[1]);
  
    // Agregar los campos del formulario al FormData
    Object.entries(formulario).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  
    try {
      const response = await fetch("http://37.27.133.117/backend/api/compras", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        setMensaje(`Datos enviados exitosamente: ${data.message}`);
        console.log("Respuesta del servidor:", data);
        reiniciarFormulario(); // Limpiar el formulario después del envío exitoso
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          setMensaje(`Errores de validación:\n${errorMessages}`);
        } else {
          setMensaje(`Error: ${errorData.title || "Ocurrió un error."}`);
        }
        console.error("Error en el servidor:", errorData);
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.title || "Ocurrió un error desconocido."}`);
        console.error("Error en el servidor:", errorData);
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      setMensaje("Hubo un problema al enviar los datos.");
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar los campos del formulario
  const reiniciarFormulario = () => {
    setFormulario({
      noFactura: "",
      noCotizacion: "",
      cantidad: 0,
      productoId: 0,
      medidaId: 0,
      marcaId: 0,
      codigo: "",
      observaciones: "",
      proveedorId: 0,
    });
    setArchivos([]);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-100 rounded shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Formulario de Compras</h1>
      <form onSubmit={manejarEnvio} className="space-y-4">
        {/* Campos dinámicos */}
        {[
          { label: "No. Factura", name: "noFactura", type: "text" },
          { label: "No. Cotización", name: "noCotizacion", type: "text" },
          { label: "Cantidad", name: "cantidad", type: "number" },
          { label: "Código", name: "codigo", type: "text" },
          { label: "Producto ID", name: "productoId", type: "number" },
          { label: "Medida ID", name: "medidaId", type: "number" },
          { label: "Marca ID", name: "marcaId", type: "number" },
          { label: "Observaciones", name: "observaciones", type: "text" },
          { label: "Proveedor ID", name: "proveedorId", type: "number" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block font-semibold mb-1">{label}</label>
            <input
              type={type}
              name={name}
              className="border rounded w-full p-2"
              value={formulario[name as keyof typeof formulario]}
              onChange={manejarCambioTexto}
              required
            />
          </div>
        ))}

        {/* Campo para archivos */}
        <div>
          <label className="block font-semibold mb-1">Archivos (archivo1 y archivo2)</label>
          <input
            type="file"
            className="border rounded w-full p-2"
            onChange={manejarCambioArchivo}
            multiple
            required
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          className="bg-blue-500 text-white w-full rounded px-4 py-2 hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {/* Mensaje de respuesta */}
      {mensaje && (
        <p className="mt-4 text-center text-lg font-medium text-green-600">{mensaje}</p>
      )}
    </div>
  );
}