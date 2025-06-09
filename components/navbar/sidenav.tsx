// components/SideNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NavLinksWithSubMenu from "@/components/navbar/NavLinksWithSubMenu";
// import AcmeLogo from "@/components/navbar/AcmeLogo";
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
      {!isOpen && (
        <div
          className="fixed left-0 top-0 z-40 h-full w-12 bg-green-600 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Bars3Icon className="w-6 h-6 text-white" />
        </div>
      )}
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

          <Link
            href="/dashboard"
            className="mb-2 flex items-center justify-center rounded-md p-4"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-32 text-green-600 md:w-40 text-base font-bold text-center">
              AVIMEX-INTRANET 2.0
            </div>
          </Link>

          {/* Search bar */}
          <div className="mb-4 px-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex grow flex-col space-y-2" onClick={handleLinkClick}>
            <NavLinksWithSubMenu search={searchTerm} />
          </div>
          <div className="mt-auto px-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-[48px] w-full items-center gap-2 rounded-md p-3 text-base font-medium hover:bg-green-100 hover:text-green-600"
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