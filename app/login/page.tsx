"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formulario, setFormulario] = useState({
    usuario: "", // Usando "usuario" en lugar de "username"
    pwd: "", // Usando "pwd" en lugar de "password"
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [session, setSession] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Marca que el cliente ha montado
    const userSession = typeof window !== "undefined" ? sessionStorage.getItem("session") : null;
    if (userSession) {
      setSession(userSession);
      router.push("/dashboard"); // Redirigir si ya está autenticado
    }
  }, [router]);

  const manejarCambioTexto = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario), // Enviar JSON en lugar de FormData
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof window !== "undefined") {
          sessionStorage.setItem("session", data.token);
        }
        setSession(data.token);
        router.push("/dashboard");
      } else {
        alert("Error en las credenciales");
      }
    } catch (error) {
      alert("Error en la solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null; // Evita la hidratación incorrecta

  return (
    <div className="flex items-center justify-center min-h-screen from-blue-500 to-indigo-600 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg ">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h1>
        <form onSubmit={manejarEnvio} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Usuario</label>
            <input
              type="text"
              name="usuario"
              className="border rounded w-full p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={formulario.usuario}
              onChange={manejarCambioTexto}
              required
              placeholder="Ingresa tu usuario"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mt-2 mb-2">Contraseña</label>
            <input
              type="password"
              name="pwd"
              className="border rounded w-full p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={formulario.pwd}
              onChange={manejarCambioTexto}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <div className="mt-5">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg w-full transition duration-200"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Ingresar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}