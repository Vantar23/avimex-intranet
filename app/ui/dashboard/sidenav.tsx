// components/SideNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NavLinksWithSubMenu from "@/app/ui/dashboard/NavLinksWithSubMenu";
import AcmeLogo from "@/app/ui/acme-logo";
import {
  PowerIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    if (target.tagName === "A") setIsOpen(false);
  };

  return (
    <>
      <button
        className="fixed left-2 top-5 z-50 flex items-center justify-center rounded-lg bg-green-600 p-2 shadow-lg hover:bg-green-700"
        onClick={() => setIsOpen(true)}
      >
        <Bars3Icon className="h-6 w-6 text-white" />
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg md:w-72"
      >
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
          <button
            className="ml-auto mb-4 rounded-full p-2 hover:bg-gray-300"
            onClick={() => setIsOpen(false)}
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>

          <Link
            href="/dashboard"
            className="mb-2 flex h-20 items-end rounded-md bg-green-600 p-4 md:h-40"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-32 text-white md:w-40">
              <AcmeLogo />
            </div>
          </Link>

          {/* Search bar */}
          <div className="mb-4 px-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex grow flex-col space-y-2" onClick={handleLinkClick}>
            <NavLinksWithSubMenu search={searchTerm} />
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-green-100 hover:text-green-600"
            >
              <PowerIcon className="w-6 h-6" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}