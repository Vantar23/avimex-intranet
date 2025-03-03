"use client";
import React, { useState } from "react";

interface FieldOption {
  label: string;
  value: string;
}

interface FormField {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[];
  component?: string;
  apiUrl?: string;
}

interface SubmitButton {
  label: string;
  action: string;
  method: "POST" | "GET" | "PUT" | "DELETE";
}

const FormBuilder: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [moduloId, setModuloId] = useState<string>("21");
  const [formTitle, setFormTitle] = useState("Registro de Usuario");
  const [formDescription, setFormDescription] = useState(
    "Complete los siguientes campos para registrarse"
  );
  const [submitButton, setSubmitButton] = useState<SubmitButton>({
    label: "Enviar",
    action: "/api/submit",
    method: "POST",
  });

  // Opciones disponibles para ModuloId
  const moduloOptions: FieldOption[] = [
    { label: "Usuarios", value: "21" },
    { label: "Productos", value: "22" },
    { label: "Pedidos", value: "23" },
  ];

  // Agregar un nuevo campo
  const addField = () => {
    setFields([
      ...fields,
      {
        label: "Nuevo Campo",
        name: `campo${fields.length}`,
        type: "text",
        required: false,
      },
    ]);
  };

  // Eliminar un campo
  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // Manejar cambios en los campos
  const handleFieldChange = (index: number, key: keyof FormField, value: any) => {
    const updatedFields = [...fields];
    // Si se cambia el tipo a select o combo, inicializamos propiedades específicas
    if (key === "type") {
      if (value === "select") {
        updatedFields[index].options = [{ label: "Opción 1", value: "opcion1" }];
        updatedFields[index].component = undefined;
        updatedFields[index].apiUrl = undefined;
      } else if (value === "combo") {
        updatedFields[index].component = "ComboComponent";
        updatedFields[index].apiUrl = "";
        updatedFields[index].options = [];
      }
    }
    (updatedFields[index] as any)[key] = value;
    setFields(updatedFields);
  };

  // Agregar opción a un campo tipo select
  const addOption = (index: number) => {
    const updatedFields = [...fields];
    if (!updatedFields[index].options) {
      updatedFields[index].options = [];
    }
    updatedFields[index].options!.push({
      label: `Opción ${updatedFields[index].options!.length + 1}`,
      value: `opcion${updatedFields[index].options!.length + 1}`,
    });
    setFields(updatedFields);
  };

  // Eliminar opción en un campo select
  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options!.splice(optionIndex, 1);
    setFields(updatedFields);
  };

  // Manejar cambios en las opciones del select
  const handleOptionChange = (
    fieldIndex: number,
    optionIndex: number,
    key: keyof FieldOption,
    value: string
  ) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options![optionIndex][key] = value;
    setFields(updatedFields);
  };

  // Manejar cambios en la API URL para campos combo
  const handleApiUrlChange = (index: number, value: string) => {
    const updatedFields = [...fields];
    updatedFields[index].apiUrl = value;
    setFields(updatedFields);
  };

  // Cargar datos desde la API para el campo combo usando fetch
  const loadComboData = async (index: number) => {
    const field = fields[index];
    if (!field.apiUrl) return;
    try {
      const response = await fetch(field.apiUrl);
      if (!response.ok) {
        throw new Error("Error en la respuesta de la API");
      }
      const data = await response.json();
      // Se asume que la API retorna un arreglo de objetos con 'id' y 'nombre'
      const options = data.map((item: any) => ({
        label: item.nombre || item.label || "Sin Nombre",
        value: item.id || item.value || "",
      }));
      const updatedFields = [...fields];
      updatedFields[index].options = options;
      setFields(updatedFields);
    } catch (error) {
      console.error("Error al cargar datos del combo:", error);
    }
  };

  // Generar JSON completo del formulario (para previsualización)
  const generatedJson = {
    ModuloId: parseInt(moduloId),
    title: formTitle,
    description: formDescription,
    fields: fields,
    submitButton: submitButton,
  };

  // Función para enviar solo el JSON mínimo a la URL local (/api/form) usando fetch
