import React from "react";

interface RowDetailsModalProps {
  selectedRow: Record<string, any> | null;
  setSelectedRow: React.Dispatch<React.SetStateAction<any | null>>;
}

const RowDetailsModal: React.FC<RowDetailsModalProps> = ({ selectedRow, setSelectedRow }) => {
  if (!selectedRow) return null;

  const formatKeyLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ");

  return (
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
            <span className="w-5 h-5">✏️</span> {/* Replace with your icon */}
          </button>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 ">
            Detalles del Registro
          </h2>
          <button
            onClick={() => console.log("Eliminar registro", selectedRow)}
            className="text-red-600 hover:text-red-800 hover:text-white p-1 rounded hover:bg-green-500"
            title="Eliminar registro"
          >
            <span className="w-5 h-5">🗑️</span> {/* Replace with your icon */}
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
  );
};

export default RowDetailsModal;
