"use client";

import React, { useState, useEffect } from "react";
import type { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

export interface MenuItem {
  name: string;
  href?: string;
  icon?: string;
  subMenu?: MenuItem[];
}

interface NavLinksWithSubMenuProps {
  search: string;
}

// Mapeo de string a componente de icono
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  HomeIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  DocumentDuplicateIcon,
};

// Filtra recursivamente el menú según término de búsqueda
// Si el padre coincide, conserva todos sus hijos; si sólo hijos coinciden, los filtra
function filterMenu(items: MenuItem[], term: string): MenuItem[] {
  const lower = term.toLowerCase();
  return (
    items
      .map(item => {
        const matchSelf = item.name.toLowerCase().includes(lower);
        const filteredChildren = item.subMenu ? filterMenu(item.subMenu, term) : [];
        if (matchSelf) {
          return { ...item }; // conserva hijos completos
        }
        if (filteredChildren.length) {
          return { ...item, subMenu: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as MenuItem[]
  );
}

export default function NavLinksWithSubMenu({ search }: NavLinksWithSubMenuProps) {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [menuStack, setMenuStack] = useState<MenuItem[][]>([]);
  const pathname = usePathname();

  // Carga inicial del menú
  useEffect(() => {
    fetch("/navbar/nav.json")
      .then(res => res.json())
      .then(data => {
        const topMenu: MenuItem[] = data.menu || [];
        setMenuData(topMenu);
        setMenuStack([topMenu]);
      })
      .catch(console.error);
  }, []);

  // Al cambiar búsqueda, reinicia stack con menú filtrado o completo
  useEffect(() => {
    const top = search ? filterMenu(menuData, search) : menuData;
    setMenuStack([top]);
  }, [search, menuData]);

  const currentMenu = menuStack[menuStack.length - 1] || [];

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.subMenu && item.subMenu.length > 0) {
      setMenuStack(prev => [...prev, item.subMenu!]);
    }
  };

  const handleBack = () => {
    setMenuStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Renderizado recursivo para búsqueda
  const renderFiltered = (items: MenuItem[], depth = 0): JSX.Element[] =>
    items.map((item, idx) => {
      const Icon = item.icon ? iconMap[item.icon] : null;
      const isActive = pathname === item.href;
      const hasChildren = item.subMenu && item.subMenu.length > 0;
      const padding = { paddingLeft: `${depth * 16 + 16}px` };

      return (
        <div key={item.name + depth + idx} className="flex flex-col">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => handleMenuItemClick(item)}
              style={padding}
              className="cursor-pointer flex items-center gap-2 p-2 text-sm font-medium rounded-md bg-gray-50 hover:bg-green-100 hover:text-green-600"
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span>{item.name}</span>
            </button>
          ) : item.href ? (
            <Link
              href={item.href}
              style={padding}
              className={`cursor-pointer flex items-center gap-2 p-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-50 hover:bg-green-100 hover:text-green-600'
              }`}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span>{item.name}</span>
            </Link>
          ) : (
            <div style={padding} className="flex items-center gap-2 p-2 text-sm font-medium bg-gray-50 rounded-md">
              {Icon && <Icon className="w-5 h-5" />}
              <span>{item.name}</span>
            </div>
          )}
          {hasChildren && renderFiltered(item.subMenu!, depth + 1)}
        </div>
      );
    });

  return (
    <div className="w-full">
      {/* Botón Volver para submenús */}
      {menuStack.length > 1 && (
        <motion.button
          type="button"
          onClick={handleBack}
          className="mb-2 cursor-pointer flex items-center gap-2 p-2 text-sm font-medium hover:bg-green-100 hover:text-green-600 rounded-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver</span>
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={search ? 'filter' : menuStack.length}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {search
            ? renderFiltered(currentMenu)
            : currentMenu.map((item, idx) => {
                const Icon = item.icon ? iconMap[item.icon] : null;
                const isActive = pathname === item.href;
                const hasChildren = item.subMenu && item.subMenu.length > 0;

                return (
                  <div key={item.name + idx} className="list-none">
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => handleMenuItemClick(item)}
                        className="cursor-pointer flex w-full items-center gap-2 p-3 text-sm font-medium rounded-md bg-gray-50 hover:bg-green-100 hover:text-green-600"
                      >
                        {Icon && <Icon className="w-6 h-6" />}
                        <span>{item.name}</span>
                      </button>
                    ) : item.href ? (
                      <Link
                        href={item.href}
                        className={`cursor-pointer flex w-full items-center gap-2 p-3 text-sm font-medium text-left rounded-md ${
                          isActive
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-50 hover:bg-green-100 hover:text-green-600'
                        }`}
                      >
                        {Icon && <Icon className="w-6 h-6" />}
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 p-3 text-sm font-medium bg-gray-50 rounded-md">
                        {Icon && <Icon className="w-6 h-6" />}
                        <span>{item.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}