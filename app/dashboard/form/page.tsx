"use client";

import { useState } from "react";

export default function Requisicion() {
  const [archivo1, setArchivo1] = useState<File | null>(null);
  const [archivo2, setArchivo2] = useState<File | null>(null);
  const [archivo1Base64, setArchivo1Base64] = useState<string | null>(null);
  const [archivo2Base64, setArchivo2Base64] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [jsonGenerado, setJsonGenerado] = useState<string | null>(null);

  // Opciones manuales
  const productos = [
    { ID: "1", DESCRIPCION: "Producto A" },
    { ID: "2", DESCRIPCION: "Producto B" },
    { ID: "3", DESCRIPCION: "Producto C" },
  ];

  const proveedores = [
    { ID: "1", DESCRIPCION: "Proveedor X" },
    { ID: "2", DESCRIPCION: "Proveedor Y" },
    { ID: "3", DESCRIPCION: "Proveedor Z" },
  ];

  // Manejo del archivo seleccionado
  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>, archivoSetter: any, base64Setter: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const archivoSeleccionado = e.target.files[0];
      archivoSetter(archivoSeleccionado);

      // Leer archivo y convertirlo a base64
      const lector = new FileReader();
      lector.onload = () => {
        if (lector.result) {
          base64Setter(lector.result.toString());
          console.log("Archivo en Base64:", lector.result);
        }
      };
      lector.readAsDataURL(archivoSeleccionado);
    }
  };

  // Manejar el envío del formulario
  const manejarEnvio = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !archivo1 ||
      !archivo2 ||
      !codigo ||
      !cantidad ||
      !productoSeleccionado ||
      !proveedorSeleccionado
    ) {
      alert("Por favor, completa todos los campos antes de enviar.");
      return;
    }

    const data = {
      archivo1: archivo1Base64, // Primer archivo en formato Base64
      nombreArchivo1: archivo1.name,
      archivo2: archivo2Base64, // Segundo archivo en formato Base64
      nombreArchivo2: archivo2.name,
      codigo,
      cantidad,
      productoId: productoSeleccionado,
      proveedorId: proveedorSeleccionado,
    };

    const jsonString = JSON.stringify(data, null, 2);
    setJsonGenerado(jsonString); // Guardar el JSON generado para mostrarlo en pantalla
    console.log("Datos generados (JSON):", jsonString);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Requisición</h1>
      <form className="bg-white rounded p-6 space-y-4" onSubmit={manejarEnvio}>
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
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Generar JSON
        </button>
      </form>
      {jsonGenerado && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">JSON Generado:</h2>
          <pre className="bg-white p-4 rounded shadow">{jsonGenerado}</pre>
        </div>
      )}
    </div>
  );
}
