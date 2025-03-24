"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import AcmeLogo from "@/app/ui/acme-logo";
import { PowerIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Para prevenir errores de SSR

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });

      if (response.ok) {
        sessionStorage.removeItem("session");
        if (response.headers.get("Clear-LocalStorage")) {
          localStorage.clear();
        }
        window.location.href = "/";
      } else {
        alert("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error en logout:", error);
      alert("Error en la solicitud de cierre de sesión");
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A") {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botón flotante para abrir el SideNav */}
      <button
        className="fixed left-2 top-5 z-50 flex items-center justify-center rounded-lg bg-green-600 p-2 shadow-lg transition-all hover:bg-green-700"
        onClick={() => setIsOpen(true)}
      >
        <Bars3Icon className="h-6 w-6 text-white" />
      </button>

      {/* Fondo oscuro para cerrar el menú al hacer clic afuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SideNav flotante */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg md:w-72"
      >
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
          {/* Botón para cerrar el menú */}
          <button
            className="ml-auto mb-4 rounded-full p-2 hover:bg-gray-300"
            onClick={() => setIsOpen(false)}
          >
            ✖
          </button>

          <Link
            className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40"
            href="/dashboard"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-32 text-white md:w-40">
              <AcmeLogo />
            </div>
          </Link>

          <div
            className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2"
            onClick={handleLinkClick}
          >
            <NavLinks />
            <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-green-100 hover:text-green-600 md:flex-none md:justify-start md:p-2 md:px-3"
            >
              <PowerIcon className="w-6" />
              <div className="hidden md:block">Cerrar Sesión</div>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}