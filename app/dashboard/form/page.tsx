"use client";

import { useState, useEffect } from "react";
import { catalogos } from "app/api/catalogos"; // Ajusta la ruta a tu archivo catalogos.js

// Define una interfaz para tipar los productos
interface Producto {
  ID: number;
  DESCRIPCION: string;
}

export default function Requisicion() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [codigo, setCodigo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");

  useEffect(() => {
    if (catalogos.Cat_Producto && catalogos.Cat_Producto.length > 0) {
      setProductos(catalogos.Cat_Producto.map((producto: Producto) => ({
        ID: producto.ID,
        DESCRIPCION: producto.DESCRIPCION,
      })));
      console.log("Productos cargados: ", catalogos.Cat_Producto);
    } else {
      console.error("No se encontraron productos en el catálogo.");
    }
  }, []);

  // Manejar el archivo seleccionado
  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0]);
      console.log("Archivo seleccionado: ", e.target.files[0].name);
    }
  };

  // Manejar el envío del formulario
  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!archivo || !codigo || !cantidad || !productoSeleccionado) {
      alert("Por favor, completa todos los campos antes de enviar.");
      return;
    }

    // Crear un objeto FormData
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("codigo", codigo);
    formData.append("cantidad", cantidad);
    formData.append("productoId", productoSeleccionado);

    try {
      // Realizar la petición a tu API .NET
      const respuesta = await fetch("https://api-recepcion-de-archivos-production.up.railway.app/", {
        method: "POST",
        body: formData,
      });

      if (respuesta.ok) {
        const resultado = await respuesta.json();
        console.log("Datos enviados exitosamente:", resultado);
        alert("Formulario enviado exitosamente.");
      } else {
        console.error("Error al enviar el formulario:", respuesta.statusText);
        alert("Error al enviar el formulario.");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Requisición</h1>

      <form className="bg-white rounded p-6 space-y-4" onSubmit={manejarEnvio}>
        {/* Fila 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="codigo"
              className="block text-sm font-medium text-gray-700"
            >
              Código
            </label>
            <input
              type="text"
              id="codigo"
              name="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="cantidad"
              className="block text-sm font-medium text-gray-700"
            >
              Cantidad
            </label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="producto"
              className="block text-sm font-medium text-gray-700"
            >
              Producto
            </label>
            <select
              id="producto"
              name="producto"
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Seleccionar...</option>
              {productos.map((producto) => (
                <option key={producto.ID} value={producto.ID}>
                  {producto.DESCRIPCION}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campo para subir archivo */}
        <div>
          <label
            htmlFor="archivo"
            className="block text-sm font-medium text-gray-700"
          >
            Subir archivo
          </label>
          <input
            type="file"
            id="archivo"
            name="archivo"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onChange={manejarArchivo}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
