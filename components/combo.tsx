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
  onSelectionChange?: (selection: number | null) => void;
  className?: string;
  resetTrigger?: number; // Prop para resetear el combo
  defaultSelectedId?: number; // Nuevo prop para el id por defecto
};

const ComboInput: React.FC<ComboInputProps> = ({
  apiUrl,
  localData,
  propertyName,
  onSelectionChange,
  className,
  resetTrigger,
  defaultSelectedId,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(defaultSelectedId ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Si se proporciona localData, la usamos; de lo contrario, se hace fetch desde la API.
    if (localData && localData.length > 0) {
      setOptions(localData);
    } else if (apiUrl && propertyName) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(apiUrl);
          const fetchedData = response.data?.[propertyName];
          if (response.status === 200 && Array.isArray(fetchedData)) {
            setOptions(fetchedData as Option[]);
          } else {
            console.error(
              `Formato de respuesta inválido. Se esperaba un arreglo en '${propertyName}'.`
            );
          }
        } catch (error) {
          console.error("Error al obtener datos de la API:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [apiUrl, propertyName, localData]);

  // Resetea el combo cuando resetTrigger o defaultSelectedId cambian.
  useEffect(() => {
    setSelectedId(defaultSelectedId ?? null);
  }, [resetTrigger, defaultSelectedId]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value ? parseInt(event.target.value, 10) : null;
    setSelectedId(selectedValue);
    if (onSelectionChange) {
      onSelectionChange(selectedValue);
    }
  };

  return (
<<<<<<< HEAD
    <div className={` ${className || ""}`}>
      <Select
        options={options}
        value={selectedOption}
=======
    <div className={`w-full max-w-sm ${className || ""}`}>
      <select
        id="api-input"
        value={selectedId ?? ""}
>>>>>>> parent of 92517f7 (Merge branch 'master' of https://github.com/Vantar23/nextjs-dashboard)
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