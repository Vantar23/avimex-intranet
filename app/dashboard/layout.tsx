'use client'
import SideNav from "@/app/ui/dashboard/sidenav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen">
      {/* SideNav flotante */}
      <SideNav />

      {/* Contenido principal ocupa toda la pantalla */}
      <div className="h-full w-full p-6 md:overflow-y-auto md:p-12">
        {children}
      </div>
    </div>
  );
}