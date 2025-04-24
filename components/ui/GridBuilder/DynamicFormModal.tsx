import React, { useState, useEffect } from "react";

interface DynamicFormProps {
  num: string;
  subcarpeta: string;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

interface FormData {
  field1: string;
  field2: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ num, subcarpeta, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<FormData>({ field1: "", field2: "" });
  
  // Simula la carga de un formulario basado en 'num' y 'subcarpeta'
  useEffect(() => {
    // Aquí puedes cargar dinámicamente los campos del formulario según 'num' y 'subcarpeta'
    setFormData({
      field1: "",
      field2: "",
    });
  }, [num, subcarpeta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="field1" className="block text-sm font-medium text-gray-700">
          Campo 1
        </label>
        <input
          type="text"
          id="field1"
          name="field1"
          value={formData.field1}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="field2" className="block text-sm font-medium text-gray-700">
          Campo 2
        </label>
        <input
          type="text"
          id="field2"
          name="field2"
          value={formData.field2}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setFormData({ field1: "", field2: "" })}
          className="px-4 py-2 bg-gray-500 text-white rounded"
          disabled={isSubmitting}
        >
          Limpiar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
