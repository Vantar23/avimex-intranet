// app/[...slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { ComponentFactory } from "@/components/ComponentFactory";

interface PageComponent {
  type: string;
  props: any;
}

interface PageConfig {
  title: string;
  components: PageComponent[];
}

export default function DynamicPage() {
  const params = useParams() as { slug: string[] };
  const slugPath = params.slug ? params.slug.join("/") : "";
  
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`/JsonPages/${slugPath}.json`)
      .then((res) => {
        if (!res.data || !res.data.title || !res.data.components) {
          setError("Configuración incompleta");
        } else {
          setPageConfig(res.data);
        }
      })
      .catch(() => {
        setError("No se pudo cargar la configuración de la página");
      });
  }, [slugPath]);

  // Pantalla de mantenimiento en caso de error o JSON inexistente
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">¡En mantenimiento!</h1>
          <p className="text-xl mb-4">Estamos trabajando para mejorar esta sección.</p>
        </motion.div>
        {/* Imagen animada con efecto de flotación, movimiento lateral y ligera inclinación */}
        <motion.img
          src="https://cdn.pixabay.com/photo/2013/07/12/14/15/boy-148071_1280.png"
          alt="En mantenimiento"
          className="w-32 h-32"
          initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{
            x: [0, -10, 0, 10, 0],      // Movimiento lateral
            y: [0, -10, 0],            // Rebote vertical
            rotate: [0, -2, 0, 2, 0],   // Inclinación suave
            scale: [1, 1.03, 1],       // Efecto de respiración
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

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