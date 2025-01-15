"use client";

import { useState } from "react";

// Define la interfaz Producto
interface Producto {
  ID: number;
  DESCRIPCION: string;
}

// Datos predefinidos para los productos
const productosIniciales: Producto[] = [
  { ID: 1, DESCRIPCION: "Producto 1" },
  { ID: 2, DESCRIPCION: "Producto 2" },
  { ID: 3, DESCRIPCION: "Producto 3" },
  { ID: 4, DESCRIPCION: "Producto 4" },
];

export default function RequisitionForm() {
  const [productos] = useState<Producto[]>(productosIniciales);

  return (
    <div>
      {/* Encabezado */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Catálogo de Productos</h1>

      {/* Tabla de productos */}
      <table className="min-w-full divide-y divide-gray-200 border rounded-md">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Descripción
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {productos.map((producto) => (
            <tr key={producto.ID}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {producto.ID}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {producto.DESCRIPCION}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
