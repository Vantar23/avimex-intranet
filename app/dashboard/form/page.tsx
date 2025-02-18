"use client";

import { useState } from "react";

export default function FormularioPrueba() {
  const [noFactura, setNoFactura] = useState("");
  const [mensaje, setMensaje] = useState("");

  const manejarCambioTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoFactura(e.target.value);
    console.log("No factura actualizado:", e.target.value);
  };

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!noFactura) {
      alert("Por favor, completa el campo 'No. Factura' antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("noFactura", noFactura);

    try {
      const response = await fetch("/api/proxyCompras", {
        method: "POST",
        body: formData, // Enviar datos con FormData
      });

      if (response.ok) {
        const data = await response.json();
        setMensaje("Datos enviados exitosamente: " + data.message);
        console.log("Respuesta del servidor:", data);
        setNoFactura(""); // Limpiar el campo noFactura
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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Enviar No. Factura</h1>
      <form className="bg-white rounded p-6 space-y-4" onSubmit={manejarEnvio}>
        <div>
          <label className="block font-semibold mb-1">No. Factura</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={noFactura}
            onChange={manejarCambioTexto}
            required
          />
        </div>
        <div className="mt-4">
          <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">
            Enviar
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