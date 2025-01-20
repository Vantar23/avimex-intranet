import { useState } from "react";

export default function Requisicion() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [codigo, setCodigo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");

  // Opciones manuales
  const productos = [
    { ID: "1", DESCRIPCION: "Producto A" },
    { ID: "2", DESCRIPCION: "Producto B" },
    { ID: "3", DESCRIPCION: "Producto C" },
  ];

  const proveedores = [
    { ID: "1", DESCRIPCION: "Proveedor X" },
    { ID: "2", DESCRIPCION: "Proveedor Y" },
    { ID: "3", DESCRIPCION: "Proveedor Z" },
  ];

  // Manejo del archivo seleccionado
  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0]);
      console.log("Archivo seleccionado: ", e.target.files[0].name);
    }
  };

  // Manejar el envío del formulario
  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!archivo || !codigo || !cantidad || !productoSeleccionado || !proveedorSeleccionado) {
      alert("Por favor, completa todos los campos antes de enviar.");
      return;
    }

    const data = {
      archivo: archivo.name,
      codigo,
      cantidad,
      productoId: productoSeleccionado,
      proveedorId: proveedorSeleccionado,
    };

    console.log("Datos a enviar (JSON):", JSON.stringify(data));

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("codigo", codigo);
    formData.append("cantidad", cantidad);
    formData.append("productoId", productoSeleccionado);
    formData.append("proveedorId", proveedorSeleccionado);

    try {
      const respuesta = await fetch(
        "https://api-recepcion-de-archivos-production.up.railway.app/",
        { method: "POST", body: formData }
      );

      if (respuesta.ok) {
        const resultado = await respuesta.json();
        console.log("Datos enviados exitosamente:", resultado);
        alert("Formulario enviado exitosamente.");
      } else {
        console.error("Error al enviar el formulario:", respuesta.statusText);
        alert("Error al enviar el formulario.");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Requisición</h1>
      <form className="bg-white rounded p-6 space-y-4" onSubmit={manejarEnvio}>
        <div>
          <label className="block font-semibold mb-1">Archivo</label>
          <input type="file" onChange={manejarArchivo} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Código</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Cantidad</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Producto</label>
          <select
            className="border rounded w-full p-2"
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
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
          <label className="block font-semibold mb-1">Proveedor</label>
          <select
            className="border rounded w-full p-2"
            value={proveedorSeleccionado}
            onChange={(e) => setProveedorSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un proveedor</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.ID} value={proveedor.ID}>
                {proveedor.DESCRIPCION}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
