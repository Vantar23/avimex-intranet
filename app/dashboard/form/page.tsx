"use client";

import { useState } from "react";
import ComboComponent from "@/components/combo";
import data from "./data.json"; // Importar datos locales

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

  const manejarCambioTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === "number" ? (name === "cantidad" ? parseFloat(value) : parseInt(value)) : value;

    setFormulario((prev) => ({ ...prev, [name]: parsedValue }));
    console.log(`${name} actualizado:`, parsedValue);
  };

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files)); // Guardar múltiples archivos
      console.log("Archivos seleccionados:", Array.from(e.target.files).map((file) => file.name));
    }
  };

  const manejarSeleccionCombo = (field: keyof typeof formulario) => {
    return (option: { id: number; nombre: string } | null) => {
      if (option) {
        setFormulario((prev) => ({ ...prev, [field]: option.id }));
        console.log(`${field} seleccionado:`, option);
      }
    };
  };

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

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setLoading(true);

    const formData = new FormData();

    formData.append("archivo1", archivos[0]);
    formData.append("archivo2", archivos[1]);

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
        reiniciarFormulario();
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.error}`);
        console.error("Error en el servidor:", errorData);
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      setMensaje("Hubo un problema al enviar los datos.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-4xl mx-auto p-6 rounded ">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Requisición</h1>
      <form
        onSubmit={manejarEnvio}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {[
          { label: "No. Factura", name: "noFactura", type: "text" },
          { label: "No. Cotización", name: "noCotizacion", type: "text" },
          { label: "Cantidad", name: "cantidad", type: "number" },
          { label: "Código", name: "codigo", type: "text" },
          { label: "Observaciones", name: "observaciones", type: "text" },
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

        {/* Combo Components */}
        <div>
          <label className="block font-semibold mb-1">Producto</label>
          <ComboComponent
            localData={data.productos}
            filterKey="nombre"
            onOptionSelect={manejarSeleccionCombo("productoId")}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Proveedor</label>
          <ComboComponent
            localData={data.proveedores}
            filterKey="nombre"
            onOptionSelect={manejarSeleccionCombo("proveedorId")}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Marca</label>
          <ComboComponent
            localData={data.marcas}
            filterKey="nombre"
            onOptionSelect={manejarSeleccionCombo("marcaId")}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Medida</label>
          <ComboComponent
            localData={data.medidas}
            filterKey="nombre"
            onOptionSelect={manejarSeleccionCombo("medidaId")}
          />
        </div>

        {/* Campo para archivos */}
        <div className="col-span-1 md:col-span-2">
          <label className="block font-semibold mb-1">Archivos (archivo1 y archivo2)</label>
          <input
            type="file"
            className="border rounded w-full p-2"
            onChange={manejarCambioArchivo}
            multiple
            required
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            className="bg-blue-500 text-white w-full rounded px-4 py-2 hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>

      {mensaje && <p className="mt-4 text-center text-lg font-medium text-green-600">{mensaje}</p>}
    </div>
  );
}