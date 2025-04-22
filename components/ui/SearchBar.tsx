// components/SearchBar.tsx
'use client'
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  selectOptions?: string[]; // Opcionales, si está en "select mode"
  searchMode: 'typing' | 'select';
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
              onClick={() => onChange({ target: { value: "" } } as any)}
              className="absolute inset-y-0 right-3 flex items-center"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>
      ) : (
        <select
          value={value}
          onChange={onChange}
          className="w-full max-w-lg p-3 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Selecciona una opción...</option>
          {selectOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default SearchBar;