// Suponiendo que 'generatedJson' es el objeto completo generado por el componente
const handleSubmitForm = async () => {
    const minimalPayload = {
      ModuloId: parseInt(moduloId),
      title: formTitle,
      description: formDescription,
    };
  
    const fullJson = generatedJson; // JSON completo que deseas guardar
  
    console.log("Payload a enviar:", { minimalPayload, fullJson });
    try {
      const response = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minimalPayload, fullJson }),
      });
      if (!response.ok) {
        throw new Error("Error al enviar el formulario");
      }
      alert("Formulario enviado correctamente.");
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert("Error al enviar el formulario.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Generador de Formularios</h2>

      {/* Selección del ModuloId */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Módulo</label>
        <select
          value={moduloId}
          onChange={(e) => setModuloId(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {moduloOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Configuración del formulario */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Título del Formulario</label>
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      {/* Configuración del botón de envío */}
      <div className="p-4 mb-4 border rounded-md bg-gray-100">
        <h3 className="text-lg font-bold">Configuración del Botón de Envío</h3>
        <label className="block text-sm font-medium mt-2">Texto del Botón</label>
        <input
          type="text"
          value={submitButton.label}
          onChange={(e) => setSubmitButton({ ...submitButton, label: e.target.value })}
          className="w-full p-2 border rounded-md"
        />
        <label className="block text-sm font-medium mt-2">URL de Envío</label>
        <input
          type="text"
          value={submitButton.action}
          onChange={(e) => setSubmitButton({ ...submitButton, action: e.target.value })}
          className="w-full p-2 border rounded-md"
        />
        <label className="block text-sm font-medium mt-2">Método de Envío</label>
        <select
          value={submitButton.method}
          onChange={(e) =>
            setSubmitButton({ ...submitButton, method: e.target.value as SubmitButton["method"] })
          }
          className="w-full p-2 border rounded-md"
        >
          <option value="POST">POST</option>
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {/* Lista de campos */}
      {fields.map((field, index) => (
        <div key={index} className="p-4 mb-2 border rounded-md bg-gray-50">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">Etiqueta</label>
            <button
              onClick={() => removeField(index)}
              className="bg-red-500 mb-4 text-white px-2 py-1 rounded-md text-xs"
            >
              Eliminar
            </button>
          </div>
          <input
            type="text"
            value={field.label}
            onChange={(e) => handleFieldChange(index, "label", e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Etiqueta del campo"
          />

          {/* Campo editable para el name */}
          <label className="block text-sm font-medium">Nombre del Campo</label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => handleFieldChange(index, "name", e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Nombre interno del campo"
          />

          <label className="block text-sm font-medium">Tipo de Campo</label>
          <select
            value={field.type}
            onChange={(e) => handleFieldChange(index, "type", e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
          >
            <option value="text">Texto</option>
            <option value="email">Correo Electrónico</option>
            <option value="password">Contraseña</option>
            <option value="number">Número</option>
            <option value="date">Fecha</option>
            <option value="select">Selección</option>
            <option value="checkbox">Checkbox</option>
            <option value="file">Archivo</option>
            <option value="textarea">Área de Texto</option>
            <option value="combo">Combo (API)</option>
          </select>

          {/* Opciones para select */}
          {field.type === "select" && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Opciones</h4>
              {field.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => handleOptionChange(index, optionIndex, "label", e.target.value)}
                    className="p-2 border rounded-md flex-1"
                    placeholder="Texto de opción"
                  />
                  <button
                    onClick={() => removeOption(index, optionIndex)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md"
                  >
                    ✖
                  </button>
                </div>
              ))}
              <button
                onClick={() => addOption(index)}
                className="bg-blue-500 text-white px-3 py-1 rounded-md"
              >
                Agregar Opción
              </button>
            </div>
          )}

          {/* Configuración para campos tipo combo */}
          {field.type === "combo" && (
            <div className="mt-2">
              <label className="block text-sm font-medium">API URL</label>
              <input
                type="text"
                value={field.apiUrl || ""}
                onChange={(e) => handleApiUrlChange(index, e.target.value)}
                className="w-full p-2 border rounded-md mb-2"
                placeholder="https://api.example.com/ciudades"
              />
              <button
                onClick={() => loadComboData(index)}
                className="bg-blue-500 text-white px-3 py-1 rounded-md"
              >
                Cargar Datos
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Botón para agregar campo */}
      <button
        onClick={addField}
        className="w-full bg-blue-500 text-white py-2 mt-4 rounded-md hover:bg-blue-600"
      >
        Agregar Campo
      </button>

      {/* Botón para enviar formulario (JSON mínimo) */}
      <button
        onClick={handleSubmitForm}
        className="w-full bg-green-500 text-white py-2 mt-4 rounded-md hover:bg-green-600"
      >
        Enviar Formulario
      </button>

      {/* JSON generado */}
      <pre className="bg-gray-100 p-4 rounded-md text-sm mt-4">
        {JSON.stringify(generatedJson, null, 2)}
      </pre>
    </div>
  );
};

export default FormBuilder;