"use client";

import { useState } from "react";

export default function FormularioPrueba() {
  const [noFactura, setNoFactura] = useState("");
  const [mensaje, setMensaje] = useState("");

  const manejarCambioTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoFactura(e.target.value);
    console.log("No factura actualizado:", e.target.value);
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!noFactura) {
      alert("Por favor, completa el campo 'No. Factura' antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("noFactura", noFactura);

    try {
      const response = await fetch("http://localhost/backend/api/compras", {
        method: "POST",
        body: formData, // Enviar datos con FormData
        headers: {
          "Accept": "*/*",
          "User-Agent": "PostmanRuntime/7.43.0",
          "Connection": "keep-alive",
        }, // Content-Type se manejará automáticamente por el navegador
      });

      if (response.ok) {
        const data = await response.json();
        setMensaje("Datos enviados exitosamente: " + data.message);
        console.log("Respuesta del servidor:", data);
        setNoFactura(""); // Limpiar el campo noFactura
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
      </form>
      {mensaje && <p className="mt-4 text-green-600">{mensaje}</p>}
    </div>
  );
}
