'use client';
import React from "react";
import Select from "react-select";
import { XMarkIcon, MagnifyingGlassIcon, ArrowDownCircleIcon } from "@heroicons/react/24/outline";

interface FilterItem {
  column: string;
  value: string;
}

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { value: string } }) => void;
  onAddFilter: () => void;
  filters?: FilterItem[];
  onRemoveFilter?: (value: FilterItem) => void;
  selectOptions?: string[];
  searchMode: 'typing' | 'select' | 'date-range';
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onAddFilter,
  filters = [],
  onRemoveFilter,
  selectOptions = [],
  searchMode,
}) => {
  const formatKeyLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ");

  return (
    <div className="flex flex-col items-center justify-center w-full mb-6 gap-2">
      {/* TEXT INPUT */}
      {searchMode === "typing" && (
        <div className="relative w-full max-w-4xl">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder="Buscar..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAddFilter();
                onChange({ target: { value: "" } });
              }
            }}
            className="w-full pl-12 pr-12 py-2.5 text-lg border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <ArrowDownCircleIcon
            className="w-5 h-5 absolute right-10 top-1/2 transform -translate-y-1/2 text-green-500 cursor-pointer hover:text-green-700"
            onClick={() => {
              onAddFilter();
              onChange({ target: { value: "" } });
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange({ target: { value: "" } })}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>
      )}

      {/* SELECT */}
      {searchMode === "select" && (
        <div className="relative w-full max-w-4xl">
          <Select
            options={selectOptions.map((opt) => ({
              value: opt,
              label: opt.trim() === "" ? "--sin contenido--" : opt,
            }))}
            value={
              value
                ? { value: value, label: value.trim() === "" ? "--sin contenido--" : value }
                : null
            }
            onChange={(selected) => {
              onChange({
                target: { value: selected ? selected.value : "" },
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAddFilter();
                onChange({ target: { value: "" } });
              }
            }}
            isClearable
            placeholder="Selecciona una opción..."
            styles={{
              control: (base) => ({
                ...base,
                padding: "0 8px",
                fontSize: "1rem",
                borderRadius: "9999px",
                borderColor: "#ccc",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                minHeight: "50px",
                height: "46px",
                '&:hover': { borderColor: "#999" },
              }),
              container: (base) => ({
                ...base,
                width: "100%",
              }),
              valueContainer: (base) => ({
                ...base,
                padding: "0 12px",
              }),
              input: (base) => ({
                ...base,
                margin: 0,
                padding: 0,
              }),
              indicatorsContainer: (base) => ({
                ...base,
                paddingRight: "2.5rem",
              }),
            }}
          />
          <ArrowDownCircleIcon
            className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 cursor-pointer hover:text-green-700"
            onClick={() => {
              onAddFilter();
              onChange({ target: { value: "" } });
            }}
          />
        </div>
      )}

{/* DATE RANGE */}
{searchMode === "date-range" && (
  <div
    className="relative w-full max-w-4xl flex items-center gap-3"
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        onAddFilter();
        onChange({ target: { value: "" } });
      }
    }}
  >
    <MagnifyingGlassIcon
      className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
    />

    {/* fecha inicio */}
    <input
      type="date"
      value={value.split("|")[0] || ""}
      onChange={(e) => {
        const end = value.split("|")[1] || "";
        onChange({ target: { value: `${e.target.value}|${end}` } });
      }}
      className="w-full pl-12 pr-3 py-2.5 text-lg border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
    />

    {/* fecha fin */}
    <input
      type="date"
      value={value.split("|")[1] || ""}
      onChange={(e) => {
        const start = value.split("|")[0] || "";
        onChange({ target: { value: `${start}|${e.target.value}` } });
      }}
      className="w-full pl-4 pr-3 py-2.5 text-lg border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
    />

    {/* aplicar filtro */}
    <ArrowDownCircleIcon
      className="absolute right-10 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 cursor-pointer hover:text-green-700"
      onClick={() => {
        onAddFilter();
        onChange({ target: { value: "" } });
      }}
    />

    {/* limpiar rango */}
    {value && (
      <button
        type="button"
        onClick={() => onChange({ target: { value: "" } })}
        className="absolute right-4 top-1/2 transform -translate-y-1/2"
      >
        <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
      </button>
    )}
  </div>
)}

      {/* CHIPS */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 justify-center">
          {filters.map((filter, idx) => (
            <span
              key={idx}
              className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
            >
              {`${formatKeyLabel(filter.column)}: ${filter.value}`}
              {onRemoveFilter && (
                <button
                  onClick={() => onRemoveFilter(filter)}
                  className="hover:text-red-500"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
