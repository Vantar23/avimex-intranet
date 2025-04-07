"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ComboInput from "./ComboInput";
// Importa el loader
import GridLoader from "react-spinners/GridLoader";

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
  const [fileData, setFileData] = useState<{ [key: string]: File }>({});
  // Estado para mostrar la rueda de carga y evitar múltiples envíos
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get(`/form-data/${subcarpeta}/${num}.json`)
      .then((response) => setFormConfig(response.data))
      .catch((error) => console.error("Error fetching form config:", error));
  }, [num, subcarpeta]);

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  // Manejo de archivos: se guarda el objeto File en "fileData"
  // y se asigna un nombre con prefijo HHmmss al campo en "formData"
  const handleFileChange = (name: string, file: File | undefined) => {
    if (file) {
      setFileData((prev) => ({ ...prev, [name]: file }));
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

    // Evitar que se inicie un nuevo envío si ya se está enviando
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Limpiar espacios adicionales en el campo 'proveedorId'
    if (formData.proveedorId && typeof formData.proveedorId === "string") {
      formData.proveedorId = formData.proveedorId.trim();
    }

    // Validar campos "either": al menos uno de los subcampos debe completarse
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
            setIsSubmitting(false);
            return;
          }
        }
      }
    }

    console.log("JSON del formulario:", JSON.stringify(formData, null, 2));

    let savedFiles = null;
    // Si hay archivos, enviarlos primero a /api/HandleFiles
    if (Object.keys(fileData).length > 0) {
      const form = new FormData();
      for (const key in fileData) {
        form.append(key, fileData[key], formData[key]);
      }
      try {
        const fileResponse = await axios.post("/api/HandleFiles", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Archivos guardados:", fileResponse.data);
        savedFiles = fileResponse.data.savedFiles;
      } catch (error: any) {
        console.error("Error al guardar archivos:", error);
        const errorMsg =
          error.response?.data?.error || "Error al guardar archivos.";
        alert(errorMsg);
        setIsSubmitting(false);
        return;
      }
    }

    // Enviar el JSON del formulario a /api/proxyJson en application/json
    try {
      const response = await axios.post(
        "/api/proxyJson",
        {
          url: formConfig!.submitButton.action,
          body: formData,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Response from proxy:", response.data);
      //alert("Datos enviados correctamente.");

      // Refrescar la página después de un envío exitoso
      //window.location.reload();
    } catch (error: any) {
      console.error("Error en el envío de datos:", error);
      const errorMsg =
        error.response?.data?.error ||
        "Error enviando los datos. Se eliminarán los archivos guardados.";
      alert(errorMsg);
      if (savedFiles) {
        try {
          await axios.delete("/api/HandleFiles", { data: { savedFiles } });
          console.log("Archivos eliminados por fallo en envío de JSON.");
        } catch (delError) {
          console.error("Error al eliminar archivos:", delError);
        }
      }
      setIsSubmitting(false);
      return;
    }
  };

  if (!formConfig) return <p>Cargando formulario...</p>;

  return (
    <>
      {/* Overlay con el loader de react-spinners */}
      {isSubmitting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* GridLoader muestra cuadrículas animadas como indicador de carga */}
          <GridLoader color="#000" size={15} />
        </div>
      )}

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
          // Caso "nest"
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
                    {["text", "email", "password", "number", "date"].includes(field.childField.type) ? (
                      <input
                        type={field.childField.type}
                        name={field.childField.name}
                        placeholder={field.childField.placeholder || ""}
                        required={formData[field.fatherField.name] ? field.childField.required : false}
                        value={formData[field.childField.name] ?? ""}
                        onChange={(e) => handleChange(field.childField!.name, e.target.value)}
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                      />
                    ) : field.childField.type === "textarea" ? (
                      <textarea
                        name={field.childField.name}
                        placeholder={field.childField.placeholder || ""}
                        required={formData[field.fatherField.name] ? field.childField.required : false}
                        onChange={(e) => handleChange(field.childField!.name, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ccc",
                          borderRadius: "6px",
                          minHeight: "100px",
                        }}
                      />
                    ) : field.childField.type === "select" ? (
                      <select
                        name={field.childField.name}
                        required={formData[field.fatherField.name] ? field.childField.required : false}
                        onChange={(e) => handleChange(field.childField!.name, e.target.value)}
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                      >
                        {field.childField.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.childField.type === "checkbox" ? (
                      <input
                        type="checkbox"
                        name={field.childField.name}
                        required={formData[field.fatherField.name] ? field.childField.required : false}
                        onChange={(e) => handleChange(field.childField!.name, e.target.checked)}
                      />
                    ) : field.childField.type === "file" ? (
                      <input
                        type="file"
                        accept={field.childField.accept?.join(",")}
                        required={formData[field.fatherField.name] ? field.childField.required : false}
                        onChange={(e) =>
                          handleFileChange(field.childField!.name, e.target.files?.[0])
                        }
                        style={{ marginTop: "8px", display: "block", width: "100%" }}
                      />
                    ) : null}
                  </div>
                )}
              </div>
            );
          }

          // Caso "either"
          if (field.type === "either" && field.eitherFields && field.eitherFields.length >= 2) {
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
                {field.eitherFields.map((eitherField, index) => {
                  const otherIndex = (index + 1) % field.eitherFields!.length;
                  const otherFieldName = field.eitherFields![otherIndex].name;
                  // Opcional: deshabilitar un campo si el otro está lleno
                  const disabledInput = !!formData[otherFieldName];
                  return (
                    <div key={eitherField.name} style={{ display: "flex", flexDirection: "column" }}>
                      <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
                        {eitherField.label}
                      </label>
                      {eitherField.type === "ComboComponent" ? (
                        <ComboInput
                          apiUrl={eitherField.apiUrl || "/api/proxyJson"}
                          defaultSelectedId={formData[eitherField.name]}
                          onSelectionChange={(value) => handleChange(eitherField.name, value)}
                          disabled={disabledInput}
                        />
                      ) : (
                        <input
                          type={eitherField.type === "number" ? "number" : eitherField.type}
                          name={eitherField.name}
                          placeholder={eitherField.placeholder || ""}
                          required={eitherField.required}
                          disabled={disabledInput}
                          value={formData[eitherField.name] ?? ""}
                          onKeyDown={
                            eitherField.type === "number"
                              ? (e) => {
                                  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                                  if (allowedKeys.includes(e.key)) return;
                                  if (e.key === ".") {
                                    if (e.currentTarget.value.includes(".")) {
                                      e.preventDefault();
                                    }
                                    return;
                                  }
                                  if (!/^\d$/.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }
                              : undefined
                          }
                          onChange={(e) => {
                            if (eitherField.type === "number") {
                              const sanitized = e.target.value.replace(/[^\d.]/g, "");
                              handleChange(eitherField.name, sanitized === "" ? "" : parseFloat(e.target.value));
                            } else {
                              handleChange(eitherField.name, e.target.value);
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }

          // Resto de campos estándar
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
                  onKeyDown={
                    field.type === "number"
                      ? (e) => {
                          const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                          if (allowedKeys.includes(e.key)) return;
                          if (e.key === ".") {
                            if (e.currentTarget.value.includes(".")) {
                              e.preventDefault();
                            }
                            return;
                          }
                          if (!/^\d$/.test(e.key)) {
                            e.preventDefault();
                          }
                        }
                      : undefined
                  }
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

              {/* Si deseas usar "childField" en campos estándar, puedes manejarlo así: */}
              {field.childField && formData[field.name] && (
                <div style={{ marginLeft: "20px", marginTop: "10px" }}>
                  <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
                    {field.childField.label}
                  </label>
                  {/* Implementa aquí la lógica de renderizado para el childField si es necesario */}
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
            marginBottom: "20px",
          }}
        >
          {formConfig.submitButton.label}
        </button>
      </form>
    </>
  );
};

export default DynamicForm;