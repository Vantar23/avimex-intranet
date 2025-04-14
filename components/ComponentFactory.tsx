// components/ComponentFactory.tsx
import GridBuilder from "@/components/GridBuilder";
import { useState } from "react";
import DynamicForm from "@/components/FormBuilder";
import clsx from "clsx";

export const ComponentFactory = (type: string, props: any) => {
  switch (type) {
    case "heading":
      return <h2 className={`text-${props.size} font-bold mb-4`}>{props.text}</h2>;
    case "text":
      return <p className="mb-4">{props.content}</p>;
    case "grid":
      return (
        <GridBuilder
          apiUrl={props.apiUrl}
          onRowClick={props.onRowClick}
          selectFilters={props.selectFilters || []}
          modal={props.modal}  // Ahora modal viene incluido en props
        />
      );
    case "button":
      return <ButtonWithModal {...props} />;
    default:
      return <p className="text-red-500">Componente desconocido: {type}</p>;
  }
};

const allowedColors = {
  blue: "bg-blue-500 hover:bg-blue-600",
  green: "bg-green-500 hover:bg-green-600",
  red: "bg-red-500 hover:bg-red-600",
  purple: "bg-purple-500 hover:bg-purple-600",
  gray: "bg-gray-500 hover:bg-gray-600",
};

const ButtonWithModal = ({ label, color = "blue", modal }: any) => {
  const [open, setOpen] = useState(false);
  const colorClasses =
    allowedColors[color as keyof typeof allowedColors] || allowedColors.blue;

  return (
    <div>
      <button
        className={`px-4 py-2 rounded text-white transition ${colorClasses}`}
        onClick={() => setOpen(true)}
      >
        {label || "Botón"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-lg shadow-lg px-6 pt-6 pb-6 overflow-hidden">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-0 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold z-10"
              aria-label="Cerrar"
            >
              &times;
            </button>
            <div className="pt-4 overflow-y-auto max-h-[75vh] pr-2">
              {modal?.type === "dynamicForm" && (
                <DynamicForm num={modal.num} subcarpeta={modal.subcarpeta} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentFactory;