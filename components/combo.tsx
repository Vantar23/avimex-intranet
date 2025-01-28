import React, { useState, useEffect } from "react";
import axios from "axios";

type ComboInputProps = {
  apiUrl: string;
  propertyName: string;
  onSelectionChange?: (selection: { [key: string]: number | null }) => void;
  className?: string;
};

type Option = {
  ID: number;
  DESCRIPCION: string;
};

const ComboInput: React.FC<ComboInputProps> = ({ apiUrl, propertyName, onSelectionChange, className }) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(apiUrl);

        if (response.status === 200 && response.data && Array.isArray(response.data[propertyName])) {
          setOptions(response.data[propertyName] as Option[]);
        } else {
          console.error(`Invalid API response format. Expected an array in ${propertyName}.`);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, propertyName]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = parseInt(event.target.value, 10);
    setSelectedId(selectedValue);

    if (onSelectionChange) {
      onSelectionChange({ [propertyName]: selectedValue });
    }
  };

  return (
    <div className={`w-full max-w-sm ${className || ""}`}>
      <select
        id="api-input"
        value={selectedId || ""}
        onChange={handleChange}
        className="border rounded w-full p-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <option value="" disabled>
            Cargando opciones...
          </option>
        ) : (
          <option value="" disabled>
            Ninguno seleccionado
          </option>
        )}
        {!isLoading &&
          options.map((option) => (
            <option key={option.ID} value={option.ID}>
              {option.DESCRIPCION}
            </option>
          ))}
      </select>
    </div>
  );
};

export default ComboInput;