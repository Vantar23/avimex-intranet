"use client";

import { useState } from "react";
import ComboComponent from "@/components/combo";

interface FormularioState {
  noFactura: string;
  noCotizacion: string;
  cantidad: number;
  productoId: number | null;
  medidaId: number | null;
  marcaId: number | null;
  codigo: string;
  observaciones: string;
  proveedorId: number | null;
}

export default function FormularioCompleto() {
  const [formulario, setFormulario] = useState<FormularioState>({
    noFactura: "",
    noCotizacion: "",
    cantidad: 0,
    productoId: null,
    medidaId: null,
    marcaId: null,
    codigo: "",
    observaciones: "",
    proveedorId: null,
  });

  const [archivos, setArchivos] = useState<File[]>([]);
  const [mensaje, setMensaje] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const manejarCambioTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    const parsedValue =
      type === "number"
        ? value === "" // Evita NaN si el input está vacío
          ? 0
          : name === "cantidad"
          ? parseFloat(value)
          : parseInt(value, 10)
        : value;

    setFormulario((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files));
    }
  };

  const manejarSeleccionCombo = (field: keyof FormularioState) => {
    return (selection: { [key: string]: number | null }) => {
      setFormulario((prev) => ({ ...prev, [field]: selection[field] ?? null }));
    };
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (archivos.length < 2) {
      setMensaje("Debes subir al menos dos archivos.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("archivo1", archivos[0]);
    formData.append("archivo2", archivos[1]);

    Object.entries(formulario).forEach(([key, value]) => {
      formData.append(key, value !== null ? String(value) : "");
    });

    try {
      const response = await fetch("http://37.27.133.117/backend/api/compras", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMensaje(`Datos enviados exitosamente: ${data.message}`);
        reiniciarFormulario();
      } else {
        const errorData = await response.json();
        setMensaje(`Error: ${errorData.error}`);
      }
    } catch (error) {
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
      productoId: null,
      medidaId: null,
      marcaId: null,
      codigo: "",
      observaciones: "",
      proveedorId: null,
    });
    setArchivos([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Requisición</h1>
      <form onSubmit={manejarEnvio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              value={formulario[name as keyof FormularioState] ?? ""}
              onChange={manejarCambioTexto}
              required
            />
          </div>
        ))}

        {/* ComboComponents corregidos con la URL del proxy */}
        <ComboComponent
          apiUrl="/api/proxy"
          propertyName="Cat_Producto"
          onSelectionChange={manejarSeleccionCombo("productoId")}
        />
        
        <ComboComponent
          apiUrl="/api/proxy"
          propertyName="Cat_Medida"
          onSelectionChange={manejarSeleccionCombo("medidaId")}
        />

        <ComboComponent
          apiUrl="/api/proxy"
          propertyName="Cat_Marca"
          onSelectionChange={manejarSeleccionCombo("marcaId")}
        />

        <ComboComponent
          apiUrl="/api/proxy"
          propertyName="Cat_Proveedor"
          onSelectionChange={manejarSeleccionCombo("proveedorId")}
        />

        {/* Campo para archivos */}
        <div className="col-span-2">
          <label className="block font-semibold mb-1">Subir Archivos</label>
          <input type="file" multiple onChange={manejarCambioArchivo} className="border rounded w-full p-2" />
        </div>

        {/* Botón de envío */}
        <div className="col-span-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>

      {mensaje && <p className="mt-4 text-center text-red-600">{mensaje}</p>}
    </div>
  );
}