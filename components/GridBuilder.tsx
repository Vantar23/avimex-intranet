// components/GridBuilder.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  FunnelIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import { FaFileExcel } from "react-icons/fa";
import DynamicForm from "@/components/FormBuilder";
import SearchBar from "@/components/ui/SearchBar";

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

function parseCustomDate(fechaTexto: string): Date {
  // Quita espacios dobles o caracteres raros
  const clean = fechaTexto.replace(/\s+/g, " ").trim();

  // Se espera formato: "dd/MM/yyyy hh:mm:ss a. m." (hora 12h con AM/PM en español)
  const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2}) (a\. m\.|p\. m\.)$/i;
  const match = clean.match(regex);

  if (!match) return new Date("Invalid Date");

  let [, day, month, year, hour, minute, second, meridian] = match;
  let h = parseInt(hour);
  if (meridian.toLowerCase().includes("p") && h < 12) h += 12;
  if (meridian.toLowerCase().includes("a") && h === 12) h = 0;

  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    h,
    parseInt(minute),
    parseInt(second)
  );
}


export default function GridBuilder({
  apiUrl,
  onRowClick,
  selectFilters,
  modal,
}: GridBuilderProps) {
  const [searchColumn, setSearchColumn] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"typing" | "select" | "date-range">("typing");
  const [searchValue, setSearchValue] = useState(""); // reemplaza globalSearch si quieres unificar
  const [activeFilters, setActiveFilters] = useState<{ column: string; value: string }[]>([]);

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

        // obtenemos todos los encabezados
        const rawCols = res.data.Headers || res.data.columns;
        // filtramos los que comiencen con '$'
        const cols = rawCols.filter((col: string) => !col.startsWith("$"));
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

  const handleAddFilter = () => {
    if (!searchColumn || searchValue.trim() === "") return;
  
    const newFilter = { column: searchColumn, value: searchValue.trim() };
  
    if (!activeFilters.some(f => f.column === newFilter.column && f.value === newFilter.value)) {
      setActiveFilters([...activeFilters, newFilter]);
      setSearchValue("");
    }
  };
  
  const handleRemoveFilter = (filterToRemove: { column: string; value: string }) => {
    setActiveFilters((prev) =>
      prev.filter(
        (f) => !(f.column === filterToRemove.column && f.value === filterToRemove.value)
      )
    );
  };
  

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
    let filtered = [...originalData];

    // 1) Búsqueda global (si no hay columna seleccionada)
    if (!searchColumn && globalSearch.trim() !== "") {
      const lower = globalSearch.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? "").toLowerCase().includes(lower)
        )
      );
    }

    // 2) Filtros acumulables, aquí incluimos date-range
    if (activeFilters.length > 0) {
      filtered = filtered.filter((row) =>
        activeFilters.every(({ column, value }) => {
          // ——— si value tiene “|” y es date-range sobre la misma columna ———
          if (
            value.includes("|") &&
            searchMode === "date-range" &&
            column === searchColumn
          ) {
            const [start, end] = value.split("|");
            const dt = parseCustomDate(String(row[column] ?? ""));
            // dejamos solo la fecha (00:00:00)
            const cellDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
            // bounds inclusive
            const startDateObj = start
              ? new Date(start)
              : new Date(-8640000000000000);
            const endDateObj = end
              ? new Date(end)
              : new Date(8640000000000000);

            if (cellDate < startDateObj) return false;
            if (cellDate > endDateObj)   return false;
            return true;
          }

          // ——— resto (typing / select) ———
          const cell = String(row[column] ?? "").toLowerCase();
          return cell.includes(value.toLowerCase());
        })
      );
    }

    // 3) selectFilters extra, si tienes
    if (selectFilters) {
      filtered = filtered.filter((row) =>
        selectFilters.every((field) =>
          !selectedFilters[field] || row[field] === selectedFilters[field]
        )
      );
    }

    setData(filtered);
    setCurrentPage(1);
  }, [
    originalData,
    globalSearch,
    activeFilters,
    selectFilters,
    JSON.stringify(selectedFilters),
    searchColumn,
    searchMode,
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
          <div className="w-full flex flex-col items-center justify-center px-4 md:px-0 mb-4">
          <div className="w-full max-w-6xl flex flex-col items-center gap-3">
          <SearchBar
             value={searchColumn ? searchValue : globalSearch}
             onChange={(e) => {
               const newValue = e.target.value;
               if (searchColumn) {
                 setSearchValue(newValue);
               } else {
                 setGlobalSearch(newValue);
               }
             }}
             onAddFilter={handleAddFilter}
             filters={activeFilters}
             onRemoveFilter={handleRemoveFilter}
             searchMode={searchMode}
            selectOptions={
              searchMode === "select" && searchColumn
                ? Array.from(
                    new Set(
                      data
                        .map((row) => row[searchColumn])
                        .filter((v) => v !== undefined && v !== null)
                    )
                  ).sort((a, b) => {
                    if (a === "") return 1;
                    if (b === "") return -1;
                    return a.localeCompare(b);
                  })
                : []
            }            
          />
          </div>
          {searchColumn && (
            <p className="text-sm text-gray-500 mt-1">
              Filtrando por columna: <span className="font-semibold">{formatKeyLabel(searchColumn)}</span>
            </p>
          )}
          </div>
          <div className="hidden md:block w-full max-w-screen mx-auto">
            {/* Controles superiores */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                {showReload && (
                  <button
                    onClick={() => {
                      Cookies.set("id_header", "0");
                      window.location.reload();
                    }}
                    className="bg-transparent p-1 rounded text-gray-600 hover:text-white hover:bg-green-500"
                    title="Regresar a ver todos los registros"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                )}
                {modal && (
                  <button
                    onClick={() => setShowFormModal(true)}
                    className="bg-green p-1 rounded text-gray-700 hover:text-white hover:bg-green-500"
                    title="Nueva entrada"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                )}
                {showReload && (
                  <button
                    onClick={() => {
                      // aquí tu lógica de “enviar”
                      console.log("Enviar registros con id_header:", Cookies.get("id_header"));
                    }}
                    className="bg-green p-1 rounded text-gray-700 hover:text-white hover:bg-green-500"
                    title="Enviar"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExcelExport}
                  className="bg-transparent text-green-500 hover:text-white p-1 rounded hover:bg-green-500"
                  title="Exportar a Excel"
                >
                  <FaFileExcel className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="bg-transparent text-gray-600 hover:text-white p-1 rounded hover:bg-green-500"
                  title="Mostrar/Ocultar Filtros"
                >
                  <FunnelIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabla */}
            <table className="table-fixed text-white bg-green-600   rounded-lg w-full rounded-lg text-sm">
              <thead className="shadow-sm ">
                <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => {
                      if (searchColumn === col) {
                        // Si se vuelve a hacer clic en la misma columna, salir del modo búsqueda por columna
                        setSearchColumn(null);
                        setSearchValue("");
                        setSearchMode("typing");
                        return;
                      }
                    
                      setSearchColumn(col);
                    
                      if (col.toLowerCase().includes("fecha")) {
                        setSearchMode("date-range");
                        return;
                      }
                    
                      const rawValues = originalData.map((row) => row[col]);
                    
                      const validValues = rawValues.filter((v) => {
                        if (v === null || v === undefined) return false;
                        const str = String(v).trim();
                        return str !== "" && str.toLowerCase() !== "null" && str.toLowerCase() !== "undefined";
                      });
                    
                      const uniqueValues = Array.from(new Set(validValues));
                    
                      const isShortStringList = uniqueValues.every(
                        (val) => typeof val === "string" && val.length <= 50
                      );
                    
                      const emptyCount = rawValues.length - validValues.length;
                      const emptyRatio = emptyCount / rawValues.length;
                    
                      const showAsSelect =
                        uniqueValues.length > 0 &&
                        uniqueValues.length <= 20 &&
                        isShortStringList &&
                        emptyRatio < 0.8;
                    
                      setSearchMode(showAsSelect ? "select" : "typing");
                    }}
                    
                    
                    className={`p-2 text-left border-b whitespace-normal break-words cursor-pointer select-none ${
                      searchColumn === col ? "text-green-700 underline" : "hover:text-green-500"
                    }`}
                    title="Click para filtrar por esta columna"
                  >
                    {formatKeyLabel(col)}
                  </th>
                ))}
                  <th className="p-2 text-left border-b">Archivos</th>
                </tr>
              </thead>

              <tbody className="text-black bg-white ">
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
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {currentPage > 3 && (
                <>
                  <button
                    className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-green-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setCurrentPage(1)}
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="px-2 py-1">...</span>}
                </>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => Math.abs(currentPage - page) <= 2)
                .map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded ${currentPage === page ? "bg-green-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2 py-1">...</span>}
                  <button
                    className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-green-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
                className="text-gray-600 hover:text-white p-1 rounded hover:bg-green-500"
                title="Editar registro"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 ">
                Detalles del Registro
              </h2>
              <button
                onClick={() => console.log("Eliminar registro", selectedRow)}
                className="text-red-600 hover:text-red-800 hover:text-white p-1 rounded hover:bg-green-500"
                title="Eliminar registro"
              >
                <TrashIcon className="w-5 h-5 hover:text-white" />
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

