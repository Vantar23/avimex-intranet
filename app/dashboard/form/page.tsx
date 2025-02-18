"use client";

import { useState, useRef } from "react";

export default function FormularioRequisicion() {
  const [formData, setFormData] = useState({
    codigo: "",
    cantidad: "",
    producto: "",
    unidadMedida: "",
    catalogo: "",
    proveedor: "",
    noFactura: "",
    noCotizacion: "",
    observaciones: "",
  });

  const [mensaje, setMensaje] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const manejarCambio = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.noFactura) {
      alert("Por favor, completa el campo 'No. Factura' antes de enviar.");
      return;
    }

    try {
      const response = await fetch("http://localhost/backend/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setMensaje("Datos enviados exitosamente: " + data.message);
        console.log("Respuesta del servidor:", data);
        setFormData({
          codigo: "",
          cantidad: "",
          producto: "",
          unidadMedida: "",
          catalogo: "",
          proveedor: "",
          noFactura: "",
          noCotizacion: "",
          observaciones: "",
        });
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

  // Función para activar el input de archivos
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Maneja el cambio cuando se selecciona un archivo PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      console.log("PDF seleccionado:", file);
      // Aquí puedes agregar la lógica para subir el archivo a tu servidor o procesarlo según requieras.
    }
  };

  return (
    // Contenedor que centra el formulario en la pantalla
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Formulario con ancho máximo para que no se salga de la pantalla */}
      <form className="w-full max-w-3xl p-8" onSubmit={manejarEnvio}>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Requisición</h1>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-lg mb-1">Código</label>
            <input
              type="text"
              name="codigo"
              className="border rounded w-full p-2"
              value={formData.codigo}
              onChange={manejarCambio}
            />
          </div>
          <div>
            <label className="block font-semibold text-lg mb-1">Proveedor</label>
            <select
              name="proveedor"
              className="border rounded w-full p-2"
              value={formData.proveedor}
              onChange={manejarCambio}
            >
              <option value="">Selecciona un proveedor</option>
              <option value="AELENEVA MEXICO">AELENEVA MEXICO</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-lg mb-1">Cantidad</label>
            <input
              type="number"
              name="cantidad"
              className="border rounded w-full p-2"
              value={formData.cantidad}
              onChange={manejarCambio}
            />
          </div>
          <div>
            <label className="block font-semibold text-lg mb-1">No. Factura</label>
            <input
              type="text"
              name="noFactura"
              className="border rounded w-full p-2"
              value={formData.noFactura}
              onChange={manejarCambio}
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-lg mb-1">Producto</label>
            <select
              name="producto"
              className="border rounded w-full p-2"
              value={formData.producto}
              onChange={manejarCambio}
            >
              <option value="">Selecciona un producto</option>
              <option value="Despachador de Toallas">Despachador de Toallas</option>
              <option value="Jabón Antibacterial">Jabón Antibacterial</option>
              <option value="Abrazaderas sin fin">Abrazaderas sin fin</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-lg mb-1">
              No. Cotización
            </label>
            <input
              type="text"
              name="noCotizacion"
              className="border rounded w-full p-2"
              value={formData.noCotizacion}
              onChange={manejarCambio}
            />
          </div>
          <div>
            <label className="block font-semibold text-lg mb-1">
              Unidad de Medida
            </label>
            <select
              name="unidadMedida"
              className="border rounded w-full p-2"
              value={formData.unidadMedida}
              onChange={manejarCambio}
            >
              <option value="">Selecciona una unidad</option>
              <option value="Piezas">Piezas</option>
              <option value="Metros">Metros</option>
              <option value="Kilogramos">Kilogramos</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-lg mb-1">
              No. Catálogo y Marca
            </label>
            <select
              name="catalogo"
              className="border rounded w-full p-2"
              value={formData.catalogo}
              onChange={manejarCambio}
            >
              <option value="">Selecciona una marca</option>
              <option value="Talos Electronics">Talos Electronics</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block font-semibold text-lg mb-1">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            className="border rounded w-full p-2 h-28"
            value={formData.observaciones}
            onChange={manejarCambio}
          />
        </div>
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={handleFileButtonClick}
            className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border border-gray-700 rounded-md px-4 py-2 font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition transform duration-150 hover:scale-105"
          >
            Cargar PDF
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg px-6 py-2 font-bold shadow hover:bg-blue-600 transition transform duration-150 hover:scale-105"
          >
            Agregar
          </button>
        </div>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
      </form>
    </div>
  );
}
