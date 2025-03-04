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

  // Evitar renderizado hasta que el componente se haya montado para prevenir problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const processData = (data: any[]) => {
      if (data.length === 0) {
        console.error("⚠️ No se recibieron datos para ComboInput.");
        return;
      }

      // Detectar automáticamente los nombres de los campos
      const firstItem = data[0];
      const keys = Object.keys(firstItem);

      if (keys.length < 2) {
        console.error("❌ Estructura de datos inválida. Se requieren al menos dos campos.");
        return;
      }

      const idField = keys[0]; // Primer campo como ID
      const labelField = keys[1]; // Segundo campo como descripción

      console.log(`🔍 Detectados campos: ID="${idField}", Label="${labelField}"`);

      // Mapear los datos para react-select
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

          const response = await axios.get(`/api/proxyJson?url=${encodeURIComponent(apiUrl)}`);
          console.log("✅ Respuesta de la API:", response.data);

          if (response.status === 200 && Array.isArray(response.data)) {
            processData(response.data);
          } else {
            console.error("⚠️ Respuesta de la API no válida:", response.data);
          }
        } catch (error) {
          console.error("❌ Error al obtener datos de la API:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [apiUrl, localData]);

  // Actualizar opción seleccionada según el valor por defecto o trigger de reinicio
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

  // Mientras el componente no esté montado, renderizar un placeholder
  if (!mounted) {
    return <div className={className}>Cargando...</div>;
  }

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