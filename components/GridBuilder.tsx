// components/GridBuilder.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  FunnelIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import { FaFileExcel } from "react-icons/fa";
import DynamicForm from "@/components/FormBuilder";

// Ahora modal siempre se espera dentro de props
interface GridBuilderModalConfig {
  type: "dynamicForm";
  num: string;
  subcarpeta: string;
}

interface GridBuilderProps {
  apiUrl: string;
  onRowClick?: (rowData: any) => void;
  selectFilters?: string[];
  modal: GridBuilderModalConfig; // Ahora no es opcional, se incluye siempre en props
}

function parseDate(dateString: string): Date {
  if (!dateString) return new Date(0);
  if (dateString.includes("-")) {
    return new Date(dateString);
  } else if (dateString.includes("/")) {
    const parts = dateString.split("/");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateString);
}

export default function GridBuilder({
  apiUrl,
  onRowClick,
  selectFilters,
  modal,
}: GridBuilderProps) {
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Filtros
  const [globalSearch, setGlobalSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Control del ícono de regresar
  const [showReload, setShowReload] = useState(false);

  // Estado para el modal del FormBuilder
  const [showFormModal, setShowFormModal] = useState(false);

  const rowsPerPage = 10;

  useEffect(() => {
    const idHeader = Cookies.get("id_header");
    if (idHeader && idHeader !== "0") {
      setShowReload(true);
    }
  }, []);

  useEffect(() => {
    const fetchDataFromProxy = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/proxyGridRoute", { params: { apiUrl } });
        console.log("Respuesta de API:", res.data);

        const cols = res.data.Headers || res.data.columns;
        const dta = res.data.Data || res.data.data;

        if (!res.data || !Array.isArray(cols) || !Array.isArray(dta)) {
          setError("Datos incompletos o erróneos recibidos.");
          setColumns([]);
          setData([]);
          setOriginalData([]);
        } else {
          setColumns(cols);
          setData(dta);
          const orig = res.data.originalData || dta;
          setOriginalData(orig);
        }
      } catch (err: any) {
        console.error("Error al cargar datos:", err);
        setError(err.message || "Error desconocido al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchDataFromProxy();
  }, [apiUrl]);

  useEffect(() => {
    if (selectFilters && selectFilters.length > 0) {
      setSelectedFilters((prev) => {
        const init: Record<string, string> = {};
        selectFilters.forEach((field) => {
          init[field] = prev[field] || "";
        });
        return init;
      });
    }
  }, [selectFilters]);

  const hasFechaField = originalData.some((row) =>
    Object.keys(row).some((key) => key.toLowerCase() === "fecha")
  );

  const distinctSelectValues: Record<string, string[]> = {};
  if (selectFilters) {
    selectFilters.forEach((field) => {
      distinctSelectValues[field] = Array.from(
        new Set(
          originalData
            .map((row) => row[field])
            .filter((val: any) => val && String(val).trim() !== "")
        )
      );
    });
  }

  const handleExcelExport = () => {
    let csvContent = "";
    if (originalData.length > 0) {
      const headers = Object.keys(originalData[0]);
      csvContent += headers.join(",") + "\n";
      originalData.forEach((row) => {
        const values = headers.map((header) => {
          const cell = row[header] ?? "";
          return `"${String(cell).replace(/"/g, '""')}"`;
        });
        csvContent += values.join(",") + "\n";
      });
    }
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const search = globalSearch.trim().toLowerCase();
    const filtered = originalData.filter((row) => {
      const matchesSearch =
        search === "" ||
        Object.entries(row).some(([, value]) =>
          String(value).toLowerCase().includes(search)
        );

      let matchesDate = true;
      if (startDate || endDate) {
        const fechaKey = Object.keys(row).find(
          (key) => key.toLowerCase() === "fecha"
        );
        if (fechaKey && row[fechaKey] && typeof row[fechaKey] === "string") {
          const rowDateStr = row[fechaKey].split("T")[0];
          const rowDate = new Date(rowDateStr);
          if (startDate) {
            const start = parseDate(startDate);
            if (rowDate < start) matchesDate = false;
          }
          if (endDate) {
            const end = parseDate(endDate);
            end.setHours(23, 59, 59, 999);
            if (rowDate > end) matchesDate = false;
          }
        } else {
          matchesDate = false;
        }
      }

      let matchesSelect = true;
      if (selectFilters) {
        selectFilters.forEach((field) => {
          if (selectedFilters[field] && row[field] !== selectedFilters[field]) {
            matchesSelect = false;
          }
        });
      }
      return matchesSearch && matchesDate && matchesSelect;
    });

    setData(filtered);
    setCurrentPage(1);
  }, [
    globalSearch,
    originalData,
    startDate,
    endDate,
    selectedFilters,
    selectFilters,
  ]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRowClick = (item: any) => {
    setSelectedRow(item);
    onRowClick?.(item);
  };

  const formatKeyLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ");

  return (
    <div className="relative w-full p-4">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: showFilters ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="fixed top-0 right-0 z-40 h-full w-80 bg-white border-l border-gray-300 shadow-lg p-4 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filtros</h2>
          <button
            onClick={() => setShowFilters(false)}
            className="text-red-500 hover:text-red-700 text-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Búsqueda global:</label>
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Buscar en todos los registros..."
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {hasFechaField && (
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Fecha:</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Desde</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {selectFilters &&
          selectFilters.map((field) => (
            <div className="mb-4" key={field}>
              <label className="block mb-1 text-sm font-medium">{formatKeyLabel(field)}:</label>
              <select
                value={selectedFilters[field] || ""}
                onChange={(e) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="">-- Todos --</option>
                {distinctSelectValues[field]?.map((val: string) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          ))}
      </motion.div>

      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div>
          <div className="hidden md:block w-full max-w-screen-2xl mx-auto px-2">
            <table className="table-fixed w-full border border-gray-300 rounded-lg shadow-md text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th colSpan={columns.length + 1} className="p-2 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {showReload && (
                          <button
                            onClick={() => {
                              Cookies.set("id_header", "0");
                              window.location.reload();
                            }}
                            className="bg-transparent text-gray-600 hover:text-gray-900"
                            title="Regresar a ver todos los registros"
                          >
                            <ArrowLeftIcon className="w-5 h-5" />
                          </button>
                        )}
                        {modal && (
                          <button
                            onClick={() => setShowFormModal(true)}
                            className="bg-yellow-300 p-1 rounded text-gray-700 hover:bg-yellow-400"
                            title="Nueva entrada"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExcelExport}
                          className="bg-transparent text-green-500 hover:text-green-700"
                          title="Exportar a Excel"
                        >
                          <FaFileExcel className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowFilters((prev) => !prev)}
                          className="bg-transparent text-gray-600 hover:text-gray-900"
                          title="Mostrar/Ocultar Filtros"
                        >
                          <FunnelIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </th>
                </tr>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="p-2 text-left border-b whitespace-normal break-words"
                    >
                      {formatKeyLabel(col)}
                    </th>
                  ))}
                  <th className="p-2 text-left border-b">Archivos</th>
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
                      <td
                        key={col}
                        className="p-2 border-b whitespace-normal break-words"
                      >
                        {String(item[col] ?? "")}
                      </td>
                    ))}
                    <td className="p-2 border-b whitespace-normal break-words">
                      <div className="flex flex-wrap gap-2">
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
                    currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
          <div className="block md:hidden">
            {/* ... lógica similar en "cards" para móviles ... */}
          </div>
        </div>
      )}
      {selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="relative bg-gray-50 w-full max-w-md p-8 rounded-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => console.log("Editar registro", selectedRow)}
                className="text-gray-600 hover:text-gray-800"
                title="Editar registro"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                Detalles del Registro
              </h2>
              <button
                onClick={() => console.log("Eliminar registro", selectedRow)}
                className="text-red-600 hover:text-red-800"
                title="Eliminar registro"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {Object.entries(selectedRow)
                .filter(([key, value]) => {
                  const excluded = ["ArchCoti", "NombreCoti", "ArchFact", "NombreFact"];
                  if (excluded.includes(key)) return false;
                  if (key.toLowerCase().includes("id")) return false;
                  if (value === null || value === undefined || value === "") return false;
                  return true;
                })
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                      {formatKeyLabel(key)}
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {String(value)}
                    </p>
                  </div>
                ))}
            </div>
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setSelectedRow(null)}
                className="text-sm text-red-500 border border-red-500 px-4 py-2 rounded-full hover:bg-red-50 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-lg shadow-lg p-6 overflow-auto">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              title="Cerrar Formulario"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <DynamicForm num={modal.num} subcarpeta={modal.subcarpeta} />
          </div>
        </div>
      )}
    </div>
  );
}