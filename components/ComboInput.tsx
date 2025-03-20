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
  disabled?: boolean; // Propiedad para deshabilitar el input desde fuera
};

const ComboInput: React.FC<ComboInputProps> = ({
  apiUrl,
  localData,
  onSelectionChange,
  className,
  resetTrigger,
  defaultSelectedId,
  disabled,
}) => {
  const [mounted, setMounted] = useState(false);
  const [options, setOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Evitar renderizado hasta que el componente se haya montado para prevenir problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const processData = (data: any[]) => {
      if (!data || data.length === 0) {
        console.warn("No se recibieron datos para ComboInput.");
        setError("No se recibieron datos.");
        setOptions([]);
        return;
      }
      // Detectar automáticamente los nombres de los campos
      const firstItem = data[0];
      const keys = Object.keys(firstItem);
      if (keys.length < 2) {
        console.error("Estructura de datos inválida. Se requieren al menos dos campos.");
        setError("Estructura de datos inválida.");
        setOptions([]);
        return;
      }
      const idField = keys[0];
      const labelField = keys[1];
      console.log(`Campos detectados: ID="${idField}", Label="${labelField}"`);
      setOptions(
        data.map(item => ({
          value: item[idField],
          label: item[labelField],
        }))
      );
      setError(null);
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

          if (response.status === 200) {
            // Si la respuesta es un array, procesarla
            if (Array.isArray(response.data)) {
              processData(response.data);
            }
            // Si la respuesta es un objeto, revisamos si es vacío
            else if (typeof response.data === "object" && response.data !== null) {
              if (Object.keys(response.data).length === 0) {
                // Objeto vacío: tratar como "sin datos"
                console.warn("La respuesta está vacía.");
                setError("No se recibieron datos.");
                setOptions([]);
              } else {
                // Objeto no vacío: formato inesperado, lo tratamos como sin datos
                console.warn("La respuesta de la API no es válida. Se esperaba un array o un objeto vacío. Se recibió:", response.data);
                setError("No se recibieron datos.");
                setOptions([]);
              }
            } else {
              // Formato inesperado
              console.warn("La respuesta de la API tiene un formato inesperado:", response.data);
              setError("No se recibieron datos.");
              setOptions([]);
            }
          } else {
            console.error("Código de respuesta inesperado:", response.status);
            setError(`Código de respuesta: ${response.status}`);
            setOptions([]);
          }
        } catch (error: any) {
          console.error("❌ Error al obtener datos de la API:", error);
          setError("Error al obtener datos de la API.");
          setOptions([]);
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
        isClearable={true}  // Permite eliminar la selección
        // Se deshabilita si se pasa la propiedad disabled o si hay error
        isDisabled={disabled || !!error}
        placeholder={
          error
            ? error
            : isLoading
            ? "Cargando opciones..."
            : "Selecciona una opción..."
        }
      />
    </div>
  );
};

export default ComboInput;