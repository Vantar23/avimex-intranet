// components/SearchBar.tsx
'use client'
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { value: string } }) => void;
  selectOptions?: string[];
  searchMode: 'typing' | 'select' | 'date-range';
}


const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  selectOptions = [],
  searchMode,
}) => {
  return (
  <div className="flex justify-center mb-4">
    {searchMode === "typing" ? (
      <div className="relative w-full max-w-lg">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Buscar..."
          className="w-full pr-10 p-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange({ target: { value: "" } })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </div>
    ) : searchMode === "select" ? (
      <select
        value={value}
        onChange={onChange}
        className="w-full max-w-lg p-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">Selecciona una opción...</option>
        {selectOptions.map((option, index) => {
          const value = option ?? "";
          return (
            <option key={index} value={value}>
              {value.trim() === "" ? "--sin contenido--" : value}
            </option>
          );
        })}

      </select>
    ) : (
      // date-range mode
      <div className="relative w-full max-w-lg flex items-center gap-2">
        <input
          type="date"
          value={value.split("|")[0] || ""}
          onChange={(e) => {
            const end = value.split("|")[1] || "";
            onChange({ target: { value: `${e.target.value}|${end}` } });
          }}
          className="w-1/2 p-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <span className="text-gray-400">a</span>
        <input
          type="date"
          value={value.split("|")[1] || ""}
          onChange={(e) => {
            const start = value.split("|")[0] || "";
            onChange({ target: { value: `${start}|${e.target.value}` } });
          }}
          className="w-1/2 p-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange({ target: { value: "" } })}
            className="absolute -right-8 top-1/2 transform -translate-y-1/2"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </div>
    )}
  </div>

  );
};

export default SearchBar;
