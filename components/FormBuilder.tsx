'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import ComboInput from "./ComboInput";

interface FormField {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  accept?: string[];
  component?: string;
  apiUrl?: string;
  validationApi?: { url: string };
  // Para "nest":
  fatherField?: FormField;
  childField?: FormField;
  // Para "either":
  eitherFields?: FormField[];
}

interface FormConfig {
  title: string;
  description: string;
  fields: FormField[];
  submitButton: { label: string; action: string; method: string };
}

type DynamicFormProps = {
  num: string;
  subcarpeta: string;
};

const DynamicForm: React.FC<DynamicFormProps> = ({ num, subcarpeta }) => {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  // Estado para almacenar los objetos File de los campos file
  const [fileData, setFileData] = useState<{ [key: string]: File }>({});

  useEffect(() => {
    axios
      .get(`/form-data/${subcarpeta}/${num}.json`)
      .then((response) => setFormConfig(response.data))
      .catch((error) => console.error("Error fetching form config:", error));
  }, [num, subcarpeta]);

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  // Para inputs de tipo file, se almacena el objeto File en fileData
  // y se guarda en el JSON solo el nombre con prefijo HHmmss.
  const handleFileChange = (name: string, file: File | undefined) => {
    if (file) {
      // Guardar el objeto File para enviarlo luego a /api/SaveFile
      setFileData((prev) => ({ ...prev, [name]: file }));
      // Generar el nuevo nombre con prefijo de hora (HHmmss)
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const timeStamp = `${hours}${minutes}${seconds}`;
      const newFileName = `${timeStamp}_${file.name}`;
      handleChange(name, newFileName);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Limpiar espacios adicionales en el campo 'proveedorId'
    if (formData.proveedorId && typeof formData.proveedorId === "string") {
      formData.proveedorId = formData.proveedorId.trim();
    }

    // Validar campos "either": se debe completar al menos uno de los dos campos
    if (formConfig) {
      for (const field of formConfig.fields) {
        if (field.type === "either" && field.eitherFields) {
          const [firstField, secondField] = field.eitherFields;
          if (
            (!formData[firstField.name] || formData[firstField.name] === "") &&
            (!formData[secondField.name] || formData[secondField.name] === "")
          ) {
            alert(
              `Por favor, complete al menos uno de los campos: ${firstField.label} o ${secondField.label}.`
            );
            return;
          }
        }
      }
    }

    // Mostrar en consola el JSON del formulario
    console.log("JSON del formulario:", JSON.stringify(formData, null, 2));

    // Si hay archivos, enviarlos primero a /api/SaveFile
    if (Object.keys(fileData).length > 0) {
      const form = new FormData();
      // Se envían todos los archivos; el tercer parámetro define el nombre del archivo (ya con prefijo)
      for (const key in fileData) {
        form.append(key, fileData[key], formData[key]);
      }
      try {
        const fileResponse = await axios.post("/api/SaveFile", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Archivos guardados:", fileResponse.data);
        // Opcional: actualizar formData con las rutas retornadas por SaveFile
        // Object.assign(formData, fileResponse.data.savedFiles);
      } catch (error) {
        console.error("Error al guardar archivos:", error);
        alert("Error al guardar archivos.");
        return;
      }
    }

    // Enviar el JSON del formulario a /api/proxyJson en application/json
    axios
      .post(
        "/api/proxyJson",
        {
          url: formConfig!.submitButton.action,
          body: formData,
        },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        console.log("Response from proxy:", response.data);
        alert("Datos enviados correctamente.");
      })
      .catch((error) => {
        console.error("Error en el envío:", error);
        alert("Error enviando los datos.");
      });
  };

  if (!formConfig) return <p>Cargando formulario...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}
    >
      <h2
        style={{
          gridColumn: "span 2",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "12px",
        }}
      >
        {formConfig.title}
      </h2>
      <p style={{ gridColumn: "span 2", fontSize: "16px", marginBottom: "20px" }}>
        {formConfig.description}
      </p>

      {formConfig.fields.map((field) => {
        // -- Caso "nest" --
        if (field.type === "nest" && field.fatherField && field.childField) {
          return (
            <div key={field.fatherField.name} style={{ display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
                {field.fatherField.label}
              </label>
              <input
                type={field.fatherField.type}
                name={field.fatherField.name}
                placeholder={field.fatherField.placeholder || ""}
                required={field.fatherField.required}
                value={formData[field.fatherField.name] ?? ""}
                onChange={(e) => handleChange(field.fatherField!.name, e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
              />
              {formData[field.fatherField.name] && (
                <div
                  style={{
                    marginLeft: "20px",
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
                    {field.childField.label}
                  </label>
                  {["text", "email", "password", "number", "date"].includes(field.childField!.type) ? (
                    <input
                      type={field.childField!.type}
                      name={field.childField!.name}
                      placeholder={field.childField.placeholder || ""}
                      required={field.childField.required}
                      value={formData[field.childField!.name] ?? ""}
                      onChange={(e) => handleChange(field.childField!.name, e.target.value)}
                      style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                    />
                  ) : field.childField!.type === "textarea" ? (
                    <textarea
                      name={field.childField!.name}
                      placeholder={field.childField.placeholder || ""}
                      required={field.childField.required}
                      onChange={(e) => handleChange(field.childField!.name, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        minHeight: "100px",
                      }}
                    />
                  ) : field.childField!.type === "select" ? (
                    <select
                      name={field.childField!.name}
                      onChange={(e) => handleChange(field.childField!.name, e.target.value)}
                      style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                    >
                      {field.childField.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.childField!.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      name={field.childField!.name}
                      onChange={(e) => handleChange(field.childField!.name, e.target.checked)}
                    />
                  ) : field.childField!.type === "file" ? (
                    <input
                      type="file"
                      accept={field.childField.accept?.join(",")}
                      onChange={(e) => handleFileChange(field.childField!.name, e.target.files?.[0])}
                      style={{ marginTop: "8px", display: "block", width: "100%" }}
                    />
                  ) : null}
                </div>
              )}
            </div>
          );
        }

        // -- Caso "either" --
        if (field.type === "either" && field.eitherFields) {
          return (
            <div
              key={`either-${field.eitherFields[0].name}-${field.eitherFields[1].name}`}
              style={{
                gridColumn: "span 2",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              {field.eitherFields.map((eitherField) => (
                <div key={eitherField.name} style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
                    {eitherField.label}
                  </label>
                  {eitherField.type === "ComboComponent" ? (
                    <ComboInput
                      apiUrl={eitherField.apiUrl || "/api/proxyJson"}
                      defaultSelectedId={formData[eitherField.name]}
                      onSelectionChange={(value) => handleChange(eitherField.name, value)}
                    />
                  ) : (
                    <input
                      type={eitherField.type === "number" ? "number" : eitherField.type}
                      name={eitherField.name}
                      placeholder={eitherField.placeholder || ""}
                      required={eitherField.required}
                      value={formData[eitherField.name] ?? ""}
                      onChange={(e) =>
                        handleChange(
                          eitherField.name,
                          eitherField.type === "number" ? parseFloat(e.target.value) : e.target.value
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          );
        }

        // -- Resto de campos estándar --
        return (
          <div key={field.name} style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
              {field.label}
            </label>
            {["text", "email", "password", "number", "date"].includes(field.type) ? (
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder || ""}
                required={field.required}
                value={formData[field.name] ?? ""}
                onChange={(e) => {
                  if (field.type === "number") {
                    const sanitized = e.target.value.replace(/[^\d.]/g, "");
                    handleChange(field.name, sanitized === "" ? "" : parseFloat(e.target.value));
                  } else {
                    handleChange(field.name, e.target.value);
                  }
                }}
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
              />
            ) : field.type === "textarea" ? (
              <textarea
                name={field.name}
                placeholder={field.placeholder || ""}
                required={field.required}
                onChange={(e) => handleChange(field.name, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  minHeight: "100px",
                }}
              />
            ) : field.type === "select" ? (
              <select
                name={field.name}
                onChange={(e) => handleChange(field.name, e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                name={field.name}
                onChange={(e) => handleChange(field.name, e.target.checked)}
              />
            ) : field.type === "file" ? (
              <input
                type="file"
                accept={field.accept?.join(",")}
                onChange={(e) => handleFileChange(field.name, e.target.files?.[0])}
                style={{ marginTop: "8px", display: "block", width: "100%" }}
              />
            ) : field.type === "combo" && field.component === "ComboComponent" ? (
              <ComboInput
                apiUrl={field.apiUrl || "/api/proxyJson"}
                defaultSelectedId={formData[field.name]}
                onSelectionChange={(value) => handleChange(field.name, value)}
              />
            ) : null}

            {field.childField && formData[field.name] && (
              <div style={{ marginLeft: "20px", marginTop: "10px" }}>
                <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
                  {field.childField.label}
                </label>
                {/* Aquí puedes agregar la lógica de renderizado para childField si es necesario */}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        style={{
          gridColumn: "span 2",
          margin: "0 auto",
          width: "25%",
          padding: "12px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {formConfig.submitButton.label}
      </button>
    </form>
  );
};

export default DynamicForm;