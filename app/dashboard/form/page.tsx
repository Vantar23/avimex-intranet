"use client";

import { useState, ChangeEvent, FormEvent, useCallback } from "react";
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

// 🔹 Mover estado inicial fuera del componente para evitar recreación en cada render
const estadoInicial: FormularioState = {
  noFactura: "",
  noCotizacion: "",
  cantidad: 0,
  productoId: null,
  medidaId: null,
  marcaId: null,
  codigo: "",
  observaciones: "",
  proveedorId: null,
};

export default function FormularioCompleto(): JSX.Element {
  const [formulario, setFormulario] = useState<FormularioState>(estadoInicial);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [mensaje, setMensaje] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 🔹 Manejo de cambios en inputs de texto
  const manejarCambioTexto = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type } = e.target;
    
    const parsedValue =
      type === "number" ? (value === "" ? 0 : parseFloat(value)) : value;

    setFormulario((prev) => ({ ...prev, [name]: parsedValue }));
  }, []);

  // 🔹 Manejo de selección de archivos con validación de tipo
  const manejarCambioArchivo = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const archivosSeleccionados = Array.from(e.target.files);
      const archivosValidos = archivosSeleccionados.filter((file) =>
        ["application/pdf", "image/png", "image/jpeg"].includes(file.type)
      );

      if (archivosValidos.length < 2) {
        setMensaje("Debes subir al menos dos archivos válidos (PDF o imágenes)");
      } else {
        setArchivos(archivosValidos);
      }
    }
  }, []);

  // 🔹 Manejo de selección en ComboComponent
  const manejarSeleccionCombo = useCallback((field: keyof FormularioState) => {
    return (selection: number | null) => {
      console.log(`Seleccionado para ${field}:`, selection);
      setFormulario((prev) => ({ ...prev, [field]: selection ?? null }));
    };
  }, []);

  // 🔹 Envío del formulario
  const manejarEnvio = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    if (archivos.length < 2) {
      setMensaje("Debes subir al menos dos archivos.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    archivos.forEach((archivo, index) => {
      formData.append(`archivo${index + 1}`, archivo);
    });

    Object.entries(formulario).forEach(([key, value]) => {
      formData.append(key, value !== null ? String(value) : "");
    });

    console.log("📤 Enviando datos:", Object.fromEntries(formData.entries()));

    try {
      const response = await fetch("https://localhost/backend/api/compras", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido");
      }

      const data = await response.json();
      setMensaje(`Datos enviados exitosamente: ${data.message}`);
      reiniciarFormulario();
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
      setMensaje("Hubo un problema al enviar los datos.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reiniciar formulario
  const reiniciarFormulario = useCallback((): void => {
    setFormulario(estadoInicial);
    setArchivos([]);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 rounded">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Requisición</h1>
      <form onSubmit={manejarEnvio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["noFactura", "noCotizacion", "cantidad", "codigo", "observaciones"].map((name) => (
          <div key={name}>
            <label className="block font-semibold mb-1">{name}</label>
            <input
              type={name === "cantidad" ? "number" : "text"}
              name={name}
              className="border rounded w-full p-2"
              value={formulario[name as keyof FormularioState] ?? ""}
              onChange={manejarCambioTexto}
              required
            />
          </div>
        ))}

        <ComboComponent apiUrl="/api/proxy" propertyName="Cat_Producto" onSelectionChange={manejarSeleccionCombo("productoId")} />
        <ComboComponent apiUrl="/api/proxy" propertyName="Cat_Medida" onSelectionChange={manejarSeleccionCombo("medidaId")} />
        <ComboComponent apiUrl="/api/proxy" propertyName="Cat_Marca" onSelectionChange={manejarSeleccionCombo("marcaId")} />
        <ComboComponent apiUrl="/api/proxy" propertyName="Cat_Proveedor" onSelectionChange={manejarSeleccionCombo("proveedorId")} />

        <div className="col-span-2">
          <label className="block font-semibold mb-1">Subir Archivos</label>
          <input type="file" multiple onChange={manejarCambioArchivo} className="border rounded w-full p-2" />
        </div>

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