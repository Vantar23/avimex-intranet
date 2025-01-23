"use client";

import { useState } from "react";
export const config = { ssr: false };

export default function Requisicion() {
  const [archivo1, setArchivo1] = useState<File | null>(null);
  const [archivo2, setArchivo2] = useState<File | null>(null);
  const [codigo, setCodigo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [medidaIdSeleccionada, setMedidaIdSeleccionada] = useState("");
  const [marcaIdSeleccionada, setMarcaIdSeleccionada] = useState("");
  const [noFactura, setNoFactura] = useState("");
  const [noCotizacion, setNoCotizacion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");

  const productos = [
    { ID: "1", DESCRIPCION: "Despachador de Toallas" },
    { ID: "2", DESCRIPCION: "Dispensador de Jabón" },
    { ID: "3", DESCRIPCION: "Abrazadera sin Fin 1 1/4\"" },
  ];

  const proveedores = [
    { ID: "1", DESCRIPCION: "AELENEVA México" },
    { ID: "2", DESCRIPCION: "Talos Electronics" },
    { ID: "3", DESCRIPCION: "Proveedor Genérico" },
  ];

  const medidas = [
    { ID: "1", DESCRIPCION: "Unidad" },
    { ID: "2", DESCRIPCION: "Pieza" },
    { ID: "3", DESCRIPCION: "Caja" },
    { ID: "4", DESCRIPCION: "Metro" },
  ];

  const marcas = [
    { ID: "1", DESCRIPCION: "Marca A" },
    { ID: "2", DESCRIPCION: "Marca B" },
    { ID: "3", DESCRIPCION: "Marca C" },
    { ID: "4", DESCRIPCION: "Genérico" },
  ];

  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>, archivoSetter: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const archivoSeleccionado = e.target.files[0];

      // Validar el tipo de archivo (opcional)
      const tiposPermitidos = ["application/pdf"];
      if (!tiposPermitidos.includes(archivoSeleccionado.type)) {
        alert("Solo se permiten archivos PDF.");
        return;
      }

      archivoSetter(archivoSeleccionado);
    }
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !archivo1 ||
      !archivo2 ||
      !codigo ||
      !cantidad ||
      !productoSeleccionado ||
      !medidaIdSeleccionada ||
      !marcaIdSeleccionada ||
      !proveedorSeleccionado
    ) {
      alert("Por favor, completa todos los campos obligatorios antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo1", archivo1); // Archivo 1
    formData.append("archivo2", archivo2); // Archivo 2
    formData.append("codigo", codigo);
    formData.append("cantidad", cantidad);
    formData.append("productoId", productoSeleccionado);
    formData.append("medidaId", medidaIdSeleccionada);
    formData.append("marcaId", marcaIdSeleccionada);
    formData.append("noFactura", noFactura);
    formData.append("noCotizacion", noCotizacion);
    formData.append("observaciones", observaciones);
    formData.append("proveedorId", proveedorSeleccionado);

    try {
      const response = await fetch("http://localhost/backend/api/compras", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert("Datos enviados exitosamente.");
        console.log("Respuesta de la API:", result);

        // Limpiar los campos del formulario
        setArchivo1(null);
        setArchivo2(null);
        setCodigo("");
        setCantidad("");
        setProductoSeleccionado("");
        setMedidaIdSeleccionada("");
        setMarcaIdSeleccionada("");
        setNoFactura("");
        setNoCotizacion("");
        setObservaciones("");
        setProveedorSeleccionado("");
      } else {
        const errorText = await response.text();
        alert(`Error: ${errorText}`);
        console.error("Error:", errorText);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Hubo un error al intentar enviar los datos. Verifica tu conexión.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Requisición</h1>
      <form className="bg-white rounded p-6 space-y-4" onSubmit={manejarEnvio}>
        <div>
          <label className="block font-semibold mb-1">Archivo 1</label>
          <input type="file" onChange={(e) => manejarArchivo(e, setArchivo1)} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Archivo 2</label>
          <input type="file" onChange={(e) => manejarArchivo(e, setArchivo2)} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Código</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Cantidad</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Producto</label>
          <select
            className="border rounded w-full p-2"
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            required
          >
            <option value="">Selecciona un producto</option>
            {productos.map((producto) => (
              <option key={producto.ID} value={producto.ID}>
                {producto.DESCRIPCION}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Unidad de Medida</label>
          <select
            className="border rounded w-full p-2"
            value={medidaIdSeleccionada}
            onChange={(e) => setMedidaIdSeleccionada(e.target.value)}
            required
          >
            <option value="">Selecciona una medida</option>
            {medidas.map((medida) => (
              <option key={medida.ID} value={medida.ID}>
                {medida.DESCRIPCION}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">No. Catálogo o Marca</label>
          <select
            className="border rounded w-full p-2"
            value={marcaIdSeleccionada}
            onChange={(e) => setMarcaIdSeleccionada(e.target.value)}
            required
          >
            <option value="">Selecciona una marca</option>
            {marcas.map((marca) => (
              <option key={marca.ID} value={marca.ID}>
                {marca.DESCRIPCION}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">No. Factura</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={noFactura}
            onChange={(e) => setNoFactura(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">No. Cotización</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={noCotizacion}
            onChange={(e) => setNoCotizacion(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Observaciones</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Proveedor</label>
          <select
            className="border rounded w-full p-2"
            value={proveedorSeleccionado}
            onChange={(e) => setProveedorSeleccionado(e.target.value)}
            required
          >
            <option value="">Selecciona un proveedor</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.ID} value={proveedor.ID}>
                {proveedor.DESCRIPCION}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button type="submit" className="bg-blue-500 text-white rounded px-6 py-2 w-full">
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
