import React from "react";

interface ExportButtonProps {
  originalData: any[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ originalData }) => {
  const handleExcelExport = () => {
    let csvContent = "";
    if (originalData.length > 0) {
      // Obtener las cabeceras
      const headers = Object.keys(originalData[0]);
      csvContent += headers.join(",") + "\n";

      // Agregar los datos de las filas
      originalData.forEach((row) => {
        const values = headers.map((header) => {
          const cell = row[header] ?? "";
          return `"${String(cell).replace(/"/g, '""')}"`; // Escapar las comillas dobles
        });
        csvContent += values.join(",") + "\n";
      });
    }

    // Crear el archivo CSV y desencadenar la descarga
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExcelExport}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Exportar a CSV
    </button>
  );
};

export default ExportButton;
