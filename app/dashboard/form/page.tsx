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

  const manejarCambioTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    console.log(`${name} actualizado:`, value);
  };

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files));
      console.log("Archivos seleccionados:", Array.from(e.target.files).map((file) => file.name));
    }
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!formulario.noFactura) {
      alert("Por favor, completa el campo 'No. Factura' antes de enviar.");
      return;
    }
    if (archivos.length === 0) {
      alert("Por favor, selecciona al menos un archivo antes de enviar.");
      return;
    }

    const formData = new FormData();
    archivos.forEach((archivo, index) => {
      formData.append(`archivo${index + 1}`, archivo); // archivo1, archivo2...
    });
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
        setMensaje("Datos enviados exitosamente: " + data.message);
        console.log("Respuesta del servidor:", data);
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
      } else {
        const errorData = await response.json();
        setMensaje("Error: " + errorData.error);
        console.error("Error:", errorData);
      }
    } catch (error) {
      console.error("Error al enviar datos:", error);
      setMensaje("Hubo un problema al enviar los datos.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Formulario de Compras</h1>
      <form className="bg-white rounded p-6 space-y-4" onSubmit={manejarEnvio}>
        {/* Campos de texto */}
        {[
          { label: "No. Factura", name: "noFactura", type: "text" },
          { label: "No. Cotización", name: "noCotizacion", type: "text" },
          { label: "Cantidad", name: "cantidad", type: "number" },
          { label: "Product ID", name: "productId", type: "text" },
          { label: "Medida ID", name: "medidaId", type: "text" },
          { label: "Marca ID", name: "marcaId", type: "text" },
          { label: "Observaciones", name: "observaciones", type: "text" },
          { label: "Proveedor ID", name: "proveedorId", type: "text" },
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

        {/* Campo de archivos */}
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
        <div className="mt-4">
          <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">
            Enviar
          </button>
        </div>
      </form>

      {/* Mensaje de respuesta */}
      {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
    </div>
  );
}
