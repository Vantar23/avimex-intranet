"use client";

import { useState } from "react";

export default function FormularioCompleto() {
  const [formulario, setFormulario] = useState({
    noFactura: "",
    noCotizacion: "",
    cantidad: "",
    productId: "",
    medidaId: "",
    marcaId: "",
    observaciones: "",
    proveedorId: "",
  });
  const [archivos, setArchivos] = useState<File[]>([]);
  const [mensaje, setMensaje] = useState("");

  // Manejador para cambios en los campos de texto
  const manejarCambioTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    console.log(`${name} actualizado:`, value);
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
    if (!formulario.noFactura) {
      alert("El campo 'No. Factura' es obligatorio.");
      return false;
    }
    if (archivos.length === 0) {
      alert("Debes seleccionar al menos un archivo.");
      return false;
    }
    return true;
  };

  // Manejador para el envío del formulario
  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    const formData = new FormData();

    // Agregar archivos al FormData
    archivos.forEach((archivo, index) => {
      formData.append(`archivo${index + 1}`, archivo); // archivo1, archivo2, ...
    });

    // Agregar los campos del formulario al FormData
    Object.entries(formulario).forEach(([key, value]) => {
      formData.append(key, value);
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
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.error}`);
        console.error("Error en el servidor:", errorData);
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      setMensaje("Hubo un problema al enviar los datos.");
    }
  };

  // Reiniciar los campos del formulario
  const reiniciarFormulario = () => {
    setFormulario({
      noFactura: "",
      noCotizacion: "",
      cantidad: "",
      productId: "",
      medidaId: "",
      marcaId: "",
      observaciones: "",
      proveedorId: "",
    });
    setArchivos([]);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-100 rounded shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Formulario de Compras</h1>
      <form onSubmit={manejarEnvio} className="space-y-4">
        {/* Campos dinámicos */}
        {[
          { label: "No. Factura", name: "noFactura", type: "text", required: true },
          { label: "No. Cotización", name: "noCotizacion", type: "text" },
          { label: "Cantidad", name: "cantidad", type: "number" },
          { label: "Product ID", name: "productId", type: "text" },
          { label: "Medida ID", name: "medidaId", type: "text" },
          { label: "Marca ID", name: "marcaId", type: "text" },
          { label: "Observaciones", name: "observaciones", type: "text" },
          { label: "Proveedor ID", name: "proveedorId", type: "text" },
        ].map(({ label, name, type, required }) => (
          <div key={name}>
            <label className="block font-semibold mb-1">{label}</label>
            <input
              type={type}
              name={name}
              className="border rounded w-full p-2"
              value={formulario[name as keyof typeof formulario]}
              onChange={manejarCambioTexto}
              required={required || false}
            />
          </div>
        ))}

        {/* Campo para archivos */}
        <div>
          <label className="block font-semibold mb-1">Archivos</label>
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
        >
          Enviar
        </button>
      </form>

      {/* Mensaje de respuesta */}
      {mensaje && (
        <p className="mt-4 text-center text-lg font-medium text-green-600">{mensaje}</p>
      )}
    </div>
  );
}
