"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from "react";
import ComboComponent from "@/components/combo";

// Interfaz del producto (según el JSON que se recibe)
interface Producto {
  id: number;
  producto: string;
  proveedor: string;
  medida: string;
  marca: string;
  fecha: string;
  Cantidad: number;
  Codigo: string;
  ArchFact: string;
  NombreFact: string;
  NoFactura: string | null;
  ArchCoti: string;
  NombreCoti: string;
  NoCotizacion: string | null;
  ProductoID: number;
  ProveedorId: number;
  MedidaId: number;
  MarcaId: number;
  Observaciones: string | null;
}

interface FormularioState {
  codigo: string;
  cantidad: number;
  noFactura: string;
  noCotizacion: string;
  proveedorId: number | null;
  productoId: number | null;
  medidaId: number | null;
  marcaId: number | null;
}

const estadoInicial: FormularioState = {
  codigo: "",
  cantidad: 0,
  noFactura: "",
  noCotizacion: "",
  proveedorId: null,
  productoId: null,
  medidaId: null,
  marcaId: null,
};

interface EditProductModalProps {
  product: Producto;
  onClose: () => void;
  onSave: (updatedProduct: Producto) => void;
}

function EditProductModal({ product, onClose, onSave }: EditProductModalProps) {
  const [formulario, setFormulario] = useState<FormularioState>({
    codigo: product.Codigo,
    cantidad: product.Cantidad,
    noFactura: product.NoFactura || product.NombreFact || "",
    noCotizacion: product.NoCotizacion || "",
    proveedorId: product.ProveedorId,
    productoId: product.ProductoID,
    medidaId: product.MedidaId,
    marcaId: product.MarcaId,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [formKey, setFormKey] = useState<number>(Date.now());

  const manejarCambioTexto = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  }, []);

  const manejarSeleccionCombo = useCallback((field: keyof FormularioState) => {
    return (selection: number | null) => {
      setFormulario((prev) => ({ ...prev, [field]: selection }));
    };
  }, []);

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    // Crear objeto con solo los datos modificados
    const cambios: Partial<Producto> = {};

    if (formulario.codigo !== product.Codigo) {
      cambios.Codigo = formulario.codigo;
    }
    if (formulario.cantidad !== product.Cantidad) {
      cambios.Cantidad = formulario.cantidad;
    }
    if ((product.NoFactura || "") !== formulario.noFactura) {
      // Actualizamos el campo NoFactura (asumiendo que es el que se usa para la factura)
      cambios.NoFactura = formulario.noFactura;
    }
    if ((product.NoCotizacion || "") !== formulario.noCotizacion) {
      // Actualizamos el campo NoCotizacion, no NombreCoti
      cambios.NoCotizacion = formulario.noCotizacion;
    }
    if (formulario.proveedorId !== product.ProveedorId) {
      cambios.ProveedorId = formulario.proveedorId!;
    }
    if (formulario.productoId !== product.ProductoID) {
      cambios.ProductoID = formulario.productoId!;
    }
    if (formulario.medidaId !== product.MedidaId) {
      cambios.MedidaId = formulario.medidaId!;
    }
    if (formulario.marcaId !== product.MarcaId) {
      cambios.MarcaId = formulario.marcaId!;
    }

    // Opcional: Convertir las claves a minúsculas si el backend lo requiere
    const cambiosLowerCase = Object.keys(cambios).reduce((acc, key) => {
      acc[key.toLowerCase()] = cambios[key as keyof typeof cambios];
      return acc;
    }, {} as { [key: string]: any });

    const payload = cambiosLowerCase;
    console.log("Payload enviado:", JSON.stringify(payload));

    try {
      // Asumimos que handlePut realiza la petición PUT al proxy
      await handlePut(product.id, payload);

      const productoActualizado = { ...product, ...cambios };
      onSave(productoActualizado);
      onClose();
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setLoading(false);
    }
  };

  // Simulación de handlePut que llama al proxy (reemplaza por tu implementación real)
  const handlePut = async (id: number, payload: object): Promise<any> => {
    const url = `/api/editGrid?id=${id}`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar");
      }
      const data = await response.json();
      console.log("URL de envío completa (recibida del proxy):", data.targetUrl);
      return data;
    } catch (error) {
      console.error("Error en handlePut:", error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Producto</h2>
        <form onSubmit={manejarEnvio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Código</label>
            <input
              type="text"
              name="codigo"
              maxLength={12}
              className="border rounded w-full p-2"
              value={formulario.codigo}
              onChange={manejarCambioTexto}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Cantidad</label>
            <input
              type="number"
              name="cantidad"
              min={0}
              max={999999}
              className="border rounded w-full p-2"
              value={formulario.cantidad}
              onChange={manejarCambioTexto}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">No. Factura</label>
            <input
              type="text"
              name="noFactura"
              maxLength={12}
              className="border rounded w-full p-2"
              value={formulario.noFactura}
              onChange={manejarCambioTexto}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">No. Cotización</label>
            <input
              type="text"
              name="noCotizacion"
              maxLength={12}
              className="border rounded w-full p-2"
              value={formulario.noCotizacion}
              onChange={manejarCambioTexto}
              required
            />
          </div>
          <ComboComponent
            apiUrl="/api/proxyCompras"
            propertyName="Cat_Proveedor"
            defaultSelectedId={formulario.proveedorId || undefined}
            onSelectionChange={manejarSeleccionCombo("proveedorId")}
            resetTrigger={formKey}
          />
          <ComboComponent
            apiUrl="/api/proxyCompras"
            propertyName="Cat_Producto"
            defaultSelectedId={formulario.productoId || undefined}
            onSelectionChange={manejarSeleccionCombo("productoId")}
            resetTrigger={formKey}
          />
          <ComboComponent
            apiUrl="/api/proxyCompras"
            propertyName="Cat_Medida"
            defaultSelectedId={formulario.medidaId || undefined}
            onSelectionChange={manejarSeleccionCombo("medidaId")}
            resetTrigger={formKey}
          />
          <ComboComponent
            apiUrl="/api/proxyCompras"
            propertyName="Cat_Marca"
            defaultSelectedId={formulario.marcaId || undefined}
            onSelectionChange={manejarSeleccionCombo("marcaId")}
            resetTrigger={formKey}
          />
          <div className="col-span-2 flex justify-end gap-4 mt-4">
            <button type="button" className="px-4 py-2 bg-black text-white rounded" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  const [data, setData] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/proxyGrid?id=1")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        return response.json();
      })
      .then((data: Producto[]) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const openModal = (product: Producto, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct({ ...product });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveChanges = (updatedProduct: Producto) => {
    setData((prevData) =>
      prevData.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
    );
  };

  const downloadFile = (fileName: string) => {
    if (!fileName) return;
    const filePath = `/documentos/${fileName}`;
    const link = document.createElement("a");
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className=" mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Grid de Requisiciones</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-lg text-sm md:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left border-b">Producto</th>
                <th className="p-3 text-left border-b">Proveedor</th>
                <th className="p-3 text-left border-b hidden md:table-cell">Medida</th>
                <th className="p-3 text-left border-b">Marca</th>
                <th className="p-3 text-left border-b hidden md:table-cell">Fecha</th>
                <th className="p-3 text-left border-b">Cantidad</th>
                <th className="p-3 text-left border-b">Código</th>
                <th className="p-3 text-left border-b">NoCotización</th>
                <th className="p-3 text-left border-b">Descargar Archivos</th>
                <th className="p-3 text-left border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100 transition cursor-pointer">
                  <td className="p-3 border-b">{item.producto}</td>
                  <td className="p-3 border-b">{item.proveedor}</td>
                  <td className="p-3 border-b hidden md:table-cell">{item.medida}</td>
                  <td className="p-3 border-b">{item.marca}</td>
                  <td className="p-3 border-b">{item.fecha}</td>
                  <td className="p-3 border-b">{item.Cantidad}</td>
                  <td className="p-3 border-b">{item.Codigo}</td>
                  <td className="p-3 border-b">{item.NoCotizacion}</td>
                  <td className="p-3 border-b gap-2">
                    {item.NombreFact && (
                      <button
                        className="px-2 py-1 bg-green-500 text-white rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(item.NombreFact);
                        }}
                      >
                        Factura
                      </button>
                    )}
                    {item.NombreCoti && (
                      <button
                        className="px-2 py-1 bg-blue-500 mt-2 text-white rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(item.NombreCoti);
                        }}
                      >
                        Cotización
                      </button>
                    )}
                  </td>
                  <td className="p-3 border-b">
                    <button
                      className="px-3 py-1 bg-black text-white rounded"
                      onClick={(e) => openModal(item, e)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && selectedProduct && (
        <EditProductModal product={selectedProduct} onClose={closeModal} onSave={handleSaveChanges} />
      )}
    </div>
  );
}