"use client"; // Indica que este layout funciona en el cliente

export default function FormLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Encabezado del formulario */}

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto p-6 bg-white  rounded-md mt-6">
        {children}
      </main>

      {/* Pie de página */}
    </div>
  );
}