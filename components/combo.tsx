import React, { useState, useEffect } from "react";
import axios from "axios";

type Option = {
  ID: number;
  DESCRIPCION: string;
};

type ComboInputProps = {
  apiUrl?: string;
  localData?: Option[];
  propertyName?: string;
  onSelectionChange?: (selection: { [key: string]: number | null }) => void;
  className?: string;
};

const ComboInput: React.FC<ComboInputProps> = ({ apiUrl, propertyName, onSelectionChange, className }) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!apiUrl || !propertyName) return; // Evita ejecutar la petición si falta algún dato necesario

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(apiUrl);

        // Validar que la propiedad existe y es un array antes de asignar
        const fetchedData = response.data?.[propertyName];
        if (response.status === 200 && Array.isArray(fetchedData)) {
          setOptions(fetchedData as Option[]);
        } else {
          console.error(`Invalid API response format. Expected an array in '${propertyName}'.`);
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
    const selectedValue = event.target.value ? parseInt(event.target.value, 10) : null;
    setSelectedId(selectedValue);

    if (onSelectionChange && propertyName) {
      onSelectionChange({ [propertyName]: selectedValue });
    }
  };

  return (
    <div className={`w-full max-w-sm ${className || ""}`}>
      <select
        id="api-input"
        value={selectedId ?? ""}
        onChange={handleChange}
        className="border rounded w-full p-2"
        disabled={isLoading}
      >
        <option value="" disabled>
          {isLoading ? "Cargando opciones..." : "Ninguno seleccionado"}
        </option>
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