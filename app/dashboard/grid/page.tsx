"use client";

import { useState, useEffect } from "react";

interface Producto {
  id: number;
  producto: string;
  proveedor: string;
  medida: string;
  marca: string;
  fecha: string;
  Cantidad: number;
  Codigo: string;
}

export default function Page() {
  const [data, setData] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/proxyGrid?id=1")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        return response.json();
      })
      .then((data: Producto[]) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center">Cargando...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Tabla de Productos</h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg shadow-lg text-sm md:text-base">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left border-b">Producto</th>
              <th className="p-3 text-left border-b">Proveedor</th>
              <th className="p-3 text-left border-b hidden md:table-cell">Medida</th>
              <th className="p-3 text-left border-b">Marca</th>
              <th className="p-3 text-left border-b hidden md:table-cell">Fecha</th>
              <th className="p-3 text-left border-b">Cantidad</th>
              <th className="p-3 text-left border-b">Código</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100 transition">
                <td className="p-3 border-b">{item.producto}</td>
                <td className="p-3 border-b">{item.proveedor}</td>
                <td className="p-3 border-b hidden md:table-cell">{item.medida}</td>
                <td className="p-3 border-b">{item.marca}</td>
                <td className="p-3 border-b hidden md:table-cell">
                  {new Date(item.fecha).toLocaleDateString()}
                </td>
                <td className="p-3 border-b">{item.Cantidad}</td>
                <td className="p-3 border-b">{item.Codigo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}