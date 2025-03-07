'use client'
import React, { useState } from "react";
import ComboInput from "@/components/ComboInput"; // Ajusta la ruta según corresponda

interface FieldOption {
  label: string;
  value: string;
}

interface FormField {
  label?: string;
  name?: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  apiUrl?: string;

  // Para "either"
  eitherFields?: FormField[];

  // Para "nest": no tiene label/name propios,
  // sino que contiene fatherField y childField
  fatherField?: FormField;
  childField?: FormField;
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
  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  // Actualiza formData cuando el usuario ingresa un valor
  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  // Agregar un nuevo campo (por defecto, "text")
  const addField = () => {
    setFields([
      ...fields,
      {
        label: "Nuevo Campo",
        name: `campo${fields.length + 1}`,
        type: "text",
        required: false,
      },
    ]);
  };

  // Eliminar un campo
  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // Manejar cambios en campos principales
  const handleFieldChange = (index: number, key: keyof FormField, value: any) => {
    const updatedFields = [...fields];

    if (key === "type") {
      if (value === "select") {
        updatedFields[index].options = [{ label: "Opción 1", value: "opcion1" }];
        updatedFields[index].apiUrl = undefined;
        updatedFields[index].eitherFields = undefined;
        updatedFields[index].fatherField = undefined;
        updatedFields[index].childField = undefined;
      } else if (value === "comboComponent") {
        updatedFields[index].type = "ComboComponent";
        updatedFields[index].apiUrl = "";
        updatedFields[index].options = undefined;
        updatedFields[index].eitherFields = undefined;
        updatedFields[index].fatherField = undefined;
        updatedFields[index].childField = undefined;
        setFields(updatedFields);
        return;
      } else if (value === "either") {
        updatedFields[index] = {
          type: "either",
          eitherFields: [
            {
              label: "Campo 1",
              name: `campo${index + 1}_1`,
              type: "text",
              required: false,
            },
            {
              label: "Campo 2",
              name: `campo${index + 1}_2`,
              type: "text",
              required: false,
            },
          ],
        };
        setFields(updatedFields);
        return;
      } else if (value === "nest") {
        // "nest" no tiene label ni name propios,
        // sino fatherField y childField independientes
        updatedFields[index] = {
          type: "nest",
          fatherField: {
            label: "Father Field",
            name: `father_${index + 1}`,
            type: "text",
            required: false,
          },
          childField: {
            label: "Child Field",
            name: `child_${index + 1}`,
            type: "text",
            required: false,
          },
        };
        setFields(updatedFields);
        return;
      } else {
        updatedFields[index].options = undefined;
        updatedFields[index].apiUrl = undefined;
        updatedFields[index].eitherFields = undefined;
        updatedFields[index].fatherField = undefined;
        updatedFields[index].childField = undefined;
      }
    }

    (updatedFields[index] as any)[key] = value;
    setFields(updatedFields);
  };

  // Manejar cambios en subcampos "either"
  const handleEitherFieldChange = (
    parentIndex: number,
    subIndex: number,
    key: keyof FormField,
    value: any
  ) => {
    const updatedFields = [...fields];
    if (!updatedFields[parentIndex].eitherFields) return;

    if (key === "type" && value === "comboComponent") {
      value = "ComboComponent";
      updatedFields[parentIndex].eitherFields![subIndex].options = undefined;
      updatedFields[parentIndex].eitherFields![subIndex].apiUrl = "";
    }

    updatedFields[parentIndex].eitherFields![subIndex] = {
      ...updatedFields[parentIndex].eitherFields![subIndex],
      [key]: value,
    };
    setFields(updatedFields);
  };

  // Manejar cambios en fatherField o childField de un campo nest
  const handleNestFieldChange = (
    parentIndex: number,
    fieldName: "fatherField" | "childField",
    key: keyof FormField,
    value: any
  ) => {
    const updatedFields = [...fields];
    if (!updatedFields[parentIndex][fieldName]) {
      updatedFields[parentIndex][fieldName] = {
        label: "",
        name: "",
        type: "text",
        required: false,
      };
    }
    (updatedFields[parentIndex][fieldName] as any)[key] = value;
    setFields(updatedFields);
  };

