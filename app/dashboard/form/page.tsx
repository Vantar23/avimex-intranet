"use client";

import { useState, ChangeEvent, FormEvent, useCallback, useRef } from "react";
import ComboComponent from "@/components/combo";

interface FormularioState {
  codigo: string;
  cantidad: string;
  noFactura: string;
  noCotizacion: string;
  observaciones: string;
  proveedorId: string;
  productoId: string;
  medidaId: string;
  marcaId: string;
  archivo1: File | null;
  archivo2: File | null;
}

const estadoInicial: FormularioState = {
  codigo: "",
  cantidad: "",
  noFactura: "",
  noCotizacion: "",
  observaciones: "",
  proveedorId: "",
  productoId: "",
  medidaId: "",
  marcaId: "",
  archivo1: null,
  archivo2: null,
};

export default function FormularioCompleto() {
  const [formulario, setFormulario] = useState<FormularioState>(estadoInicial);
  const [loading, setLoading] = useState<boolean>(false);
  const [formKey, setFormKey] = useState<number>(Date.now());

  const archivo1Ref = useRef<HTMLInputElement>(null);
  const archivo2Ref = useRef<HTMLInputElement>(null);

  const manejarCambioTexto = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const manejarCambioArchivo = useCallback(
    (e: ChangeEvent<HTMLInputElement>, key: "archivo1" | "archivo2") => {
      const file = e.target.files?.[0] || null;
      setFormulario((prev) => ({
        ...prev,
        [key]: file,
      }));
    },
    []
  );

  const manejarSeleccionCombo = useCallback((field: keyof FormularioState) => {
    return (selection: string) => {
      setFormulario((prev) => ({
        ...prev,
        [field]: selection,
      }));
    };
  }, []);

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Construir el FormData con todos los campos y archivos
    const formData = new FormData();
    Object.entries(formulario).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else {
        formData.append(key, value);
      }
    });

    console.log("Enviando FormData:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await fetch("/api/proxyCompras", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error en la solicitud:", errorText);
        alert("Error en la solicitud");
      } else {
        alert("Envío Exitoso");
        setFormulario(estadoInicial);
        setFormKey(Date.now());
        if (archivo1Ref.current) archivo1Ref.current.value = "";
        if (archivo2Ref.current) archivo2Ref.current.value = "";
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Error en la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Requisición</h1>
      <form onSubmit={manejarEnvio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campos de texto */}
        <div>
          <label className="block font-semibold mb-1">Código</label>
          <input
            type="text"
            name="codigo"
            maxLength={12}
            className="border rounded w-full p-2"
            value={formulario.codigo}
            onChange={manejarCambioTexto}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Cantidad</label>
          <input
            type="text"
            name="cantidad"
            className="border rounded w-full p-2"
            value={formulario.cantidad}
            onChange={manejarCambioTexto}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">No. Factura</label>
          <input
            type="text"
            name="noFactura"
            maxLength={12}
            className="border rounded w-full p-2"
            value={formulario.noFactura}
            onChange={manejarCambioTexto}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">No. Cotización</label>
          <input
            type="text"
            name="noCotizacion"
            maxLength={12}
            className="border rounded w-full p-2"
            value={formulario.noCotizacion}
            onChange={manejarCambioTexto}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Observaciones</label>
          <input
            type="text"
            name="observaciones"
            className="border rounded w-full p-2"
            value={formulario.observaciones}
            onChange={manejarCambioTexto}
          />
        </div>
        {/* Combos */}
        <ComboComponent
          apiUrl="/api/proxyCompras"
          propertyName="Cat_Proveedor"
          onSelectionChange={manejarSeleccionCombo("proveedorId")}
          resetTrigger={formKey}
        />
        <ComboComponent
          apiUrl="/api/proxyCompras"
          propertyName="Cat_Producto"
          onSelectionChange={manejarSeleccionCombo("productoId")}
          resetTrigger={formKey}
        />
        <ComboComponent
          apiUrl="/api/proxyCompras"
          propertyName="Cat_Medida"
          onSelectionChange={manejarSeleccionCombo("medidaId")}
          resetTrigger={formKey}
        />
        <ComboComponent
          apiUrl="/api/proxyCompras"
          propertyName="Cat_Marca"
          onSelectionChange={manejarSeleccionCombo("marcaId")}
          resetTrigger={formKey}
        />
        {/* Archivos */}
        <div className="col-span-1 md:col-span-2">
          <label className="block font-semibold mb-1">Archivo 1</label>
          <input
            type="file"
            className="border rounded w-full p-2"
            onChange={(e) => manejarCambioArchivo(e, "archivo1")}
            ref={archivo1Ref}
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block font-semibold mb-1">Archivo 2</label>
          <input
            type="file"
            className="border rounded w-full p-2"
            onChange={(e) => manejarCambioArchivo(e, "archivo2")}
            ref={archivo2Ref}
          />
        </div>
        {/* Botón de envío */}
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
    </div>
  );
}