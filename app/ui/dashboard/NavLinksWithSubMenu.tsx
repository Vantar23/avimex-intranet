// NavLinksWithSubMenu.tsx
"use client";

import { useState, useEffect } from "react";
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

// Mapeo de string a componente de icono
const iconMap: { [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>> } = {
  HomeIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  DocumentDuplicateIcon,
};

// Tipo para cada entrada del stack del menú
interface MenuStackEntry {
  title: string; // Nombre del menú que nos llevó a este nivel (puede estar vacío en el nivel raíz)
  items: MenuItem[];
}

export default function NavLinksWithSubMenu() {
  const [menuStack, setMenuStack] = useState<MenuStackEntry[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Cargar el JSON desde public/navbar/nav.json
    fetch("/navbar/nav.json")
      .then((res) => res.json())
      .then((data) => {
        const topMenu: MenuItem[] = data.menu || [];
        // Inicializa el stack con el menú principal
        setMenuStack([{ title: "", items: topMenu }]);
      })
      .catch((error) => {
        console.error("Error al cargar el menú:", error);
      });
  }, []);

  // Obtener el menú actual (último elemento del stack)
  const currentMenu = menuStack[menuStack.length - 1];

  // Al hacer click en un ítem que tiene subMenú, se empuja al stack
  const handleMenuItemClick = (item: MenuItem) => {
    if (item.subMenu) {
      setMenuStack([...menuStack, { title: item.name, items: item.subMenu }]);
    }
  };

  // Botón de regreso: remueve el último nivel del stack
  const handleBack = () => {
    if (menuStack.length > 1) {
      setMenuStack(menuStack.slice(0, menuStack.length - 1));
    }
  };

  // Variantes para animar cada opción
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <div className="w-full">
      {/* Si no estamos en el nivel raíz, mostramos el botón de regreso */}
      {menuStack.length > 1 && (
        <motion.button
          onClick={handleBack}
          className="mb-2 flex items-center gap-2 p-2 text-sm font-medium hover:bg-green-100 hover:text-green-600 rounded-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <ArrowLeftIcon className="w-5" />
          <span>{currentMenu.title}</span>
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        <motion.ul
          key={menuStack.length} // Cambia la key al cambiar de nivel para animar la transición
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ staggerChildren: 0.1 }}
          className="flex flex-col gap-2"
        >
          {currentMenu?.items.map((item, index) => {
            const IconComponent = item.icon ? iconMap[item.icon] : null;
            const isActive = pathname === item.href;
            return (
              <motion.li
                key={index}
                variants={itemVariants}
                className="list-none"
              >
                {item.subMenu ? (
                  <button
                    onClick={() => handleMenuItemClick(item)}
                    className="flex w-full items-center gap-2 rounded-md p-3 text-sm font-medium bg-gray-50 hover:bg-green-100 hover:text-green-600 text-left"
                  >
                    {IconComponent && <IconComponent className="w-6" />}
                    <span>{item.name}</span>
                  </button>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className={`flex w-full items-center gap-2 rounded-md p-3 text-sm font-medium text-left ${
                      isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-50 hover:bg-green-100 hover:text-green-600"
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-6" />}
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 rounded-md p-3 text-sm font-medium bg-gray-50">
                    {IconComponent && <IconComponent className="w-6" />}
                    <span>{item.name}</span>
                  </div>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}