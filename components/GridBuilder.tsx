'use client';

import { useState, useEffect } from "react";
import axios from "axios";

interface ColumnDefinition {
  key: string;
  label: string;
  type: string;
}

interface GridBuilderProps {
  jsonUrl: string;
  apiUrl: string;
  onRowClick?: (rowData: any) => void;
}

const GridBuilder = ({ jsonUrl, apiUrl, onRowClick }: GridBuilderProps) => {
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchDataFromProxy = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/proxyGridRoute", {
          params: {
            jsonUrl,
            apiUrl,
          },
        });

        setColumns(res.data.columns);
        setData(res.data.data);
        setOriginalData(res.data.originalData);
      } catch (err: any) {
        setError(err.message || "Error desconocido al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromProxy();
  }, [jsonUrl, apiUrl]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRowClick = (item: any) => {
    const fullData = originalData.find((row) =>
      columns.every((col) => row[col.key] === item[col.key])
    );
    setSelectedRow(fullData || item);
    onRowClick?.(fullData || item);
  };

  const formatKeyLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1") // separa camelCase → camel Case
      .replace(/^./, (str) => str.toUpperCase()) // primera en mayúscula
      .replace(/_/g, " "); // reemplaza guiones bajos por espacios
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-4">Tabla Generada Dinámicamente</h2>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-md text-sm">
            <thead className="bg-gray-200">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="p-3 text-left border-b">
                    {col.label}
                  </th>
                ))}
                <th className="p-3 text-left border-b">Archivos</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleRowClick(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 border-b">
                      {String(item[col.key] ?? "")}
                    </td>
                  ))}
                  <td className="p-3 border-b">
                    <div className="flex gap-2">
                      {item.NombreFact && (
                        <button
                          className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            const path = `/documents/${item.NombreFact}`;
                            const link = document.createElement("a");
                            link.href = path;
                            link.download = item.NombreFact;
                            link.click();
                          }}
                        >
                          Factura
                        </button>
                      )}
                      {item.NombreCoti && (
                        <button
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            const path = `/documents/${item.NombreCoti}`;
                            const link = document.createElement("a");
                            link.href = path;
                            link.download = item.NombreCoti;
                            link.click();
                          }}
                        >
                          Cotización
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="flex justify-center mt-4 gap-2 text-sm">
            <button
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Modal para mostrar detalles del registro seleccionado */}
      {selectedRow && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Detalles del Registro</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2 py-2">
              {Object.entries(selectedRow)
                .filter(([key, value]) => {
                  const excludedAlways = ["ArchCoti", "NombreCoti", "ArchFact", "NombreFact"];
                  if (excludedAlways.includes(key)) return false;
                  if (["NoFactura", "NoCotizacion"].includes(key)) {
                    return value !== null && value !== "";
                  }
                  return true;
                })
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-3 gap-2 border-b pb-2 last:border-none"
                  >
                    <div className="col-span-1 text-base font-semibold text-gray-700 capitalize">
                      {formatKeyLabel(key)}:
                    </div>
                    <div className="col-span-2 text-base text-gray-900 break-words">
                      {String(value)}
                    </div>
                  </div>
                ))}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => setSelectedRow(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridBuilder;