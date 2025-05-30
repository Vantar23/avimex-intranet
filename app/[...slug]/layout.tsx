// app/layout.tsx
'use client'
import SideNav from "@/components/navbar/sidenav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen">
      {/* SideNav flotante */}
      <SideNav />

      {/* Contenido principal ocupa toda la pantalla */}
      <div className="h-full w-full p-6 md:overflow-y-auto md:p-12 max-w-screen-xl mx-auto">
        {children}
      </div>
    </div>
  );
}