  // Manejar cambios en las opciones de un campo select (para campos tradicionales)
  const handleOptionChange = (
    fieldIndex: number,
    optionIndex: number,
    key: keyof FieldOption,
    value: string
  ) => {
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options![optionIndex][key] = value;
      setFields(updatedFields);
    }
  };

  // Agregar una opción a un campo select (para campos tradicionales)
  const addOption = (fieldIndex: number) => {
    const updatedFields = [...fields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    updatedFields[fieldIndex].options!.push({
      label: `Opción ${updatedFields[fieldIndex].options!.length + 1}`,
      value: `opcion${updatedFields[fieldIndex].options!.length + 1}`,
    });
    setFields(updatedFields);
  };

  // Eliminar una opción de un campo select (para campos tradicionales)
  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...fields];
    if (updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options!.splice(optionIndex, 1);
      setFields(updatedFields);
    }
  };

  // Alternar "required" en un campo tradicional
  const toggleFieldRequired = (index: number) => {
    const current = fields[index].required;
    handleFieldChange(index, "required", !current);
  };

  // JSON final
  const generatedJson = {
    ModuloId: parseInt(moduloId),
    title: formTitle,
    description: formDescription,
    fields: fields,
    submitButton: submitButton,
  };

  // Validar y enviar
  const handleSubmitForm = async () => {
    // Validación "either"
    for (const field of fields) {
      if (field.type === "either" && field.eitherFields) {
        const value1 = formData[field.eitherFields[0].name || ""];
        const value2 = formData[field.eitherFields[1].name || ""];
        if (!value1 && !value2) {
          alert(`En "Required Either", al menos uno de los subcampos debe tener valor.`);
          return;
        }
      }
    }
  
    const minimalPayload = {
      ModuloId: parseInt(moduloId),
      title: formTitle,
      description: formDescription,
    };
    const fullJson = generatedJson;
  
    console.log("Payload a enviar:", { minimalPayload, fullJson });
    try {
      const response = await fetch("/api/formCreate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minimalPayload, fullJson }),
      });
      if (!response.ok) {
        throw new Error("Error al enviar el formulario");
      }
      const data = await response.json();
      // Se asume que data tiene solo { id } y que ModuloId está en minimalPayload
      alert(`Usa el componente de la siguiente manera:
  <DynamicForm num="${data.id}" subcarpeta="${minimalPayload.ModuloId}" />`);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert("Error al enviar el formulario.");
    }
  };

  // Manejar selección en ComboInput
  const handleModuloChange = (selection: number | null) => {
    setModuloId(selection ? selection.toString() : "");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Generador de Formularios</h2>

      {/* Seleccionar Módulo */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Módulo</label>
        <ComboInput
          apiUrl="http://avimexintranet.com/backend/api/modulo"
          onSelectionChange={handleModuloChange}
          className="w-full"
          defaultSelectedId={parseInt(moduloId)}
        />
      </div>

      {/* Configuración del Formulario */}
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

      {/* Configuración del Botón de Envío */}
      <div className="p-4 mb-4 border rounded-md bg-gray-100">
        <h3 className="text-lg font-bold">Configuración del Botón de Envío</h3>
        <label className="block text-sm font-medium mt-2">Texto del Botón</label>
        <input
          type="text"
          value={submitButton.label}
          onChange={(e) =>
            setSubmitButton({ ...submitButton, label: e.target.value })
          }
          className="w-full p-2 border rounded-md"
        />
        <label className="block text-sm font-medium mt-2">URL de Envío</label>
        <input
          type="text"
          value={submitButton.action}
          onChange={(e) =>
            setSubmitButton({ ...submitButton, action: e.target.value })
          }
          className="w-full p-2 border rounded-md"
        />
        <label className="block text-sm font-medium mt-2">Método de Envío</label>
        <select
          value={submitButton.method}
          onChange={(e) =>
            setSubmitButton({
              ...submitButton,
              method: e.target.value as SubmitButton["method"],
            })
          }
          className="w-full p-2 border rounded-md"
        >
          <option value="POST">POST</option>
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {/* Lista de Campos */}
      {fields.map((field, index) => {
        // "either"
        if (field.type === "either") {
          return (
            <div key={index} className="p-4 mb-2 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Required Either</h4>
                <button
                  onClick={() => removeField(index)}
                  className="bg-red-500 mb-4 text-white px-2 py-1 rounded-md text-xs"
                >
                  Eliminar
                </button>
              </div>
              {field.eitherFields?.map((subField, subIndex) => (
                <div key={subIndex} className="mb-4 border p-2 rounded-md">
                  <div className="mb-2">
                    <label className="block text-xs font-medium">Etiqueta:</label>
                    <input
                      type="text"
                      value={subField.label}
                      onChange={(e) =>
                        handleEitherFieldChange(index, subIndex, "label", e.target.value)
                      }
                      className="w-full p-1 border rounded-md text-xs"
                      placeholder="Etiqueta del subcampo"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium">Nombre:</label>
                    <input
                      type="text"
                      value={subField.name}
                      onChange={(e) =>
                        handleEitherFieldChange(index, subIndex, "name", e.target.value)
                      }
                      className="w-full p-1 border rounded-md text-xs"
                      placeholder="Nombre interno"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium">Tipo de Campo:</label>
                    <select
                      value={subField.type}
                      onChange={(e) =>
                        handleEitherFieldChange(index, subIndex, "type", e.target.value)
                      }
                      className="w-full p-1 border rounded-md text-xs"
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
                      <option value="ComboComponent">Combo (API)</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    name={subField.name}
                    placeholder={subField.placeholder || ""}
                    required={subField.required}
                    value={formData[subField.name || ""] || ""}
                    onChange={(e) =>
                      handleChange(subField.name || "", e.target.value)
                    }
                    className="w-full p-2 border rounded-md mt-2 text-sm"
                  />
                  {subField.type === "select" && (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium">Opciones</h5>
                      {subField.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 mb-1">
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) =>
                              handleEitherFieldChange(
                                index,
                                subIndex,
                                "options",
                                subField.options!.map((opt, i) =>
                                  i === optIndex ? { ...opt, label: e.target.value } : opt
                                )
                              )
                            }
                            className="w-full p-1 border rounded-md text-xs"
                            placeholder="Etiqueta opción"
                          />
                          <button
                            onClick={() =>
                              handleEitherFieldChange(
                                index,
                                subIndex,
                                "options",
                                subField.options!.filter((_, i) => i !== optIndex)
                              )
                            }
                            className="bg-red-500 text-white px-1 py-1 rounded-md text-xs"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          handleEitherFieldChange(
                            index,
                            subIndex,
                            "options",
                            [
                              ...(subField.options || []),
                              {
                                label: `Opción ${(subField.options?.length || 0) + 1}`,
                                value: `opcion${(subField.options?.length || 0) + 1}`,
                              },
                            ]
                          )
                        }
                        className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs"
                      >
                        Agregar Opción
                      </button>
                    </div>
                  )}
                  {subField.type === "ComboComponent" && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium">API URL:</label>
                      <input
                        type="text"
                        value={subField.apiUrl || ""}
                        onChange={(e) =>
                          handleEitherFieldChange(index, subIndex, "apiUrl", e.target.value)
                        }
                        className="w-full p-1 border rounded-md text-xs"
                        placeholder="https://api.example.com/combodata"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        } else if (field.type === "nest") {
          // Render Nest: no label/name en nest, pero fatherField y childField
          return (
            <div key={index} className="p-4 mb-2 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Contenedor Nest</h4>
                <button
                  onClick={() => removeField(index)}
                  className="bg-red-500 mb-4 text-white px-2 py-1 rounded-md text-xs"
                >
                  Eliminar
                </button>
              </div>
              {/* fatherField */}
              <div className="mt-2 p-2 border rounded-md">
                <h5 className="text-sm font-medium">Father Field</h5>
                <div className="mb-2">
                  <label className="block text-xs font-medium">Etiqueta (Father):</label>
                  <input
                    type="text"
                    value={field.fatherField?.label || ""}
                    onChange={(e) =>
                      handleNestFieldChange(index, "fatherField", "label", e.target.value)
                    }
                    className="w-full p-1 border rounded-md text-xs"
                    placeholder="Etiqueta father"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-medium">Nombre (Father):</label>
                  <input
                    type="text"
                    value={field.fatherField?.name || ""}
                    onChange={(e) =>
                      handleNestFieldChange(index, "fatherField", "name", e.target.value)
                    }
                    className="w-full p-1 border rounded-md text-xs"
                    placeholder="Nombre father"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-medium">Tipo (Father):</label>
                  <select
                    value={field.fatherField?.type || "text"}
                    onChange={(e) =>
                      handleNestFieldChange(index, "fatherField", "type", e.target.value)
                    }
                    className="w-full p-1 border rounded-md text-xs"
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
                    <option value="ComboComponent">Combo (API)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium">Requerido (Father):</span>
                  <button
                    onClick={() => {
                      const newVal = !field.fatherField?.required;
                      handleNestFieldChange(index, "fatherField", "required", newVal);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs"
                  >
                    {field.fatherField?.required ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>

              {/* childField */}
              <div className="mt-2 p-2 border rounded-md">
                <h5 className="text-sm font-medium">Child Field</h5>
                <div className="mb-2">
                  <label className="block text-xs font-medium">Etiqueta (Child):</label>
                  <input
                    type="text"
                    value={field.childField?.label || ""}
                    onChange={(e) =>
                      handleNestFieldChange(index, "childField", "label", e.target.value)
                    }
                    className="w-full p-1 border rounded-md text-xs"
                    placeholder="Etiqueta child"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-medium">Nombre (Child):</label>
                  <input
                    type="text"
                    value={field.childField?.name || ""}
                    onChange={(e) =>
                      handleNestFieldChange(index, "childField", "name", e.target.value)
                    }
                    className="w-full p-1 border rounded-md text-xs"
                    placeholder="Nombre child"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-medium">Tipo (Child):</label>
                  <select
                    value={field.childField?.type || "text"}
                    onChange={(e) =>
                      handleNestFieldChange(index, "childField", "type", e.target.value)
                    }
                    className="w-full p-1 border rounded-md text-xs"
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
                    <option value="ComboComponent">Combo (API)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium">Requerido (Child):</span>
                  <button
                    onClick={() => {
                      const newVal = !field.childField?.required;
                      handleNestFieldChange(index, "childField", "required", newVal);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs"
                  >
                    {field.childField?.required ? "Desactivar" : "Activar"}
                  </button>
                </div>

                {/* Opciones o API URL si es select o combo */}
                {field.childField?.type === "select" && (
                  <div className="mt-2">
                    <h5 className="text-xs font-medium">Opciones (Child)</h5>
                    {field.childField?.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2 mb-1">
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) =>
                            handleNestFieldChange(
                              index,
                              "childField",
                              "options",
                              field.childField?.options?.map((opt, i) =>
                                i === optIndex ? { ...opt, label: e.target.value } : opt
                              )
                            )
                          }
                          className="w-full p-1 border rounded-md text-xs"
                          placeholder="Etiqueta opción"
                        />
                        <button
                          onClick={() =>
                            handleNestFieldChange(
                              index,
                              "childField",
                              "options",
                              field.childField?.options?.filter((_, i) => i !== optIndex)
                            )
                          }
                          className="bg-red-500 text-white px-1 py-1 rounded-md text-xs"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        handleNestFieldChange(index, "childField", "options", [
                          ...(field.childField?.options || []),
                          {
                            label: `Opción ${(field.childField?.options?.length || 0) + 1}`,
                            value: `opcion${(field.childField?.options?.length || 0) + 1}`,
                          },
                        ])
                      }
                      className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs"
                    >
                      Agregar Opción
                    </button>
                  </div>
                )}
                {field.childField?.type === "ComboComponent" && (
                  <div className="mt-2">
                    <label className="block text-xs font-medium">API URL (Child):</label>
                    <input
                      type="text"
                      value={field.childField.apiUrl || ""}
                      onChange={(e) =>
                        handleNestFieldChange(index, "childField", "apiUrl", e.target.value)
                      }
                      className="w-full p-1 border rounded-md text-xs"
                      placeholder="https://api.example.com/combodata"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        } else {
          // Render campos tradicionales
          return (
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
                <option value="ComboComponent">Combo (API)</option>
                <option value="either">Required Either</option>
                <option value="nest">Nest</option>
              </select>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Requerido:</span>
                <button
                  onClick={() => toggleFieldRequired(index)}
                  className="bg-blue-500 text-white px-2 py-1 rounded-md"
                >
                  {field.required ? "Desactivar" : "Activar"}
                </button>
              </div>
              {/* Opciones para "select" */}
              {field.type === "select" && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Opciones</h4>
                  {field.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) =>
                          handleOptionChange(index, optionIndex, "label", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
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
              {/* API URL para ComboComponent */}
              {field.type === "ComboComponent" && (
                <div className="mt-2">
                  <label className="block text-sm font-medium">API URL</label>
                  <input
                    type="text"
                    value={field.apiUrl || ""}
                    onChange={(e) => {
                      const updatedFields = [...fields];
                      updatedFields[index].apiUrl = e.target.value;
                      setFields(updatedFields);
                    }}
                    className="w-full p-2 border rounded-md mb-2"
                    placeholder="https://api.example.com/compras"
                  />
                </div>
              )}
            </div>
          );
        }
      })}

      <button
        onClick={addField}
        className="w-full bg-blue-500 text-white py-2 mt-4 rounded-md hover:bg-blue-600"
      >
        Agregar Campo
      </button>

      <button
        onClick={handleSubmitForm}
        className="w-full bg-green-500 text-white py-2 mt-4 rounded-md hover:bg-green-600"
      >
        Enviar Formulario
      </button>

      <pre className="bg-gray-100 p-4 rounded-md text-sm mt-4">
        {JSON.stringify(generatedJson, null, 2)}
      </pre>
    </div>
  );
};

export default FormBuilder;