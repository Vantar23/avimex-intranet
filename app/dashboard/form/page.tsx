"use client";

import { useState, useEffect } from "react";

// Define la interfaz Producto fuera del componente
interface Producto {
  ID: number;
  DESCRIPCION: string;
}

export default function RequisitionForm() {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    async function fetchProductos() {
      try {
        const response = await fetch("http://localhost:5300/backend/api/productos");
        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }
        const data = await response.json();
        setProductos(data.Cat_Producto);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    }

    fetchProductos();
  }, []);

  return (
    <div>
      {/* Encabezado */}
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
              <option>Seleccionar...</option>
              {productos.map((producto) => (
                <option key={producto.ID} value={producto.ID}>
                  {producto.DESCRIPCION}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="unidad"
              className="block text-sm font-medium text-gray-700"
            >
              Unidad de Medida
            </label>
            <input
              type="text"
              id="unidad"
              name="unidad"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="marca"
              className="block text-sm font-medium text-gray-700"
            >
              No. Catálogo o Marca
            </label>
            <input
              type="text"
              id="marca"
              name="marca"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="proveedor"
              className="block text-sm font-medium text-gray-700"
            >
              Proveedor
            </label>
            <input
              type="text"
              id="proveedor"
              name="proveedor"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Fila 3 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="factura"
              className="block text-sm font-medium text-gray-700"
            >
              No. Factura
            </label>
            <input
              type="text"
              id="factura"
              name="factura"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="cotizacion"
              className="block text-sm font-medium text-gray-700"
            >
              No. Cotización
            </label>
            <input
              type="text"
              id="cotizacion"
              name="cotizacion"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="observaciones"
              className="block text-sm font-medium text-gray-700"
            >
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows={2}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            ></textarea>
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
