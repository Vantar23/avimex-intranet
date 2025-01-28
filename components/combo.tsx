import React, { useState, useEffect } from "react";

interface Option {
  id: number;
  nombre: string;
}

interface ComboComponentProps {
  apiUrl?: string; // URL de la API para cargar datos
  localData?: Option[]; // Datos locales como alternativa a la API
  filterKey: keyof Option; // La clave por la cual se filtrarán y mostrarán los datos
  onOptionSelect: (option: Option | null) => void; // Callback para manejar la selección
}

const ComboComponent: React.FC<ComboComponentProps> = ({
  apiUrl,
  localData,
  filterKey,
  onOptionSelect,
}) => {
  const [data, setData] = useState<Option[]>([]);
  const [filteredData, setFilteredData] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (apiUrl) {
          const response = await fetch(apiUrl);
          const result: { productos: Option[]; categorias: Option[]; marcas: Option[] } = await response.json();
          setData(result.productos); // Cambia `productos` según la propiedad deseada
          setFilteredData(result.productos);
        } else if (localData) {
          setData(localData);
          setFilteredData(localData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl, localData]);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const option = data.find((item) => item[filterKey] === selectedValue) || null;
    setSelectedOption(option);
    onOptionSelect(option);
  };

  return (
    <select
      value={selectedOption ? String(selectedOption[filterKey]) : ""}
      onChange={handleSelect}
      className="w-full p-2 border rounded-md"
    >
      <option value="" disabled>
        Seleccione una opción
      </option>
      {filteredData.map((item) => (
        <option key={item.id} value={String(item[filterKey])}>
          {item[filterKey]}
        </option>
      ))}
    </select>
  );
};

export default ComboComponent;
