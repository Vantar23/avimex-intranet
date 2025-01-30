"use client";

import { useState, ChangeEvent, FormEvent, useCallback, useRef } from "react";
import ComboComponent from "@/components/combo";

interface FormularioState {
  codigo: string;
  cantidad: number;
  noFactura: string;
  noCotizacion: string;
  proveedorId: number | null;
  productoId: number | null;
  medidaId: number | null;
  marcaId: number | null;
  archivo1: File | null;
  archivo2: File | null;
}

const estadoInicial: FormularioState = {
  codigo: "",
  cantidad: 0,
  noFactura: "",
  noCotizacion: "",
  proveedorId: null,
  productoId: null,
  medidaId: null,
  marcaId: null,
  archivo1: null,
  archivo2: null,
};

export default function FormularioCompleto(): JSX.Element {
  const [formulario, setFormulario] = useState<FormularioState>(estadoInicial);
  const [loading, setLoading] = useState<boolean>(false);
  const [formKey, setFormKey] = useState<number>(Date.now()); // 🔥 Nuevo trigger para reset

  const archivo1Ref = useRef<HTMLInputElement>(null);
  const archivo2Ref = useRef<HTMLInputElement>(null);

  const manejarCambioTexto = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  }, []);

  const manejarCambioArchivo = useCallback((e: ChangeEvent<HTMLInputElement>, archivoKey: "archivo1" | "archivo2"): void => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      setFormulario((prev) => ({ ...prev, [archivoKey]: archivo }));
    }
  }, []);

  const manejarSeleccionCombo = useCallback((field: keyof FormularioState) => {
    return (selection: number | null) => {
      setFormulario((prev) => ({ ...prev, [field]: selection ?? null }));
    };
  }, []);

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(formulario).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value instanceof File ? value : value.toString());
      }
    });

    try {
      const response = await fetch("/api/proxyCompras", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert(`Envío Exitoso`);

        // 🔥 Resetear formulario y selects
        setFormulario(estadoInicial);
        setFormKey(Date.now()); // Cambia resetTrigger

        // Resetear archivos manualmente
        if (archivo1Ref.current) archivo1Ref.current.value = "";
        if (archivo2Ref.current) archivo2Ref.current.value = "";
      } else {
        alert("Error en la solicitud");
      }
    } catch (error) {
      alert("Error en la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-whiterounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-12 text-center">Requisición</h1>
      <form onSubmit={manejarEnvio} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Código */}
        <div>
          <label className="block font-semibold mb-1">Código</label>
          <input type="text" name="codigo" maxLength={12} className="border rounded w-full p-2" value={formulario.codigo} onChange={manejarCambioTexto} required />
        </div>

        {/* Cantidad */}
        <div>
          <label className="block font-semibold mb-1">Cantidad</label>
          <input type="number" name="cantidad" min={0} max={999999} className="border rounded w-full p-2" value={formulario.cantidad} onChange={manejarCambioTexto} required />
        </div>

        {/* No. Factura */}
        <div>
          <label className="block font-semibold mb-1">No. Factura</label>
          <input type="text" name="noFactura" maxLength={12} className="border rounded w-full p-2" value={formulario.noFactura} onChange={manejarCambioTexto} required />
        </div>

        {/* No. Cotización */}
        <div>
          <label className="block font-semibold mb-1">No. Cotización</label>
          <input type="text" name="noCotizacion" maxLength={12} className="border rounded w-full p-2" value={formulario.noCotizacion} onChange={manejarCambioTexto} required />
        </div>

        {/* Selects dinámicos */}
        
        <div>
  <label className="block font-semibold mb-1">Proveedor</label>
    <ComboComponent apiUrl="/api/proxyCompras" propertyName="Cat_Proveedor" onSelectionChange={manejarSeleccionCombo("proveedorId")} resetTrigger={formKey} />
  </div>

  <div>
    <label className="block font-semibold mb-1">Producto</label>
    <ComboComponent apiUrl="/api/proxyCompras" propertyName="Cat_Producto" onSelectionChange={manejarSeleccionCombo("productoId")} resetTrigger={formKey} />
  </div>

  <div>
    <label className="block font-semibold mb-1">Medida</label>
    <ComboComponent apiUrl="/api/proxyCompras" propertyName="Cat_Medida" onSelectionChange={manejarSeleccionCombo("medidaId")} resetTrigger={formKey} />
  </div>

  <div>
    <label className="block font-semibold mb-1">Marca</label>
    <ComboComponent apiUrl="/api/proxyCompras" propertyName="Cat_Marca" onSelectionChange={manejarSeleccionCombo("marcaId")} resetTrigger={formKey} />
  </div>

        {/* Archivo 1 */}
        <div>
          <label className="block font-semibold mb-1">Archivo 1</label>
          <input ref={archivo1Ref} type="file" onChange={(e) => manejarCambioArchivo(e, "archivo1")} className="border rounded w-full p-2" />
        </div>

        {/* Archivo 2 */}
        <div>
          <label className="block font-semibold mb-1">Archivo 2</label>
          <input ref={archivo2Ref} type="file" onChange={(e) => manejarCambioArchivo(e, "archivo2")} className="border rounded w-full p-2" />
        </div>

        {/* Botón de envío */}
        <div className="col-span-1 sm:col-span-2 flex justify-center">
          <button type="submit" className="bg-green-500 text-white px-6 py-3 rounded-lg w-full sm:w-1/2 text-lg font-semibold hover:bg-green-600 transition duration-200" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>

      </form>
    </div>
  );
}