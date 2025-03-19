'use client'
import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";

type ComboInputProps = {
  apiUrl?: string;
  localData?: any[];
  onSelectionChange?: (selection: number | null) => void;
  className?: string;
  resetTrigger?: number;
  defaultSelectedId?: number;
};

const ComboInput: React.FC<ComboInputProps> = ({
  apiUrl,
  localData,
  onSelectionChange,
  className,
  resetTrigger,
  defaultSelectedId,
}) => {
  const [mounted, setMounted] = useState(false);
  const [options, setOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const processData = (data: any[]) => {
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("⚠️ No se recibieron datos válidos para ComboInput.");
        return;
      }

      const firstItem = data[0];
      const keys = Object.keys(firstItem);

      if (keys.length < 2) {
        console.warn("❌ Estructura de datos inválida. Se requieren al menos dos campos.");
        return;
      }

      const idField = keys[0];
      const labelField = keys[1];

      console.log(`🔍 Detectados campos: ID="${idField}", Label="${labelField}"`);

      setOptions(
        data.map(item => ({
          value: item[idField],
          label: item[labelField],
        }))
      );
    };

    if (localData && localData.length > 0) {
      processData(localData);
    } else if (apiUrl) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          console.log("🔹 Consultando API:", apiUrl);

          const response = await axios.get(`/api/dashboard/proxyJson?url=${encodeURIComponent(apiUrl)}`);
          console.log("✅ Respuesta de la API:", response.data);

          if (response.status === 200 && Array.isArray(response.data)) {
            processData(response.data);
          } else {
            console.warn("⚠️ Respuesta de la API no válida:", response.data);
          }
        } catch (error: any) {
          if (error.response) {
            console.warn(`❌ Error en la API (status ${error.response.status}):`, error.response.data);
          } else {
            console.warn("❌ Error al obtener datos de la API:", error.message);
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [apiUrl, localData]);

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

  if (!mounted) {
    return <div className={className}>Cargando...</div>;
  }

  return (
    <div className={`w-full ${className || ""}`}>
      <Select
        styles={{
          control: (provided) => ({
            ...provided,
            width: "100%",
            height: "42px",
            border: "1px solid #000000",
            borderRadius: "6px",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "#999",
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#eee" : "white",
            color: "black",
          }),
        }}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        isLoading={isLoading}
        placeholder={isLoading ? "Cargando opciones..." : "Selecciona una opción..."}
        noOptionsMessage={() => "No hay opciones disponibles"}
      />
    </div>
  );
};

export default ComboInput;