'use client';

import { useEffect, useState } from "react";
import { ComponentFactory } from "@/components/ComponentFactory";
import axios from "axios";

interface PageComponent {
  type: string;
  props: any;
}

interface PageConfig {
  title: string;
  components: PageComponent[];
}

export default function DynamicPage() {
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get("/JsonPages/pagina.json")
      .then(res => setPageConfig(res.data))
      .catch(() => setError("No se pudo cargar la configuración de la página"));
  }, []);

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!pageConfig) return <p className="p-4">Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{pageConfig.title}</h1>
      {pageConfig.components.map((component, idx) => (
        <div key={idx} className="mb-6">
          {ComponentFactory(component.type, component.props)}
        </div>
      ))}
    </div>
  );
}
