import React from "react";

interface FilterPanelProps {
  globalSearch: string;
  setGlobalSearch: React.Dispatch<React.SetStateAction<string>>;
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  endDate: string;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  selectFilters: string[];
  selectedFilters: Record<string, string>;
  setSelectedFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  globalSearch,
  setGlobalSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectFilters,
  selectedFilters,
  setSelectedFilters,
}) => {
  const handleSelectChange = (field: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="p-4 bg-white shadow-lg border-l border-gray-300 h-full overflow-y-auto">
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Búsqueda Global:</label>
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Buscar en todos los registros..."
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

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

      {selectFilters.length > 0 && (
        <div>
          {selectFilters.map((field) => (
            <div key={field} className="mb-4">
              <label className="block mb-1 text-sm font-medium">{field}:</label>
              <select
                value={selectedFilters[field] || ""}
                onChange={(e) => handleSelectChange(field, e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">-- Todos --</option>
                {/* Aquí puedes agregar las opciones disponibles para cada filtro */}
                <option value="opcion1">Opción 1</option>
                <option value="opcion2">Opción 2</option>
                <option value="opcion3">Opción 3</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
