"use client";

import { useState, useEffect } from "react";
import { catalogos } from "app/api/catalogos"; // Ajusta la ruta a tu archivo catalogos.js

// Define una interfaz para tipar los productos
interface Producto {
  ID: number;
  DESCRIPCION: string;
}

export default function Requisicion() {
  // Tipamos el estado como un arreglo de `Producto`
  const [productos, setProductos] = useState<Producto[]>([]);

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

  return (
    <div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Requisición</h1>

      <form className="bg-white rounded p-6 space-y-4">
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
