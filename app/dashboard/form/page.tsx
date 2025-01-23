"use client";

import { useState } from "react";
export const config = { ssr: false };

export default function Requisicion() {
  const [archivo1, setArchivo1] = useState<File | null>(null);
  const [archivo2, setArchivo2] = useState<File | null>(null);
  const [archivo1Base64, setArchivo1Base64] = useState<string | null>(null);
  const [archivo2Base64, setArchivo2Base64] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [medidaIdSeleccionada, setMedidaIdSeleccionada] = useState("");
  const [marcaIdSeleccionada, setMarcaIdSeleccionada] = useState("");
  const [noFactura, setNoFactura] = useState("");
  const [noCotizacion, setNoCotizacion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");

  const productos = [
    { ID: "1", DESCRIPCION: "Despachador de Toallas" },
    { ID: "2", DESCRIPCION: "Dispensador de Jabón" },
    { ID: "3", DESCRIPCION: "Abrazadera sin Fin 1 1/4\"" },
  ];

  const proveedores = [
    { ID: "1", DESCRIPCION: "AELENEVA México" },
    { ID: "2", DESCRIPCION: "Talos Electronics" },
    { ID: "3", DESCRIPCION: "Proveedor Genérico" },
  ];

  const medidas = [
    { ID: "1", DESCRIPCION: "Unidad" },
    { ID: "2", DESCRIPCION: "Pieza" },
    { ID: "3", DESCRIPCION: "Caja" },
    { ID: "4", DESCRIPCION: "Metro" },
  ];

  const marcas = [
    { ID: "1", DESCRIPCION: "Marca A" },
    { ID: "2", DESCRIPCION: "Marca B" },
    { ID: "3", DESCRIPCION: "Marca C" },
    { ID: "4", DESCRIPCION: "Genérico" },
  ];

  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>, archivoSetter: any, base64Setter: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const archivoSeleccionado = e.target.files[0];
      archivoSetter(archivoSeleccionado);

      const lector = new FileReader();
      lector.onload = () => {
        if (lector.result) {
          base64Setter(lector.result.toString());
        }
      };
      lector.readAsDataURL(archivoSeleccionado);
    }
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !archivo1 ||
      !archivo2 ||
      !codigo ||
      !cantidad ||
      !productoSeleccionado ||
      !medidaIdSeleccionada ||
      !marcaIdSeleccionada ||
      !proveedorSeleccionado
    ) {
      alert("Por favor, completa todos los campos obligatorios antes de enviar.");
      return;
    }

    const data = {
      archivo1: archivo1Base64,
      nombreArchivo1: archivo1.name,
      archivo2: archivo2Base64,
      nombreArchivo2: archivo2.name,
      codigo,
      cantidad,
      productoId: productoSeleccionado,
      medidaId: medidaIdSeleccionada,
      marcaId: marcaIdSeleccionada,
      noFactura,
      noCotizacion,
      observaciones,
      proveedorId: proveedorSeleccionado,
    };

    const jsonString = JSON.stringify(data, null, 2);
    console.log("JSON generado:", jsonString);

    try {
      const response = await fetch("http://localhost/backend/api/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Datos enviados exitosamente.");
        console.log("Respuesta de la API:", result);
      } else {
        const errorText = await response.text();
        alert("Error al enviar los datos. Revisa la consola para más información.");
        console.error("Error:", errorText);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Hubo un error al intentar enviar los datos.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Requisición</h1>
      <form className="bg-white rounded p-6 space-y-4" onSubmit={manejarEnvio}>
        {/* Campos del formulario */}
        <div>
          <label className="block font-semibold mb-1">Archivo 1</label>
          <input
            type="file"
            onChange={(e) => manejarArchivo(e, setArchivo1, setArchivo1Base64)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Archivo 2</label>
          <input
            type="file"
            onChange={(e) => manejarArchivo(e, setArchivo2, setArchivo2Base64)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Código</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Cantidad</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Producto</label>
          <select
            className="border rounded w-full p-2"
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un producto</option>
            {productos.map((producto) => (
              <option key={producto.ID} value={producto.ID}>
                {producto.DESCRIPCION}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Unidad de Medida</label>
          <select
            className="border rounded w-full p-2"
            value={medidaIdSeleccionada}
            onChange={(e) => setMedidaIdSeleccionada(e.target.value)}
          >
            <option value="">Selecciona una medida</option>
            {medidas.map((medida) => (
              <option key={medida.ID} value={medida.ID}>
                {medida.DESCRIPCION}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">No. Catálogo o Marca</label>
          <select
            className="border rounded w-full p-2"
            value={marcaIdSeleccionada}
            onChange={(e) => setMarcaIdSeleccionada(e.target.value)}
          >
            <option value="">Selecciona una marca</option>
            {marcas.map((marca) => (
              <option key={marca.ID} value={marca.ID}>
                {marca.DESCRIPCION}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">No. Factura</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={noFactura}
            onChange={(e) => setNoFactura(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">No. Cotización</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={noCotizacion}
            onChange={(e) => setNoCotizacion(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Observaciones</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Proveedor</label>
          <select
            className="border rounded w-full p-2"
            value={proveedorSeleccionado}
            onChange={(e) => setProveedorSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un proveedor</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.ID} value={proveedor.ID}>
                {proveedor.DESCRIPCION}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Enviar Requisición
        </button>
      </form>
    </div>
  );
}
