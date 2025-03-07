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
  childField?: FormField; // <-- Nuevo: campo anidado
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

const ComboComponent: React.FC<{
  apiUrl: string;
  propertyName: string;
  defaultSelectedId?: string;
  onSelectionChange: (value: string) => void;
  resetTrigger?: any;
}> = ({ apiUrl, propertyName, defaultSelectedId, onSelectionChange, resetTrigger }) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [selected, setSelected] = useState<string | undefined>(defaultSelectedId);

  useEffect(() => {
    axios.get(apiUrl)
      .then((response) => setOptions(response.data[propertyName] || []))
      .catch((error) => console.error("Error fetching combo options:", error));
  }, [apiUrl, propertyName, resetTrigger]);

  return (
    <select 
      value={selected} 
      onChange={(e) => { 
        setSelected(e.target.value); 
        onSelectionChange(e.target.value); 
      }} 
      style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
    >
      <option value="">Seleccione...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
};

const DynamicForm: React.FC<DynamicFormProps> = ({ num, subcarpeta }) => {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    axios
      .get(`/form-data/${subcarpeta}/${num}.json`)
      .then((response) => setFormConfig(response.data))
      .catch((error) => console.error("Error fetching form config:", error));
  }, [num, subcarpeta]);

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  // Para inputs de tipo file, se conserva solo el nombre del archivo en el JSON
  const handleFileChange = (name: string, file: File | undefined) => {
    if (file) {
      handleChange(name, file.name);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("JSON del formulario:", JSON.stringify(formData, null, 2));
    alert("Revisa la consola para ver el JSON.");
  };

  if (!formConfig) return <p>Cargando formulario...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
      <h2 style={{ gridColumn: "span 2", fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>
        {formConfig.title}
      </h2>
      <p style={{ gridColumn: "span 2", fontSize: "16px", marginBottom: "20px" }}>
        {formConfig.description}
      </p>

      {formConfig.fields.map((field) => (
        <div key={field.name} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
            {field.label}
          </label>
          {field.type === "text" ||
           field.type === "email" ||
           field.type === "password" ||
           field.type === "number" ||
           field.type === "date" ? (
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder || ""}
              required={field.required}
              value={formData[field.name] !== undefined ? formData[field.name] : ""}
              {...(field.type === "number" && {
                inputMode: "numeric",
                pattern: "[0-9.]*"
              })}
              onKeyDown={(e) => {
                if (field.type === "number") {
                  const allowedKeys = [
                    "Backspace",
                    "ArrowLeft",
                    "ArrowRight",
                    "Delete",
                    "Tab",
                    "Home",
                    "End",
                    "Enter"
                  ];
                  if (e.key === ".") {
                    if (e.currentTarget.value.includes(".")) {
                      e.preventDefault();
                    }
                    return;
                  }
                  if (
                    !allowedKeys.includes(e.key) &&
                    !/^[0-9]$/.test(e.key)
                  ) {
                    e.preventDefault();
                  }
                }
              }}
              onChange={(e) => {
                if (field.type === "number") {
                  const sanitized = e.target.value.replace(/[^\d.]/g, "");
                  handleChange(field.name, sanitized === "" ? "" : parseFloat(sanitized));
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
              style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", minHeight: "100px" }}
            />
          ) : field.type === "select" ? (
            <select 
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : field.type === "checkbox" ? (
            <input
              type="checkbox"
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

          {/* Renderizado del campo anidado si se definió y el padre tiene valor */}
          {field.childField && formData[field.name] && (
            <div style={{ marginLeft: "20px", marginTop: "10px" }}>
              <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>
                {field.childField.label}
              </label>
              {field.childField.type === "text" ||
               field.childField.type === "email" ||
               field.childField.type === "password" ||
               field.childField.type === "number" ||
               field.childField.type === "date" ? (
                <input
                  type={field.childField.type}
                  name={field.childField.name}
                  placeholder={field.childField.placeholder || ""}
                  required={field.childField.required}
                  value={formData[field.childField.name] !== undefined ? formData[field.childField.name] : ""}
                  {...(field.childField.type === "number" && {
                    inputMode: "numeric",
                    pattern: "[0-9.]*"
                  })}
                  onKeyDown={(e) => {
                    if (field.childField?.type === "number") {
                      const allowedKeys = [
                        "Backspace",
                        "ArrowLeft",
                        "ArrowRight",
                        "Delete",
                        "Tab",
                        "Home",
                        "End",
                        "Enter"
                      ];
                      if (e.key === ".") {
                        if (e.currentTarget.value.includes(".")) {
                          e.preventDefault();
                        }
                        return;
                      }
                      if (
                        !allowedKeys.includes(e.key) &&
                        !/^[0-9]$/.test(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }
                  }}
                  onChange={(e) => {
                    if (field.childField?.type === "number") {
                      const sanitized = e.target.value.replace(/[^\d.]/g, "");
                      handleChange(field.childField!.name, sanitized === "" ? "" : parseFloat(sanitized));
                    } else {
                      handleChange(field.childField!.name, e.target.value);
                    }
                  }}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                />
              ) : field.childField.type === "textarea" ? (
                <textarea
                  name={field.childField.name}
                  placeholder={field.childField.placeholder || ""}
                  required={field.childField.required}
                  onChange={(e) => handleChange(field.childField!.name, e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", minHeight: "100px" }}
                />
              ) : field.childField.type === "select" ? (
                <select 
                  onChange={(e) => handleChange(field.childField!.name, e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                >
                  {field.childField.options?.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : field.childField.type === "checkbox" ? (
                <input
                  type="checkbox"
                  onChange={(e) => handleChange(field.childField!.name, e.target.checked)}
                />
              ) : field.childField.type === "file" ? (
                <input
                  type="file"
                  accept={field.childField.accept?.join(",")}
                  onChange={(e) => handleFileChange(field.childField!.name, e.target.files?.[0])}
                  style={{ marginTop: "8px", display: "block", width: "100%" }}
                />
              ) : field.childField.type === "combo" && field.childField.component === "ComboComponent" ? (
                <ComboInput 
                  apiUrl={field.childField.apiUrl || "/api/proxyJson"} 
                  defaultSelectedId={formData[field.childField.name]} 
                  onSelectionChange={(value) => handleChange(field.childField!.name, value)} 
                />
              ) : null}
            </div>
          )}
        </div>
      ))}

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
          cursor: "pointer"
        }}
      >
        {formConfig.submitButton.label}
      </button>
    </form>
  );
};

export default DynamicForm;