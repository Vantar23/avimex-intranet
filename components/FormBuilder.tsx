'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";

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

const ComboComponent: React.FC<{ apiUrl: string; propertyName: string; defaultSelectedId?: string; onSelectionChange: (value: string) => void; resetTrigger?: any }> = ({ apiUrl, propertyName, defaultSelectedId, onSelectionChange, resetTrigger }) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [selected, setSelected] = useState<string | undefined>(defaultSelectedId);

  useEffect(() => {
    axios.get(apiUrl)
      .then((response) => setOptions(response.data[propertyName] || []))
      .catch((error) => console.error("Error fetching combo options:", error));
  }, [apiUrl, propertyName, resetTrigger]);

  return (
    <select value={selected} onChange={(e) => { setSelected(e.target.value); onSelectionChange(e.target.value); }} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}>
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formConfig) return;
    try {
      await axios({
        url: formConfig.submitButton.action,
        method: formConfig.submitButton.method,
        data: formData,
      });
      alert("Formulario enviado correctamente");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (!formConfig) return <p>Cargando formulario...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ padding: "16px", borderRadius: "8px", maxWidth: "1200px", margin: "auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
      <h2 style={{ gridColumn: "span 2", fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>{formConfig.title}</h2>
      <p style={{ gridColumn: "span 2", fontSize: "16px", marginBottom: "20px" }}>{formConfig.description}</p>

      {formConfig.fields.map((field) => (
        <div key={field.name} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px" }}>{field.label}</label>
          {field.type === "text" || field.type === "email" || field.type === "password" || field.type === "number" || field.type === "date" ? (
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder || ""}
              required={field.required}
              onChange={(e) => handleChange(field.name, e.target.value)}
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
            <select onChange={(e) => handleChange(field.name, e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}>
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
              onChange={(e) => handleChange(field.name, e.target.files?.[0])}
            />
          ) : field.type === "combo" && field.component === "ComboComponent" ? (
            <ComboComponent apiUrl={field.apiUrl || "/api/proxyCompras"} propertyName="Cat_Proveedor" defaultSelectedId={formData[field.name]} onSelectionChange={(value) => handleChange(field.name, value)} />
          ) : null}
        </div>
      ))}
      <button type="submit" style={{ gridColumn: "span 2", margin:"0 auto", width:"25%", padding: "12px 20px", background: "#007bff", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" }}>
        {formConfig.submitButton.label}
      </button>
    </form>
  );
};

export default DynamicForm;