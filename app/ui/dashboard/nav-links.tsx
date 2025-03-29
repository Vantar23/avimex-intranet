// nav-links.tsx
"use client";

import {
  HomeIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface MenuItem {
  name: string;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subMenu?: MenuItem[];
}

export const links: MenuItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Requisición',
    icon: PencilSquareIcon,
    subMenu: [
      { name: 'Sub Requisición 1', href: '/dashboard/form/sub1' },
      { name: 'Sub Requisición 2', href: '/dashboard/form/sub2' },
    ],
  },
  { name: 'Tabla', href: '/dashboard/grid', icon: Squares2X2Icon },
  { name: 'Mejoras', href: '/dashboard/mejoras', icon: DocumentDuplicateIcon },
];