'use client'
import React, { CSSProperties, useState, useEffect } from "react";
import Select from "react-select";
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
  resetTrigger?: number;
  defaultSelectedId?: number;
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
  const [options, setOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (localData && localData.length > 0) {
      setOptions(localData.map(option => ({ value: option.ID, label: option.DESCRIPCION })));
    } else if (apiUrl && propertyName) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(apiUrl);
          const fetchedData = response.data?.[propertyName];
          if (response.status === 200 && Array.isArray(fetchedData)) {
            setOptions(fetchedData.map((option: Option) => ({ value: option.ID, label: option.DESCRIPCION })));
          } else {
            console.error(`Formato de respuesta inválido. Se esperaba un arreglo en '${propertyName}'.`);
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

  useEffect(() => {
    if (defaultSelectedId && options.length > 0) {
      const preselected = options.find(opt => opt.value === defaultSelectedId) || null;
      setSelectedOption(preselected);
    } else {
      setSelectedOption(null);
    }
  }, [resetTrigger, defaultSelectedId, options]);

  const handleChange = (selected: { value: number; label: string } | null) => {
    setSelectedOption(selected);
    if (onSelectionChange) {
      onSelectionChange(selected ? selected.value : null);
    }
  };

  return (
    <div className={`w-full ${className || ""}`}>
      <Select
        options={options}
        value={selectedOption}
        onChange={handleChange}
        isLoading={isLoading}
        placeholder={isLoading ? "Cargando opciones..." : "Selecciona una opción..."}
      />
    </div>
  );
};

export default ComboInput;
