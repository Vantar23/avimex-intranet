"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formulario, setFormulario] = useState({ usuario: "", pwd: "", captchaInput: "" });
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const captchaCanvas = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const userSession = typeof window !== "undefined" ? sessionStorage.getItem("session") : null;
    if (userSession) {
      setSession(userSession);
      router.push("/dashboard");
    }
    generarCaptcha();
  }, [router]);

  useEffect(() => {
    if (captchaText) {
      dibujarCaptcha(captchaText);
    }
  }, [captchaText]);

  const generarCaptcha = () => {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    setCaptchaText(captcha);
  };

  const dibujarCaptcha = (texto: string) => {
    if (captchaCanvas.current) {
      const ctx = captchaCanvas.current.getContext("2d");
      if (ctx) {
        const canvasWidth = captchaCanvas.current.width;
        const canvasHeight = captchaCanvas.current.height;

        // Limpiar el canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Dibujar fondo con un color claro
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Dibujar líneas de ruido
        for (let i = 0; i < 6; i++) {
          ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`;
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvasWidth, Math.random() * canvasHeight);
          ctx.lineTo(Math.random() * canvasWidth, Math.random() * canvasHeight);
          ctx.stroke();
        }

        // Dibujar puntos de ruido
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`;
          ctx.beginPath();
          const x = Math.random() * canvasWidth;
          const y = Math.random() * canvasHeight;
          ctx.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Dibujar cada carácter con estilos y rotaciones aleatorias
        const letterSpacing = canvasWidth / (texto.length + 1);
        for (let i = 0; i < texto.length; i++) {
          const letter = texto[i];
          ctx.save();

          // Color aleatorio para el carácter
          ctx.fillStyle = `rgb(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)})`;

          // Tamaño de fuente aleatorio (entre 24px y 31px)
          const fontSize = Math.floor(Math.random() * 8) + 24;
          ctx.font = `${fontSize}px Arial`;

          // Posición y rotación aleatorias
          const x = letterSpacing * (i + 1);
          const y = canvasHeight / 2 + (Math.random() * 10 - 5);
          const angle = (Math.random() * 60 - 30) * (Math.PI / 180);

          // Aplicar transformación: trasladar y rotar
          ctx.translate(x, y);
          ctx.rotate(angle);

          // Centrar el texto
          const metrics = ctx.measureText(letter);
          const letterWidth = metrics.width;
          ctx.fillText(letter, -letterWidth / 2, 0);

          ctx.restore();
        }
      }
    }
  };

  const manejarCambioTexto = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (formulario.captchaInput !== captchaText) {
      alert("Captcha incorrecto");
      setLoading(false);
      generarCaptcha();
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: formulario.usuario, pwd: formulario.pwd }),
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

  if (!isClient) return null;

  return (
    <div className="flex items-center justify-center min-h-screen from-green-500 to-indigo-600 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h1>
        <form onSubmit={manejarEnvio} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Usuario</label>
            <input
              type="text"
              name="usuario"
              className="border rounded w-full p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={formulario.usuario}
              onChange={manejarCambioTexto}
              required
              placeholder="Ingresa tu usuario"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              name="pwd"
              className="border rounded w-full p-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={formulario.pwd}
              onChange={manejarCambioTexto}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Captcha</label>
            <div className="flex items-center space-x-2 mb-2">
              <canvas ref={captchaCanvas} width="150" height="40" className="border rounded p-1" />
              <button type="button" onClick={generarCaptcha} className="px-2 py-1 rounded">
                🔄
              </button>
            </div>
            <input
              type="text"
              name="captchaInput"
              className="border rounded w-full p-3 mt-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              value={formulario.captchaInput}
              onChange={manejarCambioTexto}
              required
              placeholder="Ingresa el texto del captcha"
            />
          </div>
          <div className="mt-5">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-lg w-full transition duration-200"
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